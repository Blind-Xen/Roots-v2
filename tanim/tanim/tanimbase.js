/* ══════════════════════════════════════════
   tanimbase.js — TanimBase User View Logic
══════════════════════════════════════════ */

const TAG_LABELS = {
  medicinal:  '💊 Medicinal',
  edible:     '🥗 Edible',
  crop:       '🌾 Crop',
  ornamental: '🌸 Ornamental',
  timber:     '🪵 Timber',
  aromatic:   '🌺 Aromatic'
};

/* ── Demo data (fallback when api.php is unavailable) ── */
const DEMO_PLANTS = [
  {
    id: 1, localName: 'Alagaw', sciName: 'Premna odorata', emoji: '🌿',
    family: 'Lamiaceae', tags: ['medicinal', 'timber'], image: null,
    description: 'A small tree native to the Philippines used in traditional medicine and timber production.',
    uses: ['Leaves used to treat fever and headaches', 'Bark decoction for cough relief', 'Wood used for light construction'],
    careWater: 'Moderate', careLight: 'Full sun', careSoil: 'Well-drained loam', careDifficulty: 'Easy',
    height: '3–8 m', lifespan: 'Perennial', videoUrl: null,
    regions: ['Luzon', 'Visayas', 'Mindanao'], alsoKnown: ['Alagaw-gubat']
  },
  {
    id: 2, localName: 'Ampalaya', sciName: 'Momordica charantia', emoji: '🥒',
    family: 'Cucurbitaceae', tags: ['edible', 'medicinal', 'crop'], image: null,
    description: 'Bitter melon, a popular Philippine vegetable and medicinal herb known for blood sugar regulation.',
    uses: ['Widely eaten as a vegetable in many dishes', 'Leaves brewed as tea for diabetes management', 'Rich in vitamins C and A'],
    warnings: 'Excessive consumption may cause hypoglycemia in diabetics.',
    careWater: 'Regular watering', careLight: 'Full sun', careSoil: 'Rich, moist', careGrowth: 'Fast', careDifficulty: 'Easy',
    height: 'Up to 5 m (vine)', lifespan: 'Annual', harvestTime: '60–70 days', videoUrl: null,
    regions: ['Nationwide'], alsoKnown: ['Bitter gourd', 'Bitter melon']
  },
  {
    id: 3, localName: 'Banaba', sciName: 'Lagerstroemia speciosa', emoji: '🌸',
    family: 'Lythraceae', tags: ['medicinal', 'ornamental', 'timber'], image: null,
    description: 'Known as the Pride of India, banaba is a flowering tree valued for its anti-diabetic properties and ornamental beauty.',
    uses: ['Leaves used to lower blood sugar', 'Flowers and bark used in herbal preparations', 'Prized as an ornamental street tree'],
    careWater: 'Low to moderate', careLight: 'Full sun', careSoil: 'Sandy or clay loam', careDifficulty: 'Moderate',
    height: '10–20 m', lifespan: 'Perennial', flowerColor: 'Purple/Pink', videoUrl: null,
    regions: ['Luzon', 'Mindanao'], alsoKnown: ['Pride of India', 'Queen Crepe Myrtle']
  },
  {
    id: 4, localName: 'Lagundi', sciName: 'Vitex negundo', emoji: '🌾',
    family: 'Lamiaceae', tags: ['medicinal'], image: null,
    description: 'One of the official herbal plants of the Philippines, widely used for treating cough, asthma, and fever.',
    uses: ['DOH-approved herbal medicine for cough and asthma', 'Leaves boiled for fever relief', 'Anti-inflammatory properties for skin conditions'],
    careWater: 'Low', careLight: 'Full sun to partial shade', careSoil: 'Any well-drained soil', careDifficulty: 'Very easy',
    height: '2–5 m', lifespan: 'Perennial', videoUrl: null,
    regions: ['Nationwide'], alsoKnown: ['Five-leaved chaste tree']
  },
  {
    id: 5, localName: 'Malunggay', sciName: 'Moringa oleifera', emoji: '🌳',
    family: 'Moringaceae', tags: ['medicinal', 'edible'], image: null,
    description: 'Called the "miracle tree," malunggay is one of the most nutritious plants in the world and a staple in Filipino cooking.',
    uses: ['Leaves added to soups and stews', 'High in iron, calcium, and vitamins A and C', 'Seeds used for water purification', 'Used to increase breast milk in nursing mothers'],
    careWater: 'Drought-tolerant', careLight: 'Full sun', careSoil: 'Any soil type', careGrowth: 'Very fast', careDifficulty: 'Very easy',
    height: '3–12 m', lifespan: 'Perennial', harvestTime: 'Year-round', videoUrl: null,
    regions: ['Nationwide'], alsoKnown: ['Moringa', 'Drumstick tree']
  },
  {
    id: 6, localName: 'Niyog', sciName: 'Cocos nucifera', emoji: '🥥',
    family: 'Arecaceae', tags: ['edible', 'crop', 'timber'], image: null,
    description: 'The coconut palm, national tree of the Philippines and the "tree of life," providing food, shelter, and livelihood.',
    uses: ['Coconut water and meat consumed fresh or processed', 'Copra and coconut oil extracted for cooking and export', 'Leaves used for thatching; trunk for construction', 'Coir fiber used in mats and ropes'],
    careWater: 'Regular near coast', careLight: 'Full sun', careSoil: 'Sandy, well-drained', careGrowth: 'Slow (fruit in 6–10 yrs)', careDifficulty: 'Easy',
    height: '20–30 m', lifespan: '80–100 years', harvestTime: 'Year-round', videoUrl: null,
    regions: ['Nationwide'], alsoKnown: ['Coconut palm']
  },
  {
    id: 7, localName: 'Pandan', sciName: 'Pandanus amaryllifolius', emoji: '🌿',
    family: 'Pandanaceae', tags: ['edible', 'aromatic'], image: null,
    description: 'A tropical plant with fragrant leaves used extensively in Filipino cooking and as a natural air freshener.',
    uses: ['Leaves used to flavor rice, desserts, and drinks', 'Natural food coloring (green)', 'Placed in closets to repel insects', 'Used as flavoring in kakanin and buko pandan'],
    careWater: 'Moderate to high', careLight: 'Partial shade', careSoil: 'Moist, rich soil', careDifficulty: 'Easy',
    height: '0.5–1.5 m', lifespan: 'Perennial', videoUrl: null,
    regions: ['Nationwide'], alsoKnown: ['Screwpine', 'Pandan leaf']
  },
  {
    id: 8, localName: 'Sampaguita', sciName: 'Jasminum sambac', emoji: '🌼',
    family: 'Oleaceae', tags: ['ornamental', 'aromatic'], image: null,
    description: 'The national flower of the Philippines, cherished for its sweet fragrance and cultural significance.',
    uses: ['Strung into garlands for religious offerings and events', 'Essential oils extracted for perfumes and cosmetics', 'Flowers used in tea blending', 'Symbol of purity in Filipino culture'],
    careWater: 'Regular, avoid waterlogging', careLight: 'Full sun', careSoil: 'Well-drained loam', careDifficulty: 'Easy',
    height: '0.5–3 m (shrub/vine)', lifespan: 'Perennial', flowerColor: 'White', videoUrl: null,
    regions: ['Nationwide'], alsoKnown: ['Arabian jasmine', 'Philippine jasmine']
  }
];

