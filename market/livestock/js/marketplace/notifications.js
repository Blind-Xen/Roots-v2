// Roots Livestock — notifications
// ===== SECTION: NOTIFICATIONS =====
// ======================================================================
let notifications = [
  { id: 1, avatar: '🐖', message: 'Manong Ernie viewed your hog listing and sent an inquiry.', time: '30 mins ago', unread: true },
  { id: 2, avatar: '💉', message: 'DA Oroquieta: Free Hog Cholera vaccine drive this Friday at Brgy. Pines.', time: '2 hrs ago', unread: true },
  { id: 3, avatar: '🐄', message: 'Market price update: Cattle live weight rose to ₱145/kg this week.', time: 'Yesterday', unread: true },
  { id: 4, avatar: '⚠️', message: 'ASF Advisory: Avoid purchasing pigs from unverified sources outside Oroquieta.', time: '2 days ago', unread: false }
];

// Cached profile stats (when backend is available)
let profileStatsCache = null; // { animals: number, sold: number, rating: number|null, ratingCount?: number }

/**
 * Update the profile dropdown stats strip:
 *   Animals = total head count across "my" active listings
 *   Sold    = number of "my" listings with status === 'sold'
 *   Rating  = sellerRating from the first "mine" listing
 */
function renderProfileStats() {
  // Prefer backend-computed stats (source of truth), fallback to local computation.
  let animalCount = null;
  let soldCount   = null;
  let rating      = null;

  if (profileStatsCache && typeof profileStatsCache === 'object') {
    animalCount = Number(profileStatsCache.animals);
    soldCount   = Number(profileStatsCache.sold);
    rating      = (profileStatsCache.rating === null || profileStatsCache.rating === undefined)
      ? null
      : Number(profileStatsCache.rating);
  }

  if (!Number.isFinite(animalCount) || !Number.isFinite(soldCount)) {
    const myListings  = listings.filter(l => l.isMine);
    const myActive    = myListings.filter(l => l.status === 'active');
    const mySold      = myListings.filter(l => l.status === 'sold');

    // "Animals" should reflect total heads in your ACTIVE listings.
    animalCount = myActive.reduce((sum, l) => sum + (Number(l.count) || 1), 0);
    // "Sold" should reflect how many of your listings are marked SOLD.
    soldCount   = mySold.length;

    // Rating fallback: average rating visible in the loaded dataset (best-effort).
    const ratings = myListings.map(l => Number(l.sellerRating)).filter(r => Number.isFinite(r) && r > 0);
    rating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
  }

  const ratingText = Number.isFinite(rating) ? rating.toFixed(1) + '\u2605' : '\u2014';

  const elTotal  = document.getElementById('profileTotal');
  const elSold   = document.getElementById('profileSold');
  const elRating = document.getElementById('profileRating');

  if (elTotal)  elTotal.textContent  = String(animalCount);
  if (elSold)   elSold.textContent   = String(soldCount);
  if (elRating) elRating.textContent = ratingText;
}

// ======================================================================
