// ======================================================================
// fruits-vegetables.js
// Handles: topbar, dropdowns, product cards, farmer shops,
//          modals, search/filter, and API calls
// ======================================================================
 
// ===== STATE =====
let allListings  = [];   // all listings from API
let allFarmers   = [];   // unique farmers from listings
let activeCategory = 'all';
let activeView     = 'grid';
let currentSort    = 'newest';

// Temporary current user — replace with session when login module is integrated
const CURRENT_USER_ID = 1;   // Mario Santos (farmer)
 
// ===== SAMPLE DATA (remove when API is connected) =====
// This is placeholder data so the UI works before PHP is ready.
const SAMPLE_LISTINGS = [
  { id:1, crop_name:'Kamatis', category:'vegetable', emoji:'🍅', price_per_kg:65, quantity_kg:120, description:'Fresh Roma tomatoes from upper field.', farmer_id:1, farmer_name:'Mario Santos', farmer_barangay:'Brgy. Pines', farmer_verified:1, created_at:'2025-04-17' },
  { id:2, crop_name:'Sitaw',   category:'vegetable', emoji:'🫘', price_per_kg:75, quantity_kg:45,  description:'Batangas variety, crisp and fresh.',  farmer_id:2, farmer_name:'Rosa Cruz',   farmer_barangay:'Brgy. Layawan', farmer_verified:1, created_at:'2025-04-16' },
  { id:3, crop_name:'Ampalaya',category:'vegetable', emoji:'🫑', price_per_kg:80, quantity_kg:80,  description:'Local strain, bitter and healthy.',   farmer_id:1, farmer_name:'Mario Santos', farmer_barangay:'Brgy. Pines', farmer_verified:1, created_at:'2025-04-15' },
  { id:4, crop_name:'Saging',  category:'fruit',     emoji:'🍌', price_per_kg:30, quantity_kg:200, description:'Lakatan variety, sweet and ripe.',    farmer_id:3, farmer_name:'Juan dela Cruz',farmer_barangay:'Brgy. Dalisay', farmer_verified:1, created_at:'2025-04-14' },
  { id:5, crop_name:'Papaya',  category:'fruit',     emoji:'🍈', price_per_kg:25, quantity_kg:90,  description:'Solo papaya, perfect sweetness.',     farmer_id:2, farmer_name:'Rosa Cruz',   farmer_barangay:'Brgy. Layawan', farmer_verified:1, created_at:'2025-04-13' },
  { id:6, crop_name:'Kamote',  category:'root',      emoji:'🍠', price_per_kg:35, quantity_kg:150, description:'Sweet potato, purple variety.',       farmer_id:3, farmer_name:'Juan dela Cruz',farmer_barangay:'Brgy. Dalisay', farmer_verified:1, created_at:'2025-04-12' },
  { id:7, crop_name:'Kangkong',category:'vegetable', emoji:'🥬', price_per_kg:40, quantity_kg:30,  description:'Water spinach, tender leaves.',       farmer_id:4, farmer_name:'Nena Bautista',farmer_barangay:'Brgy. Malindang', farmer_verified:1, created_at:'2025-04-11' },
  { id:8, crop_name:'Langka',  category:'fruit',     emoji:'🍈', price_per_kg:55, quantity_kg:60,  description:'Jackfruit, ready for cooking.',       farmer_id:4, farmer_name:'Nena Bautista',farmer_barangay:'Brgy. Malindang', farmer_verified:1, created_at:'2025-04-10' },
];
 
// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  setTodayLabel();
  loadListings();
  closeAllOnOutsideClick();
});
 
function setTodayLabel() {
  // Could be used in a greeting if needed
}
 
// ===== LOAD LISTINGS =====
// When API is ready, replace the SAMPLE_LISTINGS block with the fetch call below
async function loadListings() {
  try {
    const res  = await fetch('api/get_all_listings.php');
    const json = await res.json();
    if (!json.success) throw new Error('API error');
allListings = json.data;
 
    buildFarmerList();
    renderListings();
    renderStats();
  } catch (err) {
    console.error('Failed to load listings:', err);
    showToast('⚠️ Could not load listings. Check your connection.');
    document.getElementById('productsGrid').innerHTML = '';
    document.getElementById('emptyState').classList.remove('hidden');
  }
}
 
