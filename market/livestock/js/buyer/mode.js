// Roots Livestock — buyer / seller mode (UI says "farmer"), cart & saved
// ===== SECTION: BUYER MODE — CART, SAVED, USER ROLE =====
// ======================================================================

function loadBuyerData() {
  userMode = localStorage.getItem(LS_KEY_USER_MODE) === 'seller' ? 'seller' : 'buyer';
  try {
    const rawCart = localStorage.getItem(LS_KEY_CART);
    cartItems = rawCart ? JSON.parse(rawCart) : [];
    if (!Array.isArray(cartItems)) cartItems = [];
  } catch (e) {
    cartItems = [];
  }
  try {
    const rawSaved = localStorage.getItem(LS_KEY_SAVED);
    const arr = rawSaved ? JSON.parse(rawSaved) : [];
    savedIds = new Set(Array.isArray(arr) ? arr.map(Number) : []);
  } catch (e) {
    savedIds = new Set();
  }
}

function persistCart() {
  try { localStorage.setItem(LS_KEY_CART, JSON.stringify(cartItems)); } catch (e) {}
  updateBuyerBadges();
}

function persistSaved() {
  try { localStorage.setItem(LS_KEY_SAVED, JSON.stringify([...savedIds])); } catch (e) {}
  updateBuyerBadges();
}

function isSellerMode() {
  return userMode === 'seller';
}

function setUserMode(mode) {
  userMode = mode === 'seller' ? 'seller' : 'buyer';
  try { localStorage.setItem(LS_KEY_USER_MODE, userMode); } catch (e) {}
  applyUserModeUI();
  renderListings();
  if (userMode === 'seller') {
    showToast('🌾 Farmer mode on — you can list and manage animals.');
  } else {
    showToast('🛒 Browsing as buyer — cart and saved listings are available.');
  }
}

function applyUserModeUI() {
  const buyerActions  = document.getElementById('buyerHeaderActions');
  const sellerActions = document.getElementById('sellerHeaderActions');
  const farmerCta     = document.getElementById('farmerCtaBanner');
  const fab           = document.getElementById('fabAddListing');
  const subtitle      = document.querySelector('.module-header .subtitle');

  if (buyerActions)  buyerActions.classList.toggle('hidden', isSellerMode());
  if (sellerActions) sellerActions.classList.toggle('hidden', !isSellerMode());
  if (farmerCta)     farmerCta.classList.toggle('hidden', isSellerMode());
  if (fab)           fab.classList.toggle('hidden', !isSellerMode());
  if (subtitle) {
    subtitle.textContent = isSellerMode()
      ? 'Manage your listings and reach buyers in Oroquieta'
      : 'Browse animals from verified farmers in Oroquieta — save favorites or add to cart';
  }
  updateBuyerBadges();
}

function updateBuyerBadges() {
  const cartBadge  = document.getElementById('cartBadge');
  const savedBadge = document.getElementById('savedBadge');
  const cartCount  = cartItems.length;
  const savedCount = savedIds.size;

  [cartBadge, savedBadge].forEach((el, i) => {
    if (!el) return;
    const n = i === 0 ? cartCount : savedCount;
    el.textContent = String(n);
    el.classList.toggle('hidden', n === 0);
  });
}

function getListingById(id) {
  return listings.find(l => l.id === id);
}

function isListingSaved(id) {
  return savedIds.has(Number(id));
}

function toggleSaved(listingId, e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const id = Number(listingId);
  if (savedIds.has(id)) {
    savedIds.delete(id);
    showToast('💔 Removed from saved');
  } else {
    savedIds.add(id);
    showToast('❤️ Saved to your list');
  }
  persistSaved();
  renderListings();
  if (!document.getElementById('savedModal')?.classList.contains('hidden')) {
    renderSavedModal();
  }
}

