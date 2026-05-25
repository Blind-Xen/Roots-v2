/**
 * ═══════════════════════════════════════════════════════
 * ROOTS — FARMER DOCUMENTS MODULE
 * Manages document storage, DA approval workflow,
 * sharing controls, and UI interactions.
 * ═══════════════════════════════════════════════════════
 */

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
const state = {
  documents: [],
  currentView: 'all',
  currentLayout: 'grid',
  filterQuery: '',
  sortMode: 'date-desc',
  pendingFiles: [],
  shareTargetId: null,
};

/* ──────────────────────────────────────────
   MOCK DATA  (replace with API calls)
────────────────────────────────────────── */
const MOCK_DOCS = [
  {
    id: 1,
    title: 'Land Title – Lot No. 4821-A',
    category: 'title',
    status: 'approved',
    size: '1.2 MB',
    date: '2026-03-15',
    shared: false,
    daNote: 'Verified by DA Region X on March 22, 2026. All details confirmed.',
    notes: 'Primary farm parcel in Oroquieta City.',
  },
  {
    id: 2,
    title: 'Fertilizer Subsidy Application Form',
    category: 'subsidy',
    status: 'pending',
    size: '876 KB',
    date: '2026-04-28',
    shared: true,
    daNote: 'Under review — DA will respond within 5–7 business days.',
    notes: '',
  },
  {
    id: 3,
    title: 'Farm Registration Permit 2026',
    category: 'permit',
    status: 'approved',
    size: '2.1 MB',
    date: '2026-01-10',
    shared: true,
    daNote: 'Permit valid until December 31, 2026.',
    notes: '',
  },
  {
    id: 4,
    title: 'Crop Insurance Certificate – Palay',
    category: 'insurance',
    status: 'approved',
    size: '540 KB',
    date: '2026-02-20',
    shared: false,
    daNote: 'PCIC policy confirmed. Coverage: ₱35,000.',
    notes: 'For wet season 2026.',
  },
  {
    id: 5,
    title: 'Water Irrigation Permit',
    category: 'permit',
    status: 'pending',
    size: '1.8 MB',
    date: '2026-04-30',
    shared: false,
    daNote: 'Awaiting NIA signature.',
    notes: 'Submitted to NIA Misamis Occidental.',
  },
  {
    id: 6,
    title: 'Seed Subsidy Form – Season 1',
    category: 'subsidy',
    status: 'approved',
    size: '410 KB',
    date: '2025-11-05',
    shared: true,
    daNote: 'Approved. Seeds distributed November 12, 2025.',
    notes: '',
  },
  {
    id: 7,
    title: 'Deed of Absolute Sale – Lot 9-B',
    category: 'title',
    status: 'private',
    size: '3.2 MB',
    date: '2024-08-01',
    shared: false,
    daNote: '',
    notes: 'Keep private — pending notarization.',
  },
];

/* ──────────────────────────────────────────
   CATEGORY METADATA
────────────────────────────────────────── */
const CAT_META = {
  title:     { emoji: '🗺️', label: 'Land Title',    class: 'type-title' },
  permit:    { emoji: '🪪', label: 'Permit',         class: 'type-permit' },
  subsidy:   { emoji: '💰', label: 'Subsidy Form',   class: 'type-subsidy' },
  insurance: { emoji: '🛡️', label: 'Insurance',     class: 'type-insurance' },
  other:     { emoji: '📄', label: 'Other',          class: 'type-other' },
};