// ===== RENDER STATS =====
function renderStats() {
  const farmers  = [...new Set(allListings.map(l => l.farmer_id))];
  const fruits   = allListings.filter(l => l.category === 'fruit');
  const veggies  = allListings.filter(l => l.category === 'vegetable');
 
  document.getElementById('statListings').textContent = allListings.length;
  document.getElementById('statFarmers').textContent  = farmers.length;
  document.getElementById('statFruits').textContent   = fruits.length;
  document.getElementById('statVeggies').textContent  = veggies.length;
}
 
// ===== RENDER LISTINGS =====
function renderListings() {
  const grid       = document.getElementById('productsGrid');
  const empty      = document.getElementById('emptyState');
  const countEl    = document.getElementById('resultsCount');
  const query      = document.getElementById('searchInput').value.toLowerCase().trim();
 
  // Filter
  let filtered = allListings.filter(l => {
    const matchCat    = activeCategory === 'all' || l.category === activeCategory;
    const matchSearch = !query || l.crop_name.toLowerCase().includes(query)
                                || l.farmer_name.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });
 
  // Sort
  if (currentSort === 'price_asc')  filtered.sort((a,b) => a.price_per_kg - b.price_per_kg);
  if (currentSort === 'price_desc') filtered.sort((a,b) => b.price_per_kg - a.price_per_kg);
  if (currentSort === 'newest')     filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  if (currentSort === 'farmer')     filtered.sort((a,b) => a.farmer_name.localeCompare(b.farmer_name));
 
  // Update count
  countEl.textContent = `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} found`;
 
  // Empty state
  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
 
  // Build cards
  grid.innerHTML = filtered.map(item => buildProductCard(item)).join('');
}
 
function getCropEmoji(name, category) {
  const map = {
    'kamatis':  '🍅',
    'tomato':   '🍅',
    'sitaw':    '🫘',
    'ampalaya': '🫑',
    'saging':   '🍌',
    'banana':   '🍌',
    'papaya':   '🍈',
    'kangkong': '🥬',
    'kamote':   '🍠',
    'langka':   '🍈',
    'pechay':   '🥦',
    'talong':   '🍆',
    'okra':     '🌿',
    'luya':     '🫚',
    'sibuyas':  '🧅',
    'bawang':   '🧄',
    'mais':     '🌽',
  };
 
  const key = name?.toLowerCase().trim();
  if (map[key]) return map[key];
 
  if (category === 'fruit')     return '🍎';
  if (category === 'vegetable') return '🥦';
  if (category === 'root')      return '🥔';
  return '🌿';
}
 
function buildProductCard(item) {
  const emoji    = getCropEmoji(item.crop_name, item.category);
  const verified = item.farmer_verified == 1 || item.farmer_verified === true;
  const soldOut  = parseFloat(item.quantity_kg) <= 0 || item.status === 'sold out';
  const isMine   = parseInt(item.farmer_id) === CURRENT_USER_ID;
  let imageHtml;

  if (item.image_url && item.image_url !== '' && item.image_url !== null) {
    imageHtml = '<img src="' + item.image_url + '" alt="' + item.crop_name + '" style="width:100%;height:100%;object-fit:cover;">';
  } else {
    imageHtml = '<span style="font-size:54px">' + emoji + '</span>';
  }

  // Sold out overlay
  const soldOutOverlay = soldOut
    ? '<div class="pc-soldout-overlay"><span>SOLD OUT</span></div>'
    : '';

  // Action buttons — show Edit if it's the farmer's own listing, otherwise show Inquire
  let actionBtns = '';
  if (isMine) {
    actionBtns = `
      <button class="pc-btn primary" onclick="openEditListingModal(${item.id}, event)">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="pc-btn danger" onclick="confirmRemoveListing(${item.id}, '${item.crop_name}', event)">
        <i class="fas fa-trash"></i> Remove
      </button>
    `;
  } else {
    actionBtns = `
      <button class="pc-btn primary" onclick="openInquiryModal(${item.id}, '${item.crop_name}', ${item.price_per_kg})" ${soldOut ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
        <i class="fas fa-envelope"></i> ${soldOut ? 'Sold Out' : 'Inquire'}
      </button>
      <button class="pc-btn secondary" onclick="showToast('💾 Saved to wishlist!')">
        <i class="fas fa-heart"></i>
      </button>
    `;
  }

  return `
    <div class="product-card" onclick="openProductDetail(${item.id})">
      <div class="pc-image">
        ${imageHtml}
        <div class="pc-category-badge">${item.category}</div>
        ${soldOutOverlay}
      </div>
      <div class="pc-body">
        <div class="pc-name">${item.crop_name}</div>
        <div class="pc-price">₱${item.price_per_kg}<span>/kg</span></div>
        <div class="pc-qty"><i class="fas fa-box"></i> ${soldOut ? '<span style="color:#DC2626">Out of stock</span>' : item.quantity_kg + ' kg available'}</div>
        <div class="pc-farmer" onclick="openFarmerShop(${item.farmer_id}, event)">
          <div class="pc-farmer-avatar">👨‍🌾</div>
          <div class="pc-farmer-info">
            <div class="pc-farmer-name">${item.farmer_name}</div>
            <div class="pc-farmer-loc">${item.farmer_barangay}</div>
          </div>
          ${verified ? '<span class="pc-verified"><i class="fas fa-shield-alt"></i> DA</span>' : ''}
        </div>
      </div>
      <div class="pc-actions" onclick="event.stopPropagation()">
        ${actionBtns}
      </div>
    </div>
  `;
}
 
