const LS_KEY_LISTINGS = 'roots_livestock_listings';
const LS_KEY_VERSION = 'roots_livestock_version';
const LS_KEY_ACTIVITY = 'roots_livestock_admin_activity';
const LS_SCHEMA_VER = '1.1';

let adminListingFilter = 'all';
let adminListingSearch = '';
let adminActivity = [
  { dot: 'green', msg: 'New listing posted: <strong>Brahman Cross Cow</strong>', time: '2 hours ago • Aling Coring Reyes', timestamp: Date.now() - 2 * 60 * 60 * 1000 },
  { dot: 'blue', msg: 'Farmer registered: <strong>Juana Reyes</strong>', time: '5 hours ago • Brgy. Pines', timestamp: Date.now() - 5 * 60 * 60 * 1000 },
  { dot: 'amber', msg: 'DA Verification approved: <strong>Nong Berto Cabales</strong>', time: 'Yesterday • Brgy. Clarin', timestamp: Date.now() - 24 * 60 * 60 * 1000 },
  { dot: 'red', msg: 'Report filed on listing: <strong>50 Native Chickens</strong>', time: 'Yesterday • Suspected mislabeling', timestamp: Date.now() - 26 * 60 * 60 * 1000 },
  { dot: 'green', msg: 'Listing marked SOLD: <strong>Work Carabao</strong>', time: '2 days ago • Kuya Pepe Dela Cruz', timestamp: Date.now() - 48 * 60 * 60 * 1000 }
];

const farmerProfiles = [
  { id: 1, name: 'Kuya Mario Santos', emoji: '👨‍🌾', barangay: 'Pines', rating: 4.9, daVerified: true, phone: '09171234567' },
  { id: 2, name: 'Aling Coring Reyes', emoji: '👩‍🌾', barangay: 'Layawan', rating: 4.7, daVerified: true, phone: '09281234567' },
  { id: 3, name: 'Manong Dodong Bato', emoji: '🧑‍🌾', barangay: 'Mialen', rating: 4.5, daVerified: false, phone: '09391234567' },
  { id: 4, name: 'Nong Berto Cabales', emoji: '👨‍🌾', barangay: 'Clarin', rating: 4.8, daVerified: true, phone: '09471234567' },
  { id: 5, name: 'Kuya Pepe Dela Cruz', emoji: '👨‍🌾', barangay: 'Agusan', rating: 4.6, daVerified: true, phone: '09551234567' },
  { id: 6, name: 'Ate Nora Mendez', emoji: '👩‍🌾', barangay: 'Lamao', rating: 4.4, daVerified: false, phone: '09661234567' },
  { id: 7, name: 'Manong Ernie Vidal', emoji: '🧑‍🌾', barangay: 'Don Anselmo', rating: 4.9, daVerified: true, phone: '09771234567' },
  { id: 8, name: 'Juana Reyes', emoji: '👩‍🌾', barangay: 'Pines', rating: 4.3, daVerified: false, phone: '09881234567' }
];