/* ── State ── */
let allPlants     = [];
let currentFilter = 'all';
let currentSearch = '';

/* ══════════════════════════════════════════════
   TRANSITIONS
   Handles smooth animated view swaps and the
   card click micro-animation.
══════════════════════════════════════════════ */
const Transitions = (() => {

  function injectStyles() {
    if (document.getElementById('tr-styles')) return;
    const style = document.createElement('style');
    style.id = 'tr-styles';
    style.textContent = `
      #view-list,
      #view-detail {
        transition: opacity .32s ease, transform .32s cubic-bezier(.22,.68,0,1.2);
        will-change: opacity, transform;
      }
      #view-list.tr-exit {
        opacity: 0;
        transform: translateX(-28px) scale(0.98);
        pointer-events: none;
      }
      #view-detail.tr-enter-from {
        opacity: 0;
        transform: translateX(36px) scale(0.98);
      }
      #view-detail.tr-enter-to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      #view-detail.tr-exit {
        opacity: 0;
        transform: translateX(36px) scale(0.98);
        pointer-events: none;
      }
      #view-list.tr-enter-from {
        opacity: 0;
        transform: translateX(-28px) scale(0.98);
      }
      #view-list.tr-enter-to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      .plant-card {
        transition: transform .2s cubic-bezier(.22,.68,0,1.2),
                    box-shadow .2s ease,
                    border-color .2s ease;
      }
      .plant-card.tr-clicked {
        transform: scale(0.95) !important;
        box-shadow: 0 2px 8px rgba(30,92,58,.1) !important;
      }
      .back-btn {
        transition: transform .18s ease, background .15s, border-color .15s;
      }
      .back-btn.tr-pulse {
        transform: translateX(-4px);
      }
    `;
    document.head.appendChild(style);
  }

  /* list → detail */
  function toDetail(renderFn, clickedCard) {
    const listEl   = document.getElementById('view-list');
    const detailEl = document.getElementById('view-detail');

    if (clickedCard) clickedCard.classList.add('tr-clicked');

    setTimeout(() => {
      if (clickedCard) clickedCard.classList.remove('tr-clicked');

      listEl.classList.add('tr-exit');

      setTimeout(() => {
        listEl.style.display = 'none';
        listEl.classList.remove('tr-exit');

        renderFn();

        detailEl.classList.add('tr-enter-from');
        detailEl.style.display = 'block';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            detailEl.classList.remove('tr-enter-from');
            detailEl.classList.add('tr-enter-to');
            detailEl.addEventListener('transitionend', () => {
              detailEl.classList.remove('tr-enter-to');
            }, { once: true });
          });
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

      }, 220);

    }, 120);
  }

  /* detail → list */
  function toList() {
    const listEl   = document.getElementById('view-list');
    const detailEl = document.getElementById('view-detail');

    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
      backBtn.classList.add('tr-pulse');
      setTimeout(() => backBtn.classList.remove('tr-pulse'), 200);
    }

    detailEl.classList.add('tr-exit');

    setTimeout(() => {
      detailEl.style.display = 'none';
      detailEl.classList.remove('tr-exit');

      listEl.classList.add('tr-enter-from');
      listEl.style.display = 'block';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          listEl.classList.remove('tr-enter-from');
          listEl.classList.add('tr-enter-to');
          listEl.addEventListener('transitionend', () => {
            listEl.classList.remove('tr-enter-to');
          }, { once: true });
        });
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

    }, 220);
  }

  injectStyles();
  return { toDetail, toList };

})();