// ===== BUILD FARMER LIST (side panel) =====
function buildFarmerList() {
  const seen    = new Set();
  allFarmers    = [];
  allListings.forEach(l => {
    if (!seen.has(l.farmer_id)) {
      seen.add(l.farmer_id);
      allFarmers.push({
        id: l.farmer_id,
        name: l.farmer_name,
        barangay: l.farmer_barangay,
        verified: l.farmer_verified,
        listingCount: allListings.filter(x => x.farmer_id === l.farmer_id).length
      });
    }
  });
 
  document.getElementById('farmerCount').textContent = allFarmers.length;
 
  document.getElementById('farmerList').innerHTML = allFarmers.map(f => `
    <div class="farmer-item" onclick="openFarmerShop(${f.id})">
      <div class="fi-avatar">👨‍🌾</div>
      <div class="fi-body">
        <div class="fi-name">${f.name}</div>
        <div class="fi-loc">${f.barangay} · ${f.listingCount} listing${f.listingCount !== 1 ? 's' : ''}</div>
      </div>
      ${f.verified ? '<span class="fi-badge"><i class="fas fa-shield-alt"></i> DA</span>' : ''}
    </div>
  `).join('');
}
 
// ===== SEARCH & FILTER =====
function handleSearch() {
  const query = document.getElementById('searchInput').value;
  document.getElementById('searchClear').classList.toggle('hidden', !query);
  renderListings();
}
 
function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').classList.add('hidden');
  renderListings();
}
 
function setCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderListings();
}
 
function handleSort() {
  currentSort = document.getElementById('sortSelect').value;
  renderListings();
}
 
function setView(view, btn) {
  activeView = view;
  document.querySelectorAll('.vb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('productsGrid');
  grid.classList.toggle('list-view', view === 'list');
}
 
// ===== FARMER SHOP MODAL =====
async function openFarmerShop(farmerId, event) {
  if (event) event.stopPropagation();
 
  const modal = document.getElementById('shopModal');
  modal.classList.remove('hidden');
 
  // Get farmer info from local data (replace with API call when ready)
  const farmer = allFarmers.find(f => f.id === farmerId);
  const farmerListings = allListings.filter(l => l.farmer_id === farmerId);
 
  // ---- UNCOMMENT when PHP API is ready ----
  // const res  = await fetch(`api/get_farmer_shop.php?farmer_id=${farmerId}`);
  // const json = await res.json();
  // const farmer = json.farmer;
  // const farmerListings = json.listings;
 
  if (!farmer) { showToast('⚠️ Farmer not found'); return; }
 
  document.getElementById('shopModalContent').innerHTML = `
    <div class="shop-header">
      <div class="shop-avatar">👨‍🌾</div>
      <div>
        <div class="shop-name">${farmer.name}</div>
        <div class="shop-sub"><i class="fas fa-map-marker-alt"></i> ${farmer.barangay}</div>
        ${farmer.verified ? '<div class="shop-verified"><i class="fas fa-shield-alt"></i> DA Verified Farmer</div>' : ''}
      </div>
    </div>
    <p style="font-size:13px;color:var(--dust);margin-bottom:14px;">${farmerListings.length} active listing${farmerListings.length !== 1 ? 's' : ''}</p>
    <div class="shop-grid">
      ${farmerListings.map(item => buildProductCard(item)).join('')}
    </div>
  `;
}
 
function closeShopModal() {
  document.getElementById('shopModal').classList.add('hidden');
}
 
// ===== ADD LISTING MODAL =====
function openAddListingModal() {
  document.getElementById('addListingModal').classList.remove('hidden');
}
 
function closeAddListingModal() {
  document.getElementById('addListingModal').classList.add('hidden');
}
 
// ===== PHOTO PREVIEW =====
function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
 
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('uploadPreview').classList.remove('hidden');
    document.getElementById('uploadPlaceholder').classList.add('hidden');
  };
  reader.readAsDataURL(file);
}
 
