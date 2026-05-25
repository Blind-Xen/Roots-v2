// Roots Livestock — configuration
// ===== CONFIG =====
// ======================================================================
const API_BASE        = 'livestock-api.php'; // Change path as needed
const USE_API         = true;                // Keep true when backend is available
const LS_KEY_LISTINGS = 'roots_livestock_listings'; // localStorage key
const LS_KEY_VERSION  = 'roots_livestock_version';  // schema version key
const LS_SCHEMA_VER   = '1.1';                      // bump if schema changes
const LS_KEY_CART     = 'roots_livestock_cart';
const LS_KEY_SAVED    = 'roots_livestock_saved';
const LS_KEY_USER_MODE = 'roots_livestock_user_mode'; // 'buyer' | 'seller'
const LS_KEY_FARMER_REG = 'roots_livestock_farmer_reg';

/** Default: all users browse as buyers until they register as a farmer. */
let userMode = 'buyer';
let cartItems = [];   // { listingId, quantity, addedAt }
let savedIds = new Set();
let farmerRegStep = 1;

// ======================================================================