function addToCart(listingId, e, qty = 1) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const l = getListingById(Number(listingId));
  if (!l || l.status !== 'active') {
    showToast('⚠️ Listing not available');
    return;
  }
  if (isSellerMode() && l.isMine) {
    showToast('⚠️ You cannot add your own listing to cart');
    return;
  }
  const amount = Math.max(1, Math.min(Number(qty) || 1, l.count || 99));
  const existing = cartItems.find(c => c.listingId === l.id);
  if (existing) {
    existing.quantity = Math.min((existing.quantity || 1) + amount, l.count || 99);
  } else {
    cartItems.push({ listingId: l.id, quantity: amount, addedAt: Date.now(), selected: true });
  }
  if (existing) existing.selected = existing.selected !== false;
  persistCart();
  showToast(amount > 1 ? `🛒 Added ${amount} to cart` : '🛒 Added to cart');
}

function removeFromCart(listingId) {
  cartItems = cartItems.filter(c => c.listingId !== Number(listingId));
  persistCart();
  renderCartModal();
}

function openCartModal() {
  renderCartModal();
  document.getElementById('cartModal')?.classList.remove('hidden');
}

function closeCartModal() {
  document.getElementById('cartModal')?.classList.add('hidden');
}

function openSavedModal() {
  renderSavedModal();
  document.getElementById('savedModal')?.classList.remove('hidden');
}

function closeSavedModal() {
  document.getElementById('savedModal')?.classList.add('hidden');
}

function renderBuyerItemRow(l, opts = {}) {
  const qty = opts.quantity || 1;
  const removeFn = opts.onRemove || `removeFromCart(${l.id})`;
  const photo = (l.photos && l.photos[0]) ? l.photos[0] : null;
  const thumb = photo
    ? `<img src="${photo}" alt="" class="buyer-item-thumb">`
    : `<span class="buyer-item-emoji">${l.emoji}</span>`;
  return `
    <div class="buyer-item-row">
      ${thumb}
      <div class="buyer-item-body">
        <div class="buyer-item-title">${l.title}</div>
        <div class="buyer-item-meta">₱${l.price.toLocaleString()}${qty > 1 ? ` × ${qty}` : ''} · ${l.seller}</div>
      </div>
      <div class="buyer-item-actions">
        ${opts.showOpen ? `<button type="button" class="btn-icon" onclick="closeSavedModal(); openListingDetail(${l.id})" title="View"><i class="fas fa-eye"></i></button>` : ''}
        <button type="button" class="btn-icon danger" onclick="${removeFn}" title="Remove"><i class="fas fa-trash-alt"></i></button>
      </div>
    </div>
  `;
}

function normalizeCartSelection() {
  cartItems.forEach(c => {
    if (c.selected === undefined) c.selected = true;
  });
}

function getCartRows() {
  return cartItems
    .map(c => {
      const l = getListingById(c.listingId);
      if (!l || l.status !== 'active') return null;
      return { c, l, quantity: c.quantity || 1 };
    })
    .filter(Boolean);
}

function getSelectedCartRows() {
  normalizeCartSelection();
  return getCartRows().filter(row => row.c.selected !== false);
}

function renderCartItemRow({ c, l, quantity }) {
  const checked = c.selected !== false;
  const lineTotal = l.price * quantity;
  const photo = (l.photos && l.photos[0]) ? l.photos[0] : null;
  const thumb = photo
    ? `<img src="${photo}" alt="" class="buyer-item-thumb">`
    : `<span class="buyer-item-emoji">${l.emoji}</span>`;
  return `
    <div class="cart-item-row ${checked ? '' : 'cart-item-unselected'}">
      <label class="cart-item-check" onclick="event.stopPropagation()">
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleCartItemSelect(${l.id}, this.checked)" aria-label="Select ${l.title}">
      </label>
      <button type="button" class="cart-item-main" onclick="closeCartModal(); openListingDetail(${l.id})">
        ${thumb}
        <div class="buyer-item-body">
          <div class="buyer-item-title">${l.title}</div>
          <div class="buyer-item-meta">₱${l.price.toLocaleString()}${quantity > 1 ? ` × ${quantity}` : ''} · ${l.seller}</div>
          <div class="cart-item-line-total">Subtotal ₱${lineTotal.toLocaleString()}</div>
        </div>
      </button>
      <button type="button" class="btn-icon danger" onclick="removeFromCart(${l.id})" title="Remove"><i class="fas fa-trash-alt"></i></button>
    </div>
  `;
}