function removePhoto(event) {
  event.stopPropagation();
  document.getElementById('formPhoto').value = '';
  document.getElementById('previewImg').src = '';
  document.getElementById('uploadPreview').classList.add('hidden');
  document.getElementById('uploadPlaceholder').classList.remove('hidden');
}
 
async function submitListing() {
  const category = document.getElementById('formCategory').value;
  const name     = document.getElementById('formName').value.trim();
  const price    = document.getElementById('formPrice').value;
  const qty      = document.getElementById('formQty').value;
  const location = document.getElementById('formLocation').value.trim();
  const desc     = document.getElementById('formDesc').value.trim();
  const photo    = document.getElementById('formPhoto').files[0];
 
  if (!category) { showToast('⚠️ Please select a category'); return; }
  if (!name)     { showToast('⚠️ Please enter produce name'); return; }
  if (!price)    { showToast('⚠️ Please enter a price'); return; }
  if (!qty)      { showToast('⚠️ Please enter available quantity'); return; }
 
  // Use FormData so we can send the photo file
  const formData = new FormData();
  formData.append('user_id',      1);   // temporary: Mario Santos
  formData.append('category',     category);
  formData.append('crop_name',    name);
  formData.append('price_per_kg', price);
  formData.append('quantity_kg',  qty);
  formData.append('location',     location);
  formData.append('description',  desc);
  if (photo) formData.append('photo', photo);
 
  try {
    const res  = await fetch('api/add_listing.php', {
      method: 'POST',
      body: formData   // NO headers needed — browser sets it automatically for FormData
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
  } catch(err) {
    showToast('❌ Failed to post listing');
    return;
  }
 
  showToast('✅ Listing posted successfully!');
  closeAddListingModal();
 
  // Reset form and photo
  ['formCategory','formName','formPrice','formQty','formLocation','formDesc'].forEach(id => {
    document.getElementById(id).value = '';
  });
  removePhoto({ stopPropagation: () => {} });
 
  // Reload listings
  loadListings();
}
 
// ===== INQUIRY MODAL =====
function openInquiryModal(listingId, cropName, price) {
  document.getElementById('inquiryModal').classList.remove('hidden');
  document.getElementById('inquiryListingId').value = listingId;
  document.getElementById('inquiryPreview').innerHTML = `
    <div class="ipv-emoji">📦</div>
    <div>
      <div class="ipv-name">${cropName}</div>
      <div class="ipv-price">₱${price}/kg</div>
    </div>
  `;
}
 
function closeInquiryModal() {
  document.getElementById('inquiryModal').classList.add('hidden');
}
 
async function submitInquiry() {
  const listingId = document.getElementById('inquiryListingId').value;
  const qty       = document.getElementById('inquiryQty').value;
  const msg       = document.getElementById('inquiryMsg').value.trim();

  if (!qty) { showToast('⚠️ Please enter how many kg you need'); return; }
  if (!msg) { showToast('⚠️ Please write a message to the farmer'); return; }

  try {
    const res  = await fetch('api/send_inquiry.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id:      parseInt(listingId),   // force number
        buyer_id:        5,
        quantity_needed: parseFloat(qty),        // force number
        message:         msg
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    showToast('📩 Inquiry sent to farmer!');
    closeInquiryModal();
    document.getElementById('inquiryQty').value = '';
    document.getElementById('inquiryMsg').value = '';

  } catch(err) {
    showToast('❌ Failed to send inquiry: ' + err.message);
  }
}

// ===== TOPBAR DROPDOWNS =====
function toggleNotifDropdown(e) {
  e.stopPropagation();
  const panel = document.getElementById('notifDropdown');
  const isHidden = panel.classList.contains('hidden');
  closeAllDropdowns();
  if (isHidden) panel.classList.remove('hidden');
}
 
function closeNotifDropdown() {
  document.getElementById('notifDropdown').classList.add('hidden');
}
 
function toggleProfileDropdown(e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('profileDropdown');
  const isHidden = panel.classList.contains('hidden');
  closeAllDropdowns();
  if (isHidden) panel.classList.remove('hidden');
}
 
function closeProfileDropdown() {
  document.getElementById('profileDropdown').classList.add('hidden');
}
 
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-panel').forEach(p => p.classList.add('hidden'));
}
 
function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  const badge = document.getElementById('notifBadge');
  badge.textContent = '0';
  badge.style.display = 'none';
  showToast('✅ All marked as read');
}
 
function clearNotifs() {
  document.getElementById('notifList').innerHTML =
    '<div style="padding:20px;text-align:center;color:#bbb;font-size:13px;">No notifications</div>';
  const badge = document.getElementById('notifBadge');
  badge.textContent = '0';
  badge.style.display = 'none';
  showToast('🗑️ Notifications cleared');
}
 
// ===== MOBILE NAV =====
function toggleMobileNav() {
  const nav     = document.getElementById('topbarNav');
  const overlay = document.getElementById('mobileOverlay');
  const isOpen  = nav.classList.contains('open');
  nav.classList.toggle('open', !isOpen);
  overlay.classList.toggle('hidden', isOpen);
}
 
// ===== OUTSIDE CLICK CLOSES DROPDOWNS & MODALS =====
function closeAllOnOutsideClick() {
  document.addEventListener('click', (e) => {
    if (!document.getElementById('notifWrapper')?.contains(e.target))   closeNotifDropdown();
    if (!document.getElementById('profileWrapper')?.contains(e.target)) closeProfileDropdown();
  });
 
  // Close modals on backdrop click
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.add('hidden');
    });
  });
}
 
