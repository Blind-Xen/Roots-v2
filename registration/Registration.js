'use strict';

// ─── BUILT-IN CREDENTIALS ─────────────────────────────────────
const ADMIN_CREDENTIALS = { phone: '09000000001', password: 'admin123' };
const ADMIN_USER = {
  firstname: 'Admin', lastname: 'DA',
  phone: '09000000001', type: 'admin',
  barangay: 'DA Region X', crop: null,
  role: 'DA Admin', isAdmin: true, isNonFarmer: false,
  token: 'admin_static_token'   // must match the token stored in the DB for the admin row
};

// ─── API CONFIG ───────────────────────────────────────────────
// Points to register.php in the api folder.
const API_URL = 'api/register.php';

// ─── STATE ────────────────────────────────────────────────────
let currentUser = null;
let currentFarmerFilter = 'all';
let selectedFarmerId = null;

// Barangays loaded from the database
let barangayList = [];   // [{ barangay_id, barangay_name }, ...]

// ─── NOTIFICATIONS STATE ──────────────────────────────────────
let notifications = [
  { id:1, icon:'🌾', iconBg:'rgba(82,183,136,.12)',
    text:'Welcome to <strong>Roots — DA Farmers Registry</strong>',
    time:'Just now', unread:true, type:'info' },
];

/**
 * Fetch barangays from the DB and populate the #regBarangay <select>.
 * Called once on DOMContentLoaded and also when the register tab opens.
 */
async function loadBarangays(locationId = 1) {
  try {
    const res  = await fetch(`${API_URL}?action=barangays&location_id=${locationId}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return;
    barangayList = json.data;
    renderBrgyList(barangayList);
  } catch (err) {
    console.error('Could not load barangays:', err);
  }
}

function renderBrgyList(list) {
  const ul = document.getElementById('brgyList');
  if (!ul) return;
  ul.innerHTML = '';
  list.forEach(b => {
    const li = document.createElement('li');
    li.textContent = b.barangay_name;
    li.dataset.id  = b.barangay_id;
    li.style.cssText = 'padding:8px 14px;cursor:pointer;font-size:13px;color:var(--canopy)';
    li.onmouseenter = () => li.style.background = 'var(--mist)';
    li.onmouseleave = () => li.style.background = '';
    li.onclick = () => selectBrgy(b.barangay_id, b.barangay_name);
    ul.appendChild(li);
  });
}

function filterBrgy(q) {
  const filtered = barangayList.filter(b =>
    b.barangay_name.toLowerCase().includes(q.toLowerCase())
  );
  renderBrgyList(filtered);
}

function toggleBrgyDropdown() {
  const panel    = document.getElementById('brgyPanel');
  const chevron  = document.getElementById('brgyChevron');
  const isOpen   = panel.style.display === 'flex';
  panel.style.display = isOpen ? 'none' : 'flex';
  chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
  if (!isOpen) {
    setTimeout(() => document.getElementById('brgySearch')?.focus(), 50);
  }
}

function selectBrgy(id, name) {
  document.getElementById('regBarangay').value = id;
  document.getElementById('brgyLabel').textContent = name;
  document.getElementById('brgyLabel').style.color = 'var(--canopy)';
  document.getElementById('brgyPanel').style.display = 'none';
  document.getElementById('brgyChevron').style.transform = '';
  document.getElementById('brgySearch').value = '';
  renderBrgyList(barangayList);
  document.getElementById('regBrgyErr').textContent = '';
}

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  const trigger = document.getElementById('brgyTrigger');
  const panel   = document.getElementById('brgyPanel');
  if (panel && trigger && !trigger.contains(e.target) && !panel.contains(e.target)) {
    panel.style.display = 'none';
    document.getElementById('brgyChevron').style.transform = '';
  }
});

// Users, farmers, and nonFarmers are loaded from the database — no dummy accounts.
let users      = [];
let farmers    = [];
let nonFarmers = [];



// ─── PAGE ROUTING ─────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  // Show/hide shared navigation based on view
  if (id === 'dashView') {
    document.body.classList.add('show-nav');
  } else {
    document.body.classList.remove('show-nav');
  }
}
function goLanding()   { showView('landingView'); }
function goAuth(tab)   { showView('authView'); switchTab(tab || 'login'); }
function goDashboard() { showView('dashView'); initDashboard(); }

// ─── REG SUB-TABS ─────────────────────────────────────────────
function switchRegTab(tab) {
  const farmerForm  = document.getElementById('regFarmerForm');
  const nonFarmForm = document.getElementById('regNonFarmForm');
  const tabFarmer   = document.getElementById('regTabFarmer');
  const tabNonFarm  = document.getElementById('regTabNonFarm');
  if (tab === 'farmer') {
    farmerForm.style.display  = 'block';
    nonFarmForm.style.display = 'none';
    tabFarmer.classList.add('active');
    tabNonFarm.classList.remove('active');
  } else {
    farmerForm.style.display  = 'none';
    nonFarmForm.style.display = 'block';
    tabFarmer.classList.remove('active');
    tabNonFarm.classList.add('active');
  }
}

// ─── NAV SWITCH (FARMER) ──────────────────────────────────────
function navSwitch(panel) {
  closeDropdowns();
  document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#fbCenterNav .fb-nav-btn').forEach(b => b.classList.remove('active'));
  const panelMap = {
    home:'panelHome', admin:'panelAdmin',
    livestock:'panelLivestock', fruitsveg:'panelFruitsveg',
    landequip:'panelLandequip', tanimbase:'panelTanimbase',
    payment:'panelPayment', farmmap:'panelFarmmap',
    harvest:'panelHarvest', docs:'panelDocs', profile:'panelProfile'
  };
  const btnMap = {
    home:'navHome', admin:'navAdmin',
    livestock:'navLivestock', fruitsveg:'navFruitsVeg',
    landequip:'navLandEquip', tanimbase:'navTanimBase',
    payment:'navPayment', farmmap:'navFarmMap',
    harvest:'navHarvest', docs:'navDocs', profile:'navProfile'
  };
  const el = document.getElementById(panelMap[panel]);
  if (el) el.classList.add('active');
  const btn = document.getElementById(btnMap[panel]);
  if (btn) btn.classList.add('active');
  document.getElementById('mainContent').scrollTop = 0;
}

// ─── NAV SWITCH (NON-FARMER) ──────────────────────────────────
function nfNavSwitch(panel) {
  closeDropdowns();
  document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#fbCenterNavNF .fb-nav-btn').forEach(b => b.classList.remove('active'));
  const panelMap = {
    home:      'panelHome',
    nfmarket:  'panelNfmarket',
    nfprices:  'panelNfprices',
    nfda:      'panelNfda',
    nfconnect: 'panelNfconnect',
    nfprofile: 'panelNfprofile',
  };
  const btnMap = {
    home:      'nfNavHome',
    nfmarket:  'nfNavMarket',
    nfprices:  'nfNavPrices',
    nfda:      'nfNavDA',
    nfconnect: 'nfNavConnect',
    nfprofile: 'nfNavProfile',
  };
  const el = document.getElementById(panelMap[panel]);
  if (el) el.classList.add('active');
  const btn = document.getElementById(btnMap[panel]);
  if (btn) btn.classList.add('active');
  document.getElementById('mainContent').scrollTop = 0;
}

function switchNFProfileTab(tab, btn) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const map = { about:'nfPtabAbout', activity:'nfPtabActivity' };
  const el = document.getElementById(map[tab]);
  if (el) el.classList.add('active');
}

// ─── DROPDOWNS ────────────────────────────────────────────────
function toggleDropdown(type) {
  const notif    = document.getElementById('notifDropdown');
  const profile  = document.getElementById('profileDropdown');
  const notifBtn = document.getElementById('notifBtn');
  if (type === 'notif') {
    const open = notif.classList.contains('open');
    profile.classList.remove('open');
    notif.classList.toggle('open', !open);
    notifBtn.classList.toggle('active', !open);
  } else {
    const open = profile.classList.contains('open');
    notif.classList.remove('open');
    notifBtn.classList.remove('active');
    profile.classList.toggle('open', !open);
  }
}
function closeDropdowns() {
  document.getElementById('notifDropdown').classList.remove('open');
  document.getElementById('profileDropdown').classList.remove('open');
  document.getElementById('notifBtn').classList.remove('active');
}
document.addEventListener('click', e => {
  if (!e.target.closest('#notifBtn') && !e.target.closest('#notifDropdown') &&
      !e.target.closest('#topbarAv') && !e.target.closest('#profileDropdown')) {
    closeDropdowns();
  }
});

// ─── AUTH TABS ────────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab==='login');
  document.getElementById('tabRegister').classList.toggle('active', tab==='register');
  document.getElementById('formLogin').classList.toggle('active', tab==='login');
  document.getElementById('formRegister').classList.toggle('active', tab==='register');
  // Reset to farmer sub-tab on each open and (re)load barangays from DB
  if (tab === 'register') {
    switchRegTab('farmer');
    loadBarangays();
  }
}
function togglePw(inputId, iconId) {
  const inp  = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (inp.type === 'password') { inp.type = 'text';     icon.className = 'fas fa-eye-slash'; }
  else                          { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

// ─── PHONE NORMALIZER ─────────────────────────────────────────
/**
 * Accepts:
 *   10-digit  "9171234567"  → "09171234567"
 *   11-digit  "09171234567" → "09171234567"  (already correct)
 * Returns the normalised 11-digit string.
 */
function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && !digits.startsWith('0')) return '0' + digits;
  return digits;
}

// ─── LOGIN ────────────────────────────────────────────────────
async function doLogin() {
  const rawPhone = document.getElementById('loginPhone').value.trim();
  const pw       = document.getElementById('loginPassword').value;
  const phone    = normalizePhone(rawPhone);

  let ok = true;
  document.getElementById('loginPhoneErr').textContent    = '';
  document.getElementById('loginPasswordErr').textContent = '';

  if (!/^09\d{9}$/.test(phone)) {
    document.getElementById('loginPhoneErr').textContent = 'Enter a valid PH number (e.g. 09171234567).';
    ok = false;
  }
  if (!pw) {
    document.getElementById('loginPasswordErr').textContent = 'Password is required.';
    ok = false;
  }
  if (!ok) return;

  // All users (including admin) are authenticated via the database
  try {
    const res  = await fetch(`${API_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password: pw })
    });
    const json = await res.json();
    if (!json.success) {
      document.getElementById('loginPasswordErr').textContent =
        json.error || 'Invalid phone number or password.';
      return;
    }
    const u = json.data;
    const isAdmin = u.type === 'admin';
    currentUser = {
      id:          u.user_id,
      phone:       u.phone,
      firstname:   u.firstname,
      lastname:    u.lastname,
      type:        u.type,
      barangay:    u.barangay   || (isAdmin ? 'DA Region X' : ''),
      city:        u.city       || '',
      crop:        u.crop       || null,
      role:        isAdmin ? 'DA Admin' : '',
      email:       u.email      || '',
      token:       u.token,
      isAdmin:     isAdmin,
      isNonFarmer: u.type === 'nonfarm',
    };
    sessionStorage.setItem('rootsUser', JSON.stringify(currentUser));
    showToast(isAdmin ? '🛡️ Welcome, DA Admin!' : `✅ Welcome back, ${u.firstname}!`);
    setTimeout(() => window.location.href = '../community/views/roots-feed.html', 600);
  } catch (err) {
    document.getElementById('loginPasswordErr').textContent = 'Could not connect to server. Try again.';
  }
}