function updateCartFooter() {
  const selected = getSelectedCartRows();
  const allRows = getCartRows();
  const totalEl = document.getElementById('cartTotal');
  const labelEl = document.getElementById('cartSelectedLabel');
  const countEl = document.getElementById('cartSelectedCount');
  const proceedBtn = document.getElementById('cartProceedBtn');
  const selectAllEl = document.getElementById('cartSelectAll');

  const total = selected.reduce((sum, { l, quantity }) => sum + l.price * quantity, 0);
  if (totalEl) totalEl.textContent = '₱' + total.toLocaleString();
  if (labelEl) {
    labelEl.textContent = selected.length === 1 ? '1 selected' : `${selected.length} selected`;
  }
  if (countEl) {
    countEl.textContent = selected.length ? `${selected.length} of ${allRows.length} selected` : 'None selected';
  }
  if (proceedBtn) proceedBtn.disabled = selected.length === 0;
  if (selectAllEl && allRows.length) {
    selectAllEl.checked = selected.length === allRows.length;
    selectAllEl.indeterminate = selected.length > 0 && selected.length < allRows.length;
  }
}

function toggleCartItemSelect(listingId, checked) {
  const item = cartItems.find(c => c.listingId === Number(listingId));
  if (!item) return;
  item.selected = !!checked;
  persistCart();
  renderCartModal();
}

function toggleCartSelectAll(checked) {
  normalizeCartSelection();
  getCartRows().forEach(({ c }) => { c.selected = !!checked; });
  persistCart();
  renderCartModal();
}

function proceedWithSelectedCart() {
  const selected = getSelectedCartRows();
  if (!selected.length) {
    showToast('⚠️ Select at least one item');
    return;
  }

  closeCartModal();

  if (selected.length === 1) {
    const { l, quantity } = selected[0];
    redirectToPaymentsModule(l.id, quantity);
    return;
  }

  const items = selected.map(({ l, quantity }) => ({
    listing_id: l.id,
    title: l.title,
    price: l.price,
    quantity,
    seller: l.seller,
    line_total: l.price * quantity
  }));
  const total = items.reduce((s, i) => s + i.line_total, 0);
  const params = new URLSearchParams({
    mode: 'cart',
    items: JSON.stringify(items),
    total: String(total)
  });
  window.location.href = `/dropdown/payment/payment.html?${params.toString()}`;
}

function renderCartModal() {
  const list   = document.getElementById('cartItemsList');
  const empty  = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const toolbar = document.getElementById('cartToolbar');
  if (!list) return;

  normalizeCartSelection();
  const rows = getCartRows();

  if (!rows.length) {
    list.innerHTML = '';
    empty?.classList.remove('hidden');
    footer?.classList.add('hidden');
    toolbar?.classList.add('hidden');
    return;
  }

  empty?.classList.add('hidden');
  footer?.classList.remove('hidden');
  toolbar?.classList.remove('hidden');
  list.innerHTML = rows.map(renderCartItemRow).join('');
  updateCartFooter();
}

function renderSavedModal() {
  const list  = document.getElementById('savedItemsList');
  const empty = document.getElementById('savedEmpty');
  if (!list) return;

  const saved = [...savedIds]
    .map(id => getListingById(id))
    .filter(l => l && l.status === 'active');

  if (!saved.length) {
    list.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }

  empty?.classList.add('hidden');
  list.innerHTML = saved.map(l =>
    renderBuyerItemRow(l, {
      showOpen: true,
      onRemove: `toggleSaved(${l.id}); renderSavedModal();`
    })
  ).join('');
}

// ----- Farmer onboarding (Register as Farmer) -----

function openFarmerOnboarding() {
  if (isSellerMode()) {
    openMyListings();
    return;
  }
  document.getElementById('farmerIntroModal')?.classList.remove('hidden');
}

function closeFarmerOnboarding() {
  ['farmerIntroModal', 'farmerLoginModal', 'farmerRegModal'].forEach(id =>
    document.getElementById(id)?.classList.add('hidden')
  );
  farmerRegStep = 1;
}

let farmerLoginTab = 'phone';