/* ── Init ── */
initUserDropdown({
  user: { initials: 'KM', name: 'Kuya Mario', role: 'Registered Farmer' },
  onAction: (action) => {
    if (action === 'logout') {
      console.log('Logout action triggered');
      alert('Logout clicked');
    }
  }
});

loadPlants();

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    if (link.getAttribute('href') === '#') {
      e.preventDefault();
    }
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

/* ── Load plants (API with demo fallback) ── */
async function loadPlants() {
  const loading = document.getElementById('loading');
  loading.style.display = 'flex';
  try {
    const res  = await fetch('api.php');
    const data = await res.json();
    if (!data.success) throw new Error();
    allPlants = data.plants;
  } catch {
    allPlants = DEMO_PLANTS;
  }
  document.getElementById('total-count').textContent = allPlants.length;
  loading.style.display = 'none';
  applyFilters();
}

/* ── Filter chip ── */
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

/* ── Search input ── */
function handleSearch(val) {
  currentSearch = val.toLowerCase().trim();
  applyFilters();
}

/* ── Parse tags ── */
function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try { return JSON.parse(tags); } catch { return tags.split(',').map(t => t.trim()); }
}

/* ── Apply filter + search ── */
function applyFilters() {
  let result = [...allPlants];
  if (currentFilter !== 'all') {
    result = result.filter(p => parseTags(p.tags).includes(currentFilter));
  }
  if (currentSearch) {
    result = result.filter(p => {
      const alsoKnown = Array.isArray(p.alsoKnown)
        ? p.alsoKnown
        : (p.alsoKnown || '').split(',').map(s => s.trim());

      const uses = Array.isArray(p.uses)
        ? p.uses
        : (p.uses ? p.uses.split('\n').filter(Boolean) : []);

      return (
        (p.localName   || '').toLowerCase().includes(currentSearch) ||
        (p.sciName     || '').toLowerCase().includes(currentSearch) ||
        (p.family      || '').toLowerCase().includes(currentSearch) ||
        (p.description || '').toLowerCase().includes(currentSearch) ||
        alsoKnown.some(n => n.toLowerCase().includes(currentSearch)) ||
        uses.some(u => u.toLowerCase().includes(currentSearch)) ||
        (p.regions || []).some(r => r.toLowerCase().includes(currentSearch)) ||
        parseTags(p.tags).some(t => t.toLowerCase().includes(currentSearch))
      );
    });
  }
  renderGrid(result);
}