// ===== MODULE SWITCHING =====
function switchModule(module) {
  const map = {
    home:      '../home/index.html',
    livestock: '../livestock/livestock.html',
    land:      '../land-equipment/land-equipment.html',
    tanimbase: '../tanimbase/tanimbase.html',
    payments:  '../payments/payments.html',
    map:       '../farm-map/farm-map.html',
    calendar:  '../calendar/calendar.html',
    documents: '../documents/documents.html',
  };
  if (map[module]) {
    showToast('📂 Coming Soon...');
    // window.location.href = map[module];  // uncomment to enable navigation
  }
}
 
// ===== FEATURE 1: PRODUCT DETAIL MODAL =====
function openProductDetail(listingId) {
  const item = allListings.find(l => l.id == listingId);
  if (!item) return;

  const emoji    = getCropEmoji(item.crop_name, item.category);
  const verified = item.farmer_verified == 1;
  const soldOut  = parseFloat(item.quantity_kg) <= 0 || item.status === 'sold out';
  const date     = new Date(item.created_at).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });

  let imageHtml;
  if (item.image_url && item.image_url !== '') {
    imageHtml = '<img src="' + item.image_url + '" alt="' + item.crop_name + '" style="width:100%;height:220px;object-fit:cover;border-radius:var(--r)">';
  } else {
    imageHtml = '<div style="font-size:80px;text-align:center;padding:20px;background:var(--pale);border-radius:var(--r)">' + emoji + '</div>';
  }

  document.getElementById('productDetailContent').innerHTML = `
    <div style="display:flex;gap:20px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">${imageHtml}</div>
      <div style="flex:2;min-width:220px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="background:var(--canopy);color:white;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;text-transform:uppercase">${item.category}</span>
          ${soldOut ? '<span style="background:#fee2e2;color:#DC2626;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px">SOLD OUT</span>' : ''}
        </div>
        <h2 style="font-family:Lora,serif;font-size:24px;color:var(--forest);margin-bottom:8px">${item.crop_name}</h2>
        <div style="font-size:26px;font-weight:800;color:var(--canopy);margin-bottom:12px">₱${item.price_per_kg}<span style="font-size:14px;font-weight:400;color:var(--dust)">/kg</span></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dust)">
            <i class="fas fa-box" style="color:var(--leaf);width:16px"></i>
            ${soldOut ? '<span style="color:#DC2626">Out of stock</span>' : '<span>' + item.quantity_kg + ' kg available</span>'}
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dust)">
            <i class="fas fa-map-marker-alt" style="color:var(--leaf);width:16px"></i>
            <span>${item.location || 'Location not specified'}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dust)">
            <i class="fas fa-calendar-alt" style="color:var(--leaf);width:16px"></i>
            <span>Posted: ${date}</span>
          </div>
        </div>
        ${item.description ? `<div style="background:var(--mist);border-radius:var(--r-sm);padding:12px;font-size:13px;color:var(--ink);margin-bottom:16px;border-left:3px solid var(--leaf)">${item.description}</div>` : ''}
        <div style="background:var(--pale);border-radius:var(--r-sm);padding:12px;display:flex;align-items:center;gap:12px;margin-bottom:16px;cursor:pointer" onclick="openFarmerShop(${item.farmer_id})">
          <span style="font-size:32px">👨‍🌾</span>
          <div>
            <div style="font-weight:700;font-size:14px;color:var(--ink)">${item.farmer_name}</div>
            <div style="font-size:12px;color:var(--dust)">${item.farmer_barangay}</div>
            ${verified ? '<div style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,var(--leaf),var(--canopy));color:white;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;margin-top:3px"><i class="fas fa-shield-alt"></i> DA Verified</div>' : ''}
          </div>
        </div>
        ${!soldOut ? `
        <button class="btn-primary" style="width:100%" onclick="closeProductDetailModal();openInquiryModal(${item.id},'${item.crop_name}',${item.price_per_kg})">
          <i class="fas fa-envelope"></i> Send Inquiry to Farmer
        </button>` : `
        <button class="btn-secondary" style="width:100%;opacity:0.6;cursor:not-allowed" disabled>
          <i class="fas fa-times-circle"></i> This produce is Sold Out
        </button>`}
      </div>
    </div>
  `;

  document.getElementById('productDetailModal').classList.remove('hidden');
}

