// Roots Livestock — admin panel
// ===== ADMIN PANEL — FULLY LIVE & CONNECTED =====
// ======================================================================

const LS_KEY_ACTIVITY = 'roots_livestock_admin_activity';

// Suspended farmer IDs (runtime state)
let suspendedFarmers = new Set();

// Admin activity log (runtime, prepended on events)
let adminActivity = [
  { dot: 'green',  msg: 'New listing posted: <strong>Brahman Cross Cow</strong>', time: '2 hours ago • Aling Coring Reyes', timestamp: Date.now() - 2 * 60 * 60 * 1000 },
  { dot: 'blue',   msg: 'Farmer registered: <strong>Juana Reyes</strong>',        time: '5 hours ago • Brgy. Pines', timestamp: Date.now() - 5 * 60 * 60 * 1000 },
  { dot: 'amber',  msg: 'DA Verification approved: <strong>Nong Berto Cabales</strong>', time: 'Yesterday • Brgy. Clarin', timestamp: Date.now() - 24 * 60 * 60 * 1000 },
  { dot: 'red',    msg: 'Report filed on listing: <strong>50 Native Chickens</strong>', time: 'Yesterday • Suspected mislabeling', timestamp: Date.now() - 26 * 60 * 60 * 1000 },
  { dot: 'green',  msg: 'Listing marked SOLD: <strong>Work Carabao</strong>',      time: '2 days ago • Kuya Pepe Dela Cruz', timestamp: Date.now() - 48 * 60 * 60 * 1000 }
];

function saveAdminActivityToStorage() {
  try {
    localStorage.setItem(LS_KEY_ACTIVITY, JSON.stringify(adminActivity));
  } catch (e) {
    console.warn('[Roots] Admin activity save failed:', e);
  }
}

function loadAdminActivityFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY_ACTIVITY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return Array.isArray(saved)
      ? saved.map(item => ({ ...item, timestamp: item.timestamp || Date.now() }))
      : null;
  } catch (e) {
    console.warn('[Roots] Admin activity load failed:', e);
    return null;
  }
}

function logAdminActivity(dot, msg, time) {
  adminActivity.unshift({ dot, msg, time: time || 'Just now', timestamp: Date.now() });
  if (adminActivity.length > 20) adminActivity.pop();
  saveAdminActivityToStorage();
  if (document.getElementById('adminActivityList')) {
    renderAdminOverview();
  }
}

function openAdminPanel() {
  document.getElementById('adminPanel').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  refreshAdminPanel();
}

function closeAdminPanel() {
  document.getElementById('adminPanel').classList.add('hidden');
  document.body.style.overflow = '';
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
  const content = document.getElementById('adminTab-' + tab);
  if (content) content.classList.remove('hidden');
  if (btn) btn.classList.add('active');
  refreshAdminPanel();
}

// ── Master refresh: re-renders all admin sub-sections from live data ──
function refreshAdminPanel() {
  renderAdminOverview();
  renderAdminListingsTable();
  renderAdminFarmers();
}

