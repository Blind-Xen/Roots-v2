// Roots Livestock — submit listing
// ===== SECTION: SUBMIT LISTING (Add or Edit) =====
// ======================================================================
async function submitListing() {
  const animalType       = document.getElementById('animalType').value;
  const customAnimalName = document.getElementById('customAnimalName').value.trim();
  const title            = document.getElementById('listingTitle').value.trim();
  const count            = parseInt(document.getElementById('animalCount').value) || 1;
  const countUnit        = document.getElementById('animalCountUnit').value;
  const weight           = parseFloat(document.getElementById('animalWeight').value) || 0;
  const ageNum           = document.getElementById('animalAgeNum').value.trim();
  const ageUnit          = document.getElementById('animalAgeUnit').value;
  const ageNum2          = document.getElementById('animalAgeNum2').value.trim();
  const ageUnit2         = document.getElementById('animalAgeUnit2').value;
  const ageUnitLabel = { days: 'day/s', months: 'month/s', years: 'year/s' };
  const labelFor = (u) => ageUnitLabel[u] || u;
  // Build compound age like "7 month/s 8 day/s" or just "7 month/s"
  let age = '';
  if (ageNum && parseInt(ageNum) > 0) {
    age = `${ageNum} ${labelFor(ageUnit)}`;
    if (ageNum2 && parseInt(ageNum2) > 0) age += ` ${ageNum2} ${labelFor(ageUnit2)}`;
  } else if (ageNum2 && parseInt(ageNum2) > 0) {
    age = `${ageNum2} ${labelFor(ageUnit2)}`;
  }
  const price            = parseFloat(document.getElementById('listingPrice').value) || 0;
  const listType         = document.getElementById('listingType').value;
  const vaccStat         = document.getElementById('vaccineStatus').value;
  const locationBarangay = document.getElementById('listingLocation').value.trim();
  const locationPurok    = document.getElementById('listingPurok').value.trim();
  const locationLandmark = document.getElementById('listingLandmark').value.trim();
  const notes            = document.getElementById('listingNotes').value.trim();
  const breed            = document.getElementById('animalBreed').value.trim();

  // Validation
  if (!animalType)       { showToast('⚠️ Please select an animal type'); return; }
  if (animalType === 'other' && !customAnimalName) { showToast('⚠️ Please enter the animal name'); return; }
  if (!title)            { showToast('⚠️ Please enter a listing title'); return; }
  if (price === 0 && listType !== 'trade') { showToast('⚠️ Please enter a price (or switch to For Trade)'); return; }
  if (!locationBarangay) { showToast('⚠️ Please select a barangay'); return; }
  if (selectedPhotos.length === 0 && editingId === null) { showToast('📸 Please upload at least one photo for your listing'); return; }
  if (selectedPhotos.length === 0 && editingId !== null) {
    const existing = listings.find(l => l.id === editingId);
    if (!existing || !existing.photos || existing.photos.length === 0) {
      showToast('📸 Please upload at least one photo for your listing'); return;
    }
  }

  const emojiMap = { cattle: '🐄', hog: '🐖', goat: '🐐', poultry: '🐓', carabao: '🦬', other: '🐇' };
  let locationStr = `Brgy. ${locationBarangay}`;
  if (locationPurok)    locationStr += `, ${locationPurok}`;
  if (locationLandmark) locationStr += ` (near ${locationLandmark})`;
  locationStr += ', Oroquieta';

  const localPhotoUrls = selectedPhotos.map(photo => photo.previewUrl).filter(Boolean);
  // Convert fresh uploads to data URLs so photos persist after modal closes/reloads.
  const photoUrls = await resolveSelectedPhotoUrls();
  const finalPhotoUrls = photoUrls.length > 0 ? photoUrls : localPhotoUrls;

  if (editingId !== null) {
    // ── EDIT MODE ──
    const idx = listings.findIndex(l => l.id === editingId);
    if (idx === -1) { showToast('⚠️ Listing not found'); return; }
    const originalListing = { ...listings[idx] };

    listings[idx] = {
      ...listings[idx],
      type:             animalType,
      customAnimalName: animalType === 'other' ? customAnimalName : '',
      emoji:            emojiMap[animalType] || '🐾',
      title, breed: breed || 'Native', count, countUnit, weight,
      age:              age || 'Not specified',
      price,
      priceNegotiable:  true,
      listingType:      listType,
      vaccineStatus:    vaccStat,
      location:         locationStr,
      locationBarangay,
      locationPurok,
      locationLandmark,
      notes,
      photos:           photoUrls.length > 0 ? photoUrls : (listings[idx].photos || localPhotoUrls),
    };

    // ── Always auto-save to localStorage immediately ──
    saveToStorage();

    const photosToUpload = selectedPhotos.slice();
    closeAddListingModal();
    renderListings();
    renderProfileStats();
    showToast('✅ Listing updated and saved!');

    // ── Try to sync with backend silently in the background ──
    if (USE_API) {
      apiUpdateListing(editingId, listings[idx], photosToUpload)
        .then((result) => {
          if (result && Array.isArray(result.uploadedPhotoUrls) && result.uploadedPhotoUrls.length > 0) {
            listings[idx].photos = result.uploadedPhotoUrls;
            saveToStorage();
            renderListings();
          }
          return syncListingsFromApi().catch((e) => {
            console.warn('[Roots] Background API update failed (changes kept locally):', e);
            showToast('⚠️ Update saved locally but failed to sync to server.');
          });
        })
        .catch((e) => {
          console.warn('[Roots] Background API update failed (changes kept locally):', e);
          showToast('⚠️ Update saved locally but failed to sync to server.');
        });
    }
  } else {
    // ── ADD MODE ──
    const newListing = {
      id:               Date.now(),
      type:             animalType,
      customAnimalName: animalType === 'other' ? customAnimalName : '',
      emoji:            emojiMap[animalType] || '🐾',
      title,
      breed:            breed || 'Native',
      count, countUnit, weight,
      age:              age || 'Not specified',
      price,
      priceNegotiable:  true,
      listingType:      listType,
      vaccineStatus:    vaccStat,
      location:         locationStr,
      locationBarangay,
      locationPurok,
      locationLandmark,
      notes,
      seller:           'Kuya Mario Santos',
      sellerEmoji:      '👨‍🌾',
      sellerRating:     4.9,
      daVerified:       true,
      isMine:           true,
      photos:           finalPhotoUrls,
      postedDaysAgo:    0,
      status:           'active'
    };

    listings.unshift(newListing);

    // ── Always auto-save to localStorage immediately ──
    saveToStorage();

    // ── Notify admin activity & bell right away ──
    logAdminActivity('green',
      `New listing posted: <strong>${title}</strong>`,
      `Just now • ${newListing.seller}`);

    addNotification('✅',
      `Your listing "${title}" is now live! Buyers in Oroquieta can see it.`);

    const photosToUpload = selectedPhotos.slice();
    closeAddListingModal();
    renderListings();
    renderProfileStats();
    showToast('✅ Listing posted and saved! Buyers can now see your animal.');

    // ── Try to sync with backend silently in the background ──
    if (USE_API) {
      apiCreateListing(newListing, photosToUpload)
        .then((result) => {
          if (result && result.id) {
            const tempIndex = listings.findIndex(l => l.id === newListing.id);
            if (tempIndex !== -1) {
              listings[tempIndex].id = result.id;
              if (Array.isArray(result.photoUrls) && result.photoUrls.length > 0) {
                listings[tempIndex].photos = result.photoUrls;
              }
              saveToStorage();
            }
          }
          return syncListingsFromApi().catch((e) => {
            console.warn('[Roots] Background API sync failed after create:', e);
            showToast('⚠️ Listing saved locally but failed to sync with server.');
          });
        })
        .catch((e) => {
          console.warn('[Roots] Background API sync failed (listing kept locally):', e);
          showToast('⚠️ Listing saved locally but failed to sync with server.');
        });
    }
  }
}

// ======================================================================