/* ──────────────────────────────────────────
   NAV FIX — runs after first paint so
   getBoundingClientRect returns real height
────────────────────────────────────────── */
function applyNavOffset() {
  const nav = document.getElementById('roots-nav');
  if (!nav) return;

  // Move nav to top of body if it got injected elsewhere
  if (nav.parentElement !== document.body) {
    document.body.insertBefore(nav, document.body.firstChild);
  }

  // Wait for paint so height is real
  requestAnimationFrame(() => {
    const h = nav.getBoundingClientRect().height;
    if (!h) return; // bail if still 0, resize observer will catch it

    document.documentElement.style.setProperty('--topbar-h', h + 'px');

    const sidebar = document.querySelector('.docs-sidebar');
    const layout  = document.querySelector('.docs-layout');
    if (sidebar) {
      sidebar.style.top    = h + 'px';
      sidebar.style.height = `calc(100vh - ${h}px)`;
    }
    if (layout) {
      layout.style.paddingTop = h + 'px';
    }
  });
}

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyNavOffset();

  // Also re-apply on resize in case nav wraps/unwraps
  window.addEventListener('resize', applyNavOffset);

  state.documents = [...MOCK_DOCS];
  updateSidebarCounts();
  renderDocs();
  updateHeroStats();
  checkDaBanner();

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notifPanel') && !e.target.closest('.fb-action-btn')) {
      document.getElementById('notifPanel')?.classList.add('hidden');
    }
    if (!e.target.closest('#profileMenu') && !e.target.closest('.fb-avatar-btn')) {
      document.getElementById('profileMenu')?.classList.add('hidden');
    }
  });

  // Share scope radio → show/hide link box
  document.querySelectorAll('input[name="shareScope"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const box = document.getElementById('shareLinkBox');
      box.classList.toggle('hidden', radio.value !== 'link');
    });
  });
});

/* ──────────────────────────────────────────
   FILTERING & SORTING HELPERS
────────────────────────────────────────── */
function getFilteredDocs() {
  let docs = [...state.documents];

  switch (state.currentView) {
    case 'title':     docs = docs.filter(d => d.category === 'title'); break;
    case 'permit':    docs = docs.filter(d => d.category === 'permit'); break;
    case 'subsidy':   docs = docs.filter(d => d.category === 'subsidy'); break;
    case 'insurance': docs = docs.filter(d => d.category === 'insurance'); break;
    case 'shared':    docs = docs.filter(d => d.shared); break;
    case 'pending':   docs = docs.filter(d => d.status === 'pending'); break;
    default: break;
  }

  const q = state.filterQuery.toLowerCase();
  if (q) {
    docs = docs.filter(d =>
      d.title.toLowerCase().includes(q) ||
      (CAT_META[d.category]?.label || '').toLowerCase().includes(q)
    );
  }

  switch (state.sortMode) {
    case 'date-asc':  docs.sort((a, b) => a.date.localeCompare(b.date)); break;
    case 'name-asc':  docs.sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'status':    docs.sort((a, b) => a.status.localeCompare(b.status)); break;
    default:          docs.sort((a, b) => b.date.localeCompare(a.date)); break;
  }

  return docs;
}