function closeProductDetailModal() {
  document.getElementById('productDetailModal').classList.add('hidden');
}

// ===== FEATURE 2: MY INQUIRIES MODAL =====
async function openInquiriesModal() {
  document.getElementById('inquiriesModal').classList.remove('hidden');
  document.getElementById('inquiriesContent').innerHTML =
    '<div class="inq-loading"><i class="fas fa-spinner fa-spin"></i> Loading inquiries...</div>';

  try {
    const res  = await fetch('api/get_inquiries.php?farmer_id=' + CURRENT_USER_ID);
    const json = await res.json();

    if (!json.success || json.data.length === 0) {
      document.getElementById('inquiriesContent').innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--dust)">
          <div style="font-size:40px;margin-bottom:12px">📭</div>
          <div style="font-weight:700;font-size:16px;margin-bottom:6px">No inquiries yet</div>
          <div style="font-size:13px">When buyers inquire on your listings, they'll appear here.</div>
        </div>`;
      return;
    }

    document.getElementById('inquiriesContent').innerHTML = json.data.map(inq => {
      const statusColor = inq.status === 'accepted' ? '#16a34a' : inq.status === 'declined' ? '#DC2626' : '#F57C00';
      const statusBg    = inq.status === 'accepted' ? '#dcfce7' : inq.status === 'declined' ? '#fee2e2' : '#FFF8E1';
      const date        = new Date(inq.created_at).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' });

      return `
        <div class="inq-item">
          <div class="inq-header">
            <div class="inq-crop">
              <span style="font-size:20px">${getCropEmoji(inq.crop_name, '')}</span>
              <div>
                <div style="font-weight:700;font-size:14px;color:var(--ink)">${inq.crop_name}</div>
                <div style="font-size:11px;color:var(--dust)">₱${inq.price_per_kg}/kg · ${inq.location || ''}</div>
              </div>
            </div>
            <span class="inq-status" style="background:${statusBg};color:${statusColor}">${inq.status}</span>
          </div>
          <div class="inq-body">
            <div class="inq-buyer"><i class="fas fa-user"></i> ${inq.buyer_name} · ${inq.quantity_needed} kg needed</div>
            <div class="inq-msg">"${inq.message}"</div>
            <div class="inq-date"><i class="fas fa-clock"></i> ${date}</div>
          </div>
          ${inq.status === 'pending' ? `
          <div class="inq-actions">
            <button class="btn-primary" style="flex:1;padding:8px" onclick="updateInquiryStatus(${inq.id}, 'accepted')">
              <i class="fas fa-check"></i> Accept
            </button>
            <button class="btn-secondary" style="flex:1;padding:8px" onclick="updateInquiryStatus(${inq.id}, 'declined')">
              <i class="fas fa-times"></i> Decline
            </button>
          </div>` : ''}
        </div>
      `;
    }).join('');

  } catch(err) {
    document.getElementById('inquiriesContent').innerHTML =
      '<div style="text-align:center;padding:30px;color:#DC2626">⚠️ Could not load inquiries.</div>';
  }
}

function closeInquiriesModal() {
  document.getElementById('inquiriesModal').classList.add('hidden');
}

async function updateInquiryStatus(inquiryId, status) {
  try {
    const res  = await fetch('api/update_inquiry.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiry_id: inquiryId, status })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    showToast(status === 'accepted' ? '✅ Inquiry accepted!' : '❌ Inquiry declined');
    openInquiriesModal(); // refresh the list
  } catch(err) {
    showToast('⚠️ Failed to update inquiry');
  }
}

// ===== FEATURE 3: EDIT LISTING MODAL =====
function openEditListingModal(listingId, event) {
  if (event) event.stopPropagation();
  const item = allListings.find(l => l.id == listingId);
  if (!item) return;

  document.getElementById('editListingId').value  = item.id;
  document.getElementById('editName').value        = item.crop_name;
  document.getElementById('editPrice').value       = item.price_per_kg;
  document.getElementById('editQty').value         = item.quantity_kg;
  document.getElementById('editLocation').value    = item.location || '';
  document.getElementById('editDesc').value        = item.description || '';
  document.getElementById('editStatus').value      = item.status || 'active';

  document.getElementById('editListingModal').classList.remove('hidden');
}

function closeEditListingModal() {
  document.getElementById('editListingModal').classList.add('hidden');
}

async function submitEditListing() {
  const id       = document.getElementById('editListingId').value;
  const name     = document.getElementById('editName').value.trim();
  const price    = document.getElementById('editPrice').value;
  const qty      = document.getElementById('editQty').value;
  const location = document.getElementById('editLocation').value.trim();
  const desc     = document.getElementById('editDesc').value.trim();
  const status   = document.getElementById('editStatus').value;

  if (!name)  { showToast('⚠️ Please enter produce name'); return; }
  if (!price) { showToast('⚠️ Please enter a price'); return; }
  if (!qty)   { showToast('⚠️ Please enter quantity'); return; }

  try {
    const res  = await fetch('api/update_listing.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id:   id,
        user_id:      CURRENT_USER_ID,
        crop_name:    name,
        price_per_kg: price,
        quantity_kg:  qty,
        location,
        description:  desc,
        status
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    showToast('✅ Listing updated!');
    closeEditListingModal();
    loadListings();
  } catch(err) {
    showToast('❌ Failed to update listing');
  }
}

// ===== FEATURE 4: REMOVE LISTING =====
function confirmRemoveListing(listingId, cropName, event) {
  if (event) event.stopPropagation();
  if (confirm('Remove "' + cropName + '" from your listings?')) {
    removeListing(listingId);
  }
}

async function removeListing(listingId) {
  try {
    const res  = await fetch('api/delete_listing.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, user_id: CURRENT_USER_ID })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    showToast('🗑️ Listing removed');
    loadListings();
  } catch(err) {
    showToast('❌ Failed to remove listing');
  }
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.display = 'none'; }, duration);
}