function setFarmerLoginTab(tab) {
  farmerLoginTab = tab === 'account' ? 'account' : 'phone';
  const tabPhone = document.getElementById('farmerLoginTabPhone');
  const tabAccount = document.getElementById('farmerLoginTabAccount');
  const panelPhone = document.getElementById('farmerLoginPanelPhone');
  const panelAccount = document.getElementById('farmerLoginPanelAccount');

  const isPhone = farmerLoginTab === 'phone';
  tabPhone?.classList.toggle('active', isPhone);
  tabAccount?.classList.toggle('active', !isPhone);
  tabPhone?.setAttribute('aria-selected', isPhone ? 'true' : 'false');
  tabAccount?.setAttribute('aria-selected', !isPhone ? 'true' : 'false');
  panelPhone?.classList.toggle('hidden', !isPhone);
  panelAccount?.classList.toggle('hidden', isPhone);

  if (isPhone) {
    initPhilippinePhoneField(document.getElementById('farmerLoginPhone'));
  }
}

function openFarmerLoginStep() {
  document.getElementById('farmerIntroModal')?.classList.add('hidden');
  document.getElementById('farmerLoginModal')?.classList.remove('hidden');
  setFarmerLoginTab('phone');
}

function backToFarmerIntro() {
  document.getElementById('farmerLoginModal')?.classList.add('hidden');
  document.getElementById('farmerIntroModal')?.classList.remove('hidden');
}

function submitFarmerLogin() {
  const password = document.getElementById('farmerLoginPassword')?.value;

  if (farmerLoginTab === 'phone') {
    const phoneEl = document.getElementById('farmerLoginPhone');
    const phoneCheck = validatePhilippinePhoneRequired(phoneEl?.value, 'mobile number');
    if (!phoneCheck.ok) {
      showToast(`⚠️ ${phoneCheck.message}`);
      return;
    }
    if (phoneEl) phoneEl.value = phoneCheck.value;
  } else {
    const account = document.getElementById('farmerLoginAccount')?.value.trim();
    if (!account) {
      showToast('⚠️ Enter your email or username');
      return;
    }
    if (account.includes('@')) {
      if (!looksLikeEmail(account)) {
        showToast('⚠️ Enter a valid email address');
        return;
      }
    } else if (account.length < 3) {
      showToast('⚠️ Username must be at least 3 characters');
      return;
    }
  }

  if (!password || password.length < 4) {
    showToast('⚠️ Enter your password (min. 4 characters)');
    return;
  }
  document.getElementById('farmerLoginModal')?.classList.add('hidden');
  openFarmerRegForm();
  showToast('✅ Signed in — complete your farmer registration');
}

function openFarmerRegForm() {
  farmerRegStep = 1;
  loadFarmerRegDraft();
  updateFarmerRegStepUI();
  document.getElementById('farmerRegModal')?.classList.remove('hidden');
  initPhilippinePhoneField(document.getElementById('farmPhone'));
  const nameInput = document.getElementById('farmShopName');
  if (nameInput) {
    nameInput.oninput = () => {
      const c = document.getElementById('farmShopNameCount');
      if (c) c.textContent = String(nameInput.value.length);
    };
  }
}

function updateFarmerRegStepUI() {
  const s1 = document.getElementById('farmerRegStep1');
  const s2 = document.getElementById('farmerRegStep2');
  const ind1 = document.getElementById('farmerStep1Indicator');
  const ind2 = document.getElementById('farmerStep2Indicator');
  const title = document.getElementById('farmerRegStepTitle');
  const backBtn = document.getElementById('farmerRegBackBtn');
  const nextBtn = document.getElementById('farmerRegNextBtn');

  if (farmerRegStep === 1) {
    s1?.classList.remove('hidden');
    s2?.classList.add('hidden');
    ind1?.classList.add('active');
    ind2?.classList.remove('active');
    if (title) title.textContent = 'Farm Information';
    if (backBtn) backBtn.disabled = true;
    if (nextBtn) nextBtn.innerHTML = 'Next';
  } else {
    s1?.classList.add('hidden');
    s2?.classList.remove('hidden');
    ind1?.classList.add('done');
    ind2?.classList.add('active');
    if (title) title.textContent = 'Contact & Location';
    if (backBtn) backBtn.disabled = false;
    if (nextBtn) nextBtn.innerHTML = '<i class="fas fa-check-circle"></i> Submit';
    initPhilippinePhoneField(document.getElementById('farmPhone'));
  }
}

