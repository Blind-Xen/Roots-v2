// ===== ROOTS SETTINGS SCRIPT =====

let selectedLanguage = 'en';

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  loadLanguagePreference();
  loadNotificationPreferences();
});

// ── Panel navigation ──────────────────────────────────
function goTo(panelId, navEl) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  navEl.classList.add('active');

  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + panelId).classList.add('active');

  hideToast();
}

// ── Toast ─────────────────────────────────────────────
let toastTimer;

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');

  toast.className = `toast ${type} show`;
  msg.textContent = message;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 4000);
}

function hideToast() {
  document.getElementById('toast').classList.remove('show');
}

// ── Profile ───────────────────────────────────────────
function loadUserProfile() {
  const data = getUserData();

  document.getElementById('firstName').value = data.firstName || '';
  document.getElementById('lastName').value = data.lastName || '';
  document.getElementById('email').value = data.email || '';
  document.getElementById('phone').value = data.phone || '';
  document.getElementById('bio').value = data.bio || '';

  syncAvatar();
  updateBioCount();
}

function saveProfile() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const bio = document.getElementById('bio').value.trim();

  if (!firstName || !lastName) {
    showToast('Please enter your first and last name.', 'error');
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  if (bio.length > 500) {
    showToast('Bio must be 500 characters or less.', 'error');
    return;
  }

  const data = getUserData();
  Object.assign(data, { firstName, lastName, email, phone, bio });
  setUserData(data);

  showToast('Profile updated successfully.');
}

function resetProfile() {
  loadUserProfile();
  showToast('Profile reset to saved values.');
}

// ── Avatar ────────────────────────────────────────────
function syncAvatar() {
  const fn = (document.getElementById('firstName').value[0] || '').toUpperCase();
  const ln = (document.getElementById('lastName').value[0] || '').toUpperCase();
  const el = document.getElementById('avatarEl');

  // Only update initials text node (first child), preserve the badge and input
  if (el.childNodes[0].nodeType === Node.TEXT_NODE) {
    el.childNodes[0].textContent = fn + ln;
  }
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file.', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be less than 5MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const el = document.getElementById('avatarEl');
    el.style.backgroundImage = `url(${e.target.result})`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    if (el.childNodes[0].nodeType === Node.TEXT_NODE) {
      el.childNodes[0].textContent = '';
    }

    const data = getUserData();
    data.avatarUrl = e.target.result;
    setUserData(data);

    showToast('Profile photo updated.');
  };
  reader.readAsDataURL(file);
}

// ── Bio counter ───────────────────────────────────────
function updateBioCount() {
  const len = document.getElementById('bio').value.length;
  const el = document.getElementById('bioCount');
  el.textContent = `${len} / 500 characters`;
  el.style.color = len > 500 ? 'var(--danger)' : 'var(--dust)';
}

// ── Phone formatter ───────────────────────────────────
function formatPH(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.startsWith('0')) v = v.slice(1);
  if (v.length > 10) v = v.slice(0, 10);

  let out = '';
  if (v.length > 0) out = v.slice(0, 3);
  if (v.length > 3) out += ' ' + v.slice(3, 6);
  if (v.length > 6) out += ' ' + v.slice(6, 10);

  el.value = out;
}

// ── Password ──────────────────────────────────────────
function checkStrength() {
  const pw = document.getElementById('newPassword').value;
  const bar = document.getElementById('strengthBar');
  const label = document.getElementById('strengthLabel');

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    ['0%', '', ''],
    ['25%', '#E24B4A', 'Weak'],
    ['50%', '#EF9F27', 'Fair'],
    ['75%', '#3B6D11', 'Good'],
    ['100%', '#0f3d22', 'Strong'],
  ];

  bar.style.width = levels[score][0];
  bar.style.background = levels[score][1];
  label.textContent = levels[score][2];
}

function changePassword() {
  const current = document.getElementById('currentPassword').value;
  const next = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (!current) {
    showToast('Please enter your current password.', 'error');
    return;
  }

  if (next.length < 8) {
    showToast('New password must be at least 8 characters.', 'error');
    return;
  }

  if (next !== confirm) {
    showToast('Passwords do not match.', 'error');
    return;
  }

  if (current === next) {
    showToast('New password must differ from current password.', 'error');
    return;
  }

  // TODO: call backend API to update password
  clearPassword();
  showToast('Password updated successfully.');
}

function clearPassword() {
  ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('strengthBar').style.width = '0';
  document.getElementById('strengthLabel').textContent = '';
}

// ── Language ──────────────────────────────────────────
function loadLanguagePreference() {
  selectedLanguage = localStorage.getItem('rootsLanguage') || 'en';
  document.querySelectorAll('.lang-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === selectedLanguage);
  });
}

function selectLang(el, code) {
  if (el.querySelector('.lang-soon')) {
    showToast('This language is coming soon!', 'error');
    return;
  }
  selectedLanguage = code;
  document.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
}

function saveLanguage() {
  localStorage.setItem('rootsLanguage', selectedLanguage);
  showToast('Language preference saved.');
}

// ── Notifications ─────────────────────────────────────
function loadNotificationPreferences() {
  const prefs = JSON.parse(localStorage.getItem('rootsNotifPrefs')) || {};

  const defaults = {
    'notif-activity': true,
    'notif-digest': true,
    'notif-announce': false,
    'notif-security': true,
    'notif-push': true,
    'notif-sound': false,
  };

  Object.entries(defaults).forEach(([id, def]) => {
    const el = document.getElementById(id);
    if (el) el.checked = id in prefs ? prefs[id] : def;
  });
}

function saveNotifications() {
  const ids = ['notif-activity', 'notif-digest', 'notif-announce', 'notif-security', 'notif-push', 'notif-sound'];
  const prefs = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) prefs[id] = el.checked;
  });
  localStorage.setItem('rootsNotifPrefs', JSON.stringify(prefs));
  showToast('Notification preferences saved.');
}

// ── Danger zone ───────────────────────────────────────
function exportData() {
  // TODO: trigger backend export job
  showToast('Export started — you will receive an email shortly.');
}

function deactivateAccount() {
  // TODO: call backend deactivation endpoint
  showToast('Account deactivated. You have been logged out.');
}

function showDeleteModal() {
  document.getElementById('deleteModal').classList.add('show');
}

function hideDeleteModal() {
  document.getElementById('deleteModal').classList.remove('show');
}

function confirmDelete() {
  hideDeleteModal();
  // TODO: call backend delete endpoint, then redirect
  showToast('Account deletion requested. You will receive a confirmation email.');
}

// ── localStorage helpers ──────────────────────────────
function getUserData() {
  return JSON.parse(localStorage.getItem('rootsUserData')) || {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '',
    bio: '',
  };
}

function setUserData(data) {
  localStorage.setItem('rootsUserData', JSON.stringify(data));
}