// ─── DEMO LOGIN ─────────────────────────────────────────────────
function demoLogin(type) {
  // Demo accounts for testing purposes
  const demoAccounts = {
    farmer: {
      id: 'demo_farmer_001',
      phone: '09171234567',
      firstname: 'Ricardo',
      lastname: 'Magsaysay',
      type: 'farmer',
      barangay: 'Purok 4, Taboc',
      crop: '🌾 Palay / Rice',
      role: '',
      email: 'ricardo.demo@roots.ph',
      token: 'demo_farmer_token_' + Date.now(),
      isAdmin: false,
      isNonFarmer: false,
      status: 'active'
    },
    nonfarm: {
      id: 'demo_nonfarm_001',
      phone: '09181234567',
      firstname: 'Juan',
      lastname: 'dela Cruz',
      type: 'nonfarm',
      barangay: 'Brgy. Pines',
      city: 'Oroquieta City',
      crop: null,
      role: '',
      email: 'juan.demo@roots.ph',
      token: 'demo_nonfarm_token_' + Date.now(),
      isAdmin: false,
      isNonFarmer: true,
      status: 'active'
    }
  };

  const demo = demoAccounts[type];
  if (!demo) {
    showToast('❌ Invalid demo account type');
    return;
  }

  currentUser = { ...demo };
  sessionStorage.setItem('rootsUser', JSON.stringify(currentUser));
  
  const welcomeMsg = type === 'farmer' 
    ? '🌾 Welcome, Demo Farmer Ricardo!' 
    : '🤝 Welcome, Demo Member Juan!';
  
  showToast(welcomeMsg);
  setTimeout(() => window.location.href = '../community/views/roots-feed.html', 600);
}

