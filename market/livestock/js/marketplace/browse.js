// Roots Livestock — marketplace browse & detail
// ===== SECTION: RENDER – LISTINGS GRID =====
// ======================================================================
function matchesListingFilter(l, filter) {
  if (filter === 'sell')     return l.listingType === 'sell'  || l.listingType === 'both';
  if (filter === 'trade')    return l.listingType === 'trade' || l.listingType === 'both';
  if (filter === 'service')  return l.listingType === 'service';
  if (filter === 'da')       return !!l.daVerified;
  return true;
}

function getFilteredSortedListings() {
  let result = listings.filter(l => l.status === 'active');

  // Buyers browse the marketplace; own listings appear only in farmer mode.
  if (!isSellerMode()) {
    result = result.filter(l => !l.isMine);
  }

  if (activeTypeFilter !== 'all') {
    result = result.filter(l => l.type === activeTypeFilter);
  }

  if (activeListingFilters.size > 0) {
    result = result.filter(l =>
      [...activeListingFilters].every(f => matchesListingFilter(l, f))
    );
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(l =>
      l.title.toLowerCase().includes(q) ||
      (l.breed || '').toLowerCase().includes(q) ||
      l.seller.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      (l.customAnimalName || '').toLowerCase().includes(q)
    );
  }

  if (currentSort === 'price-asc')  result.sort((a, b) => a.price - b.price);
  if (currentSort === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (currentSort === 'newest')     result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  if (currentSort === 'rating')     result.sort((a, b) => b.sellerRating - a.sellerRating);

  return result;
}

function renderListings() {
  renderListingsDirect(getFilteredSortedListings());
  renderPriceBoard();
}

function renderListingsDirect(result) {
  const grid  = document.getElementById('listingsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultsCount');

  count.textContent = `${result.length} listing${result.length !== 1 ? 's' : ''} found`;

  if (result.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = result.map(l => renderListingCard(l)).join('');
}

function renderListingCard(l) {
  const photos = Array.isArray(l.photos)
    ? l.photos
    : (typeof l.photos === 'string' ? l.photos.split('||').filter(Boolean) : []);
  const firstPhoto = photos.length > 0 ? photos[0] : null;

  const typeBadge = {
    sell:    ['For Sale',    'badge-sell'],
    trade:   ['For Trade',   'badge-trade'],
    both:    ['Sale/Trade',  'badge-both'],
    service: ['For Service', 'badge-service']
  }[l.listingType] || ['For Sale', 'badge-sell'];

  const vaccBadge = {
    complete: ['✅ Vaccinated',   'vaccine-complete'],
    partial:  ['⚠️ Partial Vacc', 'vaccine-partial'],
    none:     ['❌ Unvaccinated', 'vaccine-none'],
    unknown:  ['', '']
  }[l.vaccineStatus];

  const priceDisplay = l.priceNegotiable
    ? `<div class="listing-price negotiable">₱${l.price.toLocaleString()} <span style="font-size:11px;color:#aaa">• Negotiable</span></div>`
    : `<div class="listing-price">₱${l.price.toLocaleString()}</div>`;

  const daysAgo = l.postedDaysAgo === 0 ? 'Today'
    : l.postedDaysAgo === 1 ? 'Yesterday' : `${l.postedDaysAgo}d ago`;

  // Photo area — real image or emoji
  const photoContent = firstPhoto
    ? `<img src="${firstPhoto}" alt="${l.title}" class="listing-photo-img" onerror="this.parentElement.innerHTML='${l.emoji}'">`
    : l.emoji;

  // Location display
  const locationDisplay = l.locationPurok
    ? `${l.locationBarangay || l.location}, ${l.locationPurok}`
    : (l.locationBarangay ? `Brgy. ${l.locationBarangay}, Oroquieta` : l.location);

  // Display name for "other" type
  const displayName = l.type === 'other' && l.customAnimalName
    ? l.customAnimalName : l.type.charAt(0).toUpperCase() + l.type.slice(1);

  const showAsMine = l.isMine && isSellerMode();
  const myBadge = showAsMine
    ? `<span style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.55);color:white;border-radius:8px;padding:2px 7px;font-size:10px;font-weight:700"><i class="fas fa-user"></i> Mine</span>`
    : '';

  const saved = isListingSaved(l.id);
  const buyShort = l.listingType === 'trade' ? 'Trade' : l.listingType === 'service' ? 'Book' : 'Buy';
  const buyerActions = !showAsMine ? `
        <div class="listing-card-actions" onclick="event.stopPropagation()">
          <button type="button" class="listing-action-btn listing-action-icon ${saved ? 'active' : ''}" title="${saved ? 'Saved' : 'Save'}" onclick="toggleSaved(${l.id}, event)" aria-label="Save listing">
            <i class="fas fa-heart"></i>
          </button>
          <button type="button" class="listing-action-btn cart" title="Add to cart" onclick="addToCart(${l.id}, event)" aria-label="Add to cart">
            <i class="fas fa-cart-plus"></i>
            <span>Cart</span>
          </button>
          <button type="button" class="listing-action-btn buy-now" title="${buyShort} now — goes to checkout" onclick="buyNowListing(${l.id}, event)" aria-label="${buyShort} now">
            <span>${buyShort}</span>
          </button>
        </div>
      ` : '';

  return `
    <div class="listing-card" onclick="openListingDetail(${l.id})">
      <div class="listing-photo">
        ${photoContent}
        <span class="listing-type-badge ${typeBadge[1]}">${typeBadge[0]}</span>
        ${l.daVerified ? `<span class="listing-verified"><i class="fas fa-shield-alt"></i> DA</span>` : ''}
        ${vaccBadge[0] ? `<span class="listing-vaccine ${vaccBadge[1]}">${vaccBadge[0]}</span>` : ''}
        ${myBadge}
      </div>
      <div class="listing-body">
        <div class="listing-title">${l.title}</div>
        <div class="listing-meta">
          <span><i class="fas fa-layer-group"></i> ${l.count} head</span>
          <span><i class="fas fa-weight-hanging"></i> ~${l.weight}kg${l.count > 1 ? '/head' : ''}</span>
          <span><i class="fas fa-clock"></i> ${l.age}</span>
        </div>
        ${priceDisplay}
        <div class="listing-location">
          <i class="fas fa-map-marker-alt"></i> ${locationDisplay}
        </div>
        <div class="listing-seller">
          ${showAsMine && farmerProfilePhotoUrl
            ? `<img src="${farmerProfilePhotoUrl}" class="seller-avatar-photo" alt="${l.seller}">`
            : `<span class="seller-avatar">${l.sellerEmoji}</span>`}
          <span>${l.seller}</span>
          <span style="font-size:11px;color:#aaa;margin-left:4px">• ${daysAgo}</span>
          <span class="seller-rating">⭐ ${l.sellerRating}</span>
        </div>
        ${buyerActions}
      </div>
    </div>
  `;
}

// ======================================================================
// ===== SECTION: RENDER – PRICE BOARD =====
// ======================================================================
function renderPriceBoard() {
  const el = document.getElementById('priceBoard');
  if (!el) return;

  const marketPrices = computeMarketPricesFromListings();
  const trendMap = { up: ['↑ Up', 'trend-up'], down: ['↓ Down', 'trend-down'], same: ['→ Stable', 'trend-same'] };

  el.innerHTML = marketPrices.map(p => {
    const [tLabel, tClass] = trendMap[p.trend] || trendMap.same;
    const noData = p.sampleCount === 0;
    return `
      <div class="price-row${noData ? ' price-row-empty' : ''}">
        <div class="price-animal">
          <span class="price-animal-emoji">${p.emoji}</span>
          <span>${p.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end">
          <span class="price-value">${p.price}</span>
          ${noData ? '' : `<span class="price-trend ${tClass}">${tLabel}</span>`}
        </div>
      </div>
    `;
  }).join('');
}

// ======================================================================
// ===== SECTION: RENDER – NOTIFICATIONS =====
// ======================================================================
function renderNotifications() {
  const list  = document.getElementById('notificationsList');
  const badge = document.getElementById('notifBadge');
  const unread = notifications.filter(n => n.unread).length;

  badge.textContent = unread > 0 ? unread : '';

  list.innerHTML = notifications.length === 0
    ? `<p style="padding:16px;color:#888;font-size:14px">No notifications.</p>`
    : notifications.map(n => `
        <div class="notification-item ${n.unread ? 'unread' : ''}" onclick="readNotification(${n.id})">
          <div class="notification-avatar">${n.avatar}</div>
          <div class="notification-content">
            <div class="notification-message">${n.message}</div>
            <div class="notification-time">${n.time}</div>
          </div>
        </div>
      `).join('');
}

function readNotification(id) {
  const n = notifications.find(n => n.id === id);
  if (n) n.unread = false;
  renderNotifications();
}

function markAllAsRead() {
  notifications.forEach(n => n.unread = false);
  renderNotifications();
  showToast('✅ All notifications marked as read');
}

function clearAllNotifications() {
  notifications = [];
  renderNotifications();
  showToast('🗑️ All notifications cleared');
}

// ======================================================================

// ===== SECTION: LISTING DETAIL (product page) =====
// ======================================================================
let detailListingId = null;
let detailPhotoIndex = 0;
let detailQuantity = 1;

function getListingPhotos(l) {
  if (!l) return [];
  if (Array.isArray(l.photos)) return l.photos.filter(Boolean);
  if (typeof l.photos === 'string') return l.photos.split('||').filter(Boolean);
  return [];
}

function getDetailListing() {
  return detailListingId != null ? listings.find(x => x.id === detailListingId) : null;
}

function getDetailMaxQty() {
  const l = getDetailListing();
  return l ? Math.max(1, l.count || 1) : 1;
}

function setDetailPhotoIndex(index) {
  const photos = getListingPhotos(getDetailListing());
  if (!photos.length) return;
  detailPhotoIndex = Math.max(0, Math.min(index, photos.length - 1));
  const main = document.getElementById('detailMainImage');
  if (main) {
    main.src = photos[detailPhotoIndex];
    main.classList.remove('hidden');
  }
  document.querySelectorAll('.listing-detail-thumb').forEach((el, i) => {
    el.classList.toggle('active', i === detailPhotoIndex);
  });
}

function changeDetailQuantity(delta) {
  const max = getDetailMaxQty();
  detailQuantity = Math.max(1, Math.min(max, detailQuantity + delta));
  const input = document.getElementById('detailQtyInput');
  if (input) input.value = detailQuantity;
  const subtotal = document.getElementById('detailSubtotal');
  const l = getDetailListing();
  if (subtotal && l) {
    subtotal.textContent = '₱' + (l.price * detailQuantity).toLocaleString();
  }
}

function onDetailQtyInput() {
  const input = document.getElementById('detailQtyInput');
  if (!input) return;
  const max = getDetailMaxQty();
  detailQuantity = Math.max(1, Math.min(max, parseInt(input.value, 10) || 1));
  input.value = detailQuantity;
  changeDetailQuantity(0);
}

function addToCartFromDetail() {
  if (detailListingId == null) return;
  addToCart(detailListingId, null, detailQuantity);
}

function buyNowListing(listingId, e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const l = getListingById(Number(listingId));
  if (!l || l.status !== 'active') {
    showToast('⚠️ Listing not available');
    return;
  }
  if (isSellerMode() && l.isMine) {
    showToast('⚠️ You cannot buy your own listing');
    return;
  }
  redirectToPaymentsModule(l.id, 1);
}

function buyNowFromDetail() {
  if (detailListingId == null) return;
  const l = getDetailListing();
  if (!l || l.status !== 'active') {
    showToast('⚠️ Listing not available');
    return;
  }
  if (isSellerMode() && l.isMine) {
    showToast('⚠️ You cannot buy your own listing');
    return;
  }
  closeListingDetailModal();
  redirectToPaymentsModule(detailListingId, detailQuantity);
}

function openListingDetail(id) {
  const l = listings.find(x => x.id === id);
  if (!l) return;

  detailListingId = l.id;
  detailPhotoIndex = 0;
  detailQuantity = 1;

  const photos = getListingPhotos(l);
  const mainPhoto = photos[0] || '';
  const vaccLabel = { complete: '✅ Fully Vaccinated', partial: '⚠️ Partially Vaccinated', none: '❌ Not Vaccinated', unknown: '❓ Unknown' }[l.vaccineStatus];
  const typeLabel = { sell: 'For Sale', trade: 'For Trade', both: 'Sale or Trade', service: 'Stud / Service' }[l.listingType] || 'Listing';
  const daysAgo = l.postedDaysAgo === 0 ? 'Posted today' : l.postedDaysAgo === 1 ? 'Posted yesterday' : `Posted ${l.postedDaysAgo} days ago`;
  const maxQty = Math.max(1, l.count || 1);
  const priceSuffix = l.count > 1 ? '/head' : (l.listingType === 'service' ? '/service' : '');
  const unitLabel = l.countUnit || 'head';

  const locationDisplay = l.locationPurok
    ? `Brgy. ${l.locationBarangay}, ${l.locationPurok}${l.locationLandmark ? ` — near ${l.locationLandmark}` : ''}, Oroquieta`
    : (l.locationBarangay ? `Brgy. ${l.locationBarangay}${l.locationLandmark ? ` — near ${l.locationLandmark}` : ''}, Oroquieta` : l.location);

  const displayAnimalType = l.type === 'other' && l.customAnimalName
    ? l.customAnimalName
    : l.type.charAt(0).toUpperCase() + l.type.slice(1);

  const showAsMine = l.isMine && isSellerMode();
  const saved = isListingSaved(l.id);
  const canPurchase = !showAsMine && l.status === 'active';
  const buyLabel = l.listingType === 'trade' ? 'Request Trade' : l.listingType === 'service' ? 'Book Now' : 'Buy Now';

  const mainMedia = mainPhoto
    ? `<img id="detailMainImage" class="listing-detail-main-img" src="${mainPhoto}" alt="${l.title}">`
    : `<div class="listing-detail-main-placeholder">${l.emoji}</div>`;

  const thumbs = photos.length > 1
    ? `<div class="listing-detail-thumbs">${photos.map((ph, i) =>
        `<button type="button" class="listing-detail-thumb${i === 0 ? ' active' : ''}" onclick="setDetailPhotoIndex(${i})" aria-label="Photo ${i + 1}">
          <img src="${ph}" alt="">
        </button>`
      ).join('')}</div>`
    : '';

  const purchaseBar = canPurchase ? `
    <div class="listing-detail-buybar">
      <button type="button" class="listing-detail-btn listing-detail-btn-cart" onclick="addToCartFromDetail()">
        <i class="fas fa-cart-plus"></i> Add To Cart
      </button>
      <button type="button" class="listing-detail-btn listing-detail-btn-buy" onclick="buyNowFromDetail()">
        ${buyLabel}
      </button>
    </div>
  ` : (showAsMine ? `
    <div class="listing-detail-buybar listing-detail-buybar-single">
      <button type="button" class="listing-detail-btn listing-detail-btn-buy" onclick="closeListingDetailModal(); openAddListingModal(${l.id})">
        <i class="fas fa-edit"></i> Edit My Listing
      </button>
    </div>
  ` : '');

  document.getElementById('listingDetailContent').innerHTML = `
    <div class="listing-detail-page">
      <div class="listing-detail-media">
        <div class="listing-detail-main-wrap">
          ${mainMedia}
          ${l.daVerified ? '<span class="listing-detail-da-badge"><i class="fas fa-shield-alt"></i> DA Verified</span>' : ''}
        </div>
        ${thumbs}
        <div class="listing-detail-media-actions">
          <button type="button" class="listing-detail-link-btn ${saved ? 'saved-active' : ''}" onclick="toggleSaved(${l.id}); openListingDetail(${l.id})">
            <i class="fas fa-heart"></i> ${saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div class="listing-detail-info">
        <h2 class="listing-detail-title">${l.title}</h2>
        <div class="listing-detail-rating-row">
          <span class="listing-detail-stars">⭐ ${l.sellerRating}</span>
          <span class="listing-detail-dot">·</span>
          <span class="listing-detail-meta">${daysAgo}</span>
          <span class="listing-detail-dot">·</span>
          <span class="listing-detail-type-badge">${typeLabel}</span>
        </div>

        <div class="listing-detail-price-block">
          <div class="listing-detail-price">₱${l.price.toLocaleString()}<span class="listing-detail-price-unit">${priceSuffix}</span></div>
          ${l.priceNegotiable ? '<div class="listing-detail-negotiable">Price is negotiable</div>' : ''}
          <div class="listing-detail-subtotal" id="detailSubtotal">₱${l.price.toLocaleString()}</div>
        </div>

        <div class="listing-detail-shipping">
          <i class="fas fa-map-marker-alt"></i>
          <div>
            <strong>Pickup / meet-up</strong>
            <span>${locationDisplay}</span>
          </div>
        </div>

        ${canPurchase && maxQty > 1 ? `
        <div class="listing-detail-qty-row">
          <span class="listing-detail-qty-label">Quantity</span>
          <div class="listing-detail-qty-control">
            <button type="button" onclick="changeDetailQuantity(-1)" aria-label="Decrease">−</button>
            <input type="number" id="detailQtyInput" min="1" max="${maxQty}" value="1" onchange="onDetailQtyInput()" oninput="onDetailQtyInput()">
            <button type="button" onclick="changeDetailQuantity(1)" aria-label="Increase">+</button>
          </div>
          <span class="listing-detail-stock">${maxQty} ${unitLabel} available</span>
        </div>
        ` : (canPurchase ? `<div class="listing-detail-stock-inline">${maxQty} ${unitLabel} available</div>` : '')}

        <div class="listing-detail-specs">
          <div class="listing-detail-spec"><span>Animal</span><strong>${l.emoji} ${displayAnimalType}</strong></div>
          <div class="listing-detail-spec"><span>Breed</span><strong>${l.breed || '—'}</strong></div>
          <div class="listing-detail-spec"><span>Weight</span><strong>~${l.weight} kg${l.count > 1 ? '/head' : ''}</strong></div>
          <div class="listing-detail-spec"><span>Age</span><strong>${l.age}</strong></div>
          <div class="listing-detail-spec"><span>Vaccination</span><strong>${vaccLabel}</strong></div>
          <div class="listing-detail-spec"><span>Listed</span><strong>${l.count} ${unitLabel}</strong></div>
        </div>

        <div class="listing-detail-seller-card">
          ${showAsMine && farmerProfilePhotoUrl
            ? `<img src="${farmerProfilePhotoUrl}" class="listing-detail-seller-avatar" alt="">`
            : `<span class="listing-detail-seller-emoji">${l.sellerEmoji}</span>`}
          <div>
            <div class="listing-detail-seller-name">${l.seller}</div>
            <div class="listing-detail-seller-rating">Seller rating · ⭐ ${l.sellerRating}</div>
          </div>
        </div>

        ${l.notes ? `
        <div class="listing-detail-desc">
          <h3>Description</h3>
          <p>${l.notes}</p>
        </div>` : ''}

        ${purchaseBar}
      </div>
    </div>
  `;

  document.getElementById('listingDetailModal').classList.remove('hidden');
  document.body.classList.add('listing-detail-open');
}

function closeListingDetailModal() {
  document.getElementById('listingDetailModal').classList.add('hidden');
  document.body.classList.remove('listing-detail-open');
  detailListingId = null;
}

function viewPhoto(url) {
  window.open(url, '_blank');
}

// ===== SECTION: SEARCH & FILTER =====
// ======================================================================
function onSearch() {
  searchQuery = document.getElementById('searchInput').value.trim();
  renderListings();
}

function setTypeFilter(filter, btn) {
  activeTypeFilter = filter;
  document.querySelectorAll('.filter-chip[data-kind="type"]').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderListings();
}

function toggleListingFilter(filter, btn) {
  if (activeListingFilters.has(filter)) {
    activeListingFilters.delete(filter);
    btn.classList.remove('active');
  } else {
    activeListingFilters.add(filter);
    btn.classList.add('active');
  }
  renderListings();
}

function onSort() {
  currentSort = document.getElementById('sortSelect').value;
  renderListings();
}

function redirectToPaymentsModule(id, quantity = 1) {
  const l = listings.find(x => x.id === id);
  if (!l) return;
  const qty = Math.max(1, Math.min(Number(quantity) || 1, l.count || 99));
  const total = l.price * qty;
  const params = new URLSearchParams({
    listing_id: id,
    title: l.title,
    price: l.price,
    quantity: qty,
    total: total,
    seller: l.seller
  });
  window.location.href = `/dropdown/payment/payment.html?${params.toString()}`;
}

// ======================================================================