/* ══════════════════════════════════════════════
   IMAGE HELPERS
══════════════════════════════════════════════ */
function thumbHtml(plant) {
  if (plant.image) {
    return `<img src="uploads/plants/${plant.image}" alt="${plant.localName}" loading="lazy">`;
  }
  return `
    <div class="plant-thumb-placeholder">
      <span class="thumb-emoji">${plant.emoji || '🌿'}</span>
      <span class="thumb-label">No photo yet</span>
    </div>`;
}

function detailImageHtml(plant) {
  if (plant.image) {
    return `<img src="uploads/plants/${plant.image}" alt="${plant.localName}">`;
  }
  return `
    <div class="detail-image-placeholder">
      <span class="ph-emoji">${plant.emoji || '🌿'}</span>
      <span class="ph-label">Photo coming soon</span>
    </div>`;
}

/* ── Render plant grid ── */
function renderGrid(plants) {
  const grid      = document.getElementById('plant-grid');
  const noResults = document.getElementById('no-results');
  const count     = document.getElementById('results-count');

  if (plants.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    count.innerHTML = '';
    return;
  }

  noResults.style.display = 'none';
  count.innerHTML = `Showing <strong>${plants.length}</strong> of <strong>${allPlants.length}</strong> plants`;

  /* ── Staggered card entry ── */
  grid.innerHTML = plants.map((p, i) => {
    const tags     = parseTags(p.tags);
    const tagPills = tags.map(t =>
      `<span class="ptag ptag-${t}">${TAG_LABELS[t] || t}</span>`
    ).join('');

    return `
      <div class="plant-card" style="animation-delay:${i * 40}ms" onclick="showDetail(${p.id}, this)">
        <div class="plant-card-thumb">${thumbHtml(p)}</div>
        <div class="plant-card-body">
          <div class="plant-local-name">${p.localName || '—'}</div>
          <div class="plant-sci-name">${p.sciName || ''}</div>
          <div class="plant-tags">${tagPills}</div>
        </div>
      </div>`;
  }).join('');
}