// ─── ID UPLOAD STATE ─────────────────────────────────────────
let selectedIdType  = null;
let uploadedIdFile  = null;
const ID_TYPE_LABELS = {
  drivers:    "Driver's License",
  national:   "National ID (PhilSys)",
  sss:        "SSS / GSIS Card",
  philhealth: "PhilHealth ID",
  voter:      "Voter's ID",
  passport:   "Passport",
  postal:     "Postal ID",
  barangay:   "Barangay Certificate",
};

function selectIdType(btn, type) {
  document.querySelectorAll('.id-type-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedIdType = type;
  const label    = ID_TYPE_LABELS[type];
  const selEl    = document.getElementById('idSelectedLabel');
  selEl.className = 'id-selected-name';
  selEl.innerHTML = `<i class="fas fa-id-card"></i> <strong>${label}</strong> selected — upload a clear photo below.`;
  document.getElementById('idDropZone').style.display = 'block';
  document.getElementById('idUploadErr').textContent  = '';
  // Reset file if type changed
  if (uploadedIdFile) removeIdFile();
}

function handleIdFile(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    document.getElementById('idUploadErr').textContent = 'File too large. Maximum size is 5MB.';
    input.value = '';
    return;
  }
  uploadedIdFile = file;
  document.getElementById('idUploadErr').textContent = '';
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('idPreviewImg').src = e.target.result;
      document.getElementById('idPreviewWrap').style.display = 'block';
      document.getElementById('idDropZone').style.display    = 'none';
      document.getElementById('idPreviewLabel').textContent  =
        `${ID_TYPE_LABELS[selectedIdType] || 'ID'} · ${(file.size/1024).toFixed(0)} KB`;
    };
    reader.readAsDataURL(file);
  } else {
    // PDF: show text confirmation instead of preview
    document.getElementById('idPreviewImg').src = '';
    document.getElementById('idPreviewWrap').style.display = 'block';
    document.getElementById('idDropZone').style.display    = 'none';
    document.getElementById('idPreviewImg').style.display  = 'none';
    document.getElementById('idPreviewLabel').textContent  =
      `PDF: ${file.name} · ${(file.size/1024).toFixed(0)} KB`;
  }
}

function removeIdFile() {
  uploadedIdFile = null;
  document.getElementById('idFileInput').value      = '';
  document.getElementById('idPreviewWrap').style.display = 'none';
  document.getElementById('idPreviewImg').style.display  = 'block';
  document.getElementById('idDropZone').style.display    = selectedIdType ? 'block' : 'none';
}

// ─── DA NAME DETECTION ────────────────────────────────────────
const DA_KEYWORDS = ['da staff','da agent','da worker','da extension','da region','department of agriculture'];
function checkDAName() {
  const fn  = (document.getElementById('regFn')?.value || '').toLowerCase().trim();
  const ln  = (document.getElementById('regLn')?.value || '').toLowerCase().trim();
  const full = fn + ' ' + ln;
  const warn = document.getElementById('daNameWarning');
  const isDA = DA_KEYWORDS.some(k => full.includes(k));
  if (warn) warn.style.display = isDA ? 'flex' : 'none';
}

// ─── REGISTER FARMER ─────────────────────────────────────────
async function doRegister() {
  const fn    = document.getElementById('regFn').value.trim();
  const ln    = document.getElementById('regLn').value.trim();
  const rawPh = document.getElementById('regPhone').value.trim();
  const pw    = document.getElementById('regPassword').value;
  const br    = document.getElementById('regBarangay').value;
  const email = document.getElementById('regEmail').value.trim();
  const agree = document.getElementById('regAgree').checked;

  // Normalize phone to full 11-digit PH format (09XXXXXXXXX)
  const ph = normalizePhone(rawPh);

  // ── Validate fields ──────────────────────────────────────────
  document.getElementById('regFnErr').textContent    = fn ? '' : 'First name required.';
  document.getElementById('regLnErr').textContent    = ln ? '' : 'Last name required.';
  document.getElementById('regPasswordErr').textContent = pw.length >= 6 ? '' : 'At least 6 characters.';
  document.getElementById('regBrgyErr').textContent  = br ? '' : 'Please select a barangay.';
  document.getElementById('idUploadErr').textContent = '';

  // Phone validation — must be 11-digit PH number after normalisation
  const phoneErrEl = document.getElementById('regPhoneErr');
  if (!/^09\d{9}$/.test(ph)) {
    phoneErrEl.textContent = 'Enter a valid PH number (e.g. 09171234567).';
    return;
  } else {
    phoneErrEl.textContent = '';
  }

  // Email format check (optional field)
  const emailErrEl = document.getElementById('regEmailErr');
  if (emailErrEl) emailErrEl.textContent = '';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (emailErrEl) emailErrEl.textContent = 'Enter a valid email address.';
    return;
  }

  // ID validation
  let idOk = true;
  if (!selectedIdType) {
    document.getElementById('idUploadErr').textContent = 'Please select an ID type.';
    idOk = false;
  } else if (!uploadedIdFile) {
    document.getElementById('idUploadErr').textContent =
      'Please upload a photo of your ' + ID_TYPE_LABELS[selectedIdType] + '.';
    idOk = false;
  }

  if (!fn || !ln || pw.length < 6 || !br || !idOk) return;
  if (!agree) { showToast('⚠️ Please agree to Terms of Service.'); return; }

  // Block DA admin phone
  if (ph === '0' + ADMIN_CREDENTIALS.phone || ph === ADMIN_CREDENTIALS.phone) {
    phoneErrEl.textContent = 'This number is reserved for DA staff. Contact your supervisor.';
    return;
  }

  const cropNames  = { 1:'🌾 Palay / Rice', 2:'🌽 Corn / Mais', 3:'🥬 Vegetables', 4:'🍌 Banana', 5:'🥥 Coconut', 6:'Mixed Farming' };
  const cropId     = parseInt(document.getElementById('regCrop').value) || 0;
  const areaVal    = parseFloat(document.getElementById('regFarmArea').value) || '';

  // Resolve selected barangay from the DB-loaded list
  const barangayId   = parseInt(br) || 0;
  const barangayObj  = barangayList.find(b => b.barangay_id === barangayId);
  const barangayName = barangayObj ? barangayObj.barangay_name : br;
  const cropName     = cropNames[cropId] || '';

  // ── FIX: declare FormData before appending ───────────────────
  const fd = new FormData();
  fd.append('phone',       ph);          // full 11-digit normalised phone
  fd.append('firstname',   fn);
  fd.append('lastname',    ln);
  fd.append('password',    pw);
  fd.append('barangay_id', barangayId);  // integer FK — resolved against ref_barangays
  fd.append('crop',        cropName);
  fd.append('area',        areaVal);
  fd.append('id_type',     ID_TYPE_LABELS[selectedIdType] || selectedIdType);
  fd.append('id_file',     uploadedIdFile);
  if (email) fd.append('email', email);

  try {
    showToast('⏳ Submitting registration…');
    const res  = await fetch(`${API_URL}?action=farmer`, { method: 'POST', body: fd });
    let json;
    try {
      json = await res.json();
    } catch (_) {
      const raw = await res.text().catch(() => '(no response body)');
      showToast('❌ Server error (not JSON). Check PHP logs.');
      console.error('Server returned non-JSON:', raw);
      return;
    }

    if (!json.success) {
      // Phone already taken
      if (json.error && json.error.toLowerCase().includes('already')) {
        document.getElementById('regPhoneErr').textContent = json.error;
      } else {
        showToast('❌ ' + (json.error || 'Registration failed.'));
      }
      return;
    }

    const u = json.data;
    const today = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

    // Keep local arrays in sync for the current session
    const newUser = { phone:ph, password:pw, firstname:fn, lastname:ln, type:'farmer',
      isAdmin:false, isNonFarmer:false, barangay:barangayName, crop:cropName,
      idType: ID_TYPE_LABELS[selectedIdType] || selectedIdType,
      idFileName: uploadedIdFile ? uploadedIdFile.name : 'uploaded' };
    users.push(newUser);
    currentUser = { ...newUser, id: u.user_id, token: u.token, status: u.status };
    sessionStorage.setItem('rootsUser', JSON.stringify(currentUser));

    const newId = farmers.length ? Math.max(...farmers.map(f=>f.id)) + 1 : 1;
    farmers.push({ id:newId, db_id: u.user_id, firstname:fn, lastname:ln, phone:ph, barangay:barangayName,
      crop:cropName, area: areaVal ? areaVal+' ha':'N/A', registered:today, status:'pending',
      notes:`Newly registered via online form. ID submitted: ${ID_TYPE_LABELS[selectedIdType] || selectedIdType}.` });

    notifications.unshift({ id:Date.now(), icon:'👨‍🌾', iconBg:'rgba(82,183,136,.12)',
      text:`<strong>${fn} ${ln}</strong> submitted a new farmer registration`,
      time:'Just now', unread:true, type:'verify' });

    selectedIdType = null; uploadedIdFile = null;
    showToast('🎉 Farmer account created! Welcome, ' + fn + '!');
    setTimeout(() => window.location.href = '../community/views/roots-feed.html', 700);

  } catch (err) {
    showToast('❌ ' + (err.message || 'Could not connect to server.'));
    console.error('Farmer registration error:', err);
  }
}