// ── OVERVIEW ──
function renderAdminOverview() {
  const all      = listings;
  const active   = all.filter(l => l.status === 'active');
  const farmers  = [...new Set(all.map(l => l.seller))];
  const daVerif  = farmers.filter(name => {
    const l = all.find(x => x.seller === name);
    return l && l.daVerified;
  });

  const totalEl   = document.getElementById('adm-total-listings');
  const farmersEl = document.getElementById('adm-total-farmers');
  const verifiedEl= document.getElementById('adm-verified');

  if (totalEl)    totalEl.textContent   = all.filter(l => l.status !== 'deleted').length;
  if (farmersEl)  farmersEl.textContent = farmers.length;
  if (verifiedEl) verifiedEl.textContent= daVerif.length;

  // Activity list
  const actEl = document.getElementById('adminActivityList');
  if (actEl) {
    actEl.innerHTML = adminActivity
      .slice()
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .map(a => `
      <div class="admin-activity-item">
        <div class="admin-activity-dot ${a.dot}"></div>
        <div class="admin-activity-body">
          <span class="admin-activity-msg">${a.msg}</span>
          <span class="admin-activity-time">${a.time}</span>
        </div>
      </div>`).join('');
  }

  // Breakdown by animal type
  const types = ['hog','poultry','cattle','goat','carabao','other'];
  const typeEmoji = { hog:'🐖', poultry:'🐓', cattle:'🐄', goat:'🐐', carabao:'🦬', other:'🐇' };
  const typeName  = { hog:'Hogs', poultry:'Poultry', cattle:'Cattle', goat:'Goats', carabao:'Carabao', other:'Other' };
  const typeColor = { hog:'#388E3C', poultry:'#1976D2', cattle:'#F57C00', goat:'#7B1FA2', carabao:'#5D4037', other:'#888' };
  const counts    = types.map(t => ({ t, n: active.filter(l => l.type === t).length })).filter(x => x.n > 0);
  const maxCount  = Math.max(...counts.map(x => x.n), 1);

  const bdEl = document.getElementById('adminBreakdown');
  if (bdEl) {
    bdEl.innerHTML = counts.map(({ t, n }) => `
      <div class="admin-breakdown-row">
        <span class="admin-breakdown-label">${typeEmoji[t]} ${typeName[t]}</span>
        <div class="admin-breakdown-bar-wrap">
          <div class="admin-breakdown-bar" style="width:${Math.round(n/maxCount*100)}%;background:${typeColor[t]}"></div>
        </div>
        <span class="admin-breakdown-count">${n}</span>
      </div>`).join('') || '<p style="color:#aaa;padding:12px 0;font-size:13px">No active listings.</p>';
  }
}

// ── LISTINGS TABLE (live from `listings` array) ──
let adminListingFilter = 'all';
let adminListingSearch = '';