let suspendedFarmers = new Set();
let listings = [
  {
    id: 1, type: 'hog', emoji: '🐖', title: '3 Native Hogs – Ready for Trade or Sale', breed: 'Native / Bisaya', count: 3,
    weight: 75, age: '6 months', price: 6500, priceNegotiable: true, listingType: 'both', vaccineStatus: 'complete',
    location: 'Brgy. Pines, Oroquieta', locationBarangay: 'Pines', locationPurok: 'Purok 3', seller: 'Kuya Mario Santos',
    sellerEmoji: '👨‍🌾', sellerRating: 4.9, daVerified: true, isMine: true, notes: 'All three hogs are healthy and well-fed. Free-range, mostly corn and camote feed. Vaccination records available.',
    photos: [], postedDaysAgo: 0, status: 'active'
  },
  {
    id: 2, type: 'cattle', emoji: '🐄', title: 'Brahman Cross Cow – 2 Years Old', breed: 'Brahman Cross', count: 1,
    weight: 280, age: '2 years', price: 38000, priceNegotiable: false, listingType: 'sell', vaccineStatus: 'complete',
    location: 'Brgy. Layawan, Oroquieta', locationBarangay: 'Layawan', locationPurok: '', seller: 'Aling Coring Reyes',
    sellerEmoji: '👩‍🌾', sellerRating: 4.7, daVerified: true, isMine: false, notes: 'Healthy female cow. Never calved yet. DA health certificate available.',
    photos: [], postedDaysAgo: 2, status: 'active'
  },
  {
    id: 3, type: 'poultry', emoji: '🐓', title: '50 Native Chickens – Bulk Sale', breed: 'Native / Darag', count: 50,
    weight: 1.5, age: '5–6 months', price: 350, priceNegotiable: true, listingType: 'sell', vaccineStatus: 'partial',
    location: 'Brgy. Mialen, Oroquieta', locationBarangay: 'Mialen', locationPurok: 'Purok 1', seller: 'Manong Dodong Bato',
    sellerEmoji: '🧑‍🌾', sellerRating: 4.5, daVerified: false, isMine: false, notes: 'Free-range native chickens. ₱350 per head or negotiate for bulk.',
    photos: [], postedDaysAgo: 3, status: 'active'
  },
  {
    id: 4, type: 'goat', emoji: '🐐', title: 'Anglo-Nubian Goat Pair – Breeding Stock', breed: 'Anglo-Nubian', count: 2,
    weight: 35, age: '18 months', price: 14000, priceNegotiable: true, listingType: 'sell', vaccineStatus: 'complete',
    location: 'Brgy. Clarin Settlement, Oroquieta', locationBarangay: 'Clarin Settlement', locationPurok: '', seller: 'Nong Berto Cabales',
    sellerEmoji: '👨‍🌾', sellerRating: 4.8, daVerified: true, isMine: false, notes: 'One buck and one doe. DA-assisted breed from Misamis Occidental provincial program.',
    photos: [], postedDaysAgo: 1, status: 'active'
  },
  {
    id: 5, type: 'carabao', emoji: '🦬', title: 'Work Carabao – Strong and Trained', breed: 'Philippine Native', count: 1,
    weight: 420, age: '5 years', price: 55000, priceNegotiable: true, listingType: 'sell', vaccineStatus: 'complete',
    location: 'Brgy. Buenavista, Oroquieta', locationBarangay: 'Buenavista', locationPurok: '', seller: 'Kuya Pepe Dela Cruz',
    sellerEmoji: '👨‍🌾', sellerRating: 4.6, daVerified: true, isMine: false, notes: 'Well-trained carabao for farm work. Gentle temperament.',
    photos: [], postedDaysAgo: 5, status: 'active'
  },
  {
    id: 6, type: 'poultry', emoji: '🦆', title: '20 Muscovy Ducks – Itik for Sale', breed: 'Muscovy', count: 20,
    weight: 2.5, age: '4 months', price: 400, priceNegotiable: false, listingType: 'sell', vaccineStatus: 'none',
    location: 'Brgy. Layawan, Oroquieta', locationBarangay: 'Layawan', locationPurok: 'Purok 2', seller: 'Ate Nora Mendez',
    sellerEmoji: '👩‍🌾', sellerRating: 4.4, daVerified: false, isMine: false, notes: 'Healthy muscovy ducks raised on rice paddies.',
    photos: [], postedDaysAgo: 7, status: 'active'
  },
  {
    id: 7, type: 'hog', emoji: '🐷', title: 'Landrace Boar – Stud Service', breed: 'Landrace', count: 1,
    weight: 180, age: '2 years', price: 800, priceNegotiable: false, listingType: 'service', vaccineStatus: 'complete',
    location: 'Brgy. Dolipos Alto, Oroquieta', locationBarangay: 'Dolipos Alto', locationPurok: '', seller: 'Manong Ernie Vidal',
    sellerEmoji: '🧑‍🌾', sellerRating: 4.9, daVerified: true, isMine: false, notes: 'Registered Landrace boar. ₱800 per service.',
    photos: [], postedDaysAgo: 4, status: 'active'
  },
  {
    id: 8, type: 'other', emoji: '🐇', customAnimalName: 'Rabbit', title: '8 Rabbits – Various Ages', breed: 'Native Mix', count: 8,
    weight: 1.8, age: '2–4 months', price: 250, priceNegotiable: true, listingType: 'sell', vaccineStatus: 'unknown',
    location: 'Brgy. Pines, Oroquieta', locationBarangay: 'Pines', locationPurok: 'Purok 5', seller: 'Juana Reyes',
    sellerEmoji: '👩‍🌾', sellerRating: 4.3, daVerified: false, isMine: false, notes: 'Good for meat or as pets. Mix of male and female.',
    photos: [], postedDaysAgo: 6, status: 'active'
  }
];