// ─── REGISTER NON-FARMER ──────────────────────────────────────
async function doRegisterNonFarmer() {
  const fn     = document.getElementById('nfFn').value.trim();
  const ln     = document.getElementById('nfLn').value.trim();
  const rawPh  = document.getElementById('nfPhone').value.trim();
  const pw     = document.getElementById('nfPassword').value;
  const city   = document.getElementById('nfCity').value.trim();
  const brgy   = document.getElementById('nfBarangay').value.trim();
  const email  = document.getElementById('nfEmail').value.trim();
  const agree  = document.getElementById('nfAgree').checked;

  // Normalize phone to full 11-digit PH format
  const ph = normalizePhone(rawPh);

  // Clear errors
  ['nfFnErr','nfLnErr','nfPhoneErr','nfPasswordErr','nfCityErr','nfEmailErr']
    .forEach(id => document.getElementById(id).textContent = '');

  let ok = true;
  if (!fn)                        { document.getElementById('nfFnErr').textContent       = 'First name required.'; ok = false; }
  if (!ln)                        { document.getElementById('nfLnErr').textContent       = 'Last name required.';  ok = false; }
  if (!/^09\d{9}$/.test(ph))     { document.getElementById('nfPhoneErr').textContent    = 'Enter a valid PH number (e.g. 09171234567).'; ok = false; }
  if (pw.length < 6)              { document.getElementById('nfPasswordErr').textContent = 'At least 6 characters.'; ok = false; }
  if (!city)                      { document.getElementById('nfCityErr').textContent     = 'City / municipality required.'; ok = false; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('nfEmailErr').textContent = 'Enter a valid email address.'; ok = false;
  }
  if (!ok) return;
  if (!agree) { showToast('⚠️ Please agree to Terms of Service.'); return; }
  if (ph === '0' + ADMIN_CREDENTIALS.phone || ph === ADMIN_CREDENTIALS.phone) {
    document.getElementById('nfPhoneErr').textContent = 'This number is reserved for DA staff.'; return;
  }

  try {
    showToast('⏳ Creating your account…');
    const res  = await fetch(`${API_URL}?action=nonfarm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone:ph, password:pw, firstname:fn, lastname:ln,
                             city, barangay:brgy, email })
    });
    let json;
    try {
      json = await res.json();
    } catch (_) {
      const raw = await res.text().catch(() => '(no response body)');
      showToast('❌ Server error (not JSON). Check PHP logs.');
      console.error('Server returned non-JSON:', raw);
      return;
    }

    if (!json.success) {
      if (json.error && json.error.toLowerCase().includes('already')) {
        document.getElementById('nfPhoneErr').textContent = json.error;
      } else {
        showToast('❌ ' + (json.error || 'Registration failed.'));
      }
      return;
    }

    const u = json.data;
    const today = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    const newId = nonFarmers.length ? Math.max(...nonFarmers.map(n=>n.id)) + 1 : 1;

    const newUser = { phone:ph, password:pw, firstname:fn, lastname:ln, type:'nonfarm',
      isAdmin:false, isNonFarmer:true, city, barangay:brgy, email };
    users.push(newUser);
    currentUser = { ...newUser, id: u.user_id, token: u.token, status: u.status };
    sessionStorage.setItem('rootsUser', JSON.stringify(currentUser));

    nonFarmers.push({ id:newId, firstname:fn, lastname:ln, phone:ph, city, barangay:brgy,
      email, registered:today });

    notifications.unshift({ id:Date.now(), icon:'👤', iconBg:'rgba(59,130,246,.12)',
      text:`<strong>${fn} ${ln}</strong> registered as a community member`,
      time:'Just now', unread:true, type:'info' });

    showToast('🎉 Account created! Welcome, ' + fn + '!');
    setTimeout(() => window.location.href = '../community/views/roots-feed.html', 700);

  } catch (err) {
    showToast('❌ ' + (err.message || 'Could not connect to server.'));
    console.error('Non-farmer registration error:', err);
  }
}

// ─── DASHBOARD INIT ───────────────────────────────────────────
function initDashboard() {
  const u        = currentUser;
  const name     = u.firstname + ' ' + u.lastname;
  const initials = (u.firstname[0] + (u.lastname[0]||'')).toUpperCase();
  const hour     = new Date().getHours();
  const greet    = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const isNF     = u.isNonFarmer;

  // ── Topbar avatar & dropdowns ──
  document.getElementById('topbarAv').textContent        = initials;
  document.getElementById('profileDropAv').textContent   = initials;
  document.getElementById('profileDropName').textContent = name;
  document.getElementById('profileDropRole').textContent =
    u.isAdmin ? '🛡️ Admin / DA Staff' : isNF ? '🤝 Non-Farmer' : '🌾 Farmer';
  document.getElementById('profileDropStats').style.display = isNF ? 'none' : 'grid';

  const hour2    = new Date().getHours();
  const dateStr  = new Date().toLocaleDateString('en-PH',
    { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  // ── Nav layout ──
  const farmerNav  = document.getElementById('fbCenterNav');
  const nfNav      = document.getElementById('fbCenterNavNF');
  const adminBtn   = document.getElementById('navAdmin');
  const topbar     = document.querySelector('.fb-topbar');

  if (u.isAdmin) {
    farmerNav.style.display = 'none';
    nfNav.style.display     = 'none';
    adminBtn.style.display  = 'flex';
    topbar.classList.add('admin-mode');
    navSwitch('admin');

  } else {
    // Farmer AND Non-Farmer — same dashboard
    farmerNav.style.display = 'flex';
    nfNav.style.display     = 'none';
    adminBtn.style.display  = 'none';
    topbar.classList.remove('admin-mode');
    document.getElementById('profileAvXl').textContent      = initials;
    document.getElementById('profilePageName').textContent  = name;
    document.getElementById('profilePageRole').textContent  = isNF ? '🤝 Non-Farmer' : '🌾 Farmer';
    document.getElementById('profileVerifiedBadge').style.display = isNF ? 'none' : 'inline-flex';
    document.getElementById('pInfoPhone').textContent    = '+63 ' + u.phone;
    document.getElementById('pInfoBarangay').textContent = u.barangay || '—';
    document.getElementById('pInfoCity').textContent     = u.city || 'Oroquieta City';
    document.getElementById('pInfoEmailRow').style.display = isNF ? '' : 'none';
    const pEmail = document.getElementById('pInfoEmail');
    if (isNF && pEmail) pEmail.textContent = u.email || '—';
    document.getElementById('pFarmDetailsCard').style.display   = '';
    document.getElementById('pSeasonSummaryCard').style.display = '';
    document.getElementById('pInfoCrop').textContent = u.crop || 'N/A';
    navSwitch('home');
    renderBarChart(); renderActivity(); renderTasks();
  }

  // ── Greeting + date ──
  document.getElementById('dashGreeting').textContent = u.isAdmin
    ? `${greet}, ${u.firstname} 🛡️`
    : `${greet}, Kuya ${u.firstname} 🌾`;
  document.getElementById('dashDate').textContent =
    (u.city || u.barangay || 'Oroquieta City') + ' • ' + dateStr;

  // ── Home panel content ──
  const nfBanner      = document.getElementById('nfWelcomeBanner');
  const farmerContent = document.getElementById('farmerDashContent');
  if (u.isAdmin) {
    nfBanner.style.display      = 'none';
    farmerContent.style.display = 'none';
  } else {
    // Both Farmer and Non-Farmer see the same farmer dashboard
    nfBanner.style.display      = 'none';
    farmerContent.style.display = 'block';
  }

  renderNotifications();
  if (u.isAdmin) {
    showFarmersLoading();   // show spinner while DB fetch runs
    loadFarmersFromDB();    // renders + updates stats when data arrives
    loadNonFarmersFromDB(); // also load non-farmers into cache
  }
  renderProfileActivity();
}

// ─── BAR CHART ────────────────────────────────────────────────
function renderBarChart() {
  const data   = [12,18,22,15,28,32,19,24,30,35,27,38];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const max    = Math.max(...data);
  const now    = new Date().getMonth();
  document.getElementById('barChart').innerHTML = data.map((v,i) => `
    <div class="bar ${i===now?'active':''}" style="height:${Math.round(v/max*90)}%">
      <span class="bar-val">₱${v}k</span>
    </div>`).join('');
  document.getElementById('barMonths').innerHTML = months.map(m => `<div class="bar-month">${m}</div>`).join('');
}

// ─── ACTIVITY ─────────────────────────────────────────────────
function renderActivity() {
  const acts = [
    { dot:'#52B788', title:'Harvest logged — Rice, 1.2T',      sub:'Purok 4 · Taboc',        time:'2h ago' },
    { dot:'#F4A261', title:'Market listing updated — Palay',    sub:'₱18/kg · 200 sacks',     time:'5h ago' },
    { dot:'#3B82F6', title:'DA seminar registered',             sub:'Seed subsidy program',    time:'Yesterday' },
    { dot:'#E9C46A', title:'Fertilizer application recorded',   sub:'Upper rice field',        time:'2 days ago' },
    { dot:'#EF4444', title:'Pest alert — Rice blast spotted',   sub:'Field 2 · Buenavista',   time:'3 days ago' },
  ];
  document.getElementById('activityList').innerHTML = acts.map(a => `
    <div class="act-item">
      <div class="act-dot" style="background:${a.dot}"></div>
      <div class="act-body"><div class="act-title">${a.title}</div><div class="act-sub">${a.sub}</div></div>
      <div class="act-time">${a.time}</div>
    </div>`).join('');
}

function renderProfileActivity() {
  const acts = [
    { dot:'#52B788', title:'Harvest logged — Rice, 1.2T',   sub:'Purok 4 · Taboc',    time:'2h ago' },
    { dot:'#F4A261', title:'Market listing updated — Palay', sub:'₱18/kg · 200 sacks', time:'5h ago' },
    { dot:'#3B82F6', title:'DA seminar registered',          sub:'Seed subsidy program',time:'Yesterday' },
  ];
  const el = document.getElementById('profileActivityList');
  if (el) el.innerHTML = acts.map(a => `
    <div class="act-item">
      <div class="act-dot" style="background:${a.dot}"></div>
      <div class="act-body"><div class="act-title">${a.title}</div><div class="act-sub">${a.sub}</div></div>
      <div class="act-time">${a.time}</div>
    </div>`).join('');
}

// ─── TASKS ────────────────────────────────────────────────────
function renderTasks() {
  const tasks = [
    { title:'Apply pesticide — Field 2',  date:'Today, 7:00 AM',    priority:'high', done:false },
    { title:'Submit DA subsidy form',      date:'Today, 3:00 PM',    priority:'high', done:false },
    { title:'Irrigate north field',        date:'Tomorrow, 6:00 AM', priority:'med',  done:false },
    { title:'Weeding — vegetable rows',   date:'Apr 12',            priority:'low',  done:true  },
    { title:'Check crop moisture levels', date:'Apr 13',            priority:'low',  done:true  },
  ];
  document.getElementById('taskList').innerHTML = tasks.map((t,i) => `
    <div class="task-item">
      <button class="task-check ${t.done?'done':''}" onclick="toggleTask(${i},this)">
        ${t.done?'<i class="fas fa-check"></i>':''}
      </button>
      <div class="task-body">
        <div class="task-title ${t.done?'done':''}">${t.title}</div>
        <div class="task-date">${t.date}</div>
      </div>
      <span class="task-badge ${t.priority}">${t.priority}</span>
    </div>`).join('');
}
function toggleTask(i, btn) {
  btn.classList.toggle('done');
  const title = btn.nextElementSibling.querySelector('.task-title');
  title.classList.toggle('done');
  btn.innerHTML = btn.classList.contains('done') ? '<i class="fas fa-check"></i>' : '';
  showToast(btn.classList.contains('done') ? '✅ Task completed!' : '↩️ Task reopened');
}

// ─── NOTIFICATIONS ────────────────────────────────────────────
function renderNotifications(filter='all') {
  const list  = document.getElementById('notifList');
  const shown = filter==='unread' ? notifications.filter(n=>n.unread) : notifications;
  if (!shown.length) {
    list.innerHTML = '<div style="padding:32px;text-align:center;color:var(--dust);font-size:13px">No notifications</div>';
    return;
  }
  list.innerHTML = shown.map(n => `
    <div class="notif-item ${n.unread?'unread':''}" onclick="readNotif(${n.id})">
      <div class="notif-icon-wrap" style="background:${n.iconBg}">${n.icon}</div>
      <div class="notif-body">
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>`).join('');
}
function filterNotif(type, btn) {
  document.querySelectorAll('.notif-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderNotifications(type);
}
function readNotif(id) {
  const n = notifications.find(x=>x.id===id);
  if (n) { n.unread = false; updateNotifBadge(); renderNotifications(); }
}
function markAllRead() {
  notifications.forEach(n=>n.unread=false);
  updateNotifBadge(); renderNotifications('all');
  showToast('✅ All notifications marked as read');
}
function updateNotifBadge() {
  const count = notifications.filter(n=>n.unread).length;
  const badge = document.getElementById('notifBadge');
  badge.textContent   = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ─── ADMIN FARMERS ────────────────────────────────────────────
const avatarColors = ['#52B788','#F4A261','#3B82F6','#E9C46A','#8B5CF6','#EC4899','#14B8A6'];

function renderFarmers() {
  const el = document.getElementById('farmerList');
  if (!el) return;   // not in admin view, skip safely
  const search = (document.getElementById('farmerSearch')?.value||'').toLowerCase();
  let list = farmers;
  if (currentFarmerFilter !== 'all') list = list.filter(f=>f.status===currentFarmerFilter);
  if (search) list = list.filter(f=>
    (f.firstname+' '+f.lastname).toLowerCase().includes(search) ||
    f.barangay.toLowerCase().includes(search) ||
    f.crop.toLowerCase().includes(search)
  );
  if (!list.length) {
    el.innerHTML = '<div style="padding:32px;text-align:center;color:var(--dust);font-size:13px">No farmers found</div>';
    return;
  }
  const statusMap = { pending:'⏳ Pending', verified:'✅ Verified', rejected:'❌ Rejected' };
  el.innerHTML = list.map(f => {
    const initials = (f.firstname[0]+f.lastname[0]).toUpperCase();
    const color    = avatarColors[f.id % avatarColors.length];
    const actions  = f.status === 'pending'
      ? `<button class="btn-verify approve" onclick="verifyFarmer(${f.id},'verified',event)"><i class="fas fa-check"></i> Approve</button>
         <button class="btn-verify reject"  onclick="verifyFarmer(${f.id},'rejected',event)"><i class="fas fa-times"></i> Reject</button>`
      : `<button class="btn-verify view" onclick="openFarmerModal(${f.id},event)"><i class="fas fa-eye"></i> View</button>`;
    return `
      <div class="farmer-row" onclick="openFarmerModal(${f.id})">
        <div class="farmer-av" style="background:${color}20;color:${color}">${initials}</div>
        <div class="farmer-info">
          <div class="farmer-name">${f.firstname} ${f.lastname}</div>
          <div class="farmer-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${f.barangay}</span>
            <span><i class="fas fa-leaf"></i> ${f.crop}</span>
            <span><i class="fas fa-ruler-combined"></i> ${f.area}</span>
          </div>
        </div>
        <span class="farmer-status ${f.status}">${statusMap[f.status]}</span>
        <div class="farmer-actions" onclick="event.stopPropagation()">${actions}</div>
      </div>`;
  }).join('');
}

function filterFarmers() { renderFarmers(); }

function setFarmerFilter(filter, btn) {
  currentFarmerFilter = filter;
  document.querySelectorAll('.vf-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderFarmers();
}

function updateAdminStats() {
  const statEl = document.getElementById('statTotalFarmers');
  if (!statEl) return;   // not in admin context, skip
  const total    = farmers.length;
  const pending  = farmers.filter(f=>f.status==='pending').length;
  const verified = farmers.filter(f=>f.status==='verified').length;
  const rejected = farmers.filter(f=>f.status==='rejected').length;
  const nfCount  = nonFarmers.length;
  document.getElementById('statTotalFarmers').textContent = total;
  document.getElementById('statPending').textContent      = pending;
  document.getElementById('statVerified').textContent     = verified;
  document.getElementById('statRejected').textContent     = rejected;
  document.getElementById('statNonFarmers').textContent   = nfCount;
  document.getElementById('cntAll').textContent      = total;
  document.getElementById('cntPending').textContent  = pending;
  document.getElementById('cntVerified').textContent = verified;
  document.getElementById('cntRejected').textContent = rejected;
  const badge = document.getElementById('adminBadge');
  badge.textContent   = pending;
  badge.style.display = pending > 0 ? 'flex' : 'none';
}

function removeAllAccounts() {
  if (!confirm('⚠️ Are you sure you want to remove ALL farmer accounts? This cannot be undone.')) return;
  farmers.length = 0;
  users.splice(1);
  nonFarmers.length = 0;
  renderFarmers(); updateAdminStats();
  showToast('🗑️ All accounts have been removed.');
}

// ─── LOAD FARMERS FROM DB (admin) ────────────────────────────
// ─── CACHE HELPERS ───────────────────────────────────────────
const CACHE_KEY_FARMERS    = 'roots_cached_farmers';
const CACHE_KEY_NONFARMERS = 'roots_cached_nonfarmers';

function saveFarmersCache(data)    { try { localStorage.setItem(CACHE_KEY_FARMERS,    JSON.stringify(data)); } catch(e){} }
function saveNonFarmersCache(data) { try { localStorage.setItem(CACHE_KEY_NONFARMERS, JSON.stringify(data)); } catch(e){} }

function loadFarmersCache() {
  try { const d = localStorage.getItem(CACHE_KEY_FARMERS);    return d ? JSON.parse(d) : null; } catch(e){ return null; }
}
function loadNonFarmersCache() {
  try { const d = localStorage.getItem(CACHE_KEY_NONFARMERS); return d ? JSON.parse(d) : null; } catch(e){ return null; }
}

function showFarmersLoading() {
  const el = document.getElementById('farmerList');
  if (el) el.innerHTML = '<div style="padding:32px;text-align:center;color:var(--dust);font-size:13px"><i class="fas fa-spinner fa-spin"></i> Loading farmers…</div>';
}

async function loadFarmersFromDB() {
  // ── Step 1: Restore from cache instantly so the list is never blank ──
  const cached = loadFarmersCache();
  if (cached && cached.length) {
    farmers = cached;
    renderFarmers();
    updateAdminStats();
  }

  // ── Step 2: Fetch fresh data from DB in the background ──
  try {
    const res  = await fetch(`${API_URL}?action=farmers`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + (currentUser && currentUser.token) }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      if (!cached || !cached.length) { renderFarmers(); updateAdminStats(); }
      return;
    }

    farmers = json.data.map((f, i) => ({
      id:         i + 1,
      db_id:      f.user_id,
      firstname:  f.firstname,
      lastname:   f.lastname,
      phone:      f.phone,
      barangay:   f.barangay   || '—',
      crop:       (f.crop || '').trim() || '—',
      area:       f.farm_area_ha ? f.farm_area_ha + ' ha' : 'N/A',
      registered: f.created_at  ? f.created_at.split('T')[0] : '—',
      status:     f.status,
      notes:      f.rejection_note || (f.verified_at ? 'Verified on ' + f.verified_at.split('T')[0] : 'Pending verification.'),
      idType:     f.id_type     || '—',
      idFilePath: f.id_file_path || null,
    }));

    saveFarmersCache(farmers);   // save fresh data to cache
    renderFarmers();
    updateAdminStats();
  } catch (err) {
    console.warn('Could not load farmers from DB.', err);
    if (!cached || !cached.length) {
      const el = document.getElementById('farmerList');
      if (el) el.innerHTML = `
        <div style="padding:32px;text-align:center;color:var(--dust);font-size:13px">
          <i class="fas fa-exclamation-triangle" style="color:#F4A261;margin-bottom:8px;font-size:20px;display:block"></i>
          Could not load farmers. Check your connection.
          <br><br>
          <button onclick="loadFarmersFromDB()" style="padding:6px 16px;background:var(--green);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>`;
    }
    updateAdminStats();
  }
}