function renderAdminListingsTable() {
  const tbody = document.getElementById('adminListingsTbody');
  if (!tbody) return;

  const emojiMap = { cattle:'🐄', hog:'🐖', goat:'🐐', poultry:'🐓', carabao:'🦬', other:'🐇' };
  const animalLabel = { cattle:'Cattle', hog:'Hog', goat:'Goat', poultry:'Poultry', carabao:'Carabao', other:'Other' };

  let filtered = listings.filter(l => {
    if (adminListingFilter !== 'all' && l.status !== adminListingFilter) return false;
    if (adminListingSearch) {
      const q = adminListingSearch.toLowerCase();
      return l.title.toLowerCase().includes(q)
          || l.seller.toLowerCase().includes(q)
          || (l.locationBarangay || '').toLowerCase().includes(q);
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#aaa">No listings found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    const emoji    = emojiMap[l.type] || '🐾';
    const typeDisp = l.type === 'other' && l.customAnimalName ? l.customAnimalName : (animalLabel[l.type] || l.type);
    const location = l.locationBarangay ? `${l.locationBarangay}${l.locationPurok ? ', ' + l.locationPurok : ''}` : l.location;
    const daIcon   = l.daVerified ? `<span class="admin-da-badge"><i class="fas fa-shield-alt"></i></span>` : '';
    const statusPill = l.status === 'active' ? 'active' : l.status === 'sold' ? 'sold' : 'deleted';

    // Price display
    let priceHtml = `<strong>₱${Number(l.price).toLocaleString()}</strong>`;
    if (l.count > 1) priceHtml += ` <small>/head</small>`;

    return `
      <tr data-id="${l.id}" data-status="${l.status}">
        <td><span class="admin-animal-cell">${emoji} <strong>${l.title}</strong><br><small>${typeDisp} • ${l.breed || 'Native'}</small></span></td>
        <td><span class="admin-farmer-cell">${l.sellerEmoji} ${l.seller} ${daIcon}</span></td>
        <td>${priceHtml}</td>
        <td>${location}</td>
        <td><span class="admin-status-pill ${statusPill}">${l.status.charAt(0).toUpperCase()+l.status.slice(1)}</span></td>
        <td class="admin-actions-cell">
          <button class="admin-action-btn edit"   title="View/Edit" onclick="adminEditListing(${l.id})"><i class="fas fa-edit"></i></button>
          ${l.daVerified
            ? `<button class="admin-action-btn verify" title="Unverify" onclick="adminToggleVerify(${l.id}, false)" style="opacity:0.5"><i class="fas fa-shield-alt"></i></button>`
            : `<button class="admin-action-btn verify" title="DA Verify" onclick="adminToggleVerify(${l.id}, true)"><i class="fas fa-shield-alt"></i></button>`}
          ${l.status === 'active'
            ? `<button class="admin-action-btn remove" title="Remove listing" onclick="adminRemoveListing(${l.id})"><i class="fas fa-trash"></i></button>`
            : `<button class="admin-action-btn verify" title="Restore listing" onclick="adminRestoreListing(${l.id})"><i class="fas fa-undo"></i></button>`}
        </td>
      </tr>`;
  }).join('');
}

function filterAdminListings(query) {
  adminListingSearch = query;
  renderAdminListingsTable();
}

function filterAdminListingsByStatus(status) {
  adminListingFilter = status;
  renderAdminListingsTable();
}

function adminEditListing(id) {
  closeAdminPanel();
  openAddListingModal(id);
  showToast('✏️ Editing listing — save when done');
}

function adminToggleVerify(id, verify) {
  const idx = listings.findIndex(l => l.id === id);
  if (idx === -1) return;
  listings[idx].daVerified = verify;
  saveToStorage();
  logAdminActivity(verify ? 'amber' : 'red',
    verify
      ? `DA Verified: <strong>${listings[idx].title}</strong>`
      : `Verification removed: <strong>${listings[idx].title}</strong>`,
    'Just now');
  addNotification('🛡️', verify
    ? `Admin marked your listing "${listings[idx].title}" as DA Verified.`
    : `Admin removed DA Verified badge from "${listings[idx].title}".`);
  renderAdminListingsTable();
  renderAdminOverview();
  renderListings();
  showToast(verify ? '✅ Listing DA-verified!' : '⚠️ Verification removed');
}

function adminRemoveListing(id) {
  if (!confirm('Remove this listing? It will be hidden from the marketplace.')) return;
  const idx = listings.findIndex(l => l.id === id);
  if (idx === -1) return;
  const title = listings[idx].title;
  listings[idx].status = 'deleted';
  saveToStorage();
  logAdminActivity('red', `Admin removed listing: <strong>${title}</strong>`, 'Just now');
  addNotification('⚠️', `Admin removed your listing "${title}" from the marketplace.`);
  renderAdminListingsTable();
  renderAdminOverview();
  renderListings();
  renderProfileStats();
  showToast('🗑️ Listing removed from marketplace');
}

function adminRestoreListing(id) {
  const idx = listings.findIndex(l => l.id === id);
  if (idx === -1) return;
  listings[idx].status = 'active';
  saveToStorage();
  logAdminActivity('green', `Listing restored: <strong>${listings[idx].title}</strong>`, 'Just now');
  renderAdminListingsTable();
  renderAdminOverview();
  renderListings();
  renderProfileStats();
  showToast('✅ Listing restored and visible again');
}

// ── FARMERS TAB (live) ──
const farmerProfiles = [
  { id: 1, name: 'Kuya Mario Santos',  emoji: '👨‍🌾', barangay: 'Pines',       rating: 4.9, daVerified: true,  phone: '09171234567' },
  { id: 2, name: 'Aling Coring Reyes', emoji: '👩‍🌾', barangay: 'Layawan',     rating: 4.7, daVerified: true,  phone: '09281234567' },
  { id: 3, name: 'Manong Dodong Bato', emoji: '🧑‍🌾', barangay: 'Mialen',      rating: 4.5, daVerified: false, phone: '09391234567' },
  { id: 4, name: 'Nong Berto Cabales', emoji: '👨‍🌾', barangay: 'Clarin',      rating: 4.8, daVerified: true,  phone: '09471234567' },
  { id: 5, name: 'Kuya Pepe Dela Cruz',emoji: '👨‍🌾', barangay: 'Agusan',      rating: 4.6, daVerified: true,  phone: '09551234567' },
  { id: 6, name: 'Ate Nora Mendez',    emoji: '👩‍🌾', barangay: 'Lamao',       rating: 4.4, daVerified: false, phone: '09661234567' },
  { id: 7, name: 'Manong Ernie Vidal', emoji: '🧑‍🌾', barangay: 'Don Anselmo', rating: 4.9, daVerified: true,  phone: '09771234567' },
  { id: 8, name: 'Juana Reyes',        emoji: '👩‍🌾', barangay: 'Pines',       rating: 4.3, daVerified: false, phone: '09881234567' }
];

function renderAdminFarmers(searchStr) {
  const list = document.getElementById('admin-farmer-list-dynamic');
  if (!list) return;
  const q = (searchStr || '').toLowerCase();
  const filtered = farmerProfiles.filter(f =>
    !q || f.name.toLowerCase().includes(q) || f.barangay.toLowerCase().includes(q)
  );
  if (filtered.length === 0) {
    list.innerHTML = `<p style="color:#aaa;padding:16px;font-size:13px">No farmers found.</p>`;
    return;
  }
  list.innerHTML = filtered.map(f => {
    const suspended = suspendedFarmers.has(f.id);
    const badgeHtml = suspended
      ? `<span class="admin-unverified-badge" style="background:#c62828;color:white"><i class="fas fa-ban"></i> Suspended</span>`
      : f.daVerified
        ? `<span class="admin-da-badge"><i class="fas fa-shield-alt"></i> DA Verified</span>`
        : `<span class="admin-unverified-badge"><i class="fas fa-clock"></i> Pending Verification</span>`;

    const farmerListings = listings.filter(l => l.seller === f.name && l.status !== 'deleted').length;

    return `
      <div class="admin-farmer-row" style="${suspended ? 'opacity:0.55' : ''}">
        <div class="admin-farmer-avatar">${f.emoji}</div>
        <div class="admin-farmer-info">
          <div class="admin-farmer-name">${f.name} ${badgeHtml}</div>
          <div class="admin-farmer-meta">
            <i class="fas fa-map-marker-alt"></i> Brgy. ${f.barangay}
            &nbsp;•&nbsp; ⭐ ${f.rating}
            &nbsp;•&nbsp; 📞 ${f.phone}
            &nbsp;•&nbsp; 📋 ${farmerListings} listing${farmerListings !== 1 ? 's' : ''}
          </div>
        </div>
        <div class="admin-farmer-actions">
          ${!f.daVerified && !suspended
            ? `<button class="admin-action-btn verify" title="DA Verify farmer" onclick="adminVerifyFarmer(${f.id})"><i class="fas fa-shield-alt"></i></button>`
            : `<button class="admin-action-btn edit" title="Edit farmer" onclick="showToast('✏️ Farmer edit coming soon!')"><i class="fas fa-edit"></i></button>`}
          ${suspended
            ? `<button class="admin-action-btn verify" title="Unsuspend farmer" onclick="adminUnsuspendFarmer(${f.id})"><i class="fas fa-undo"></i></button>`
            : `<button class="admin-action-btn remove" title="Suspend farmer" onclick="adminSuspendFarmer(${f.id})"><i class="fas fa-ban"></i></button>`}
        </div>
      </div>`;
  }).join('');
}

function adminVerifyFarmer(id) {
  const f = farmerProfiles.find(x => x.id === id);
  if (!f) return;
  f.daVerified = true;
  // Also verify all their listings
  listings.forEach((l, i) => {
    if (l.seller === f.name) listings[i].daVerified = true;
  });
  saveToStorage();
  logAdminActivity('amber', `DA Verification approved: <strong>${f.name}</strong>`, 'Just now');
  addNotification('🛡️', `Congratulations! Your account has been DA Verified by the admin.`);
  renderAdminFarmers();
  renderAdminOverview();
  renderListings();
  showToast(`✅ ${f.name} is now DA Verified!`);
}

function adminSuspendFarmer(id) {
  const f = farmerProfiles.find(x => x.id === id);
  if (!f) return;
  if (!confirm(`Suspend ${f.name}? Their listings will be hidden.`)) return;
  suspendedFarmers.add(id);
  // Hide their active listings
  listings.forEach((l, i) => {
    if (l.seller === f.name && l.status === 'active') listings[i].status = 'deleted';
  });
  saveToStorage();
  logAdminActivity('red', `Farmer suspended: <strong>${f.name}</strong>`, 'Just now');
  renderAdminFarmers();
  renderAdminListingsTable();
  renderAdminOverview();
  renderListings();
  renderProfileStats();
  showToast(`🚫 ${f.name} has been suspended`);
}

function adminUnsuspendFarmer(id) {
  const f = farmerProfiles.find(x => x.id === id);
  if (!f) return;
  suspendedFarmers.delete(id);
  // Restore their listings
  listings.forEach((l, i) => {
    if (l.seller === f.name && l.status === 'deleted') listings[i].status = 'active';
  });
  saveToStorage();
  logAdminActivity('green', `Farmer reinstated: <strong>${f.name}</strong>`, 'Just now');
  renderAdminFarmers();
  renderAdminListingsTable();
  renderAdminOverview();
  renderListings();
  renderProfileStats();
  showToast(`✅ ${f.name} has been reinstated`);
}

// ── REPORTS: working Dismiss and Remove ──
function adminDismissReport(cardEl) {
  if (!confirm('Dismiss this report?')) return;
  cardEl.style.transition = 'opacity 0.3s';
  cardEl.style.opacity = '0';
  setTimeout(() => cardEl.remove(), 320);
  const reportsEl = document.getElementById('adm-reports');
  if (reportsEl) reportsEl.textContent = Math.max(0, parseInt(reportsEl.textContent || '0') - 1);
  showToast('✅ Report dismissed');
}

function adminRemoveReportedListing(title, cardEl) {
  if (!confirm(`Remove listing "${title}" from the marketplace?`)) return;
  const idx = listings.findIndex(l => l.title.toLowerCase().includes(title.toLowerCase()));
  if (idx !== -1) {
    listings[idx].status = 'deleted';
    saveToStorage();
    logAdminActivity('red', `Reported listing removed: <strong>${listings[idx].title}</strong>`, 'Just now');
    renderListings();
    renderProfileStats();
    renderAdminOverview();
    renderAdminListingsTable();
  }
  adminDismissReport(cardEl);
  showToast('🗑️ Listing removed');
}

// ── SETTINGS: working export buttons ──
function adminExportListingsCSV() {
  const headers = ['ID','Title','Type','Breed','Count','Weight','Age','Price','ListingType','Vaccine','Barangay','Purok','Seller','DA Verified','Status','Posted'];
  const rows = listings.map(l => [
    l.id, `"${l.title}"`, l.type, `"${l.breed || ''}"`, l.count, l.weight, `"${l.age || ''}"`,
    l.price, l.listingType, l.vaccineStatus, l.locationBarangay || '', l.locationPurok || '',
    `"${l.seller}"`, l.daVerified ? 'Yes' : 'No', l.status, l.postedDaysAgo + ' days ago'
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  downloadCSV(csv, 'roots_livestock_listings.csv');
  showToast('📥 Listings CSV downloaded!');
}

function adminExportFarmersCSV() {
  const headers = ['ID','Name','Barangay','Rating','DA Verified','Phone'];
  const rows = farmerProfiles.map(f => [
    f.id, `"${f.name}"`, f.barangay, f.rating, f.daVerified ? 'Yes' : 'No', f.phone
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  downloadCSV(csv, 'roots_farmer_registry.csv');
  showToast('📥 Farmer registry CSV downloaded!');
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function adminPurgeDeletedListings() {
  if (!confirm('Permanently remove all deleted listings? This cannot be undone.')) return;
  const before = listings.length;
  listings = listings.filter(l => l.status !== 'deleted');
  saveToStorage();
  const removed = before - listings.length;
  logAdminActivity('red', `Purged ${removed} deleted listing(s)`, 'Just now');
  renderAdminListingsTable();
  renderAdminOverview();
  showToast(`🗑️ ${removed} deleted listing(s) permanently removed`);
}

// ── Helper: push a notification from admin actions ──
function addNotification(avatar, message) {
  notifications.unshift({ id: Date.now(), avatar, message, time: 'Just now', unread: true });
  renderNotifications();
}
