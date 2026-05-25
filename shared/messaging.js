/**
 * messaging.js — LinkedIn-style full-page messaging module
 *
 * Usage:
 *   Place <div id="msg-shell"></div> in messages.html, then:
 *   Messaging.init({ user: 'alice', adapter: new LocalStorageAdapter() });
 *
 * The shell renders a two-column layout:
 *   #msg-sidebar  — conversation list + search
 *   #msg-main     — active thread + compose area
 *
 * On mobile (≤640px) the sidebar and thread swap visibility via
 * the 'thread-open' class on #msg-shell (handled automatically).
 */

// ---------------------------------------------------------------------------
// Adapters
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Message
 * @property {string}      id
 * @property {string}      from_user
 * @property {string}      to_user
 * @property {string}      body
 * @property {string}      sent_at   — ISO 8601
 * @property {string|null} read_at   — ISO 8601 or null
 */

class LocalStorageAdapter {
  #key(user, box) { return `msg_${box}_${user}`; }

  #load(user, box) {
    try { return JSON.parse(localStorage.getItem(this.#key(user, box)) || '[]'); }
    catch { return []; }
  }

  #save(user, box, msgs) {
    localStorage.setItem(this.#key(user, box), JSON.stringify(msgs));
  }

  async getInbox(user) {
    return this.#load(user, 'inbox')
      .filter(m => !m.deleted_by_recipient)
      .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  }

  async getSent(user) {
    return this.#load(user, 'sent')
      .filter(m => !m.deleted_by_sender)
      .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  }

  async sendMessage(from, to, body) {
    const msg = {
      id: crypto.randomUUID(),
      from_user: from,
      to_user: to,
      body,
      sent_at: new Date().toISOString(),
      read_at: null,
      deleted_by_sender: false,
      deleted_by_recipient: false,
    };
    const inbox = this.#load(to, 'inbox');
    inbox.push(msg);
    this.#save(to, 'inbox', inbox);

    const sent = this.#load(from, 'sent');
    sent.push(msg);
    this.#save(from, 'sent', sent);

    return msg;
  }

  async markRead(messageId) {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('msg_inbox_')) continue;
      try {
        const msgs = JSON.parse(localStorage.getItem(key) || '[]');
        const idx  = msgs.findIndex(m => m.id === messageId);
        if (idx !== -1) {
          msgs[idx].read_at = new Date().toISOString();
          localStorage.setItem(key, JSON.stringify(msgs));
          return;
        }
      } catch { /* skip */ }
    }
  }
}

class RestApiAdapter {
  #baseUrl;
  #headers;

  /**
   * @param {string} baseUrl  — e.g. '/api' or 'https://api.example.com'
   * @param {Object} headers  — extra headers, e.g. { Authorization: 'Bearer …' }
   */
  constructor(baseUrl = '/api', headers = {}) {
    this.#baseUrl  = baseUrl.replace(/\/$/, '');
    this.#headers  = { 'Content-Type': 'application/json', ...headers };
  }

