/* ══════════════════════════════════════════════
   skeleton.js — TanimBase Skeleton Loader
   Drop this before tanimbase.js in the HTML.
   Usage: Skeleton.show() / Skeleton.hide()
══════════════════════════════════════════════ */

const Skeleton = (() => {

  /* ── Config: how many ghost cards to render ── */
  const CARD_COUNT = 8;

  /* ── Card widths/tag counts vary so it feels organic ── */
  const CARD_VARIANTS = [
    { name: '75%',  sci: '55%', tags: [68, 55] },
    { name: '60%',  sci: '45%', tags: [72, 60, 50] },
    { name: '80%',  sci: '62%', tags: [65] },
    { name: '68%',  sci: '50%', tags: [78, 58] },
    { name: '85%',  sci: '58%', tags: [60, 66] },
    { name: '55%',  sci: '42%', tags: [72, 54, 62] },
    { name: '70%',  sci: '48%', tags: [65, 70] },
    { name: '76%',  sci: '56%', tags: [80] },
  ];

  /* ── Inject styles once ── */
  function injectStyles() {
    if (document.getElementById('sk-styles')) return;
    const style = document.createElement('style');
    style.id = 'sk-styles';
    style.textContent = `
      @keyframes sk-shimmer {
        0%   { background-position: -700px 0; }
        100% { background-position:  700px 0; }
      }
      .sk {
        background: linear-gradient(
          90deg,
          rgba(30,92,58,.06) 25%,
          rgba(30,92,58,.13) 50%,
          rgba(30,92,58,.06) 75%
        );
        background-size: 700px 100%;
        animation: sk-shimmer 1.5s infinite linear;
        border-radius: 6px;
      }
      /* Hero */
      #sk-root .sk-hero {
        background: linear-gradient(135deg,#c8dfd1 0%,#b8d4c4 60%,#c2dccb 100%);
        border-radius: 16px;
        padding: 36px 40px;
        margin-bottom: 32px;
        min-height: 160px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        overflow: hidden;
        position: relative;
      }
      #sk-root .sk-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,.18) 50%, transparent 75%);
        background-size: 700px 100%;
        animation: sk-shimmer 1.5s infinite linear;
      }
      #sk-root .sk-hero-text   { display:flex; flex-direction:column; gap:10px; position:relative; }
      #sk-root .sk-eyebrow     { height:10px; width:90px;  background:rgba(255,255,255,.35); border-radius:4px; }
      #sk-root .sk-h-title     { height:32px; width:260px; background:rgba(255,255,255,.45); border-radius:8px; }
      #sk-root .sk-h-sub       { height:12px; width:340px; background:rgba(255,255,255,.28); border-radius:4px; }
      #sk-root .sk-h-sub2      { height:12px; width:260px; background:rgba(255,255,255,.22); border-radius:4px; }
      #sk-root .sk-hero-stats  { display:flex; gap:16px; position:relative; }
      #sk-root .sk-stat {
        background: rgba(255,255,255,.18);
        border: 1px solid rgba(255,255,255,.22);
        border-radius: 12px;
        padding: 12px 18px;
        display: flex; flex-direction:column; align-items:center; gap:7px;
        min-width: 80px;
      }
      #sk-root .sk-stat-num   { height:22px; width:48px; background:rgba(255,255,255,.38); border-radius:5px; }
      #sk-root .sk-stat-label { height:9px;  width:56px; background:rgba(255,255,255,.25); border-radius:3px; }
      /* Search */
      #sk-root .sk-search-wrap { margin-bottom:14px; }
      #sk-root .sk-search {
        height:44px; max-width:600px;
        background:#fff;
        border:1.5px solid var(--border,#D8EDE3);
        border-radius:999px;
        display:flex; align-items:center; gap:10px;
        padding:0 18px;
        box-shadow:0 1px 6px rgba(30,92,58,.08);
      }
      #sk-root .sk-search-icon { width:20px; height:20px; border-radius:50%; flex-shrink:0; }
      #sk-root .sk-search-bar  { flex:1; height:14px; border-radius:4px; }
      /* Filter row */
      #sk-root .sk-filter-row  { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; flex-wrap:wrap; gap:10px; }
      #sk-root .sk-chips       { display:flex; gap:6px; flex-wrap:wrap; }
      #sk-root .sk-chip {
        height:32px; border-radius:999px;
        border:1.5px solid var(--border,#D8EDE3);
        background:#fff;
        box-shadow:0 1px 6px rgba(30,92,58,.08);
      }
      #sk-root .sk-chip-active {
        background: linear-gradient(90deg,#c8dfd1 25%,#d6e8dc 50%,#c8dfd1 75%);
        background-size: 400px 100%;
        animation: sk-shimmer 1.5s infinite linear;
        border-color: transparent;
      }
      #sk-root .sk-count { height:12px; width:110px; border-radius:4px; }
      /* Grid */
      #sk-root .sk-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
        gap: 16px;
      }
      #sk-root .sk-card {
        background: #fff;
        border-radius: 12px;
        border: 1.5px solid var(--border,#D8EDE3);
        overflow: hidden;
        box-shadow: 0 1px 6px rgba(30,92,58,.08);
      }
      #sk-root .sk-card-thumb { height:140px; }
      #sk-root .sk-card-body  { padding:12px 14px 14px; display:flex; flex-direction:column; gap:6px; }
      #sk-root .sk-card-tags  { display:flex; gap:5px; margin-top:3px; flex-wrap:wrap; }
      #sk-root .sk-tag        { height:18px; border-radius:999px; }
      /* Responsive */
      @media (max-width:900px) {
        #sk-root .sk-hero { flex-direction:column; align-items:flex-start; min-height:auto; padding:28px 32px; }
        #sk-root .sk-hero-stats { margin-top:20px; width:100%; justify-content:center; }
        #sk-root .sk-search { max-width:100%; }
      }
      @media (max-width:640px) {
        #sk-root .sk-grid { grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }
        #sk-root .sk-card-thumb { height:120px; }
        #sk-root .sk-hero { padding:24px 20px; border-radius:12px; }
        #sk-root .sk-h-title { width:180px; height:24px; }
        #sk-root .sk-h-sub   { width:240px; }
        #sk-root .sk-h-sub2  { display:none; }
      }
      @media (max-width:480px) {
        #sk-root .sk-grid { grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:10px; }
        #sk-root .sk-card-thumb { height:100px; }
        #sk-root .sk-hero-stats { flex-direction:column; gap:8px; }
        #sk-root .sk-stat { width:100%; }
        #sk-root .sk-chips { overflow-x:auto; flex-wrap:nowrap; padding-bottom:4px; -webkit-overflow-scrolling:touch; }
        #sk-root .sk-chip  { flex-shrink:0; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Build a ghost card ── */
  function buildCard(variant) {
    const v    = variant || CARD_VARIANTS[0];
    const tags = v.tags.map(w => `<div class="sk sk-tag" style="width:${w}px;"></div>`).join('');
    return `
      <div class="sk-card">
        <div class="sk sk-card-thumb"></div>
        <div class="sk-card-body">
          <div class="sk" style="height:16px;border-radius:5px;width:${v.name};"></div>
          <div class="sk" style="height:11px;border-radius:3px;width:${v.sci};"></div>
          <div class="sk-card-tags">${tags}</div>
        </div>
      </div>`;
  }

  /* ── Build full skeleton HTML ── */
  function buildHTML() {
    const chipWidths = [96, 100, 78, 76, 108, 82];
    const chips = chipWidths.map((w, i) =>
      `<div class="sk sk-chip${i === 0 ? ' sk-chip-active' : ''}" style="width:${w}px;"></div>`
    ).join('');

    const cards = Array.from({ length: CARD_COUNT }, (_, i) =>
      buildCard(CARD_VARIANTS[i % CARD_VARIANTS.length])
    ).join('');

    return `
      <div id="sk-root" role="status" aria-label="Loading plants…" aria-live="polite">

        <div class="sk-hero">
          <div class="sk-hero-text">
            <div class="sk-eyebrow"></div>
            <div class="sk-h-title"></div>
            <div class="sk-h-sub"></div>
            <div class="sk-h-sub2"></div>
          </div>
          <div class="sk-hero-stats">
            <div class="sk-stat">
              <div class="sk-stat-num"></div>
              <div class="sk-stat-label"></div>
            </div>
            <div class="sk-stat">
              <div class="sk-stat-num"></div>
              <div class="sk-stat-label"></div>
            </div>
          </div>
        </div>

        <div class="sk-search-wrap">
          <div class="sk-search">
            <div class="sk sk-search-icon"></div>
            <div class="sk sk-search-bar"></div>
          </div>
        </div>

        <div class="sk-filter-row">
          <div class="sk-chips">${chips}</div>
          <div class="sk sk-count"></div>
        </div>

        <div class="sk-grid">${cards}</div>

      </div>`;
  }

  /* ── Public API ── */

  /**
   * Skeleton.show()
   * Hides #list-content and appends the skeleton inside #view-list.
   */
  function show() {
    injectStyles();
    if (document.getElementById('sk-root')) return;

    /* Hide real content */
    const listContent = document.getElementById('list-content');
    if (listContent) listContent.style.display = 'none';

    /* Mount skeleton inside #view-list */
    const container = document.createElement('div');
    container.innerHTML = buildHTML();
    const skRoot = container.firstElementChild;

    const viewList = document.getElementById('view-list');
    if (viewList) {
      viewList.appendChild(skRoot);
    } else {
      document.querySelector('.main-content')?.appendChild(skRoot);
    }
  }

  /**
   * Skeleton.hide()
   * Fades out the skeleton, removes it, then restores #list-content.
   */
  function hide() {
    const root = document.getElementById('sk-root');
    if (!root) return;

    root.style.transition = 'opacity .25s ease';
    root.style.opacity    = '0';

    setTimeout(() => {
      root.remove();
      /* Restore real content */
      const listContent = document.getElementById('list-content');
      if (listContent) listContent.style.display = 'block';
    }, 260);
  }

  return { show, hide };

})();