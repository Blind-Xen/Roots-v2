// Oroquieta City barangays — single source for all location dropdowns
const OROQUIETA_BARANGAYS = [
  'Apil', 'Binuangan', 'Bolibol', 'Buenavista', 'Bunga', 'Buntawan', 'Burgos',
  'Canubay', 'Ciriaco Pastrano', 'Clarin Settlement', 'Dolipos Alto', 'Dolipos Bajo',
  'Dulapo', 'Dullan Norte', 'Dullan Sur', 'Lower Lamac', 'Upper Lamac',
  'Lower Langcangan', 'Proper Langcangan', 'Upper Langcangan', 'Layawan',
  'Lower Loboc', 'Upper Loboc', 'Malindang', 'Mialen', 'Mobod', 'Paypayan', 'Pines',
  'Poblacion I', 'Poblacion II', 'Lower Rizal', 'Upper Rizal',
  'San Vicente Alto', 'San Vicente Bajo', 'Sebucal', 'Senote',
  'Taboc Norte', 'Taboc Sur', 'Talairon', 'Talic', 'Tipan', 'Toliyok',
  'Tuyabang Alto', 'Tuyabang Bajo', 'Proper Tuyabang', 'Victoria', 'Villaflor'
];

function populateBarangaySelect(selectEl) {
  if (!selectEl) return;
  const saved = selectEl.value;
  selectEl.innerHTML = '<option value="">-- Select barangay --</option>';
  OROQUIETA_BARANGAYS.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    selectEl.appendChild(opt);
  });
  if (saved && OROQUIETA_BARANGAYS.includes(saved)) selectEl.value = saved;
}

function initBarangaySelects() {
  populateBarangaySelect(document.getElementById('listingLocation'));
  populateBarangaySelect(document.getElementById('farmPickupBarangay'));
}
