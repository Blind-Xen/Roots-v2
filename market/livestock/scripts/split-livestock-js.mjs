/**
 * Splits livestock-script.js into modular files.
 * Run: node scripts/split-livestock-js.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(root, 'livestock-script.js'), 'utf8');

function slice(startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error('Missing start: ' + startMarker);
  const from = start;
  const end = endMarker ? src.indexOf(endMarker, start + 1) : src.length;
  if (end === -1) throw new Error('Missing end: ' + endMarker);
  return src.slice(from, end).trim();
}

function write(rel, body) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body.trim() + '\n', 'utf8');
  console.log('Wrote', rel, `(${body.split('\n').length} lines)`);
}

write('js/shared/config.js', `// Roots Livestock — configuration\n${slice('// ===== CONFIG =====', '// ===== SECTION: LOCAL STORAGE')}`);
write('js/shared/storage.js', `// Roots Livestock — localStorage\n${slice('// ===== SECTION: LOCAL STORAGE PERSISTENCE =====', '// ===== SECTION: DATA =====')}`);
write('js/shared/state.js', `// Roots Livestock — shared state\n${slice('// ===== SECTION: DATA =====', '// ===== SECTION: BUYER MODE')}`);
write('js/buyer/mode.js', `// Roots Livestock — buyer / farmer mode, cart & saved\n${slice('// ===== SECTION: BUYER MODE — CART, SAVED, USER ROLE =====', '// ===== SECTION: MARKET PRICES')}`);
write('js/shared/market-prices.js', `// Roots Livestock — market prices\n${slice('// ===== SECTION: MARKET PRICES', '// ===== SECTION: NOTIFICATIONS')}`);
write('js/marketplace/notifications.js', `// Roots Livestock — notifications\n${slice('// ===== SECTION: NOTIFICATIONS =====', '// ===== SECTION: RENDER – LISTINGS GRID')}`);
write('js/marketplace/browse.js', `// Roots Livestock — marketplace browse & detail\n${slice('// ===== SECTION: RENDER – LISTINGS GRID =====', '// ===== SECTION: PHOTO UPLOAD')}\n\n${slice('// ===== SECTION: LISTING DETAIL MODAL =====', '// ===== SECTION: API HELPERS')}\n\n${slice('// ===== SECTION: SEARCH & FILTER =====', '// ===== SECTION: DROPDOWNS')}`);
write('js/seller/photos.js', `// Roots Livestock — listing photos\n${slice('// ===== SECTION: PHOTO UPLOAD =====', '// ===== SECTION: QUANTITY STEPPER')}`);
write('js/seller/profile-photo.js', `// Roots Livestock — seller profile photo (farmer in UI)\n${slice('// ===== SECTION: FARMER PROFILE PHOTO =====', '// ===== SECTION: ANIMAL TYPE')}`);
write('js/seller/post-listing-form.js', `// Roots Livestock — listing form UI\n${slice('// ===== SECTION: QUANTITY STEPPER =====', '// ===== SECTION: SUBMIT LISTING')}`);
write('js/seller/submit-listing.js', `// Roots Livestock — submit listing\n${slice('// ===== SECTION: SUBMIT LISTING (Add or Edit) =====', '// ===== SECTION: MY LISTINGS MODAL')}`);
write('js/seller/my-listings.js', `// Roots Livestock — my listings\n${slice('// ===== SECTION: MY LISTINGS MODAL =====', '// ===== SECTION: LISTING DETAIL MODAL')}`);
write('js/shared/api.js', `// Roots Livestock — API\n${slice('// ===== SECTION: API HELPERS', '// ===== SECTION: SEARCH & FILTER')}`);
write('js/shared/ui-shell.js', `// Roots Livestock — UI shell (toast, theme, dropdowns)\n${slice('// ===== SECTION: DROPDOWNS =====', '// ===== SECTION: TOAST =====')}\n\n${slice('// ===== SECTION: TOAST =====', '// ===== SECTION: MODULE SWITCHER')}\n\n${slice('// ===== SECTION: MODULE SWITCHER =====', '// ===== SECTION: KEYBOARD SHORTCUTS')}`);
write('js/admin/panel.js', `// Roots Livestock — admin panel\n${slice('// ===== ADMIN PANEL — FULLY LIVE', '')}`);
write('js/app.js', `// Roots Livestock — app bootstrap\n${slice('// ===== SECTION: KEYBOARD SHORTCUTS =====', '// ===== ADMIN PANEL')}`);

console.log('Split complete.');