function farmerRegBack() {
  if (farmerRegStep <= 1) return;
  farmerRegStep = 1;
  updateFarmerRegStepUI();
}

function farmerRegNext() {
  if (farmerRegStep === 1) {
    const name = document.getElementById('farmShopName')?.value.trim();
    if (!name) { showToast('⚠️ Enter your farm or listing name'); return; }
    farmerRegStep = 2;
    updateFarmerRegStepUI();
    return;
  }

  const email = document.getElementById('farmEmail')?.value.trim();
  const brgy = document.getElementById('farmPickupBarangay')?.value;
  const phoneEl = document.getElementById('farmPhone');
  const phoneRaw = phoneEl?.value.trim();
  const terms = document.getElementById('farmTermsAgree')?.checked;
  const phoneCheck = validatePhilippinePhoneRequired(phoneRaw, 'contact phone');
  if (!phoneCheck.ok) { showToast(`⚠️ ${phoneCheck.message}`); return; }
  if (phoneEl) phoneEl.value = phoneCheck.value;
  if (email && !looksLikeEmail(email)) {
    showToast('⚠️ Enter a valid email address or leave it blank');
    return;
  }
  if (!brgy) { showToast('⚠️ Select your pickup barangay'); return; }
  if (!terms) { showToast('⚠️ Please read and agree to the Terms of Use and Data Privacy Policy'); return; }

  const reg = {
    shopName: document.getElementById('farmShopName')?.value.trim(),
    barangay: document.getElementById('farmPickupBarangay')?.value,
    street: document.getElementById('farmPickupStreet')?.value.trim(),
    lat: document.getElementById('farmPickupLat')?.value || null,
    lng: document.getElementById('farmPickupLng')?.value || null,
    email: email || null,
    phone: phoneCheck.value,
    daId: document.getElementById('farmDaId')?.value.trim(),
    registeredAt: Date.now()
  };
  try { localStorage.setItem(LS_KEY_FARMER_REG, JSON.stringify(reg)); } catch (e) {}

  closeFarmerOnboarding();
  setUserMode('seller');
  showToast('🌾 Farmer registration complete! You can now list animals.');
}

function saveFarmerRegDraft() {
  const draft = {
    shopName: document.getElementById('farmShopName')?.value,
    barangay: document.getElementById('farmPickupBarangay')?.value,
    street: document.getElementById('farmPickupStreet')?.value,
    lat: document.getElementById('farmPickupLat')?.value,
    lng: document.getElementById('farmPickupLng')?.value,
    email: document.getElementById('farmEmail')?.value,
    phone: document.getElementById('farmPhone')?.value,
    daId: document.getElementById('farmDaId')?.value,
    step: farmerRegStep
  };
  try { localStorage.setItem(LS_KEY_FARMER_REG + '_draft', JSON.stringify(draft)); } catch (e) {}
  showToast('💾 Registration draft saved');
}

function loadFarmerRegDraft() {
  try {
    const raw = localStorage.getItem(LS_KEY_FARMER_REG + '_draft');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.shopName) document.getElementById('farmShopName').value = d.shopName;
    if (d.barangay) document.getElementById('farmPickupBarangay').value = d.barangay;
    if (d.street) document.getElementById('farmPickupStreet').value = d.street;
    if (d.email) document.getElementById('farmEmail').value = d.email;
    if (d.phone) {
      const phoneEl = document.getElementById('farmPhone');
      if (phoneEl) {
        phoneEl.value = d.phone;
        formatPhilippineMobileInput(phoneEl);
      }
    } else {
      initPhilippinePhoneField(document.getElementById('farmPhone'));
    }
    if (d.daId) document.getElementById('farmDaId').value = d.daId;
    restoreFarmLocationFromDraft(d);
    const c = document.getElementById('farmShopNameCount');
    if (c && d.shopName) c.textContent = String(d.shopName.length);
  } catch (e) {}
}

// ======================================================================