function saveToStorage() {
  try {
    localStorage.setItem(LS_KEY_LISTINGS, JSON.stringify(listings));
    localStorage.setItem(LS_KEY_VERSION, LS_SCHEMA_VER);
  } catch (error) {
    console.warn('Admin save failed:', error);
  }
}

function loadFromStorage() {
  try {
    const version = localStorage.getItem(LS_KEY_VERSION);
    if (version !== LS_SCHEMA_VER) return null;
    const raw = localStorage.getItem(LS_KEY_LISTINGS);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return Array.isArray(saved) ? saved : null;
  } catch (error) {
    console.warn('Admin load failed:', error);
    return null;
  }
}

function saveAdminActivityToStorage() {
  try {
    localStorage.setItem(LS_KEY_ACTIVITY, JSON.stringify(adminActivity));
  } catch (error) {
    console.warn('Admin activity save failed:', error);
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
  } catch (error) {
    console.warn('Admin activity load failed:', error);
    return null;
  }
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

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  toast.classList.remove('hidden');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 2200);
}

function addNotification() {
  // No live notification stream in standalone admin page.
}

function logAdminActivity(dot, msg, time) {
  adminActivity.unshift({ dot, msg, time: time || 'Just now', timestamp: Date.now() });
  if (adminActivity.length > 20) adminActivity.pop();
  saveAdminActivityToStorage();
  if (document.getElementById('adminActivityList')) {
    renderAdminOverview();
  }
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
  const content = document.getElementById('adminTab-' + tab);
  if (content) content.classList.remove('hidden');
  if (btn) btn.classList.add('active');
}

function refreshAdminPanel() {
  const savedActivity = loadAdminActivityFromStorage();
  if (savedActivity) {
    adminActivity = savedActivity;
  }
  renderAdminOverview();
  renderAdminListingsTable();
  renderAdminFarmers();
}

function renderAdminOverview() {
  const savedActivity = loadAdminActivityFromStorage();
  if (savedActivity) {
    adminActivity = savedActivity;
  }
  const all = listings;
  const active = all.filter(l => l.status === 'active');
  const farmers = [...new Set(all.map(l => l.seller))];
  const daVerif = farmers.filter(name => {
    const l = all.find(x => x.seller === name);
    return l && l.daVerified;
  });

  const totalEl = document.getElementById('adm-total-listings');
  const farmersEl = document.getElementById('adm-total-farmers');
  const verifiedEl = document.getElementById('adm-verified');
  const reportsEl = document.getElementById('adm-reports');

  if (totalEl) totalEl.textContent = all.filter(l => l.status !== 'deleted').length;
  if (farmersEl) farmersEl.textContent = farmers.length;
  if (verifiedEl) verifiedEl.textContent = daVerif.length;
  if (reportsEl) reportsEl.textContent = document.querySelectorAll('.admin-report-card').length;

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

  const types = ['hog', 'poultry', 'cattle', 'goat', 'carabao', 'other'];
  const typeEmoji = { hog: '🐖', poultry: '🐓', cattle: '🐄', goat: '🐐', carabao: '🦬', other: '🐇' };
  const typeName = { hog: 'Hogs', poultry: 'Poultry', cattle: 'Cattle', goat: 'Goats', carabao: 'Carabao', other: 'Other' };
  const typeColor = { hog: '#388E3C', poultry: '#1976D2', cattle: '#F57C00', goat: '#7B1FA2', carabao: '#5D4037', other: '#888' };
  const counts = types.map(t => ({ t, n: active.filter(l => l.type === t).length })).filter(x => x.n > 0);
  const maxCount = Math.max(...counts.map(x => x.n), 1);

  const bdEl = document.getElementById('adminBreakdown');
  if (bdEl) {
    bdEl.innerHTML = counts.map(({ t, n }) => `
      <div class="admin-breakdown-row">
        <span class="admin-breakdown-label">${typeEmoji[t]} ${typeName[t]}</span>
        <div class="admin-breakdown-bar-wrap">
          <div class="admin-breakdown-bar" style="width:${Math.round(n / maxCount * 100)}%;background:${typeColor[t]}"></div>
        </div>
        <span class="admin-breakdown-count">${n}</span>
      </div>`).join('') || '<p style="color:#aaa;padding:12px 0;font-size:13px">No active listings.</p>';
  }
}

