// Roots Livestock — UI shell (toast, theme, dropdowns)
// ===== SECTION: DROPDOWNS =====
// ======================================================================
function toggleNotifDropdown(e) {
  e.stopPropagation();
  document.getElementById('profileDropdown')?.classList.add('hidden');
  document.getElementById('notifDropdown')?.classList.toggle('hidden');
}
function closeNotifDropdown()  { document.getElementById('notifDropdown')?.classList.add('hidden'); }

function toggleProfileDropdown(e) {
  e.stopPropagation();
  document.getElementById('notifDropdown')?.classList.add('hidden');
  document.getElementById('profileDropdown')?.classList.toggle('hidden');
}
function closeProfileDropdown() { document.getElementById('profileDropdown')?.classList.add('hidden'); }

function handleOutsideClick(e) {
  const notifWrapper = document.getElementById('notifWrapper');
  const profileWrapper = document.getElementById('profileWrapper');
  if (notifWrapper && !notifWrapper.contains(e.target)) closeNotifDropdown();
  if (profileWrapper && !profileWrapper.contains(e.target)) closeProfileDropdown();
}

// ======================================================================
// ===== SECTION: SIDEBAR =====
// ======================================================================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('sidebar-overlay').classList.toggle('active');
}

// ======================================================================
// ===== SECTION: THEME =====
// ======================================================================
function setTheme(mode) {
  document.body.classList.toggle('dark-theme', mode === 'dark');
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.classList.contains(mode + '-mode'));
  });
  showToast(mode === 'dark' ? '🌙 Dark mode on' : '☀️ Light mode on');
}

// ===== SECTION: MODULE SWITCHER =====
// ======================================================================
function switchModule(i) {
  const modules = [
    { name: 'Dashboard',        icon: '🏠', msg: 'View your farm overview, recent activity, and quick stats.' },
    { name: 'Videos',           icon: '🎬', msg: 'Watch farming tutorials and DA advisory videos.' },
    { name: 'Livestock',        icon: '🐄', msg: 'You are already on the Livestock module.' },
    { name: 'Fruits & Veg',     icon: '🥬', msg: 'Browse and sell fruits and vegetables from local farms.' },
    { name: 'Land & Equipment', icon: '🚜', msg: 'Rent or sell farm land and equipment.' },
    { name: 'Map',              icon: '🗺️',  msg: 'View farms, markets, and DA offices on the map.' },
    { name: 'Calendar',         icon: '📅', msg: 'Manage planting schedules, farm events, and reminders.' },
    { name: 'Documents',        icon: '📄', msg: 'Access DA forms, certificates, and farm records.' },
    { name: 'Payments',         icon: '💸', msg: 'Track payments, transactions, and sales history.' },
    { name: 'Community',        icon: '👥', msg: 'Connect with farmers, join groups, and share tips.' }
  ];
  const mod = modules[i];
  if (!mod) return;
  if (i === 2) { showToast('🐄 You are already on Livestock!'); return; }
  document.getElementById('moduleSwitcherIcon').textContent = mod.icon;
  document.getElementById('moduleSwitcherName').textContent = mod.name;
  document.getElementById('moduleSwitcherMsg').textContent  = mod.msg;
  document.getElementById('moduleSwitcherOverlay').classList.remove('hidden');
}

function closeModuleSwitcher() {
  document.getElementById('moduleSwitcherOverlay').classList.add('hidden');
}

// ======================================================================
