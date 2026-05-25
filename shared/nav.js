/**
 * Roots — Shared Navigation
 * Usage: <script src="/shared/nav.js"></script>
 *
 * Desktop: CSS Grid, 3 columns — brand | tabs | right-controls
 * Mobile:  flex-column — top bar (row1) + tab strip (row2)
 *          Search icon in top bar expands to full-width input on tap
 */
(function () {

  /* 1. Inject CSS */
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = '/shared/nav.css';
  document.head.appendChild(link);

  /* 2. Right-controls HTML (injected twice — Mobile inside row1, Desktop at grid col 3) */
  const RIGHT_HTML = (id_suffix) => `
    <div class="rnav-right">
      <div class="rnav-search">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search Roots...">
      </div>

      <!-- Mobile-only search icon -->
      <div class="rnav-search-icon" role="button" aria-label="Search">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>

      <div class="rnav-messages" role="button" aria-label="Messages">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        <div class="rnav-messages-badge" id="rnavMessagesBadge" style="display:none">0</div>
      </div>

      <div class="rnav-bell" role="button" aria-label="Notifications">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <div class="rnav-bell-badge">4</div>
      </div>

      <div class="rnav-admin" role="button" aria-label="Admin Panel" id="rnavAdminBtn">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>

      <div class="rnav-profile">
        <div class="rnav-avatar" id="rnavAvatar${id_suffix}" role="button" aria-label="Profile menu" aria-expanded="false">KM</div>
        <div class="rnav-dropdown" id="rnavDropdown${id_suffix}">

          <div class="rnav-dd-header">
            <div class="rnav-dd-avatar">KM</div>
            <div>
              <div class="rnav-dd-name">Karlo Mendoza</div>
              <div class="rnav-dd-role">Farmer · Zamboanga del Sur</div>
            </div>
          </div>

          <div class="rnav-dd-section">
            <a href="/dropdown/dashboard/dashboard.html" class="rnav-dd-item">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>Dashboard
            </a>
            <a href="/dropdown/farmmap/farmmap.html" class="rnav-dd-item">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
              </svg>Farm Map
            </a>
            <a href="/dropdown/calendar/calendar.html" class="rnav-dd-item">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>Harvest Cal
            </a>
            <a href="#" class="rnav-dd-item">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
              </svg>Payment / Cart
            </a>
            <a href="#" class="rnav-dd-item">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
              </svg>Documents
            </a>
          </div>

          <div class="rnav-dd-section">
            <button class="rnav-dd-item danger rnavLogout">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>Log out
            </button>
          </div>

        </div>
      </div>
    </div>`;

  /* 3. Full nav HTML */
  const NAV_HTML = `
<nav id="roots-nav">

  <div class="rnav-row1">
    <a class="rnav-brand" href="/community/views/roots-feed.html">
      <img class="rnav-brand-icon" src="/assets/logo.png" alt="Roots Logo">
      <span class="rnav-brand-name">Roots</span>
    </a>

    <!-- Mobile search overlay -->
    <div class="rnav-mobile-search" id="rnavMobileSearch">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input type="text" placeholder="Search Roots..." id="rnavMobileInput">
      <button class="rnav-search-close" id="rnavSearchClose" aria-label="Close search">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    ${RIGHT_HTML('Mobile')}
  </div>

  <div class="rnav-row2">
    <a href="/community/views/roots-feed.html" class="rnav-tab" data-tab="home">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>Home
    </a>
    <a href="/video/videos.html" class="rnav-tab" data-tab="videos">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>Videos
    </a>
    <a href="/market/market.html" class="rnav-tab" data-tab="market">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>Market
    </a>
    <a href="/tanim/tanim/tanimbase.html" class="rnav-tab" data-tab="plant">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
        <path d="M12 2c-2.76 3.6-4 7.4-4 10s1.24 6.4 4 10M12 2c2.76 3.6 4 7.4 4 10s-1.24 6.4-4 10M2 12h20"/>
      </svg>Plant
    </a>
  </div>

  ${RIGHT_HTML('Desktop')}

</nav>`.trim();

  /* 4. Inject */
  const existing = document.querySelector('nav');
  if (existing) {
    existing.outerHTML = NAV_HTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  }

  /* 5. Active tab */
  const path = window.location.pathname;
  const tabMap = { home: 'roots-feed', videos: 'videos', market: 'market', plant: 'tanimbase' };
  document.querySelectorAll('.rnav-tab').forEach(tab => {
    const key = tab.dataset.tab;
    if (key && tabMap[key] && path.includes(tabMap[key])) tab.classList.add('active');
  });

  /* 6. Avatar dropdowns */
  ['Mobile', 'Desktop'].forEach(suffix => {
    const avatar   = document.getElementById('rnavAvatar'   + suffix);
    const dropdown = document.getElementById('rnavDropdown' + suffix);
    if (!avatar || !dropdown) return;
    avatar.addEventListener('click', e => {
      e.stopPropagation();
      /* Close notification panel if open */
      const notifPanel = document.getElementById('notification-panel');
      if (notifPanel) notifPanel.classList.remove('notif-open');
      const open = dropdown.classList.toggle('open');
      avatar.setAttribute('aria-expanded', open);
    });
    dropdown.addEventListener('click', e => e.stopPropagation());
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.rnav-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.rnav-avatar').forEach(a => a.setAttribute('aria-expanded', 'false'));
  });

  /* 7. Mobile search expand/collapse */
  const mobileSearch = document.getElementById('rnavMobileSearch');
  const mobileInput  = document.getElementById('rnavMobileInput');
  const searchClose  = document.getElementById('rnavSearchClose');

  function openMobileSearch() {
    if (!mobileSearch) return;
    mobileSearch.classList.add('open');
    setTimeout(() => mobileInput && mobileInput.focus(), 50);
  }

  function closeMobileSearch() {
    if (!mobileSearch) return;
    mobileSearch.classList.remove('open');
    if (mobileInput) mobileInput.value = '';
  }

  document.querySelectorAll('.rnav-search-icon').forEach(icon => {
    icon.addEventListener('click', openMobileSearch);
  });
  if (searchClose) searchClose.addEventListener('click', closeMobileSearch);
  if (mobileInput) {
    mobileInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMobileSearch();
    });
  }

  /* 8. Logout */
  document.querySelectorAll('.rnavLogout').forEach(btn =>
    btn.addEventListener('click', () => console.log('[Roots] Logout clicked'))
  );

 /* 9. Messages */