/* ──────────────────────────────────────────
   RENDER
────────────────────────────────────────── */
function renderDocs() {
  const grid  = document.getElementById('docsGrid');
  const empty = document.getElementById('emptyState');
  const docs  = getFilteredDocs();

  const label = document.getElementById('docCountLabel');
  if (label) label.textContent = `${docs.length} document${docs.length !== 1 ? 's' : ''}`;

  if (docs.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = docs.map((doc, idx) => buildCard(doc, idx)).join('');
}

function buildCard(doc, idx) {
  const meta    = CAT_META[doc.category] || CAT_META.other;
  const dateStr = new Date(doc.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

  const statusLabel = { approved: 'DA Approved', pending: 'Pending DA', private: 'Private' };
  const statusClass = { approved: 'status-approved', pending: 'status-pending', private: 'status-private' };

  const sharedBadge = doc.shared
    ? `<span style="font-size:11px;color:var(--shared);font-weight:700;display:flex;align-items:center;gap:3px;margin-top:4px;"><i class="fas fa-share-nodes"></i> Shared with DA</span>`
    : '';

  return `
    <div class="doc-card" style="animation-delay:${idx * 0.05}s" onclick="openDetail(${doc.id})">
      <div class="doc-card-thumb ${meta.class}">
        <span>${meta.emoji}</span>
        <span class="doc-status-pill ${statusClass[doc.status]}">${statusLabel[doc.status]}</span>
      </div>
      <div class="doc-card-body">
        <div class="doc-card-title">${escHtml(doc.title)}</div>
        <div class="doc-card-meta">
          ${meta.label} · ${doc.size} · ${dateStr}
          ${sharedBadge}
        </div>
        <div class="doc-card-actions" onclick="event.stopPropagation()">
          <button class="doc-action-btn" onclick="openDetail(${doc.id})" title="View">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="doc-action-btn share" onclick="openShare(${doc.id})" title="Share">
            <i class="fas fa-share-nodes"></i> Share
          </button>
          <button class="doc-action-btn danger" onclick="deleteDoc(${doc.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ──────────────────────────────────────────
   SIDEBAR COUNTS & SECTION TITLES
────────────────────────────────────────── */
function updateSidebarCounts() {
  const docs = state.documents;
  const counts = {
    all:       docs.length,
    title:     docs.filter(d => d.category === 'title').length,
    permit:    docs.filter(d => d.category === 'permit').length,
    subsidy:   docs.filter(d => d.category === 'subsidy').length,
    insurance: docs.filter(d => d.category === 'insurance').length,
    shared:    docs.filter(d => d.shared).length,
    pending:   docs.filter(d => d.status === 'pending').length,
  };
  Object.entries(counts).forEach(([key, val]) => {
    const el = document.getElementById(`cnt-${key}`);
    if (el) el.textContent = val;
  });
}

const VIEW_TITLES = {
  all:       'All Documents',
  title:     'Land Titles',
  permit:    'Permits',
  subsidy:   'Subsidy Forms',
  insurance: 'Insurance',
  shared:    'Shared by Me',
  pending:   'Pending Approval',
};

function setView(view) {
  state.currentView = view;
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-${view}`)?.classList.add('active');
  document.getElementById('sectionTitle').textContent = VIEW_TITLES[view] || 'Documents';
  renderDocs();
}

/* ──────────────────────────────────────────
   LAYOUT TOGGLE
────────────────────────────────────────── */
function setLayout(layout) {
  state.currentLayout = layout;
  const grid = document.getElementById('docsGrid');
  grid.classList.toggle('list-view', layout === 'list');
  document.getElementById('gridBtn')?.classList.toggle('active', layout === 'grid');
  document.getElementById('listBtn')?.classList.toggle('active', layout === 'list');
}

/* ──────────────────────────────────────────
   FILTER & SORT
────────────────────────────────────────── */
function filterDocs(q) {
  state.filterQuery = q;
  renderDocs();
}

function handleGlobalSearch(q) {
  state.filterQuery = q;
  state.currentView = 'all';
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-all')?.classList.add('active');
  document.getElementById('docFilter').value = q;
  renderDocs();
}

function sortDocs(mode) {
  state.sortMode = mode;
  renderDocs();
}

/* ──────────────────────────────────────────
   HERO STATS
────────────────────────────────────────── */
function updateHeroStats() {
  const docs = state.documents;
  animateCount('hs-total',    docs.length);
  animateCount('hs-approved', docs.filter(d => d.status === 'approved').length);
  animateCount('hs-pending',  docs.filter(d => d.status === 'pending').length);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step  = Math.max(1, Math.floor(target / 20));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 40);
}

/* ──────────────────────────────────────────
   DA BANNER
────────────────────────────────────────── */
function checkDaBanner() {
  const hasPending = state.documents.some(d => d.status === 'pending');
  document.getElementById('daBanner')?.classList.toggle('hidden', !hasPending);
}

