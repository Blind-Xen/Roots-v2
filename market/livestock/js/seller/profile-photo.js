// Roots Livestock — seller profile photo (farmer in UI)
// ===== SECTION: FARMER PROFILE PHOTO =====
// ======================================================================
let farmerProfilePhotoUrl = null; // data URL for the farmer's uploaded profile photo

function handleProfilePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('⚠️ Only image files allowed'); return; }
  if (file.size > 15 * 1024 * 1024)   { showToast('⚠️ File too large (max 15MB)'); return; }

  const reader = new FileReader();
  reader.onload = function(e) {
    farmerProfilePhotoUrl = e.target.result;
    applyFarmerProfilePhoto(farmerProfilePhotoUrl);
    showToast('📸 Profile photo updated!');
    // Persist to localStorage so it survives refresh
    try { localStorage.setItem('roots_farmer_profile_photo', farmerProfilePhotoUrl); } catch(err) {}
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function applyFarmerProfilePhoto(url) {
  if (!url) return;

  // Header avatar
  const headerImg   = document.getElementById('headerAvatarImg');
  const headerEmoji = document.getElementById('headerAvatarEmoji');
  if (headerImg && headerEmoji) {
    headerImg.src = url;
    headerImg.classList.remove('hidden');
    headerEmoji.classList.add('hidden');
  }

  // Profile dropdown avatar
  const profImg   = document.getElementById('profileAvatarImg');
  const profEmoji = document.getElementById('profileAvatarEmoji');
  if (profImg && profEmoji) {
    profImg.src = url;
    profImg.classList.remove('hidden');
    profEmoji.classList.add('hidden');
  }

  // Update the seller avatar shown on the farmer's own listing cards
  // (only affects cards rendered after the photo is set — re-render does this)
  farmerProfilePhotoUrl = url;
}

function loadSavedProfilePhoto() {
  try {
    const saved = localStorage.getItem('roots_farmer_profile_photo');
    if (saved) applyFarmerProfilePhoto(saved);
  } catch(e) {}
}

// ======================================================================