/* ── Show plant detail ── */
async function showDetail(id, cardEl) {
  let p;
  try {
    const res  = await fetch('api.php?id=' + id);
    const data = await res.json();
    if (data.success) {
      p = data.plant;
    } else {
      p = allPlants.find(x => x.id == id);
    }
  } catch {
    p = allPlants.find(x => x.id == id);
  }
  if (!p) return;

  const tags      = parseTags(p.tags);
  const tagPills  = tags.map(t => `<span class="ptag ptag-${t}">${TAG_LABELS[t] || t}</span>`).join('');
  const uses      = Array.isArray(p.uses) ? p.uses : (p.uses ? p.uses.split('\n').filter(Boolean) : []);
  const regions   = Array.isArray(p.regions)   ? p.regions   : [];
  const alsoKnown = Array.isArray(p.alsoKnown) ? p.alsoKnown : [];
  const hasFacts  = p.height || p.lifespan || p.flowerColor || p.harvestTime;
  const hasCare   = p.careWater || p.careLight || p.careSoil || p.careGrowth || p.careDifficulty;

  Transitions.toDetail(() => {
    document.getElementById('detail-content').innerHTML = `
      <div class="detail-layout">

        <!-- LEFT: sticky hero card -->
        <div class="detail-hero-card">
          <div class="detail-plant-image">${detailImageHtml(p)}</div>
          <div class="detail-hero-info">
            <div class="detail-local-name">${p.localName || '—'}</div>
            <div class="detail-sci-name">${p.sciName || ''}</div>
            ${p.family    ? `<div class="detail-family">Family: ${p.family}</div>` : ''}
            ${alsoKnown.length ? `<div class="detail-also">Also known as: ${alsoKnown.join(', ')}</div>` : ''}
            <div class="detail-tags">${tagPills}</div>
            ${hasFacts ? `
            <div class="detail-quick-facts">
              ${p.height      ? `<div class="detail-fact"><div class="detail-fact-label">Height</div><div class="detail-fact-value">${p.height}</div></div>` : ''}
              ${p.lifespan    ? `<div class="detail-fact"><div class="detail-fact-label">Lifespan</div><div class="detail-fact-value">${p.lifespan}</div></div>` : ''}
              ${p.flowerColor ? `<div class="detail-fact"><div class="detail-fact-label">Flower</div><div class="detail-fact-value">${p.flowerColor}</div></div>` : ''}
              ${p.harvestTime ? `<div class="detail-fact"><div class="detail-fact-label">Harvest</div><div class="detail-fact-value">${p.harvestTime}</div></div>` : ''}
            </div>` : ''}
          </div>
        </div>

        <!-- RIGHT: content sections -->
        <div class="detail-sections">

          <div class="detail-section">
            <div class="detail-section-title"><i class="material-icons">info</i> About this Plant</div>
            <p class="detail-desc">${p.description || 'No description available.'}</p>
          </div>

          ${uses.length ? `
          <div class="detail-section">
            <div class="detail-section-title"><i class="material-icons">local_florist</i> Uses & Benefits</div>
            <ul class="uses-list">
              ${uses.map(u => `<li><i class="material-icons">check_circle</i><span>${u}</span></li>`).join('')}
            </ul>
            ${p.warnings ? `
            <div class="warn-box">
              <i class="material-icons">warning</i>
              <p><strong>Caution:</strong> ${p.warnings}</p>
            </div>` : ''}
          </div>` : ''}

          ${hasCare ? `
          <div class="detail-section">
            <div class="detail-section-title"><i class="material-icons">yard</i> How to Grow & Care</div>
            <div class="care-grid">
              ${p.careWater      ? `<div class="care-item"><div class="care-icon"><i class="material-icons">water_drop</i></div><div><div class="care-label">Watering</div><div class="care-value">${p.careWater}</div></div></div>` : ''}
              ${p.careLight      ? `<div class="care-item"><div class="care-icon"><i class="material-icons">wb_sunny</i></div><div><div class="care-label">Sunlight</div><div class="care-value">${p.careLight}</div></div></div>` : ''}
              ${p.careSoil       ? `<div class="care-item"><div class="care-icon"><i class="material-icons">grass</i></div><div><div class="care-label">Soil</div><div class="care-value">${p.careSoil}</div></div></div>` : ''}
              ${p.careGrowth     ? `<div class="care-item"><div class="care-icon"><i class="material-icons">trending_up</i></div><div><div class="care-label">Growth</div><div class="care-value">${p.careGrowth}</div></div></div>` : ''}
              ${p.careDifficulty ? `<div class="care-item"><div class="care-icon"><i class="material-icons">stars</i></div><div><div class="care-label">Difficulty</div><div class="care-value">${p.careDifficulty}</div></div></div>` : ''}
            </div>
          </div>` : ''}

          ${regions.length ? `
          <div class="detail-section">
            <div class="detail-section-title"><i class="material-icons">place</i> Where It Grows in the Philippines</div>
            <div class="regions-wrap">
              ${regions.map(r => `<span class="region-chip">${r}</span>`).join('')}
            </div>
          </div>` : ''}

          ${p.careGuide && (p.careGuide.planting || p.careGuide.watering || p.careGuide.pruning || p.careGuide.fertilizing) ? `
          <div class="detail-section">
            <div class="detail-section-title"><i class="material-icons">menu_book</i> Detailed Care Guide</div>
            <p class="care-guide-note">Step-by-step guidance for growing this plant successfully.</p>
            <div class="care-guide-sections">
              ${p.careGuide.planting ? `
              <div class="care-guide-item">
                <div class="care-guide-header">
                  <div class="care-guide-icon"><i class="material-icons">agriculture</i></div>
                  <div class="care-guide-label">Planting Guide</div>
                </div>
                <p class="care-guide-text">${p.careGuide.planting}</p>
              </div>` : ''}
              ${p.careGuide.watering ? `
              <div class="care-guide-item">
                <div class="care-guide-header">
                  <div class="care-guide-icon"><i class="material-icons">water_drop</i></div>
                  <div class="care-guide-label">Watering Guide</div>
                </div>
                <p class="care-guide-text">${p.careGuide.watering}</p>
              </div>` : ''}
              ${p.careGuide.pruning ? `
              <div class="care-guide-item">
                <div class="care-guide-header">
                  <div class="care-guide-icon"><i class="material-icons">content_cut</i></div>
                  <div class="care-guide-label">Pruning Guide</div>
                </div>
                <p class="care-guide-text">${p.careGuide.pruning}</p>
              </div>` : ''}
              ${p.careGuide.fertilizing ? `
              <div class="care-guide-item">
                <div class="care-guide-header">
                  <div class="care-guide-icon"><i class="material-icons">science</i></div>
                  <div class="care-guide-label">Fertilizing Guide</div>
                </div>
                <p class="care-guide-text">${p.careGuide.fertilizing}</p>
              </div>` : ''}
            </div>
          </div>` : ''}

          ${p.videoUrl ? `
          <div class="detail-section">
            <div class="detail-section-title"><i class="material-icons">play_circle</i> Watch & Learn</div>
            <p class="video-note">A video tutorial is available for this plant.</p>
            <a class="video-card" href="${p.videoUrl}" target="_blank" rel="noopener noreferrer">
              <div class="video-card-icon">
                <i class="material-icons">smart_display</i>
              </div>
              <div class="video-card-text">
                <div class="video-card-label">Video Tutorial</div>
                <div class="video-card-sub">Watch how to grow ${p.localName}</div>
              </div>
              <i class="material-icons video-card-arrow">open_in_new</i>
            </a>
          </div>` : ''}

        </div>
      </div>`;
  }, cardEl);
}

/* ── Back to list ── */
function showList() {
  Transitions.toList();
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent   = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}