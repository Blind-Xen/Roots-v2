// Roots Livestock — localStorage
// ===== SECTION: LOCAL STORAGE PERSISTENCE =====
// ======================================================================

/**
 * Persist the full listings array to localStorage immediately.
 * Called automatically after every mutation (add, edit, delete).
 */
function saveToStorage() {
  try {
    localStorage.setItem(LS_KEY_LISTINGS, JSON.stringify(listings));
    localStorage.setItem(LS_KEY_VERSION,  LS_SCHEMA_VER);
  } catch (e) {
    console.warn('[Roots] localStorage save failed:', e);
  }
}

/**
 * Load listings from localStorage.
 * Returns the stored array or null if nothing is saved / schema mismatch.
 */
function loadFromStorage() {
  try {
    const ver   = localStorage.getItem(LS_KEY_VERSION);
    if (ver !== LS_SCHEMA_VER) return null;   // stale schema — use seed data
    const raw   = localStorage.getItem(LS_KEY_LISTINGS);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return Array.isArray(saved) && saved.length > 0 ? saved : null;
  } catch (e) {
    console.warn('[Roots] localStorage load failed:', e);
    return null;
  }
}

/**
 * Merge API listings into the local listings array, preserving any
 * locally-added entries (isMine = true, id > 1e12) that the server may
 * not have confirmed yet.
 */
function mergeApiListings(apiListings) {
  // Keep any locally-posted listings that haven't been confirmed by DB yet
  // (id > 1e12 means it was created with Date.now() as a temp ID)
  const localOnly = listings.filter(l => l.isMine && String(l.id).length > 10);
  const merged    = [...apiListings, ...localOnly];
  listings = merged;      // ← assign FIRST so saveToStorage captures correct data
  saveToStorage();
  return merged;
}

// ======================================================================
