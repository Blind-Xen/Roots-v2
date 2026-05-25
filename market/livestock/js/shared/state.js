// Roots Livestock — shared state
// ===== SECTION: DATA =====
// ======================================================================
let activeTypeFilter = 'all';
let activeListingFilters = new Set();
let searchQuery   = '';
let currentSort   = 'newest';

// Selected photo files (for add/edit modal — client-side preview)
let selectedPhotos = []; // Array of { file, previewUrl }

// Listing being edited (null = add mode)
let editingId = null;

/** Listings data (used when USE_API = false) */
let listings = [
  {
    id: 1, type: 'hog', emoji: '🐖',
    title: '3 Native Hogs – Ready for Trade or Sale',
    breed: 'Native / Bisaya', count: 3, weight: 75, age: '6 months',
    price: 6500, priceNegotiable: true, listingType: 'both',
    vaccineStatus: 'complete',
    location: 'Brgy. Pines, Oroquieta', locationBarangay: 'Pines', locationPurok: 'Purok 3',
    seller: 'Kuya Mario Santos', sellerEmoji: '👨‍🌾', sellerRating: 4.9,
    daVerified: true, isMine: true,
    notes: 'All three hogs are healthy and well-fed. Free-range, mostly corn and camote feed. Vaccination records available.',
    photos: [], postedDaysAgo: 0, status: 'active'
  },
  {
    id: 2, type: 'cattle', emoji: '🐄',
    title: 'Brahman Cross Cow – 2 Years Old',
    breed: 'Brahman Cross', count: 1, weight: 280, age: '2 years',
    price: 38000, priceNegotiable: false, listingType: 'sell',
    vaccineStatus: 'complete',
    location: 'Brgy. Layawan, Oroquieta', locationBarangay: 'Layawan', locationPurok: '',
    seller: 'Aling Coring Reyes', sellerEmoji: '👩‍🌾', sellerRating: 4.7,
    daVerified: true, isMine: false,
    notes: 'Healthy female cow. Never calved yet. DA health certificate available.',
    photos: [], postedDaysAgo: 2, status: 'active'
  },
  {
    id: 3, type: 'poultry', emoji: '🐓',
    title: '50 Native Chickens – Bulk Sale',
    breed: 'Native / Darag', count: 50, weight: 1.5, age: '5–6 months',
    price: 350, priceNegotiable: true, listingType: 'sell',
    vaccineStatus: 'partial',
    location: 'Brgy. Mialen, Oroquieta', locationBarangay: 'Mialen', locationPurok: 'Purok 1',
    seller: 'Manong Dodong Bato', sellerEmoji: '🧑‍🌾', sellerRating: 4.5,
    daVerified: false, isMine: false,
    notes: 'Free-range native chickens. ₱350 per head or negotiate for bulk.',
    photos: [], postedDaysAgo: 3, status: 'active'
  },
  {
    id: 4, type: 'goat', emoji: '🐐',
    title: 'Anglo-Nubian Goat Pair – Breeding Stock',
    breed: 'Anglo-Nubian', count: 2, weight: 35, age: '18 months',
    price: 14000, priceNegotiable: true, listingType: 'sell',
    vaccineStatus: 'complete',
    location: 'Brgy. Clarin Settlement, Oroquieta', locationBarangay: 'Clarin Settlement', locationPurok: '',
    seller: 'Nong Berto Cabales', sellerEmoji: '👨‍🌾', sellerRating: 4.8,
    daVerified: true, isMine: false,
    notes: 'One buck and one doe. DA-assisted breed from Misamis Occidental provincial program.',
    photos: [], postedDaysAgo: 1, status: 'active'
  },
  {
    id: 5, type: 'carabao', emoji: '🦬',
    title: 'Work Carabao – Strong and Trained',
    breed: 'Philippine Native', count: 1, weight: 420, age: '5 years',
    price: 55000, priceNegotiable: true, listingType: 'sell',
    vaccineStatus: 'complete',
    location: 'Brgy. Buenavista, Oroquieta', locationBarangay: 'Buenavista', locationPurok: '',
    seller: 'Kuya Pepe Dela Cruz', sellerEmoji: '👨‍🌾', sellerRating: 4.6,
    daVerified: true, isMine: false,
    notes: 'Well-trained carabao for farm work. Gentle temperament.',
    photos: [], postedDaysAgo: 5, status: 'active'
  },
  {
    id: 6, type: 'poultry', emoji: '🦆',
    title: '20 Muscovy Ducks – Itik for Sale',
    breed: 'Muscovy', count: 20, weight: 2.5, age: '4 months',
    price: 400, priceNegotiable: false, listingType: 'sell',
    vaccineStatus: 'none',
    location: 'Brgy. Layawan, Oroquieta', locationBarangay: 'Layawan', locationPurok: 'Purok 2',
    seller: 'Ate Nora Mendez', sellerEmoji: '👩‍🌾', sellerRating: 4.4,
    daVerified: false, isMine: false,
    notes: 'Healthy muscovy ducks raised on rice paddies.',
    photos: [], postedDaysAgo: 7, status: 'active'
  },
  {
    id: 7, type: 'hog', emoji: '🐷',
    title: 'Landrace Boar – Stud Service',
    breed: 'Landrace', count: 1, weight: 180, age: '2 years',
    price: 800, priceNegotiable: false, listingType: 'service',
    vaccineStatus: 'complete',
    location: 'Brgy. Dolipos Alto, Oroquieta', locationBarangay: 'Dolipos Alto', locationPurok: '',
    seller: 'Manong Ernie Vidal', sellerEmoji: '🧑‍🌾', sellerRating: 4.9,
    daVerified: true, isMine: false,
    notes: 'Registered Landrace boar. ₱800 per service.',
    photos: [], postedDaysAgo: 4, status: 'active'
  },
  {
    id: 8, type: 'other', emoji: '🐇', customAnimalName: 'Rabbit',
    title: '8 Rabbits – Various Ages',
    breed: 'Native Mix', count: 8, weight: 1.8, age: '2–4 months',
    price: 250, priceNegotiable: true, listingType: 'sell',
    vaccineStatus: 'unknown',
    location: 'Brgy. Pines, Oroquieta', locationBarangay: 'Pines', locationPurok: 'Purok 5',
    seller: 'Juana Reyes', sellerEmoji: '👩‍🌾', sellerRating: 4.3,
    daVerified: false, isMine: false,
    notes: 'Good for meat or as pets. Mix of male and female.',
    photos: [], postedDaysAgo: 6, status: 'active'
  }
];

// ======================================================================
