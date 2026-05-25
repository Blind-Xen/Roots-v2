// Roots Livestock — farm location (geolocation + map module placeholder)

/** Hook for external map module (other group). */
window.FarmMapModule = window.FarmMapModule || {
  mount(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    return el || document.getElementById('farmMapModule');
  },
  setLocation(lat, lng) {
    if (lat == null || lng == null) return;
    setFarmPickupCoords(lat, lng);
    updateFarmMapPlaceholder(lat, lng);
  },
  getLocation() {
    const lat = parseFloat(document.getElementById('farmPickupLat')?.value);
    const lng = parseFloat(document.getElementById('farmPickupLng')?.value);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  }
};

function setFarmLocationStatus(message, type) {
  const el = document.getElementById('farmLocationStatus');
  if (!el) return;
  el.textContent = message || '';
  el.className = 'farm-location-status' + (type ? ` is-${type}` : '');
}

function setFarmPickupCoords(lat, lng) {
  const latEl = document.getElementById('farmPickupLat');
  const lngEl = document.getElementById('farmPickupLng');
  if (latEl) latEl.value = lat != null ? String(lat) : '';
  if (lngEl) lngEl.value = lng != null ? String(lng) : '';
}

function updateFarmMapPlaceholder(lat, lng) {
  const inner = document.getElementById('farmMapPlaceholderInner');
  if (!inner) return;
  if (lat == null || lng == null) {
    inner.innerHTML = `
      <i class="fas fa-map-marked-alt"></i>
      <p>Map preview</p>
      <small>Interactive map module will load here (integration pending).</small>`;
    return;
  }
  const latN = Number(lat).toFixed(5);
  const lngN = Number(lng).toFixed(5);
  inner.innerHTML = `
    <i class="fas fa-map-pin"></i>
    <p>Location captured</p>
    <small class="farm-map-coords">${latN}, ${lngN}</small>
    <small>Map module can render the pin here when integrated.</small>`;
}

function matchBarangayFromGeocode(address) {
  if (!address || typeof OROQUIETA_BARANGAYS === 'undefined') return '';
  const hay = [
    address.road,
    address.neighbourhood,
    address.suburb,
    address.village,
    address.hamlet,
    address.quarter,
    address.city_district,
    address.county,
    address.display_name
  ].filter(Boolean).join(' ').toLowerCase();

  let best = '';
  let bestLen = 0;
  OROQUIETA_BARANGAYS.forEach(name => {
    const n = name.toLowerCase();
    if (hay.includes(n) && n.length > bestLen) {
      best = name;
      bestLen = n.length;
    }
  });
  return best;
}

function buildStreetFromGeocode(address, displayName) {
  const parts = [
    address.house_number,
    address.road,
    address.neighbourhood,
    address.suburb,
    address.village
  ].filter(Boolean);
  if (parts.length) return parts.join(', ');
  if (displayName) {
    const bits = displayName.split(',').map(s => s.trim()).slice(0, 3);
    return bits.join(', ');
  }
  return '';
}

async function reverseGeocodeFarmLocation(lat, lng) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) throw new Error('Could not resolve address');
  const data = await res.json();
  const addr = data.address || {};
  return {
    barangay: matchBarangayFromGeocode({ ...addr, display_name: data.display_name }),
    street: buildStreetFromGeocode(addr, data.display_name),
    displayName: data.display_name || ''
  };
}

function applyFarmLocationResult(lat, lng, geocode) {
  setFarmPickupCoords(lat, lng);
  updateFarmMapPlaceholder(lat, lng);

  const brgyEl = document.getElementById('farmPickupBarangay');
  const streetEl = document.getElementById('farmPickupStreet');

  if (geocode.barangay && brgyEl) {
    brgyEl.value = geocode.barangay;
  }
  if (geocode.street && streetEl) {
    streetEl.value = geocode.street;
  } else if (geocode.displayName && streetEl && !streetEl.value.trim()) {
    streetEl.value = geocode.displayName.split(',').slice(0, 2).join(', ').trim();
  }

  if (typeof window.FarmMapModule?.setLocation === 'function') {
    window.FarmMapModule.setLocation(lat, lng);
  }
}

function useFarmCurrentLocation() {
  const btn = document.getElementById('farmUseLocationBtn');
  if (!navigator.geolocation) {
    showToast('⚠️ Location is not supported on this device or browser');
    return;
  }

  if (btn) btn.disabled = true;
  setFarmLocationStatus('Getting your location…', 'loading');

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setFarmLocationStatus('Looking up address…', 'loading');
      try {
        const geocode = await reverseGeocodeFarmLocation(lat, lng);
        applyFarmLocationResult(lat, lng, geocode);
        if (geocode.barangay) {
          setFarmLocationStatus('Location applied — barangay detected', 'success');
          showToast('📍 Location applied to your farm address');
        } else {
          setFarmLocationStatus('Coordinates saved — please confirm barangay', 'success');
          showToast('📍 Location saved. Select your barangay if it was not detected.');
        }
      } catch (e) {
        setFarmPickupCoords(lat, lng);
        updateFarmMapPlaceholder(lat, lng);
        setFarmLocationStatus('Coordinates saved — enter address manually', 'success');
        showToast('📍 Location saved. Please confirm barangay and street.');
      }
      if (btn) btn.disabled = false;
    },
    (err) => {
      if (btn) btn.disabled = false;
      const msg = err.code === 1
        ? 'Location permission denied'
        : err.code === 2
          ? 'Location unavailable'
          : 'Location request timed out';
      setFarmLocationStatus(msg, 'error');
      showToast(`⚠️ ${msg}. You can enter the address manually.`);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

function restoreFarmLocationFromDraft(draft) {
  if (!draft) return;
  const lat = draft.lat ?? draft.pickupLat;
  const lng = draft.lng ?? draft.pickupLng;
  if (lat != null && lng != null && lat !== '' && lng !== '') {
    setFarmPickupCoords(lat, lng);
    updateFarmMapPlaceholder(lat, lng);
    setFarmLocationStatus('Saved location restored', 'success');
  }
}
