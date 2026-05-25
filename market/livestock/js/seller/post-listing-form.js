// Roots Livestock — listing form UI
// ===== SECTION: QUANTITY STEPPER =====
// ======================================================================
function stepQty(delta) {
  const input = document.getElementById('animalCount');
  const current = parseInt(input.value) || 1;
  const next = Math.max(1, current + delta);
  input.value = next;
}

function clampQty() {
  const input = document.getElementById('animalCount');
  const val = parseInt(input.value);
  if (isNaN(val) || val < 1) input.value = 1;
}

// ======================================================================
// ===== SECTION: ANIMAL TYPE → CUSTOM NAME =====
// ======================================================================
function onAnimalTypeChange() {
  const type  = document.getElementById('animalType').value;
  const group = document.getElementById('customAnimalGroup');
  if (type === 'other') {
    group.classList.remove('hidden');
  } else {
    group.classList.add('hidden');
    document.getElementById('customAnimalName').value = '';
  }
}

// ======================================================================
// ===== SECTION: ADD / EDIT LISTING MODAL =====
// ======================================================================
function openAddListingModal(listingId = null) {
  editingId = listingId;
  const modal = document.getElementById('addListingModal');
  const title = document.getElementById('listingModalTitle');
  const btn   = document.getElementById('submitListingBtn');

  // Reset form
  resetListingForm();

  if (listingId !== null) {
    // EDIT MODE — populate fields
    const l = listings.find(l => l.id === listingId);
    if (!l || !l.isMine) { showToast('⚠️ You can only edit your own listings'); return; }

    title.innerHTML = `<i class="fas fa-edit" style="color:var(--forest)"></i> Edit Listing <span class="edit-mode-badge"><i class="fas fa-pencil-alt"></i> Editing</span>`;
    btn.innerHTML   = `<i class="fas fa-save"></i> Save Changes`;

    document.getElementById('animalType').value      = l.type;
    document.getElementById('animalBreed').value     = l.breed || '';
    document.getElementById('listingTitle').value    = l.title;
    document.getElementById('animalCount').value     = l.count;
    if (l.countUnit) document.getElementById('animalCountUnit').value = l.countUnit;
    document.getElementById('animalWeight').value    = l.weight;

    // Parse stored age string back into number + unit (supports "7 months 8 days")
    const ageStr = l.age || '';
    const primaryMatch = ageStr.match(/(\d+)\s*(year\/s|years?|month\/s|months?|day\/s|days?)/i);
    const secondaryMatch = ageStr.match(/(\d+)\s*(year\/s|years?|month\/s|months?|day\/s|days?)/gi);
    if (primaryMatch) {
      document.getElementById('animalAgeNum').value  = primaryMatch[1];
      const unitMap = {
        day: 'days', days: 'days', 'day/s': 'days',
        month: 'months', months: 'months', 'month/s': 'months',
        year: 'years', years: 'years', 'year/s': 'years'
      };
      document.getElementById('animalAgeUnit').value = unitMap[primaryMatch[2].toLowerCase()] || 'months';
    }
    // Second part (e.g. "8 day/s" in "7 month/s 8 day/s")
    if (secondaryMatch && secondaryMatch.length > 1) {
      const sec = secondaryMatch[1].match(/(\d+)\s*(year\/s|years?|month\/s|months?|day\/s|days?)/i);
      if (sec) {
        document.getElementById('animalAgeNum2').value = sec[1];
        const unitMap2 = {
          day: 'days', days: 'days', 'day/s': 'days',
          month: 'months', months: 'months', 'month/s': 'months'
        };
        document.getElementById('animalAgeUnit2').value = unitMap2[sec[2].toLowerCase()] || 'days';
      }
    } else {
      document.getElementById('animalAgeNum2').value = '';
    }

    document.getElementById('listingPrice').value    = l.price;
    document.getElementById('listingType').value     = l.listingType;
    document.getElementById('vaccineStatus').value   = l.vaccineStatus;
    document.getElementById('listingLocation').value = l.locationBarangay || '';
    document.getElementById('listingPurok').value    = l.locationPurok || '';
    document.getElementById('listingLandmark').value = l.locationLandmark || '';
    document.getElementById('listingNotes').value    = l.notes || '';
    document.getElementById('editingListingId').value = listingId;

    if (l.type === 'other') {
      document.getElementById('customAnimalGroup').classList.remove('hidden');
      document.getElementById('customAnimalName').value = l.customAnimalName || '';
    }

    // Preload existing photos so edit mode can reorder/remove/set cover.
    selectedPhotos = (l.photos || []).map((url) => ({
      file: null,
      previewUrl: url
    }));
    renderPhotoPreview();
  } else {
    title.innerHTML = `<i class="fas fa-plus-circle listing-form-icon"></i> Post Animal Listing`;
    btn.innerHTML   = `<i class="fas fa-check-circle"></i> Post Listing`;
    document.getElementById('editingListingId').value = '';
  }

  modal.classList.remove('hidden');
}

function closeAddListingModal() {
  document.getElementById('addListingModal').classList.add('hidden');
  resetListingForm();
  clearPhotoPreviews();
  editingId = null;
}

function resetListingForm() {
  const ids = ['animalType','animalBreed','listingTitle','animalAgeNum','animalAgeNum2','listingLocation',
                'listingPurok','listingLandmark','listingNotes','customAnimalName','editingListingId'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const count = document.getElementById('animalCount'); if (count) count.value = 1;
  const countUnit = document.getElementById('animalCountUnit'); if (countUnit) countUnit.value = 'head';
  const ageUnit = document.getElementById('animalAgeUnit'); if (ageUnit) ageUnit.value = 'months';
  const ageUnit2 = document.getElementById('animalAgeUnit2'); if (ageUnit2) ageUnit2.value = 'days';
  const weight= document.getElementById('animalWeight'); if (weight) weight.value = '';
  const price = document.getElementById('listingPrice'); if (price) price.value = '';
  document.getElementById('customAnimalGroup').classList.add('hidden');
}

// ======================================================================