function renderAdminListingsTable() {
  const tbody = document.getElementById('adminListingsTbody');
  if (!tbody) return;

  const emojiMap = { cattle: '🐄', hog: '🐖', goat: '🐐', poultry: '🐓', carabao: '🦬', other: '🐇' };
  const animalLabel = { cattle: 'Cattle', hog: 'Hog', goat: 'Goat', poultry: 'Poultry', carabao: 'Carabao', other: 'Other' };

  const filtered = getFilteredAdminListings();

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#aaa">No listings found.</td></tr>`;
    document.getElementById('adminListingsCards').innerHTML = `<p class="admin-no-results">No listings found for the selected filter.</p>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    const emoji = emojiMap[l.type] || '🐾';
    const typeDisp = l.type === 'other' && l.customAnimalName ? l.customAnimalName : (animalLabel[l.type] || l.type);
    const location = l.locationBarangay ? `${l.locationBarangay}${l.locationPurok ? ', ' + l.locationPurok : ''}` : l.location;
    const daIcon = l.daVerified ? `<span class="admin-da-badge"><i class="fas fa-shield-alt"></i></span>` : '';
    const statusPill = l.status === 'active' ? 'active' : l.status === 'sold' ? 'sold' : 'deleted';
    let priceHtml = `<strong>₱${Number(l.price).toLocaleString()}</strong>`;
    if (l.count > 1) priceHtml += ` <small>/head</small>`;

    return `
      <tr data-id="${l.id}" data-status="${l.status}">
        <td><span class="admin-animal-cell">${emoji} <strong>${l.title}</strong><br><small>${typeDisp} • ${l.breed || 'Native'}</small></span></td>
        <td><span class="admin-farmer-cell">${l.sellerEmoji} ${l.seller} ${daIcon}</span></td>
        <td>${priceHtml}</td>
        <td>${location}</td>
        <td><span class="admin-status-pill ${statusPill}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
        <td class="admin-actions-cell">
          <button class="admin-action-btn edit" title="View details" onclick="adminViewListingDetail(${l.id})"><i class="fas fa-eye"></i></button>
          ${l.daVerified
            ? `<button class="admin-action-btn verify" title="Unverify" onclick="adminToggleVerify(${l.id}, false)" style="opacity:0.5"><i class="fas fa-shield-alt"></i></button>`
            : `<button class="admin-action-btn verify" title="DA Verify" onclick="adminToggleVerify(${l.id}, true)"><i class="fas fa-shield-alt"></i></button>`}
          ${l.status === 'active'
            ? `<button class="admin-action-btn remove" title="Remove listing" onclick="adminRemoveListing(${l.id})"><i class="fas fa-trash"></i></button>`
            : `<button class="admin-action-btn verify" title="Restore listing" onclick="adminRestoreListing(${l.id})"><i class="fas fa-undo"></i></button>`}
        </td>
      </tr>`;
  }).join('');

  renderAdminListingCards(filtered);
}

function getFilteredAdminListings() {
  return listings.filter(l => {
    if (adminListingFilter !== 'all' && l.status !== adminListingFilter) return false;
    if (adminListingSearch) {
      const q = adminListingSearch.toLowerCase();
      return l.title.toLowerCase().includes(q)
        || l.seller.toLowerCase().includes(q)
        || (l.locationBarangay || '').toLowerCase().includes(q)
        || (l.notes || '').toLowerCase().includes(q);
    }
    return true;
  });
}

function renderAdminListingCards(filteredListings) {
  const container = document.getElementById('adminListingsCards');
  if (!container) return;

  container.innerHTML = filteredListings.map(l => {
    const typeLabel = l.type === 'other' && l.customAnimalName ? l.customAnimalName : l.type.charAt(0).toUpperCase() + l.type.slice(1);
    const statusLabel = l.status.charAt(0).toUpperCase() + l.status.slice(1);
    const location = l.locationBarangay ? `${l.locationBarangay}${l.locationPurok ? ', ' + l.locationPurok : ''}` : l.location;
    const priceHtml = `<strong>₱${Number(l.price).toLocaleString()}</strong>` + (l.count > 1 ? ` <small>/head</small>` : '');
    const daBadge = l.daVerified ? `<span class="admin-da-badge"><i class="fas fa-shield-alt"></i> DA Verified</span>` : `<span class="admin-unverified-badge"><i class="fas fa-clock"></i> Pending</span>`;

    return `
      <article class="admin-listing-card ${l.status}">
        <div class="admin-listing-card-header">
          <div>
            <div class="admin-listing-title">${l.title}</div>
            <div class="admin-listing-meta">${typeLabel} • ${l.breed || 'Native'} • ${l.count} ${l.count > 1 ? 'pcs' : 'head'}</div>
          </div>
          <span class="admin-status-pill ${l.status}">${statusLabel}</span>
        </div>
        <div class="admin-listing-body">
          <div class="admin-listing-info-row"><strong>Seller</strong> ${l.sellerEmoji} ${l.seller} ${daBadge}</div>
          <div class="admin-listing-info-row"><strong>Location</strong> ${location}</div>
          <div class="admin-listing-info-row"><strong>Price</strong> ${priceHtml}</div>
          <div class="admin-listing-info-row"><strong>Vaccine</strong> ${l.vaccineStatus}</div>
          <div class="admin-listing-notes"><strong>Notes</strong> ${l.notes || 'No additional details.'}</div>
          <div class="admin-listing-meta-sm">Posted ${l.postedDaysAgo} day${l.postedDaysAgo !== 1 ? 's' : ''} ago</div>
        </div>
        <div class="admin-listing-actions">
          <button class="admin-action-btn edit" onclick="adminViewListingDetail(${l.id})"><i class="fas fa-eye"></i> View</button>
          ${l.daVerified
            ? `<button class="admin-action-btn verify" onclick="adminToggleVerify(${l.id}, false)"><i class="fas fa-shield-alt"></i> Unverify</button>`
            : `<button class="admin-action-btn verify" onclick="adminToggleVerify(${l.id}, true)"><i class="fas fa-shield-alt"></i> Verify</button>`}
          ${l.status === 'active'
            ? `<button class="admin-action-btn remove" onclick="adminRemoveListing(${l.id})"><i class="fas fa-trash"></i> Remove</button>`
            : `<button class="admin-action-btn verify" onclick="adminRestoreListing(${l.id})"><i class="fas fa-undo"></i> Restore</button>`}
        </div>
      </article>`;
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

function adminViewListingDetail(id) {
  const listing = listings.find(l => l.id === id);
  if (!listing) return showToast('⚠️ Listing not found.');

  const typeLabel = listing.type === 'other' && listing.customAnimalName ? listing.customAnimalName : listing.type.charAt(0).toUpperCase() + listing.type.slice(1);
  const location = listing.locationBarangay ? `${listing.locationBarangay}${listing.locationPurok ? ', ' + listing.locationPurok : ''}` : listing.location;
  const priceHtml = `<strong>₱${Number(listing.price).toLocaleString()}</strong>` + (listing.count > 1 ? ` <small>/head</small>` : '');
  const daBadge = listing.daVerified ? `<span class="admin-da-badge"><i class="fas fa-shield-alt"></i> DA Verified</span>` : `<span class="admin-unverified-badge"><i class="fas fa-clock"></i> Pending Verification</span>`;

  document.getElementById('adminListingModalContent').innerHTML = `
    <div class="admin-listing-preview">
      <div class="admin-listing-preview-header">
        <div>
          <div class="admin-listing-title">${listing.title}</div>
          <div class="admin-listing-meta">${typeLabel} • ${listing.breed || 'Native'} • ${listing.count} ${listing.count > 1 ? 'pcs' : 'head'}</div>
        </div>
        <div class="admin-listing-preview-status"><span class="admin-status-pill ${listing.status}">${listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}</span></div>
      </div>
      <div class="admin-listing-preview-grid">
        <div class="admin-listing-preview-block"><span>Seller</span>${listing.sellerEmoji} ${listing.seller} ${daBadge}</div>
        <div class="admin-listing-preview-block"><span>Location</span>${location}</div>
        <div class="admin-listing-preview-block"><span>Price</span>${priceHtml}</div>
        <div class="admin-listing-preview-block"><span>Vaccine</span>${listing.vaccineStatus}</div>
        <div class="admin-listing-preview-block-wide"><span>Notes</span>${listing.notes || 'No additional details.'}</div>
      </div>
      <div class="admin-listing-preview-footer">
        <button class="admin-action-btn edit" onclick="closeAdminListingModal(); showToast('✏️ Listing edit available on the Livestock page.')"><i class="fas fa-edit"></i> Edit on Livestock</button>
        ${listing.status === 'active'
          ? `<button class="admin-action-btn remove" onclick="adminRemoveListing(${listing.id}); closeAdminListingModal();"><i class="fas fa-trash"></i> Remove</button>`
          : `<button class="admin-action-btn verify" onclick="adminRestoreListing(${listing.id}); closeAdminListingModal();"><i class="fas fa-undo"></i> Restore</button>`}
      </div>
    </div>`;

  document.getElementById('adminListingModal').classList.remove('hidden');
}

function closeAdminListingModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('adminListingModal');
  if (!modal) return;
  modal.classList.add('hidden');
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
  renderAdminListingsTable();
  renderAdminOverview();
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
  renderAdminListingsTable();
  renderAdminOverview();
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
  showToast('✅ Listing restored and visible again');
}

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
  listings.forEach((l, i) => {
    if (l.seller === f.name) listings[i].daVerified = true;
  });
  saveToStorage();
  logAdminActivity('amber', `DA Verification approved: <strong>${f.name}</strong>`, 'Just now');
  renderAdminFarmers();
  renderAdminOverview();
  showToast(`✅ ${f.name} is now DA Verified!`);
}

function adminSuspendFarmer(id) {
  const f = farmerProfiles.find(x => x.id === id);
  if (!f) return;
  if (!confirm(`Suspend ${f.name}? Their listings will be hidden.`)) return;
  suspendedFarmers.add(id);
  listings.forEach((l, i) => {
    if (l.seller === f.name && l.status === 'active') listings[i].status = 'deleted';
  });
  saveToStorage();
  logAdminActivity('red', `Farmer suspended: <strong>${f.name}</strong>`, 'Just now');
  renderAdminFarmers();
  renderAdminListingsTable();
  renderAdminOverview();
  showToast(`🚫 ${f.name} has been suspended`);
}

function adminUnsuspendFarmer(id) {
  const f = farmerProfiles.find(x => x.id === id);
  if (!f) return;
  suspendedFarmers.delete(id);
  listings.forEach((l, i) => {
    if (l.seller === f.name && l.status === 'deleted') listings[i].status = 'active';
  });
  saveToStorage();
  logAdminActivity('green', `Farmer reinstated: <strong>${f.name}</strong>`, 'Just now');
  renderAdminFarmers();
  renderAdminListingsTable();
  renderAdminOverview();
  showToast(`✅ ${f.name} has been reinstated`);
}

function adminDismissReport(cardEl) {
  if (!confirm('Dismiss this report?')) return;
  if (!cardEl) return;
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
    renderAdminOverview();
    renderAdminListingsTable();
  }
  adminDismissReport(cardEl);
}

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

function initAdminPage() {
  const saved = loadFromStorage();
  if (saved) {
    listings = saved;
  } else {
    saveToStorage();
  }

  const savedActivity = loadAdminActivityFromStorage();
  if (savedActivity) {
    adminActivity = savedActivity;
  } else {
    saveAdminActivityToStorage();
  }

  refreshAdminPanel();
}

document.addEventListener('DOMContentLoaded', initAdminPage);

window.addEventListener('storage', (event) => {
  if (event.key === LS_KEY_ACTIVITY) {
    const savedActivity = loadAdminActivityFromStorage();
    if (savedActivity) {
      adminActivity = savedActivity;
      renderAdminOverview();
    }
  }
});