document.querySelectorAll('.rnav-messages').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = '/community/messaging/messaging.html';
  });
});

  /* 10. Admin button */
  document.querySelectorAll('.rnav-admin').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '/admin/main-admin.html';
    });
  });

  window.showAdminButton = function() {
    document.querySelectorAll('.rnav-admin').forEach(btn => btn.style.display = 'flex');
    console.log('[Roots] Admin button shown');
  };
  window.hideAdminButton = function() {
    document.querySelectorAll('.rnav-admin').forEach(btn => btn.style.display = 'none');
    console.log('[Roots] Admin button hidden');
  };



  /* ══════════════════════════════════════════════
     11. PAGE TRANSITIONS
     — Exit: fade + slide up on nav link click
     — Enter: fade + slide up from below on load
  ══════════════════════════════════════════════ */

  /* Helper: navigate with exit animation */
  function navigateTo(href) {
    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = href;
    }, 260);
  }

  /* Intercept all nav links — tabs, brand, dropdown items */
  document.querySelectorAll('.rnav-tab, .rnav-brand, .rnav-dd-item').forEach(el => {
    const href = el.getAttribute('href');

    /* Skip: no href, hash-only, external, or _blank */
    if (!href || href === '#' || href.startsWith('http') || el.getAttribute('target') === '_blank') return;

    el.addEventListener('click', e => {
      /* Skip if it's the current page */
      if (window.location.pathname === new URL(href, window.location.origin).pathname) return;

      e.preventDefault();
      navigateTo(href);
    });
  });

  /* Page enter animation on load */
  document.body.classList.add('page-enter');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('page-enter-active');
      /* Clean up classes after transition */
      document.body.addEventListener('transitionend', () => {
        document.body.classList.remove('page-enter', 'page-enter-active');
      }, { once: true });
    });
  });

})();