/* ══════════════════════════════════════════
   tanim-admin.js — TanimBase Admin (roots_db)
══════════════════════════════════════════ */

const API       = 'api.php';
const ADMIN_API = 'admin_api.php';

let allPlants      = [];
let filteredPlants = [];
let currentFilter  = 'all';
let searchQuery    = '';
let deleteTargetId = null;

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function el(id) {
  return document.getElementById(id);
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadPlants();

  // Region checkbox change listeners (checkboxes live in the portal)
  document.addEventListener('change', (e) => {
    if (e.target.name === 'regions') updateRegionDisplay();
  });

  // Reposition region dropdown portal when drawer scrolls
  const drawer = el('adm-drawer');
  if (drawer) {
    drawer.addEventListener('scroll', () => {
      const options = el('region-options');
      if (options && options.style.display === 'block') {
        const box = el('region-combobox');
        if (box) {
          const rect = box.getBoundingClientRect();
          options.style.top  = (rect.bottom + 4) + 'px';
          options.style.left = rect.left + 'px';
        }
      }
    });
  }
});

/* ══════════════════════════════════════════
   AUTH
══════════════════════════════════════════ */
function checkAuth() {
  const auth = sessionStorage.getItem('tanimbase_admin');
  if (auth !== 'ok') {
    const pw = prompt('Enter admin password:');
    if (pw !== 'admin123') {
      alert('Access denied.');
      window.location.href = 'tanimbase.html';
      return;
    }
    sessionStorage.setItem('tanimbase_admin', 'ok');
  }
}

/* ══════════════════════════════════════════
   LOAD PLANTS
══════════════════════════════════════════ */
async function loadPlants() {
  el('adm-loading').style.display = 'flex';
  el('adm-plant-grid').innerHTML  = '';
  el('adm-empty').style.display   = 'none';

  try {
    const res  = await fetch(API);
    const data = await res.json();
    if (!data.success) throw new Error('API error');
    allPlants = data.plants;
    applyFilters();
    updateStats();
    updateCategoryCounts();
    updateSettingsStatus(true);
  } catch {
    el('adm-loading').style.display = 'none';
    el('adm-empty').style.display   = 'block';
    updateSettingsStatus(false);
    showToast('Could not load plants.', true);
  }
}

/* ══════════════════════════════════════════
   STATS
══════════════════════════════════════════ */
function updateStats() {
  const total  = allPlants.length;
  const med    = allPlants.filter(p => p.tags.includes('medicinal')).length;
  const edible = allPlants.filter(p => p.tags.includes('edible')).length;
  const crop   = allPlants.filter(p => p.tags.includes('crop')).length;

  el('s-total').textContent          = total;
  el('s-med').textContent            = med;
  el('s-edible').textContent         = edible;
  el('s-crop').textContent           = crop;
  el('nav-badge-plants').textContent = total;
  el('db-count').textContent         = total + ' plants';
}

function updateCategoryCounts() {
  ['medicinal', 'edible', 'crop', 'ornamental', 'timber', 'aromatic'].forEach(c => {
    const count = allPlants.filter(p => p.tags.includes(c)).length;
    const node  = el('cat-' + c);
    if (node) node.textContent = count + (count === 1 ? ' plant' : ' plants');
  });
}

function updateSettingsStatus(ok) {
  const node = el('db-status');
  if (!node) return;
  node.textContent = ok ? 'Connected' : 'Disconnected';
  node.className   = 'adm-status-badge ' + (ok ? 'success' : 'error');
}

/* ══════════════════════════════════════════
   FILTER & SEARCH
══════════════════════════════════════════ */
function setAdminFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.adm-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function handleAdminSearch(val) {
  searchQuery = val.toLowerCase().trim();
  applyFilters();
}

function applyFilters() {
  let result = [...allPlants];

  if (currentFilter !== 'all') {
    result = result.filter(p => p.tags.includes(currentFilter));
  }
  if (searchQuery) {
    result = result.filter(p =>
      (p.localName   || '').toLowerCase().includes(searchQuery) ||
      (p.sciName     || '').toLowerCase().includes(searchQuery) ||
      (p.description || '').toLowerCase().includes(searchQuery)
    );
  }

  filteredPlants = result;
  renderGrid();
}