  async #fetch(path, options = {}) {
    const res = await fetch(`${this.#baseUrl}${path}`, {
      ...options,
      headers: { ...this.#headers, ...(options.headers || {}) },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`[RestApiAdapter] ${res.status} ${path}: ${text}`);
    }
    return res.status === 204 ? null : res.json();
  }

  async getInbox()           { return this.#fetch('/messages/inbox'); }
  async getSent()            { return this.#fetch('/messages/sent'); }
  async markRead(id)         { return this.#fetch(`/messages/${id}/read`, { method: 'PATCH' }); }

  async sendMessage(_from, to, body) {
    return this.#fetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ to_user: to, body }),
    });
  }
}

// ---------------------------------------------------------------------------
// Messaging — full-page module
// ---------------------------------------------------------------------------
const Messaging = (() => {
  let _user         = 'guest';
  let _adapter      = new LocalStorageAdapter();
  let _activeThread = null; // peer username currently open
  let _pollTimer    = null;
  let _statusTimer  = null;
  const POLL_MS     = 30_000;

  // Avatar colour palette — cycles by first letter
  const AVATAR_COLORS = [
    'msg-avatar-blue',
    'msg-avatar-teal',
    'msg-avatar-amber',
    'msg-avatar-purple',
    'msg-avatar-coral',
    'msg-avatar-pink',
  ];

  // ── Tiny helpers ──────────────────────────────────────────────────────────

  function esc(v) {
    return String(v)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#039;');
  }

  function initials(name) {
    return String(name).slice(0, 2).toUpperCase();
  }

  function avatarClass(name) {
    const idx = (String(name).charCodeAt(0) || 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  }

  function fmtShort(iso) {
    const d   = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1)  return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24)  return `${diffHrs}h`;
    if (d.toDateString() === new Date(now - 86_400_000).toDateString()) return 'Yesterday';
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    if (diffMs < 7 * 86_400_000) return days[d.getDay()];
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function fmtDateHeading(iso) {
    const d   = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    if (d.toDateString() === new Date(now - 86_400_000).toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function $(id) { return document.getElementById(id); }
  function shell() { return $('msg-shell'); }

  // ── DOM bootstrap ─────────────────────────────────────────────────────────

  function buildDOM() {
    const s = shell();
    if (!s) {
      console.error('[Messaging] #msg-shell not found in the document.');
      return;
    }

    s.setAttribute('role', 'main');
    s.setAttribute('aria-label', 'Messaging');

    s.innerHTML = `
      <!-- Sidebar -->
      <aside id="msg-sidebar" aria-label="Conversations">

        <div class="msg-sidebar-head">
          <span class="msg-sidebar-title">Messaging</span>
          <div class="msg-sidebar-actions">
            <button class="msg-icon-btn" id="msg-new-btn" aria-label="New message">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="msg-search">
          <svg class="msg-search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input id="msg-search-input" type="search" placeholder="Search messages"
            autocomplete="off" aria-label="Search conversations" />
        </div>

        <div id="msg-conv-list" role="list" aria-label="Conversation list"></div>

      </aside>

      <!-- Main thread area -->
      <section id="msg-main" aria-label="Message thread">

        <!-- Thread header — hidden until a conversation is selected -->
        <div id="msg-thread-head" class="msg-thread-head" hidden>
          <button class="msg-icon-btn msg-back-btn" id="msg-back-btn" aria-label="Back to conversations">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div id="msg-thread-avatar" class="msg-avatar" aria-hidden="true"></div>
          <div class="msg-thread-info">
            <div id="msg-thread-name"  class="msg-thread-name"></div>
            <div id="msg-thread-sub"   class="msg-thread-sub"></div>
          </div>
          <div class="msg-thread-actions">
            <button class="msg-icon-btn" aria-label="More options">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Empty state — shown until a conversation is selected -->
        <div id="msg-no-thread" class="msg-thread-empty" role="status">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.25"
            stroke-linecap="round" stroke-linejoin="round"
            style="opacity:.25; margin-bottom:8px;" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Select a conversation or start a new one
        </div>

        <!-- Thread messages -->
        <div id="msg-thread" role="log" aria-live="polite" aria-label="Messages" hidden></div>

        <!-- Compose -->
        <div id="msg-compose" class="msg-compose" role="form" aria-label="Compose message" hidden>
          <div class="msg-compose-toolbar">
            <button class="msg-icon-btn" aria-label="Attach file">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19
                  a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <button class="msg-icon-btn" aria-label="Add image">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <button class="msg-icon-btn" aria-label="Emoji">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </button>
          </div>
          <div class="msg-compose-row">
            <textarea
              id="msg-compose-input"
              class="msg-compose-input"
              placeholder="Write a message…"
              maxlength="2000"
              rows="1"
              aria-label="Message body"
            ></textarea>
            <button id="msg-send-btn" class="msg-send-btn" disabled aria-label="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <div id="msg-status" class="msg-status" aria-live="polite"></div>
        </div>

      </section>

      <!-- New message modal -->
      <div id="msg-new-modal" class="msg-modal-backdrop" hidden role="dialog"
        aria-modal="true" aria-label="New message">
        <div class="msg-modal">
          <div class="msg-modal-head">
            <span class="msg-modal-title">New message</span>
            <button class="msg-icon-btn" id="msg-modal-close-btn" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="msg-modal-body">
            <input id="msg-new-to" class="msg-modal-input" type="text"
              placeholder="Recipient username" maxlength="64"
              autocomplete="off" aria-label="Recipient username" />
            <textarea id="msg-new-body" class="msg-modal-textarea"
              placeholder="Write a message…" maxlength="2000"
              aria-label="Message body"></textarea>
            <div class="msg-modal-footer">
              <span id="msg-new-status" class="msg-status" aria-live="polite"></span>
              <button id="msg-new-send-btn" class="msg-send-btn-full" aria-label="Send">Send</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire events
    $('msg-new-btn').addEventListener('click', openNewModal);
    $('msg-modal-close-btn').addEventListener('click', closeNewModal);
    $('msg-new-modal').addEventListener('click', e => {
      if (e.target === $('msg-new-modal')) closeNewModal();
    });
    $('msg-new-send-btn').addEventListener('click', sendNewMessage);
    $('msg-search-input').addEventListener('input', onSearch);
    $('msg-compose-input').addEventListener('input', onComposeInput);
    $('msg-send-btn').addEventListener('click', sendReply);
    $('msg-back-btn').addEventListener('click', backToList);

    // Keyboard: send on Enter (Shift+Enter = newline)
    $('msg-compose-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
    });
    $('msg-new-body').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendNewMessage(); }
    });
  }

  // ── Conversation list ─────────────────────────────────────────────────────

  /**
   * Build a de-duplicated list of conversations from inbox + sent,
   * keyed by peer username, sorted by most recent message.
   */
  async function loadConversations() {
    const [inbox, sent] = await Promise.all([
      _adapter.getInbox(_user),
      _adapter.getSent(_user),
    ]);

    const map = new Map(); // peer → { latestMsg, unreadCount }

    for (const m of inbox) {
      const peer = m.from_user;
      const cur  = map.get(peer);
      if (!cur || new Date(m.sent_at) > new Date(cur.latestMsg.sent_at)) {
        map.set(peer, {
          latestMsg:   m,
          unreadCount: (cur?.unreadCount ?? 0) + (m.read_at ? 0 : 1),
          direction:   'in',
        });
      } else if (!m.read_at) {
        cur.unreadCount++;
      }
    }

    for (const m of sent) {
      const peer = m.to_user;
      const cur  = map.get(peer);
      if (!cur || new Date(m.sent_at) > new Date(cur.latestMsg.sent_at)) {
        map.set(peer, {
          latestMsg:   m,
          unreadCount: cur?.unreadCount ?? 0,
          direction:   'out',
        });
      }
    }

    // Sort by newest first
    return [...map.entries()]
      .sort((a, b) => new Date(b[1].latestMsg.sent_at) - new Date(a[1].latestMsg.sent_at))
      .map(([peer, data]) => ({ peer, ...data }));
  }

  async function renderConvList(filter = '') {
    const list = $('msg-conv-list');
    list.innerHTML = `<div class="msg-skeleton"></div><div class="msg-skeleton"></div><div class="msg-skeleton"></div>`;

    let convs;
    try {
      convs = await loadConversations();
    } catch (err) {
      console.error('[Messaging] renderConvList:', err);
      list.innerHTML = `<div class="msg-conv-error">Failed to load conversations.</div>`;
      return;
    }

    const q = filter.trim().toLowerCase();
    if (q) convs = convs.filter(c => c.peer.toLowerCase().includes(q));

    if (!convs.length) {
      list.innerHTML = `
        <div class="msg-conv-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.25"
            stroke-linecap="round" stroke-linejoin="round"
            style="opacity:.25; margin-bottom:8px;" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          ${q ? 'No results.' : 'No conversations yet.'}
        </div>`;
      return;
    }

    list.innerHTML = convs.map(c => {
      const preview = c.direction === 'out'
        ? `You: ${esc(c.latestMsg.body)}`
        : esc(c.latestMsg.body);
      const isActive = c.peer === _activeThread;
      return `
        <div class="msg-conv-item${isActive ? ' active' : ''}"
          role="listitem" tabindex="0"
          data-peer="${esc(c.peer)}"
          aria-label="${esc(c.peer)}${c.unreadCount ? `, ${c.unreadCount} unread` : ''}">
          <div class="msg-avatar ${avatarClass(c.peer)}" aria-hidden="true">
            ${esc(initials(c.peer))}
          </div>
          <div class="msg-conv-meta">
            <div class="msg-conv-row">
              <span class="msg-conv-name">${esc(c.peer)}</span>
              <span class="msg-conv-time">${esc(fmtShort(c.latestMsg.sent_at))}</span>
            </div>
            <div class="msg-conv-preview">${preview}</div>
          </div>
          ${c.unreadCount > 0 ? `<div class="msg-unread-dot" aria-hidden="true"></div>` : ''}
        </div>`;
    }).join('');

    list.querySelectorAll('.msg-conv-item').forEach(el => {
      el.addEventListener('click',  () => openThread(el.dataset.peer));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openThread(el.dataset.peer);
      });
    });
  }

  // ── Thread view ───────────────────────────────────────────────────────────

  async function openThread(peer) {
    _activeThread = peer;

    // Update sidebar active state
    shell()?.querySelectorAll('.msg-conv-item').forEach(el => {
      el.classList.toggle('active', el.dataset.peer === peer);
    });

    // Show thread chrome
    $('msg-thread-head').hidden  = false;
    $('msg-no-thread').hidden    = true;
    $('msg-thread').hidden       = false;
    $('msg-compose').hidden      = false;

    // Mobile: show thread, hide sidebar
    shell()?.classList.add('thread-open');

    // Populate header
    const av = $('msg-thread-avatar');
    av.textContent = initials(peer);
    av.className   = `msg-avatar ${avatarClass(peer)}`;
    $('msg-thread-name').textContent = peer;
    $('msg-thread-sub').textContent  = '';

    // Render messages
    await renderThread(peer);

    // Focus compose
    $('msg-compose-input').focus();
  }

  async function renderThread(peer) {
    const thread = $('msg-thread');
    thread.innerHTML = `
      <div class="msg-skeleton" style="max-width:55%"></div>
      <div class="msg-skeleton" style="max-width:40%; align-self:flex-end"></div>
      <div class="msg-skeleton" style="max-width:60%"></div>`;

    let inbox, sent;
    try {
      [inbox, sent] = await Promise.all([
        _adapter.getInbox(_user),
        _adapter.getSent(_user),
      ]);
    } catch (err) {
      console.error('[Messaging] renderThread:', err);
      thread.innerHTML = `<div class="msg-thread-error">Failed to load messages.</div>`;
      return;
    }

    // Merge all messages between _user and peer, sorted oldest first
    const messages = [
      ...inbox.filter(m => m.from_user === peer),
      ...sent.filter(m => m.to_user === peer),
    ].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));

    if (!messages.length) {
      thread.innerHTML = `
        <div class="msg-thread-empty">
          Start the conversation with <strong>${esc(peer)}</strong>
        </div>`;
      return;
    }

    // Group by day and render bubbles
    let lastDay = '';
    const html  = [];

    for (const m of messages) {
      const day = fmtDateHeading(m.sent_at);
      if (day !== lastDay) {
        html.push(`<div class="msg-date-divider">${esc(day)}</div>`);
        lastDay = day;
      }

      const mine = m.from_user === _user;
      html.push(`
        <div class="msg-bubble-group">
          <div class="msg-bubble-row ${mine ? 'mine' : ''}">
            ${!mine ? `<div class="msg-bubble-avatar ${avatarClass(peer)}" aria-hidden="true">${esc(initials(peer))}</div>` : ''}
            <div class="msg-bubble ${mine ? 'mine' : 'theirs'}"
              role="article"
              aria-label="${mine ? 'You' : esc(peer)}: ${esc(m.body)}">
              ${esc(m.body)}
            </div>
          </div>
          <div class="msg-bubble-meta ${mine ? 'mine' : ''}">
            ${esc(fmtTime(m.sent_at))}${mine && m.read_at ? ' · Seen' : ''}
          </div>
        </div>`);
    }

    thread.innerHTML = html.join('');
    thread.scrollTop = thread.scrollHeight;

    // Mark unread messages as read
    inbox
      .filter(m => m.from_user === peer && !m.read_at)
      .forEach(m => _adapter.markRead(m.id).catch(console.warn));
  }

  function backToList() {
    shell()?.classList.remove('thread-open');
  }

  // ── Compose (reply in open thread) ───────────────────────────────────────

  function onComposeInput() {
    const ta  = $('msg-compose-input');
    const btn = $('msg-send-btn');
    btn.disabled      = !ta.value.trim();
    ta.style.height   = 'auto';
    ta.style.height   = Math.min(ta.scrollHeight, 120) + 'px';
  }

  async function sendReply() {
    if (!_activeThread) return;
    const ta  = $('msg-compose-input');
    const btn = $('msg-send-btn');
    const body = ta.value.trim();
    if (!body) return;

    btn.disabled = true;

    try {
      await _adapter.sendMessage(_user, _activeThread, body);
      ta.value      = '';
      ta.style.height = '';
      onComposeInput();
      await renderThread(_activeThread);
      await renderConvList($('msg-search-input')?.value);
    } catch (err) {
      console.error('[Messaging] sendReply:', err);
      setStatus('Failed to send. Try again.', true);
    } finally {
      btn.disabled = !ta.value.trim();
    }
  }

  // ── New message modal ─────────────────────────────────────────────────────

  function openNewModal() {
    $('msg-new-modal').hidden = false;
    $('msg-new-to').value     = '';
    $('msg-new-body').value   = '';
    $('msg-new-status').textContent = '';
    $('msg-new-to').focus();
  }

  function closeNewModal() {
    $('msg-new-modal').hidden = true;
  }

  async function sendNewMessage() {
    const toEl   = $('msg-new-to');
    const bodyEl = $('msg-new-body');
    const sendBtn = $('msg-new-send-btn');

    const to   = toEl.value.trim();
    const body = bodyEl.value.trim();

    if (!to)          { setNewStatus('Enter a recipient.', true); toEl.focus();   return; }
    if (!body)        { setNewStatus('Message is empty.',  true); bodyEl.focus(); return; }
    if (to === _user) { setNewStatus("Can't message yourself.", true); return; }

    sendBtn.disabled = true;
    setNewStatus('Sending…', false);

    try {
      await _adapter.sendMessage(_user, to, body);
      closeNewModal();
      await renderConvList();
      openThread(to);
    } catch (err) {
      console.error('[Messaging] sendNewMessage:', err);
      setNewStatus('Failed to send. Try again.', true);
    } finally {
      sendBtn.disabled = false;
    }
  }

  // ── Search ────────────────────────────────────────────────────────────────

  function onSearch() {
    renderConvList($('msg-search-input').value);
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  function setStatus(msg, isError) {
    const el = $('msg-status');
    el.textContent = msg;
    el.className   = 'msg-status' + (isError ? ' error' : '');
    clearTimeout(_statusTimer);
    _statusTimer = setTimeout(() => { el.textContent = ''; }, 3500);
  }

  function setNewStatus(msg, isError) {
    const el = $('msg-new-status');
    el.textContent = msg;
    el.className   = 'msg-status' + (isError ? ' error' : '');
  }

  // ── Polling ───────────────────────────────────────────────────────────────

  function startPolling() {
    stopPolling();
    _pollTimer = setInterval(async () => {
      await renderConvList($('msg-search-input')?.value);
      if (_activeThread) await renderThread(_activeThread);
    }, POLL_MS);
  }

  function stopPolling() {
    clearInterval(_pollTimer);
    _pollTimer = null;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * @param {Object}  options
   * @param {string}  options.user      — username of the logged-in user
   * @param {Object}  [options.adapter] — adapter instance (default: LocalStorageAdapter)
   * @param {boolean} [options.poll]    — enable background polling (default: false)
   * @param {string}  [options.openThread] — peer username to open immediately on load
   */
  function init({ user = 'guest', adapter = new LocalStorageAdapter(), poll = false, openThread: peer } = {}) {
    if (!$('msg-shell')) {
      console.error('[Messaging] #msg-shell element not found. Add <div id="msg-shell"></div> to your HTML.');
      return;
    }

    _user         = user;
    _adapter      = adapter;
    _activeThread = null;

    buildDOM();
    renderConvList();

    if (peer) openThread(peer);
    if (poll) startPolling();
  }

  function destroy() {
    stopPolling();
    const s = $('msg-shell');
    if (s) s.innerHTML = '';
  }

  return { init, destroy, openThread };
})();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
if (typeof module !== 'undefined') {
  module.exports = { Messaging, LocalStorageAdapter, RestApiAdapter };
}

window.Messaging          = Messaging;
window.LocalStorageAdapter = LocalStorageAdapter;
window.RestApiAdapter     = RestApiAdapter;