async function loadNonFarmersFromDB() {
  // ── Step 1: Restore from cache instantly ──
  const cached = loadNonFarmersCache();
  if (cached && cached.length) {
    nonFarmers = cached;
  }

  // ── Step 2: Fetch fresh data from DB ──
  try {
    const res  = await fetch(`${API_URL}?action=nonfarmers`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + (currentUser && currentUser.token) }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return;

    nonFarmers = json.data.map((u, i) => ({
      id:         i + 1,
      db_id:      u.user_id,
      firstname:  u.firstname,
      lastname:   u.lastname,
      phone:      u.phone,
      city:       u.city       || '—',
      barangay:   u.barangay   || '—',
      email:      u.email      || '—',
      registered: u.created_at ? u.created_at.split('T')[0] : '—',
    }));

    saveNonFarmersCache(nonFarmers);   // save to cache
    updateAdminStats();
  } catch (err) {
    console.warn('Could not load non-farmers from DB.', err);
  }
}


async function verifyFarmer(id, newStatus, event, rejectionNote) {
  if (event) event.stopPropagation();
  const f = farmers.find(x=>x.id===id);
  if (!f) return;

  if (!f.db_id) {
    showToast('⚠️ Cannot update: farmer has no database ID.');
    return;
  }
  if (!currentUser || !currentUser.token) {
    showToast('⚠️ Not authenticated. Please log in again.');
    return;
  }

  showToast('⏳ Updating status…');
  try {
    const res = await fetch(`${API_URL}?action=verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + currentUser.token
      },
      body: JSON.stringify({
        user_id:        f.db_id,
        action:         newStatus,
        rejection_note: rejectionNote || (newStatus === 'rejected' ? 'Rejected by admin via dashboard.' : null)
      })
    });
    const json = await res.json();
    if (!json.success) {
      showToast('❌ Server error: ' + (json.error || 'Could not update status.'));
      return;
    }
  } catch (err) {
    showToast('❌ Network error — status was NOT saved. Check your connection.');
    return;
  }

  // Only update local state after confirmed DB success
  f.status = newStatus;
  showToast(newStatus==='verified'
    ? `✅ ${f.firstname} ${f.lastname} has been verified!`
    : `❌ ${f.firstname} ${f.lastname} has been rejected.`);
  if (currentUser && currentUser.isAdmin) {
    // Reset to 'all' so the farmer stays visible under their new status
    currentFarmerFilter = 'all';
    document.querySelectorAll('.vf-tab').forEach(t => t.classList.remove('active'));
    const allTab = document.querySelector('.vf-tab[data-filter="all"]');
    if (allTab) allTab.classList.add('active');
    renderFarmers();
    updateAdminStats();
  }
  notifications.unshift({
    id: Date.now(),
    icon: newStatus==='verified' ? '✅' : '❌',
    iconBg: newStatus==='verified' ? 'rgba(82,183,136,.12)' : 'rgba(220,38,38,.1)',
    text: `<strong>${f.firstname} ${f.lastname}</strong> has been ${newStatus}`,
    time: 'Just now', unread: false, type: 'verify'
  });
  updateNotifBadge();
}

function openFarmerModal(id, event) {
  if (event) event.stopPropagation();
  const f = farmers.find(x=>x.id===id);
  if (!f) return;
  selectedFarmerId = id;
  const initials  = (f.firstname[0]+f.lastname[0]).toUpperCase();
  const color     = avatarColors[f.id % avatarColors.length];
  const statusMap = { pending:'⏳ Pending Verification', verified:'✅ Verified', rejected:'❌ Rejected' };
  document.getElementById('modalAv').textContent       = initials;
  document.getElementById('modalAv').style.background  = color+'20';
  document.getElementById('modalAv').style.color       = color;
  document.getElementById('modalName').textContent     = f.firstname+' '+f.lastname;
  document.getElementById('modalSub').textContent      = f.barangay+' · '+f.crop;
  document.getElementById('modalPhone').textContent    = '+63 '+f.phone;
  document.getElementById('modalStatus').textContent   = statusMap[f.status];
  document.getElementById('modalBarangay').textContent = f.barangay;
  document.getElementById('modalCrop').textContent     = f.crop;
  document.getElementById('modalArea').textContent     = f.area;
  document.getElementById('modalDate').textContent     = f.registered;
  document.getElementById('modalNotes').textContent    = '📝 '+f.notes;
  document.getElementById('modalIdType').textContent   = f.idType ? '🪪 ' + f.idType : '— Not provided';

  // ── ID image viewer ──────────────────────────────────────────
  const idSection = document.getElementById('modalIdImageSection');
  if (idSection) {
    if (f.idFilePath) {
      const token  = (currentUser && currentUser.token) ? encodeURIComponent(currentUser.token) : '';
      const imgUrl = `${API_URL}?action=id_image&file=${encodeURIComponent(f.idFilePath)}&token=${token}`;
      const isPdf  = f.idFilePath.toLowerCase().endsWith('.pdf');
      idSection.innerHTML = isPdf
        ? `<div class="modal-id-label">📄 Uploaded ID Document</div>
           <a href="${imgUrl}" target="_blank" class="modal-id-pdf-link">
             <i class="fas fa-file-pdf"></i> View PDF — ${f.idType || 'ID Document'}
           </a>`
        : `<div class="modal-id-label">🪪 Uploaded ID Photo</div>
           <a href="${imgUrl}" target="_blank" title="Click to open full size">
             <img src="${imgUrl}" alt="Farmer ID" class="modal-id-img"
                  onerror="this.parentElement.parentElement.innerHTML='<div class=&quot;modal-id-missing&quot;>⚠️ ID image could not be loaded. The file may be missing on the server.</div>'">
           </a>`;
    } else {
      idSection.innerHTML = '<div class="modal-id-missing">📭 No ID file uploaded for this farmer.</div>';
    }
  }

  const actionsEl = document.getElementById('modalActions');
  if (f.status === 'pending') {
    actionsEl.innerHTML = `
      <button class="btn-modal-action reject"  onclick="verifyFarmerFromModal('rejected')"><i class="fas fa-times-circle"></i> Reject</button>
      <button class="btn-modal-action approve" onclick="verifyFarmerFromModal('verified')"><i class="fas fa-check-circle"></i> Approve & Verify</button>`;
  } else if (f.status === 'verified') {
    actionsEl.innerHTML = `
      <button class="btn-modal-action reject"  onclick="verifyFarmerFromModal('rejected')"><i class="fas fa-ban"></i> Revoke Verification</button>
      <button class="btn-modal-action approve" style="cursor:default;opacity:.5"><i class="fas fa-check-circle"></i> Already Verified</button>`;
  } else {
    actionsEl.innerHTML = `
      <button class="btn-modal-action approve" onclick="verifyFarmerFromModal('verified')"><i class="fas fa-redo"></i> Re-approve</button>
      <button class="btn-modal-action reject"  style="cursor:default;opacity:.5"><i class="fas fa-times-circle"></i> Already Rejected</button>`;
  }
  document.getElementById('farmerModal').classList.add('open');
}

async function verifyFarmerFromModal(status) {
  let rejectionNote = null;
  if (status === 'rejected') {
    rejectionNote = prompt('Enter rejection reason (optional):') || 'Rejected by admin.';
  }
  await verifyFarmer(selectedFarmerId, status, null, rejectionNote);
  // Refresh modal status display after confirmed change
  const f = farmers.find(x=>x.id===selectedFarmerId);
  if (f) openFarmerModal(selectedFarmerId);
  else   closeModal(true);
}
function closeModal(force) {
  if (force === true) document.getElementById('farmerModal').classList.remove('open');
}
document.getElementById('farmerModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal(true);
});

// ─── PROFILE TABS ─────────────────────────────────────────────
function switchProfileTab(tab, btn) {
  document.querySelectorAll('.profile-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.profile-tab-content').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  const map = { about:'ptabAbout', farm:'ptabFarm', activity:'ptabActivity' };
  const el = document.getElementById(map[tab]);
  if (el) el.classList.add('active');
}

// ─── VIEW PROFILE HELPER ─────────────────────────────────────
function viewProfile() {
  if (currentUser && currentUser.isNonFarmer) nfNavSwitch('nfprofile');
  else navSwitch('profile');
}

// ─── LOGOUT ───────────────────────────────────────────────────
function doLogout() {
  currentUser = null;
  sessionStorage.removeItem('rootsUser');
  sessionStorage.removeItem('roots_cached_farmers');
  sessionStorage.removeItem('roots_cached_nonfarmers');
  showToast('👋 Logged out successfully');
  setTimeout(() => window.location.href = 'Index.html', 700);
}

// ─── TOAST ────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.style.display = 'none', 2800);
}

// ─── BOOT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Pre-load barangays so the dropdown is ready if the user opens the register tab
  loadBarangays();

  // Restore session after page refresh
  const saved = sessionStorage.getItem('rootsUser');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      window.location.href = '../community/views/roots-feed.html';   // redirect to community interface
    } catch (e) {
      sessionStorage.removeItem('rootsUser');
      updateNotifBadge();
    }
  } else {
    updateNotifBadge();
  }
});