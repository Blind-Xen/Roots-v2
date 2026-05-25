// Roots Livestock — app bootstrap
// ===== SECTION: KEYBOARD SHORTCUTS =====
// ======================================================================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['addListingModal','listingDetailModal','myListingsModal','cartModal','savedModal',
     'farmerIntroModal','farmerLoginModal','farmerRegModal','termsModal','privacyPolicyModal'].forEach(id =>
      document.getElementById(id)?.classList.add('hidden')
    );
    closeNotifDropdown();
    closeProfileDropdown();
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebar-overlay').classList.remove('active');
    closeModuleSwitcher();
  }
});

// ======================================================================
// ===== SECTION: INITIALIZATION =====
// ======================================================================
document.addEventListener('DOMContentLoaded', () => {
  initBarangaySelects();

  const today  = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const todayLabel = document.getElementById('todayLabel');
  if (todayLabel) {
    todayLabel.textContent = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  }

  if (window.location.protocol === 'file:') {
    console.warn('[Roots] Running from file://; backend API sync is unavailable.');
    showToast('⚠️ Open via http://localhost/roots-livestock-finalna to sync listings to the database.');
  }

  // ── 1. Show seed/local data instantly so the page isn't blank ──
  const saved = loadFromStorage();
  if (saved) {
    listings = saved;
    console.log(`[Roots] Loaded ${listings.length} listings from localStorage (temp)`);
  } else {
    saveToStorage();
    console.log('[Roots] No saved data — using seed data');
  }

  const savedActivity = loadAdminActivityFromStorage();
  if (savedActivity) {
    adminActivity = savedActivity;
  } else {
    saveAdminActivityToStorage();
  }

  loadBuyerData();
  applyUserModeUI();

  renderProfileStats();
  const allFilterBtn = document.querySelector('.filter-chip[data-kind="type"][data-filter="all"]');
  if (allFilterBtn) {
    setTypeFilter('all', allFilterBtn);
  } else {
    renderListings();
  }
  renderNotifications();
  loadSavedProfilePhoto();
  document.addEventListener('click', handleOutsideClick);

  // ── 2. Immediately load real data from DB — this is the source of truth ──
  // The page renders instantly above, then updates with live DB data
  if (USE_API) {
    syncListingsFromApi()
      .then(() => console.log('[Roots] Loaded from database ✓'))
      .catch(() => console.warn('[Roots] DB unavailable — showing local data'));

    // In case listings sync is slow/fails, still try to load profile stats.
    syncProfileStatsFromApi().catch(() => {});
  }

  window.addEventListener('storage', (event) => {
    if (event.key === LS_KEY_ACTIVITY) {
      const savedActivity = loadAdminActivityFromStorage();
      if (savedActivity) {
        adminActivity = savedActivity;
        if (document.getElementById('adminActivityList')) {
          renderAdminOverview();
        }
      }
    }
  });
});

// ======================================================================