/* ──────────────────────────────────────────
   DETAIL MODAL
────────────────────────────────────────── */
function openDetail(id) {
  const doc = state.documents.find(d => d.id === id);
  if (!doc) return;

  const meta      = CAT_META[doc.category] || CAT_META.other;
  const dateStr   = new Date(doc.date).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const statusLabel = { approved: '✅ DA Approved', pending: '⏳ Pending DA Review', private: '🔒 Private' };

  document.getElementById('detailTitle').textContent = doc.title;

  const daSection = doc.daNote
    ? `<div class="detail-da-section">
        <h4><i class="fas fa-landmark"></i> Department of Agriculture Note</h4>
        <p>${escHtml(doc.daNote)}</p>
      </div>`
    : '';

  const notesSection = doc.notes
    ? `<div style="background:var(--sand);border-radius:var(--radius-sm);padding:12px 14px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-soft);text-transform:uppercase;margin-bottom:4px;">Notes</div>
        <div style="font-size:13.5px;color:var(--text-mid);">${escHtml(doc.notes)}</div>
      </div>`
    : '';

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-thumb ${meta.class}">${meta.emoji}</div>
    <div class="detail-meta-grid">
      <div class="detail-meta-item"><div class="detail-meta-label">Category</div><div class="detail-meta-value">${meta.label}</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">Status</div><div class="detail-meta-value">${statusLabel[doc.status]}</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">File Size</div><div class="detail-meta-value">${doc.size}</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">Upload Date</div><div class="detail-meta-value">${dateStr}</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">Sharing</div><div class="detail-meta-value">${doc.shared ? '🔗 Shared with DA' : '🔒 Private'}</div></div>
    </div>
    ${daSection}
    ${notesSection}
    <div class="detail-actions">
      <button class="btn-primary" onclick="downloadDoc(${doc.id})"><i class="fas fa-download"></i> Download</button>
      <button class="btn-share" onclick="closeDetailModal();openShare(${doc.id})"><i class="fas fa-share-nodes"></i> Share</button>
      <button class="btn-outline" onclick="requestDAReview(${doc.id})"><i class="fas fa-landmark"></i> Request DA Review</button>
    </div>
  `;

  document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.add('hidden');
}

/* ──────────────────────────────────────────
   SHARE MODAL
────────────────────────────────────────── */
function openShare(id) {
  const doc = state.documents.find(d => d.id === id);
  if (!doc) return;
  state.shareTargetId = id;
  document.getElementById('shareDocName').textContent = doc.title;
  document.getElementById('shareModal').classList.remove('hidden');

  const scope = doc.shared ? 'da' : 'private';
  const radio = document.querySelector(`input[name="shareScope"][value="${scope}"]`);
  if (radio) radio.checked = true;
  document.getElementById('shareLinkBox')?.classList.add('hidden');
}

function closeShareModal() {
  document.getElementById('shareModal').classList.add('hidden');
  state.shareTargetId = null;
}

function confirmShare() {
  const selected = document.querySelector('input[name="shareScope"]:checked')?.value;
  const doc = state.documents.find(d => d.id === state.shareTargetId);
  if (!doc || !selected) return;

  doc.shared = selected !== 'private';
  updateSidebarCounts();
  renderDocs();
  closeShareModal();

  const messages = {
    da:      '✅ Document shared with DA Office',
    link:    '🔗 Secure link generated & copied',
    private: '🔒 Document set to private',
  };
  showToast(messages[selected] || '✅ Sharing updated');
}

function copyShareLink() {
  const input = document.getElementById('shareLinkInput');
  navigator.clipboard?.writeText(input.value).catch(() => {});
  showToast('🔗 Link copied to clipboard!');
}

/* ──────────────────────────────────────────
   UPLOAD MODAL
────────────────────────────────────────── */
function openUploadModal() {
  state.pendingFiles = [];
  document.getElementById('uploadPreview').innerHTML = '';
  document.getElementById('docTitle').value = '';
  document.getElementById('docNotes').value = '';
  document.getElementById('uploadModal').classList.remove('hidden');
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.add('hidden');
}

function handleFileSelect(files) {
  [...files].forEach(f => addFileToQueue(f));
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropzone').classList.remove('drag-over');
  handleFileSelect(e.dataTransfer.files);
}

function addFileToQueue(file) {
  if (state.pendingFiles.some(f => f.name === file.name)) return;
  state.pendingFiles.push(file);

  const preview = document.getElementById('uploadPreview');
  const chip    = document.createElement('div');
  chip.className = 'preview-chip';
  chip.id = `chip-${file.name.replace(/\W/g, '_')}`;
  chip.innerHTML = `
    <i class="fas fa-file"></i>
    <span>${file.name}</span>
    <span class="remove-chip" onclick="removeFile('${file.name.replace(/'/g, "\\'")}')">✕</span>
  `;
  preview.appendChild(chip);

  const titleInput = document.getElementById('docTitle');
  if (!titleInput.value.trim()) {
    titleInput.value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  }
}

function removeFile(name) {
  state.pendingFiles = state.pendingFiles.filter(f => f.name !== name);
  document.getElementById(`chip-${name.replace(/\W/g, '_')}`)?.remove();
}

function submitUpload() {
  const title    = document.getElementById('docTitle').value.trim();
  const category = document.getElementById('docCategory').value;
  const submitDA = document.getElementById('docSubmitDA').value;
  const notes    = document.getElementById('docNotes').value.trim();

  if (!title) { showToast('⚠️ Please enter a document title', true); return; }
  if (state.pendingFiles.length === 0) { showToast('⚠️ Please attach at least one file', true); return; }

  const newDoc = {
    id:     Date.now(),
    title,
    category,
    status: submitDA === 'yes' ? 'pending' : 'private',
    size:   formatBytes(state.pendingFiles.reduce((s, f) => s + f.size, 0)),
    date:   new Date().toISOString().slice(0, 10),
    shared: submitDA === 'yes',
    daNote: submitDA === 'yes' ? 'Submitted to DA for review.' : '',
    notes,
  };

  state.documents.unshift(newDoc);
  updateSidebarCounts();
  updateHeroStats();
  checkDaBanner();
  renderDocs();
  closeUploadModal();
  showToast(`✅ "${title}" uploaded${submitDA === 'yes' ? ' & sent to DA' : ''}`);
}

/* ──────────────────────────────────────────
   DOCUMENT ACTIONS
────────────────────────────────────────── */
function downloadDoc(id) {
  const doc = state.documents.find(d => d.id === id);
  if (!doc) return;
  showToast(`⬇️ Downloading "${doc.title}"…`);
}

function deleteDoc(id) {
  const doc = state.documents.find(d => d.id === id);
  if (!doc) return;
  if (!confirm(`Delete "${doc.title}"?\n\nThis cannot be undone.`)) return;
  state.documents = state.documents.filter(d => d.id !== id);
  updateSidebarCounts();
  updateHeroStats();
  checkDaBanner();
  renderDocs();
  showToast('🗑️ Document deleted');
}

function requestDAReview(id) {
  const doc = state.documents.find(d => d.id === id);
  if (!doc) return;
  if (doc.status === 'approved') { showToast('✅ This document is already approved by DA'); return; }
  doc.status = 'pending';
  doc.shared = true;
  doc.daNote = 'Submitted for DA review. You will be notified once confirmed.';
  updateSidebarCounts();
  updateHeroStats();
  checkDaBanner();
  renderDocs();
  closeDetailModal();
  showToast('📤 Sent to DA Region X for review');
}

/* ──────────────────────────────────────────
   DROPDOWNS
────────────────────────────────────────── */
function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const profileMenu = document.getElementById('profileMenu');
  profileMenu.classList.add('hidden');
  panel.classList.toggle('hidden');
}

function toggleProfileMenu() {
  const menu = document.getElementById('profileMenu');
  const notifPanel = document.getElementById('notifPanel');
  notifPanel.classList.add('hidden');
  menu.classList.toggle('hidden');
}

function closeProfileMenu() {
  document.getElementById('profileMenu').classList.add('hidden');
}

/* ──────────────────────────────────────────
   TOAST
────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, warn = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = warn ? '#e65100' : 'var(--forest)';
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

/* ──────────────────────────────────────────
   UTILITIES
────────────────────────────────────────── */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}