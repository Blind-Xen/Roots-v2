/* ══════════════════════════════════════════
   shared/notify.js — Shared notification & toast helper
   Updated to use .rnav-bell and .rnav-bell-badge
══════════════════════════════════════════ */
(function (window) {
  const TOAST_LIFETIME = 3500;
  const fakeNotifications = [
    { title: 'New inquiry', message: 'A buyer asked about your fresh produce.' },
    { title: 'Listing approved', message: 'Your market listing is now live.' },
    { title: 'New follower', message: 'Sofia Ramos started following you.' }
  ];

  /* ── Inject panel styles once ── */
  function injectStyles() {
    if (document.getElementById('notif-anim-styles')) return;
    const style = document.createElement('style');
    style.id = 'notif-anim-styles';
    style.textContent = `
      #notification-panel {
        position: fixed;
        z-index: 9999;
        width: 320px;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.18);
        overflow: hidden;

        /* animation state — closed */
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px) scale(0.96);
        transform-origin: top right;
        pointer-events: none;
        transition: opacity .2s ease,
                    transform .22s cubic-bezier(.22,.68,0,1.2),
                    visibility 0s linear .22s;
      }

      #notification-panel.notif-open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
        pointer-events: all;
        transition: opacity .2s ease,
                    transform .22s cubic-bezier(.22,.68,0,1.2),
                    visibility 0s linear 0s;
      }

      /* stagger notification items */
      #notification-panel .notif-item {
        opacity: 0;
        transform: translateX(-6px);
        transition: opacity .18s ease, transform .18s ease;
      }
      #notification-panel.notif-open .notif-item {
        opacity: 1;
        transform: translateX(0);
      }
      #notification-panel.notif-open .notif-item:nth-child(1) { transition-delay: .05s; }
      #notification-panel.notif-open .notif-item:nth-child(2) { transition-delay: .09s; }
      #notification-panel.notif-open .notif-item:nth-child(3) { transition-delay: .13s; }
      #notification-panel.notif-open .notif-item:nth-child(4) { transition-delay: .17s; }
      #notification-panel.notif-open .notif-item:nth-child(5) { transition-delay: .21s; }

      /* bell shake on new notification */
      @keyframes bell-shake {
        0%,100% { transform: rotate(0); }
        20%      { transform: rotate(-18deg); }
        40%      { transform: rotate(16deg); }
        60%      { transform: rotate(-12deg); }
        80%      { transform: rotate(8deg); }
      }
      .rnav-bell.notif-shake,
      .nav-notif.notif-shake {
        animation: bell-shake .5s ease;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureToastContainer() {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    return toast;
  }

  function showToast(message, opts = {}) {
    const container = ensureToastContainer();
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    if (opts.className) item.classList.add(opts.className);
    container.appendChild(item);
    setTimeout(() => {
      item.classList.add('hide');
      setTimeout(() => item.remove(), 300);
    }, opts.duration || TOAST_LIFETIME);
    return item;
  }

  function setNotifCount(count) {
    const badges = document.querySelectorAll('.rnav-bell-badge, .nav-notif-badge');
    badges.forEach(b => {
      if (!count || count <= 0) {
        b.style.display = 'none';
        b.textContent = '';
      } else {
        b.style.display = 'flex';
        b.textContent = String(count);
      }
    });
  }

  function shakeBell() {
    document.querySelectorAll('.rnav-bell, .nav-notif').forEach(el => {
      el.classList.remove('notif-shake');
      /* force reflow so animation restarts if already shaking */
      void el.offsetWidth;
      el.classList.add('notif-shake');
      el.addEventListener('animationend', () => el.classList.remove('notif-shake'), { once: true });
    });
  }

  function createNotificationPanel() {
    injectStyles();
    let panel = document.getElementById('notification-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'notification-panel';
      document.body.appendChild(panel);
    }
    return panel;
  }

  function renderNotificationDropdown(notifs) {
    const panel = createNotificationPanel();

    if (!notifs || !notifs.length) {
      panel.innerHTML = `
        <div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px;color:#1a1a1a">
          Notifications
        </div>
        <div style="padding:24px 16px;text-align:center;color:#888;font-size:13px">
          No notifications yet.
        </div>`;
      return panel;
    }

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px;color:#1a1a1a">
        <span>Notifications</span>
        <button type="button" class="notification-clear" style="background:none;border:none;color:#888;font-size:12px;cursor:pointer;font-family:inherit">Clear all</button>
      </div>
      <div>
        ${notifs.map(n => `
          <div class="notif-item" style="padding:12px 16px;border-bottom:1px solid #f9f9f9">
            <div style="font-size:13px;font-weight:600;color:#1a1a1a;margin-bottom:2px">${n.title}</div>
            <div style="font-size:12px;color:#666;line-height:1.45">${n.message}</div>
          </div>
        `).join('')}
      </div>
    `;

    panel.querySelector('.notification-clear')?.addEventListener('click', () => {
      setNotifCount(0);
      panel.innerHTML = `
        <div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px;color:#1a1a1a">
          Notifications
        </div>
        <div style="padding:24px 16px;text-align:center;color:#888;font-size:13px">
          No notifications yet.
        </div>`;
    });

    return panel;
  }

  function positionNotificationPanel(trigger, panel) {
    const rect = trigger.getBoundingClientRect();
    const panelWidth = 320;
    let left = rect.right - panelWidth;
    if (left < 16) left = 16;
    panel.style.left = `${left}px`;
    panel.style.top  = `${rect.bottom + 10}px`;
  }

  /* ── Open / close with animation ── */
  function openNotificationPanel(trigger, notifs) {
    const panel = createNotificationPanel();
    renderNotificationDropdown(notifs);
    positionNotificationPanel(trigger, panel);
    /* force reflow before adding open class so transition fires */
    void panel.offsetWidth;
    panel.classList.add('notif-open');
  }

  function closeNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;
    panel.classList.remove('notif-open');
  }

  function isOpen() {
    const panel = document.getElementById('notification-panel');
    return panel && panel.classList.contains('notif-open');
  }

  function toggleNotificationDropdown(trigger, notifs) {
    if (isOpen()) {
      closeNotificationPanel();
    } else {
      openNotificationPanel(trigger, notifs);
    }
  }

  /* kept for backwards compat */
  function closeNotificationDropdown() { closeNotificationPanel(); }

  function incrementNotif(delta = 1) {
    const badge = document.querySelector('.rnav-bell-badge, .nav-notif-badge');
    if (!badge) return setNotifCount(delta);
    const n = parseInt(badge.textContent) || 0;
    setNotifCount(n + delta);
    shakeBell();
  }

  function clearNotif() { setNotifCount(0); }

  function initNotifications(options = {}) {
    injectStyles();
    const notifications = options.fakeData ? fakeNotifications : [];
    if (options.fakeData) setNotifCount(notifications.length);

    const selector = options.selector || '.rnav-bell, .nav-notif';
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        /* Close avatar dropdowns if open */
        document.querySelectorAll('.rnav-dropdown').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.rnav-avatar').forEach(a => a.setAttribute('aria-expanded', 'false'));
        toggleNotificationDropdown(el, notifications);
      });
    });

    document.addEventListener('click', event => {
      if (!isOpen()) return;
      const panel = document.getElementById('notification-panel');
      if (panel && panel.contains(event.target)) return;
      if (event.target.closest(selector)) return;
      closeNotificationPanel();
    });

    return {
      set:        setNotifCount,
      inc:        incrementNotif,
      clear:      clearNotif,
      toast:      showToast,
      shake:      shakeBell,
      sample:     fakeNotifications,
      closePanel: closeNotificationDropdown
    };
  }

  /* Public API */
  window.showToast          = showToast;
  window.initNotifications  = initNotifications;
  window.setNotifCount      = setNotifCount;
  window.incrementNotif     = incrementNotif;
  window.clearNotif         = clearNotif;

})(window);