/* ══════════════════════════════════════════
   RENDER GRID
══════════════════════════════════════════ */
function renderGrid() {
  const grid    = el('adm-plant-grid');
  const loading = el('adm-loading');
  const empty   = el('adm-empty');
  const meta    = el('adm-results-meta');

  loading.style.display = 'none';

  if (filteredPlants.length === 0) {
    grid.innerHTML      = '';
    empty.style.display = 'block';
    meta.innerHTML      = '';
    return;
  }

  empty.style.display = 'none';
  meta.innerHTML = `Showing <strong>${filteredPlants.length}</strong> of <strong>${allPlants.length}</strong> plants`;

  grid.innerHTML = filteredPlants.map(p => {
    const tagPills = p.tags.map(t => `<span class="ptag ptag-${t}">${t}</span>`).join('');
    const thumb    = p.image
      ? `<img src="uploads/plants/${p.image}" alt="${p.localName}"
             style="width:48px;height:48px;object-fit:cover;border-radius:8px;flex-shrink:0;"
             onerror="this.outerHTML='<span style=font-size:28px>${p.emoji || '🌿'}</span>'">`
      : `<span style="font-size:28px">${p.emoji || '🌿'}</span>`;

    return `
      <div class="adm-plant-card">
        <div class="adm-card-header">
          <div style="display:flex;align-items:center;gap:12px;">
            ${thumb}
            <div>
              <div class="adm-card-id">#${p.id}</div>
              <div class="adm-card-name">${p.localName || '—'}</div>
              <div class="adm-card-sci">${p.sciName || ''}</div>
            </div>
          </div>
          <div class="adm-card-actions">
            <button class="adm-action-btn edit"
              onclick="openEditModal(${p.id})" title="Edit">
              <i class="material-icons">edit</i>
            </button>
            <button class="adm-action-btn delete"
              onclick="openDeleteConfirm(${p.id}, '${(p.localName || '').replace(/'/g, "\\'")}')"
              title="Delete">
              <i class="material-icons">delete</i>
            </button>
          </div>
        </div>
        <div class="adm-card-body">
          <div class="adm-card-desc">${p.description || 'No description available.'}</div>
          <div class="adm-card-tags">${tagPills}</div>
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════════
   TAB SWITCHING
══════════════════════════════════════════ */
function switchTab(tab) {
  document.querySelectorAll('.adm-tab-content').forEach(node => node.classList.remove('active'));
  document.querySelectorAll('.adm-nav-item').forEach(node => node.classList.remove('active'));
  el('tab-' + tab).classList.add('active');
  document.querySelectorAll('.adm-nav-item').forEach(item => {
    if (item.getAttribute('onclick')?.includes(tab)) item.classList.add('active');
  });

  const topbarRight = document.querySelector('.adm-topbar-right');
  if (topbarRight) topbarRight.style.display = tab === 'plants' ? 'flex' : 'none';

  if (window.innerWidth <= 768) {
    el('adm-sidebar')?.classList.remove('mobile-open');
    const backdrop = el('sidebar-backdrop');
    if (backdrop) backdrop.style.display = 'none';
  }
}

/* ══════════════════════════════════════════
   SIDEBAR (mobile)
══════════════════════════════════════════ */
function toggleAdminSidebar() {
  const sidebar  = el('adm-sidebar');
  const backdrop = el('sidebar-backdrop');
  if (!sidebar || !backdrop) return;
  const isOpen = sidebar.classList.contains('mobile-open');
  sidebar.classList.toggle('mobile-open');
  backdrop.style.display = isOpen ? 'none' : 'block';
}

/* ══════════════════════════════════════════
   DRAWER HELPERS
══════════════════════════════════════════ */
function openDrawer() {
  el('adm-drawer').classList.add('active');
  el('drawer-backdrop').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  el('adm-drawer').classList.remove('active');
  el('drawer-backdrop').classList.remove('active');
  document.body.style.overflow = '';
}

function resetForm() {
  const fields = [
    'field-id', 'field-local-name', 'field-sci-name', 'field-family',
    'field-also-known', 'field-emoji', 'field-description', 'field-uses',
    'field-warnings', 'field-water', 'field-light', 'field-soil',
    'field-growth', 'field-difficulty', 'field-height', 'field-lifespan',
    'field-flower-color', 'field-harvest-time', 'field-video-url',
    'field-care-planting', 'field-care-watering',
    'field-care-pruning', 'field-care-fertilizing',
  ];
  fields.forEach(id => { const node = el(id); if (node) node.value = ''; });
  document.querySelectorAll('[name="tags"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="regions"]').forEach(cb => cb.checked = false);
  updateRegionDisplay();
  closeRegionDropdown();
  resetUploadArea();
  const imgWrap = el('current-image-wrap');
  if (imgWrap) imgWrap.style.display = 'none';
}

/* ══════════════════════════════════════════
   ADD MODAL
══════════════════════════════════════════ */
function openAddModal() {
  resetForm();
  el('drawer-title').textContent = 'Add New Plant';
  el('drawer-sub').textContent   = 'Fill in the plant details below';
  el('save-label').textContent   = 'Save Plant';
  openDrawer();
}

/* ══════════════════════════════════════════
   EDIT MODAL
══════════════════════════════════════════ */
async function openEditModal(id) {
  resetForm();
  el('drawer-title').textContent = 'Loading…';
  openDrawer();

  let plant;
  try {
    const res  = await fetch(`${API}?id=${id}`);
    const data = await res.json();
    if (!data.success) throw new Error();
    plant = data.plant;
  } catch {
    showToast('Could not load plant data.', true);
    closeDrawer();
    return;
  }

  el('field-id').value          = plant.id;
  el('field-local-name').value  = plant.localName   || '';
  el('field-sci-name').value    = plant.sciName     || '';
  el('field-family').value      = plant.family      || '';
  el('field-also-known').value  = (plant.alsoKnown  || []).join(', ');
  el('field-emoji').value       = plant.emoji       || '';
  el('field-description').value = plant.description || '';
  el('field-uses').value        = Array.isArray(plant.uses)
                                    ? plant.uses.join('\n')
                                    : (plant.uses || '');
  el('field-warnings').value    = plant.warnings        || '';
  el('field-water').value       = plant.careWater       || '';
  el('field-light').value       = plant.careLight       || '';
  el('field-soil').value        = plant.careSoil        || '';
  el('field-growth').value      = plant.careGrowth      || '';
  el('field-difficulty').value  = plant.careDifficulty  || '';

  setRegions(plant.regions || []);

  el('field-height').value       = plant.height      || '';
  el('field-lifespan').value     = plant.lifespan    || '';
  el('field-flower-color').value = plant.flowerColor || '';
  el('field-harvest-time').value = plant.harvestTime || '';
  el('field-video-url').value    = plant.videoUrl    || '';

  (plant.tags || []).forEach(tag => {
    const cb = document.querySelector(`input[name="tags"][value="${tag}"]`);
    if (cb) cb.checked = true;
  });

  const imgWrap    = el('current-image-wrap');
  const imgPreview = el('current-image-preview');
  if (plant.image && imgWrap && imgPreview) {
    imgPreview.src        = 'uploads/plants/' + plant.image;
    imgWrap.style.display = 'block';
  } else if (imgWrap) {
    imgWrap.style.display = 'none';
  }

  // Set care guide LAST so resetForm() above doesn't wipe it
  el('field-care-planting').value    = plant.careGuide?.planting    || '';
  el('field-care-watering').value    = plant.careGuide?.watering    || '';
  el('field-care-pruning').value     = plant.careGuide?.pruning     || '';
  el('field-care-fertilizing').value = plant.careGuide?.fertilizing || '';

  el('drawer-title').textContent = 'Edit Plant';
  el('drawer-sub').textContent   = plant.localName || '';
  el('save-label').textContent   = 'Update Plant';
}

/* ══════════════════════════════════════════
   SUBMIT FORM (add & update)
══════════════════════════════════════════ */
async function submitForm(e) {
  e.preventDefault();

  const id   = el('field-id').value.trim();
  const tags = [...document.querySelectorAll("input[name='tags']:checked")]
                 .map(cb => cb.value);

  if (!tags.length) {
    showToast('Please select at least one category.', true);
    return;
  }

  const action = id ? 'update' : 'add';

  const fd = new FormData();
  fd.append('id',               id);
  fd.append('local_name',       el('field-local-name').value.trim());
  fd.append('sci_name',         el('field-sci-name').value.trim());
  fd.append('family',           el('field-family').value.trim());
  fd.append('also_known',       el('field-also-known').value.trim());
  fd.append('emoji',            el('field-emoji').value.trim() || '🌿');
  fd.append('tags',             tags.join(','));
  fd.append('description',      el('field-description').value.trim());
  fd.append('uses',             el('field-uses').value.trim());
  fd.append('warnings',         el('field-warnings').value.trim());
  fd.append('care_water',       el('field-water').value.trim());
  fd.append('care_light',       el('field-light').value.trim());
  fd.append('care_soil',        el('field-soil').value.trim());
  fd.append('care_growth',      el('field-growth').value.trim());
  fd.append('care_difficulty',  el('field-difficulty').value.trim());
  fd.append('regions',          getRegionsValue());
  fd.append('height',           el('field-height').value.trim());
  fd.append('lifespan',         el('field-lifespan').value.trim());
  fd.append('flower_color',     el('field-flower-color').value.trim());
  fd.append('harvest_time',     el('field-harvest-time').value.trim());
  fd.append('video_url',        el('field-video-url').value.trim());
  fd.append('care_planting',    el('field-care-planting').value.trim());
  fd.append('care_watering',    el('field-care-watering').value.trim());
  fd.append('care_pruning',     el('field-care-pruning').value.trim());
  fd.append('care_fertilizing', el('field-care-fertilizing').value.trim());

  const imageFile = el('field-image').files[0];
  if (imageFile) fd.append('image', imageFile);

  const saveBtn  = document.querySelector('.adm-drawer-actions .adm-btn-primary');
  const origHTML = saveBtn.innerHTML;
  saveBtn.innerHTML = '<span class="adm-spinner" style="border-color:#fff3;border-top-color:#fff"></span> Saving…';
  saveBtn.disabled  = true;

  try {
    const res = await fetch(`${ADMIN_API}?action=${action}`, {
      method: 'POST',
      body:   fd,
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Non-JSON response from admin_api.php:', text);
      showToast('Server error — check console for details.', true);
      return;
    }

    if (data.success) {
      showToast(id ? 'Plant updated!' : 'Plant added!');
      closeDrawer();
      loadPlants();
    } else {
      showToast('Error: ' + (data.error || 'Something went wrong.'), true);
    }
  } catch (err) {
    showToast('Network error: ' + err.message, true);
  } finally {
    saveBtn.innerHTML = origHTML;
    saveBtn.disabled  = false;
  }
}

/* ══════════════════════════════════════════
   DELETE
══════════════════════════════════════════ */
function openDeleteConfirm(id, name) {
  deleteTargetId = id;
  el('confirm-msg').textContent =
    `"${name}" will be permanently removed from the database.`;
  el('confirm-modal').classList.add('active');
}

function closeConfirm() {
  el('confirm-modal').classList.remove('active');
  deleteTargetId = null;
}

async function confirmDelete() {
  if (!deleteTargetId) return;

  const fd = new FormData();
  fd.append('id', deleteTargetId);

  try {
    const res  = await fetch(`${ADMIN_API}?action=delete`, { method: 'POST', body: fd });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Non-JSON response from admin_api.php:', text);
      showToast('Server error — check console.', true);
      return;
    }

    if (data.success) {
      closeConfirm();
      showToast('Plant deleted.');
      loadPlants();
    } else {
      showToast('Error: ' + (data.error || 'Delete failed.'), true);
    }
  } catch (err) {
    showToast('Network error: ' + err.message, true);
  }
}

/* ══════════════════════════════════════════
   IMAGE UPLOAD AREA
══════════════════════════════════════════ */
function handleFileSelect(input) {
  if (input.files && input.files[0]) {
    showUploadPreview(input.files[0]);
  }
}

function handleDragOver(e) {
  e.preventDefault();
  el('upload-area').classList.add('drag-over');
}

function handleDragLeave() {
  el('upload-area').classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  el('upload-area').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  el('field-image').files = dt.files;
  showUploadPreview(file);
}

function showUploadPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    el('upload-preview-img').src            = e.target.result;
    el('upload-preview-name').textContent   = file.name + ' (' + (file.size / 1024).toFixed(0) + ' KB)';
    el('upload-idle').style.display         = 'none';
    el('upload-preview').style.display      = 'flex';
  };
  reader.readAsDataURL(file);
}

function clearImageUpload(e) {
  e.stopPropagation();
  el('field-image').value              = '';
  el('upload-idle').style.display      = 'block';
  el('upload-preview').style.display   = 'none';
}

function resetUploadArea() {
  el('field-image').value              = '';
  el('upload-idle').style.display      = 'block';
  el('upload-preview').style.display   = 'none';
}

/* ══════════════════════════════════════════
   REGION COMBOBOX
══════════════════════════════════════════ */
function focusRegionInput() {
  el('region-search-input').focus();
}

function openRegionDropdown() {
  const options = el('region-options');
  const box     = el('region-combobox');
  if (!options || !box) return;
  const rect = box.getBoundingClientRect();
  options.style.top     = (rect.bottom + 4) + 'px';
  options.style.left    = rect.left + 'px';
  options.style.width   = rect.width + 'px';
  options.style.display = 'block';
  box.classList.add('open');
}

function closeRegionDropdown() {
  const options = el('region-options');
  const box     = el('region-combobox');
  if (options) options.style.display = 'none';
  if (box)     box.classList.remove('open');
  const si = el('region-search-input');
  if (si) { si.value = ''; filterRegions(''); }
}

function filterRegions(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('#region-list .region-option').forEach(label => {
    label.style.display = (!q || label.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
  document.querySelectorAll('#region-list .region-divider').forEach(div => {
    let next = div.nextElementSibling;
    let anyVisible = false;
    while (next && !next.classList.contains('region-divider')) {
      if (next.style.display !== 'none') anyVisible = true;
      next = next.nextElementSibling;
    }
    div.style.display = anyVisible ? '' : 'none';
  });
}

function updateRegionDisplay() {
  const pillContainer = el('region-pills');
  if (!pillContainer) return;
  const checked = [...document.querySelectorAll('input[name="regions"]:checked')];
  pillContainer.innerHTML = checked.map(cb => `
    <span class="region-pill">
      ${cb.value}
      <button type="button" onclick="removeRegion('${cb.value.replace(/'/g, "\\'")}', event)">×</button>
    </span>
  `).join('');
  const input = el('region-search-input');
  if (input) input.placeholder = checked.length ? '' : 'Type to search regions…';
}

function removeRegion(value, e) {
  e.stopPropagation();
  const cb = document.querySelector(`input[name="regions"][value="${value}"]`);
  if (cb) { cb.checked = false; updateRegionDisplay(); }
}

function getRegionsValue() {
  return [...document.querySelectorAll('input[name="regions"]:checked')]
    .map(cb => cb.value).join(', ');
}

function setRegions(regionsArray) {
  document.querySelectorAll('input[name="regions"]').forEach(cb => cb.checked = false);
  regionsArray.forEach(r => {
    const cb = document.querySelector(`input[name="regions"][value="${r.trim()}"]`);
    if (cb) cb.checked = true;
  });
  updateRegionDisplay();
}

// Close region dropdown when clicking outside
document.addEventListener('click', (e) => {
  const box     = el('region-combobox');
  const options = el('region-options');
  if (box && !box.contains(e.target) && options && !options.contains(e.target)) {
    closeRegionDropdown();
  }
});

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function showToast(msg, isError = false) {
  const t = el('toast');
  if (!t) return;
  t.textContent      = msg;
  t.style.background = isError ? '#3e1a1a' : '#1a2e1a';
  t.style.color      = isError ? '#ef9a9a' : '#7ed87f';
  t.style.display    = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3500);
}