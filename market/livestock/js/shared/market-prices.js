// Roots Livestock — market prices
// ===== SECTION: MARKET PRICES (computed from listings) =====
// ======================================================================
const PRICE_BOARD_SPECS = [
  { emoji: '🐖', name: 'Hog (live)',     match: l => l.type === 'hog' },
  { emoji: '🐄', name: 'Cattle (live)',  match: l => l.type === 'cattle' },
  { emoji: '🐐', name: 'Goat (live)',    match: l => l.type === 'goat' },
  { emoji: '🐓', name: 'Chicken (live)', match: l => l.type === 'poultry' && !isDuckListing(l) },
  { emoji: '🦬', name: 'Carabao (live)', match: l => l.type === 'carabao' },
  { emoji: '🦆', name: 'Duck (live)',    match: l => l.type === 'poultry' && isDuckListing(l) }
];

function isDuckListing(l) {
  const text = `${l.title || ''} ${l.breed || ''} ${l.customAnimalName || ''}`.toLowerCase();
  return /\b(duck|itik|muscovy|pato)\b/.test(text);
}

/** ₱/kg live weight — price is per head; weight is per-head kg on the listing form. */
function getListingPricePerKg(l) {
  const weight = Number(l.weight);
  const price  = Number(l.price);
  if (l.status !== 'active') return null;
  if (l.listingType === 'service' || l.listingType === 'trade') return null;
  if (!weight || weight <= 0 || !price || price <= 0) return null;
  return price / weight;
}

function computePriceTrend(recentRates, olderRates) {
  if (!recentRates.length || !olderRates.length) return 'same';
  const recentAvg = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;
  const olderAvg  = olderRates.reduce((a, b) => a + b, 0) / olderRates.length;
  if (olderAvg <= 0) return 'same';
  const change = (recentAvg - olderAvg) / olderAvg;
  if (change > 0.03) return 'up';
  if (change < -0.03) return 'down';
  return 'same';
}

function computeMarketPricesFromListings() {
  const active = listings.filter(l => l.status === 'active');

  return PRICE_BOARD_SPECS.map(spec => {
    const matched = active.filter(spec.match);
    const samples = matched
      .map(l => ({
        rate: getListingPricePerKg(l),
        postedDaysAgo: Number(l.postedDaysAgo) || 999
      }))
      .filter(s => s.rate != null && Number.isFinite(s.rate));

    if (!samples.length) {
      return { emoji: spec.emoji, name: spec.name, price: 'No data yet', trend: 'same', sampleCount: 0 };
    }

    const rates = samples.map(s => s.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const fmt = v => Math.round(v).toLocaleString();
    const price = min === max
      ? `₱${fmt(min)}/kg`
      : `₱${fmt(min)}–${fmt(max)}/kg`;

    const recent = samples.filter(s => s.postedDaysAgo <= 7).map(s => s.rate);
    const older  = samples.filter(s => s.postedDaysAgo > 7).map(s => s.rate);
    const trend  = computePriceTrend(recent, older);

    return { emoji: spec.emoji, name: spec.name, price, trend, sampleCount: samples.length };
  });
}

// ======================================================================
