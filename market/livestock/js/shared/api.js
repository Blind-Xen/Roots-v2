// Roots Livestock — API
// ===== SECTION: API HELPERS (when USE_API = true) =====
// ======================================================================
function mapApiListing(row) {
  // `livestock-api.php` returns DB column names:
  // animal_count, weight_kg, age_description, is_negotiable, etc.
  let photos = [];
  if (row.photo_urls) {
    photos = Array.isArray(row.photo_urls)
      ? row.photo_urls
      : (typeof row.photo_urls === 'string' ? row.photo_urls.split('||') : []);
    photos = photos.filter(Boolean);
  }

  return {
    id:               row.id,
    type:             row.animal_type,
    customAnimalName: row.custom_animal_name || '',
    emoji:            ({ cattle:'🐄', hog:'🐖', goat:'🐐', poultry:'🐓', carabao:'🦬', other:'🐇' })[row.animal_type] || '🐾',
    title:            row.title,
    breed:            row.breed,
    count:            row.animal_count ?? row.count ?? 1,
    countUnit:        row.count_unit || row.countUnit || 'head',
    weight:           row.weight_kg ?? row.weight ?? 0,
    age:              row.age_description ?? row.age ?? '',
    price:            row.price,
    priceNegotiable:  row.is_negotiable ?? row.price_negotiable ?? false,
    listingType:      row.listing_type,
    vaccineStatus:    row.vaccine_status,
    location:         `Brgy. ${row.location_barangay}, Oroquieta`,
    locationBarangay: row.location_barangay,
    locationPurok:    row.location_purok || '',
    locationLandmark: row.location_landmark || '',
    notes:            row.notes,
    seller:           row.seller_name,
    sellerEmoji:      row.seller_emoji,
    sellerRating:     Number(row.seller_rating ?? 0),
    daVerified:       Boolean(row.da_verified),
    isMine:           Boolean(row.is_mine),
    photos,
    postedDaysAgo:    Math.floor((Date.now() - new Date(row.created_at)) / 86400000),
    status:           row.status
  };
}

async function syncProfileStatsFromApi() {
  if (!USE_API) return;
  try {
    const res = await fetch(`${API_BASE}?action=profile_stats&user_id=1`);
    if (!res.ok) throw new Error(`Failed to load profile stats (${res.status})`);
    const data = await res.json();
    if (!data || typeof data !== 'object') return;
    if (!data.stats || typeof data.stats !== 'object') return;
    profileStatsCache = data.stats;
    renderProfileStats();
  } catch (e) {
    // silently ignore; UI will fallback to local computation
    console.warn('[Roots] Profile stats API unavailable — using local stats:', e.message);
  }
}

async function syncListingsFromApi() {
  if (!USE_API) return;
  try {
    const res = await fetch(`${API_BASE}?action=listings&user_id=1`);
    if (!res.ok) throw new Error(`Failed to sync listings (${res.status})`);
    const data = await res.json();
    if (!data.listings || !Array.isArray(data.listings)) return;
    const mapped = data.listings.map(mapApiListing);
    // DB is the source of truth — replace entirely and save
    listings = mapped;
    saveToStorage();
    renderListings();
    renderProfileStats();
    // Load profile strip counts/ratings from DB too
    syncProfileStatsFromApi().catch(() => {});
  } catch (e) {
    console.warn('[Roots] API sync skipped – using local data:', e.message);
    // Keep existing listings in memory; do not wipe them
  }
}

async function apiCreateListing(listing, photosToUpload = []) {
  try {
    const res = await fetch(`${API_BASE}?action=listing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id:           1,
        animal_type:       listing.type,
        custom_animal_name: listing.customAnimalName,
        breed:             listing.breed,
        title:             listing.title,
        count:             listing.count,
        count_unit:        listing.countUnit,
        weight:            listing.weight,
        age:               listing.age,
        price:             listing.price,
        price_negotiable:  listing.priceNegotiable,
        listing_type:      listing.listingType,
        vaccine_status:    listing.vaccineStatus,
        location_barangay: listing.locationBarangay,
        location_purok:    listing.locationPurok,
        location_landmark: listing.locationLandmark,
        notes:             listing.notes
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Create listing failed');
    if (data.id) {
      const uploadedPhotoUrls = [];
      // Upload new files (not preloaded existing URLs).
      for (const photo of photosToUpload) {
        if (photo?.file) {
          const photoUrl = await apiUploadPhoto(data.id, photo.file);
          if (photoUrl) uploadedPhotoUrls.push(photoUrl);
        }
      }
      return { id: data.id, photoUrls: uploadedPhotoUrls };
    }
    return null;
  } catch(e) {
    console.error('API create error:', e);
    throw e;
  }
}

async function apiUpdateListing(id, listing, photosToUpload = []) {
  try {
    const res = await fetch(`${API_BASE}?action=listing&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animal_type:       listing.type,
        custom_animal_name: listing.customAnimalName,
        breed:             listing.breed,
        title:             listing.title,
        count:             listing.count,
        weight:            listing.weight,
        age:               listing.age,
        price:             listing.price,
        price_negotiable:  listing.priceNegotiable,
        listing_type:      listing.listingType,
        vaccine_status:    listing.vaccineStatus,
        location_barangay: listing.locationBarangay,
        location_purok:    listing.locationPurok,
        notes:             listing.notes,
        status:            listing.status
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update listing failed');
    const uploadedPhotoUrls = [];
    // Upload only newly selected files
    for (const photo of photosToUpload) {
      if (photo?.file) {
        const photoUrl = await apiUploadPhoto(id, photo.file);
        if (photoUrl) uploadedPhotoUrls.push(photoUrl);
      }
    }
    return { uploadedPhotoUrls };
  } catch(e) {
    console.error('API update error:', e);
    throw e;
  }
}

async function apiUploadPhoto(listingId, file) {
  const form = new FormData();
  form.append('listing_id', listingId);
  form.append('photo', file);
  try {
    const res  = await fetch(`${API_BASE}?action=upload_photo`, { method: 'POST', body: form });
    const data = await res.json();
    return data.photo_url;
  } catch(e) { console.error('Photo upload error:', e); return null; }
}

// ======================================================================
