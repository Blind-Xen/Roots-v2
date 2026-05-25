/* ══════════════════════════════════════════
   shared/userdd.js — Shared user dropdown helper
══════════════════════════════════════════ */
(function (window) {

  const DEFAULT_MENU = [
    { label: 'Dashboard',     route: 'dashboard', icon: '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    { label: 'Farm Map',      route: 'farmmap',   icon: '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>' },
    { label: 'Harvest Cal',   route: 'calendar',  icon: '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
    { label: 'Payment / Cart',route: 'payment',   icon: '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/></svg>' },
    { label: 'Documents',     route: 'document',  icon: '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>' },
  ];

  const DEFAULT_ACTIONS = [
    { label: 'Log out', action: 'logout', variant: 'danger', icon: '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' }
  ];

  function createHtmlMarkup(user, menu, actions) {
    const profileHeader = `
      <div class="dd-header">
        <div class="dd-avatar">${user.initials || ''}</div>
        <div>
          <div class="dd-name">${user.name || ''}</div>
          <div class="dd-role">${user.role || ''}</div>
        </div>
      </div>
    `;

    const currentRoute = String(window.location.pathname || '').split('/').pop().replace('.html', '');
    const menuItems = (menu || []).map(item => {
      const activeClass = item.route && item.route === currentRoute ? ' active' : '';
      return `
        <a href="#" ${item.route ? `data-route="${item.route}"` : ''} class="dd-item${activeClass}">
          ${item.icon || ''}
          ${item.label || ''}
        </a>
      `;
    }).join('');

    const actionItems = (actions || []).map(item => `
      <button type="button" class="dd-item ${item.variant || ''}" data-action="${item.action || ''}">
        ${item.icon || ''}
        ${item.label || ''}
      </button>
    `).join('');

    return `
      ${profileHeader}
      <div class="dd-section">${menuItems}</div>
      <div class="dd-section">${actionItems}</div>
    `;
  }

  function initUserDropdown(options) {
    const avatarBtn = document.getElementById(options.avatarBtnId || 'avatarBtn');
    const dropdown  = document.getElementById(options.dropdownId  || 'profileDropdown');

    if (!avatarBtn || !dropdown) return null;

    const user     = options.user    || {};
    const menu     = options.menu    || DEFAULT_MENU;
    const actions  = options.actions || DEFAULT_ACTIONS;
    const onAction = options.onAction || function () {};

    avatarBtn.textContent  = user.initials || '';
    dropdown.innerHTML     = createHtmlMarkup(user, menu, actions);

    // Run after innerHTML is set — defer ensures DOM is ready
    setTimeout(() => {
      if (window.Base && window.Base.resolveAll) Base.resolveAll();
    }, 0);

    avatarBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = dropdown.classList.toggle('visible');
      avatarBtn.classList.toggle('open', open);
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('visible');
      avatarBtn.classList.remove('open');
    });

    dropdown.addEventListener('click', (event) => {
      event.stopPropagation();
      const target = event.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      if (action) onAction(action, target);
    });

    return {
      open:   () => { dropdown.classList.add('visible');    avatarBtn.classList.add('open');    },
      close:  () => { dropdown.classList.remove('visible'); avatarBtn.classList.remove('open'); },
      toggle: () => { const open = dropdown.classList.toggle('visible'); avatarBtn.classList.toggle('open', open); }
    };
  }

  window.initUserDropdown = initUserDropdown;
})(window);