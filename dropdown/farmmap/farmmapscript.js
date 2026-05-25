// script.js — Roots · Farm Mapping Module
// Concept: "Pinpoint farm locations on a map; locate farms or buyers nearby.
//  Users can adjust privacy options."
// Uses Leaflet.js + OpenStreetMap (free, no API key needed)

/* ══════════════════════════════════════════════
   DATA — Oroquieta City, Philippines
   Center: 8.4856° N, 123.7949° E
══════════════════════════════════════════════ */
let farms = [
  { id:1, type:"farm", name:"Mario's Rice Paddy", barangay:"Brgy. Pines", crop:"Palay (NSIC Rc222)", area:"2.5 ha", contact:"+63 917 123 4567", desc:"Well-irrigated lowland rice field. 4–5 tons/ha yield. Hiring seasonal workers after planting.", seller:"Kuya Mario Santos", avatar:"👨‍🌾", verified:true, mine:true, priv:false, lat:8.4880, lng:123.7970 },
  { id:2, type:"farm", name:"Reyes Corn Farm", barangay:"Brgy. Libertad", crop:"Hybrid White Corn", area:"1.8 ha", contact:"+63 918 234 5678", desc:"Upland corn farm with drip irrigation. Open to buyers post-harvest.", seller:"Totoy Reyes", avatar:"👨‍🌾", verified:true, mine:false, priv:false, lat:8.4920, lng:123.7910 },
  { id:3, type:"farm", name:"Ana's Vegetable Plot", barangay:"Brgy. Sinuza", crop:"Tomato, Ampalaya, Kangkong", area:"0.5 ha", contact:"+63 912 345 6789", desc:"Fresh produce available weekly. Direct to buyers. Organic methods used.", seller:"Ana Reyes", avatar:"👩‍🌾", verified:true, mine:false, priv:false, lat:8.4970, lng:123.7880 },
  { id:4, type:"farm", name:"Garcia Banana Plantation", barangay:"Brgy. Maningcol", crop:"Cavendish Banana", area:"3.2 ha", contact:"+63 919 456 7890", desc:"Export-quality bananas. Wholesalers welcome.", seller:"Pedro Garcia", avatar:"👨‍🌾", verified:false, mine:false, priv:false, lat:8.4820, lng:123.8020 },
  { id:5, type:"farm", name:"Santos Coconut Farm", barangay:"Brgy. Buenavista", crop:"Coconut, Copra", area:"4.0 ha", contact:"+63 917 123 4567", desc:"Mature coconut trees. Copra and oil production. Open for co-op partnership.", seller:"Kuya Mario Santos", avatar:"👨‍🌾", verified:true, mine:true, priv:true, lat:8.4780, lng:123.8060 },
  { id:6, type:"buyer", name:"Oroquieta City Public Market", barangay:"Brgy. Poblacion", crop:"All produce", area:"—", contact:"+63 88 531 0001", desc:"Main city market. Accepts bulk deliveries Mon–Sat 4AM–8AM. Ask for Mang Ben.", seller:"City Market", avatar:"🏪", verified:true, mine:false, priv:false, lat:8.4856, lng:123.7949 },
  { id:7, type:"buyer", name:"Mendoza Trading", barangay:"Brgy. Don Tomasito", crop:"Rice, Corn, Vegetables", area:"—", contact:"+63 920 567 8901", desc:"Buys direct from farmers at fair market price. Truck pick-up available.", seller:"Rosa Mendoza", avatar:"👩‍🌾", verified:true, mine:false, priv:false, lat:8.4840, lng:123.7920 },
  { id:8, type:"da", name:"DA Oroquieta City Office", barangay:"Brgy. Pines", crop:"Government Services", area:"—", contact:"+63 88 531 1234", desc:"Provides seeds, fertilizer subsidy, training, and certification. Open Mon–Fri 8AM–5PM.", seller:"DA Office", avatar:"🏛️", verified:true, mine:false, priv:false, lat:8.4870, lng:123.7955 },
  { id:9, type:"da", name:"ATI Extension Office", barangay:"Brgy. Libertad", crop:"Training & Extension", area:"—", contact:"+63 88 531 5678", desc:"Free farming seminars, demo plots, and tools lending. Register at the office.", seller:"ATI", avatar:"🏛️", verified:true, mine:false, priv:false, lat:8.4910, lng:123.7935 },
  { id:10, type:"farm", name:"Cruz Highland Vegetables", barangay:"Brgy. Pines", crop:"Cabbage, Carrots, Chili", area:"1.0 ha", contact:"+63 910 678 9012", desc:"Highland vegetables, cooler microclimate. Excellent for cold-weather crops.", seller:"Juan dela Cruz", avatar:"👨‍🌾", verified:true, mine:false, priv:false, lat:8.4895, lng:123.7990 }
];

let map, markers = {}, activeFilter = "All", pinMode = false;
let pendingLat = null, pendingLng = null;
let historyStack = [], redoStack = [], deletingId = null, editingId = null;
let currentFarmType = "farm";
let chatMessages = [];
let listViewVisible = true;

let notifications = [
  { id:1, type:"new",     avatar:"🌾", message:"New farm pinned near Brgy. Pines — Cruz Highland Vegetables", time:"2 hours ago", unread:true,  action:"View" },
  { id:2, type:"buyer",   avatar:"🏪", message:"Mendoza Trading is looking for rice suppliers this week", time:"5 hours ago", unread:true,  action:"Contact" },
  { id:3, type:"da",      avatar:"🏛️", message:"DA Oroquieta: Free fertilizer distribution this Friday", time:"1 day ago",   unread:false, action:"Details" },
  { id:4, type:"privacy", avatar:"🔒", message:"Reminder: Your Santos Coconut Farm is set to private", time:"2 days ago",   unread:false, action:"Edit" }
];

/* ══════════════════════════════════════════════
   CUSTOM MARKER ICONS
══════════════════════════════════════════════ */
function makeIcon(color, emoji) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:38px;height:38px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 10px rgba(0,0,0,.3);
      border:3px solid white;">
      <span style="transform:rotate(45deg);font-size:16px;line-height:1;">${emoji}</span>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40]
  });
}

const ICONS = {
  farm:  () => makeIcon("#2E7D32", "🌾"),
  buyer: () => makeIcon("#1565C0", "🏪"),
  da:    () => makeIcon("#6A1B9A", "🏛️"),
  mine:  () => makeIcon("#F57C00", "⭐")
};

/* ══════════════════════════════════════════════
   MAP INIT
══════════════════════════════════════════════ */
function initMap() {
  map = L.map("farmMap", { zoomControl: false }).setView([8.4856, 123.7949], 14);

  // OpenStreetMap tiles — free, no API key
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Zoom controls on right
  L.control.zoom({ position: "topright" }).addTo(map);

  // Click to drop pin
  map.on("click", onMapClick);

  // Draw all markers
  farms.forEach(f => addMarker(f));
}

function onMapClick(e) {
  if (!pinMode) return;
  pendingLat = e.latlng.lat;
  pendingLng = e.latlng.lng;
  // update coord display
  updateCoordDisplay();
  // stop pin mode, open modal
  pinMode = false;
  document.getElementById("pinModeBtn").classList.remove("active-pin");
  document.getElementById("pinModeBtn").innerHTML = '<i class="fas fa-map-pin"></i> Pin My Farm';
  document.getElementById("pinBanner").classList.add("hidden");
  map.getContainer().style.cursor = "";
  // Try reverse-geocode barangay using Nominatim
  fetchBarangay(pendingLat, pendingLng);
  openAddFarmModal();
}

function fetchBarangay(lat, lng) {
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lng=${lng}&format=json`)
    .then(r => r.json())
    .then(data => {
      const village = data.address?.village || data.address?.suburb || data.address?.neighbourhood || "";
      if (village && !document.getElementById("fBarangay").value) {
        document.getElementById("fBarangay").value = village;
      }
    })
    .catch(() => {});
}

function updateCoordDisplay() {
  const el = document.getElementById("coordDisplay");
  const txt = document.getElementById("coordText");
  if (pendingLat && pendingLng) {
    el.classList.remove("no-loc");
    txt.textContent = `${pendingLat.toFixed(5)}°N, ${pendingLng.toFixed(5)}°E`;
  } else {
    el.classList.add("no-loc");
    txt.textContent = "No location selected — click map first";
  }
}

/* ══════════════════════════════════════════════
   ADD MARKER
══════════════════════════════════════════════ */
function addMarker(f) {
  if (f.priv && !f.mine) return; // hide private non-mine farms
  const icon = ICONS[f.mine ? "mine" : f.type]();
  const m = L.marker([f.lat, f.lng], { icon });

  const popupClass = f.mine ? "popup-mine" : `popup-${f.type}`;
  const label = { farm:"Farm", buyer:"Buyer / Market", da:"DA Office" }[f.type];

  m.bindPopup(`
    <div class="map-popup">
      <span class="map-popup-badge ${popupClass}">${f.mine ? "⭐ Mine" : label}</span>
      <div class="map-popup-title">${f.name}</div>
      <div class="map-popup-sub"><i class="fas fa-map-marker-alt"></i> ${f.barangay}</div>
      ${f.crop && f.crop !== "—" ? `<div class="map-popup-sub"><i class="fas fa-seedling"></i> ${f.crop}</div>` : ""}
      <button class="map-popup-btn" onclick="openFarmDetail(${f.id})">View Details</button>
    </div>`, { maxWidth: 240 });

  m.addTo(map);
  markers[f.id] = m;
}

function removeMarker(id) {
  if (markers[id]) { map.removeLayer(markers[id]); delete markers[id]; }
}

function refreshMarkers() {
  // Remove all and re-add filtered
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  farms.forEach(f => {
    const matchFilter = matchChip(f);
    const matchQ = !q || `${f.name} ${f.barangay} ${f.crop} ${f.seller}`.toLowerCase().includes(q);
    if (matchFilter && matchQ) addMarker(f);
  });
}

function matchChip(f) {
  if (activeFilter === "All")        return true;
  if (activeFilter === "Farms")      return f.type === "farm";
  if (activeFilter === "Buyers")     return f.type === "buyer";
  if (activeFilter === "DA Offices") return f.type === "da";
  if (activeFilter === "Mine")       return f.mine;
  if (activeFilter === "Verified")   return f.verified;
  return true;
}

/* ══════════════════════════════════════════════
   STATS
══════════════════════════════════════════════ */
function renderStats() {
  const total   = farms.length;
  const buyers  = farms.filter(f => f.type === "buyer").length;
  const daCount = farms.filter(f => f.type === "da").length;
  const mine    = farms.filter(f => f.mine).length;

  document.getElementById("mapStatsRow").innerHTML = `
    <div class="ms-card"><span class="ms-num">${total}</span><span class="ms-lbl">Total Pins</span></div>
    <div class="ms-card"><span class="ms-num">${farms.filter(f=>f.type==="farm").length}</span><span class="ms-lbl">Farms</span></div>
    <div class="ms-card blue"><span class="ms-num">${buyers}</span><span class="ms-lbl">Buyers</span></div>
    <div class="ms-card purple"><span class="ms-num">${daCount}</span><span class="ms-lbl">DA Offices</span></div>
    <div class="ms-card orange"><span class="ms-num">${mine}</span><span class="ms-lbl">My Pins</span></div>
  `;
}

/* ══════════════════════════════════════════════
   CHIPS
══════════════════════════════════════════════ */
function renderChips() {
  const cats = ["All", "Farms", "Buyers", "DA Offices", "Mine", "Verified"];
  const bar = document.getElementById("categoryChips");
  bar.innerHTML = "";
  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "chip" + (cat === activeFilter ? " active" : "");
    btn.textContent = cat;
    btn.onclick = () => { activeFilter = cat; renderChips(); filterFarms(); };
    bar.appendChild(btn);
  });
}

/* ══════════════════════════════════════════════
   FILTER & RENDER LIST
══════════════════════════════════════════════ */
function filterFarms() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const filtered = farms.filter(f => {
    const matchF = matchChip(f);
    const matchQ = !q || `${f.name} ${f.barangay} ${f.crop} ${f.seller}`.toLowerCase().includes(q);
    return matchF && matchQ;
  });
  refreshMarkers();
  renderFarmList(filtered);
  document.getElementById("farmListCount").textContent = filtered.length;
  document.getElementById("farmListLabel").textContent =
    activeFilter === "All" ? "All Farms & Points" : activeFilter;
}

function renderFarmList(list) {
  const el = document.getElementById("farmList");
  el.innerHTML = "";
  if (!list.length) {
    el.innerHTML = `<div class="farm-list-empty"><i class="fas fa-map-marker-alt"></i><p>No pins found.</p></div>`;
    return;
  }
  list.forEach(f => {
    const card = document.createElement("div");
    card.className = "farm-list-card";
    card.onclick = () => { flyToFarm(f); openFarmDetail(f.id); };

    const iconClass = { farm:"fic-farm", buyer:"fic-buyer", da:"fic-da" }[f.type];
    const iconMine  = f.mine ? "fic-mine" : iconClass;
    const emoji     = { farm:"🌾", buyer:"🏪", da:"🏛️" }[f.type];
    const myEmoji   = f.mine ? "⭐" : emoji;

    const verifiedBadge = f.verified ? `<span class="flb flb-verified"><i class="fas fa-shield-alt"></i> DA</span>` : "";
    const privBadge     = f.priv     ? `<span class="flb flb-private"><i class="fas fa-lock"></i> Private</span>` : "";
    const mineBadge     = f.mine     ? `<span class="flb flb-mine"><i class="fas fa-star"></i> Mine</span>` : "";
    const cropStr       = f.crop && f.crop !== "—" ? `<div class="farm-list-meta"><i class="fas fa-seedling"></i>${f.crop}</div>` : "";
    const areaStr       = f.area && f.area !== "—" ? `<div class="farm-list-meta"><i class="fas fa-ruler-combined"></i>${f.area}</div>` : "";

    const editDel = f.mine
      ? `<button class="fla-btn danger" onclick="askDelete(${f.id},event)"><i class="fas fa-trash"></i></button>
         <button class="fla-btn"        onclick="openEditFarm(${f.id},event)"><i class="fas fa-pen"></i></button>`
      : "";

    card.innerHTML = `
      <div class="farm-list-icon ${iconMine}">${myEmoji}</div>
      <div class="farm-list-info">
        <div class="farm-list-name">${f.name}</div>
        <div class="farm-list-meta"><i class="fas fa-map-marker-alt"></i>${f.barangay}</div>
        ${cropStr}${areaStr}
        <div class="farm-list-badges">${verifiedBadge}${mineBadge}${privBadge}</div>
      </div>
      <div class="farm-list-actions">
        <button class="fla-btn contact" onclick="contactFarm(${f.id},event)"><i class="fas fa-comment"></i> Contact</button>
        ${editDel}
      </div>
    `;
    el.appendChild(card);
  });
}

/* ══════════════════════════════════════════════
   MAP CONTROLS
══════════════════════════════════════════════ */
function flyToFarm(f) {
  map.flyTo([f.lat, f.lng], 16, { duration: 1 });
  setTimeout(() => { if (markers[f.id]) markers[f.id].openPopup(); }, 1100);
}

function resetMapView() { map.flyTo([8.4856, 123.7949], 14, { duration: 1 }); }

function locateMe() {
  if (!navigator.geolocation) { showToast("❌ Geolocation not supported"); return; }
  showToast("🔍 Locating...");
  navigator.geolocation.getCurrentPosition(
    pos => { map.flyTo([pos.coords.latitude, pos.coords.longitude], 16); showToast("📍 Location found!"); },
    ()  => showToast("❌ Could not get location. Using Oroquieta City center.")
  );
}

function toggleListView() {
  listViewVisible = !listViewVisible;
  const panel = document.getElementById("farmListPanel");
  const btn   = document.getElementById("viewToggleBtn");
  panel.style.display = listViewVisible ? "" : "none";
  btn.innerHTML = listViewVisible ? '<i class="fas fa-list"></i>' : '<i class="fas fa-map"></i>';
  btn.title     = listViewVisible ? "Hide list" : "Show list";
  // resize map
  setTimeout(() => map.invalidateSize(), 300);
}

/* ══════════════════════════════════════════════
   PIN MODE
══════════════════════════════════════════════ */
function startPinMode() {
  pinMode = true;
  pendingLat = null; pendingLng = null;
  const btn = document.getElementById("pinModeBtn");
  btn.classList.add("active-pin");
  btn.innerHTML = '<i class="fas fa-crosshairs"></i> Click Map…';
  document.getElementById("pinBanner").classList.remove("hidden");
  map.getContainer().style.cursor = "crosshair";
  showToast("🎯 Tap the map to drop your pin");
}

function cancelPinMode() {
  pinMode = false;
  pendingLat = null; pendingLng = null;
  const btn = document.getElementById("pinModeBtn");
  btn.classList.remove("active-pin");
  btn.innerHTML = '<i class="fas fa-map-pin"></i> Pin My Farm';
  document.getElementById("pinBanner").classList.add("hidden");
  map.getContainer().style.cursor = "";
}

/* ══════════════════════════════════════════════
   ADD / EDIT FARM
══════════════════════════════════════════════ */
function openAddFarmModal() {
  editingId = null;
  currentFarmType = "farm";
  clearFarmForm();
  document.getElementById("addFarmTitle").innerHTML = '<i class="fas fa-map-pin"></i> Add Farm / Point';
  document.querySelectorAll(".ftype-btn").forEach(b => b.classList.toggle("active", b.dataset.ftype === "farm"));
  updateCoordDisplay();
  document.getElementById("addFarmModal").classList.remove("hidden");
}

function openEditFarm(id, e) {
  if (e) e.stopPropagation();
  const f = farms.find(x => x.id === id);
  if (!f) return;
  editingId = id;
  currentFarmType = f.type;
  pendingLat = f.lat; pendingLng = f.lng;

  document.getElementById("fName").value     = f.name;
  document.getElementById("fBarangay").value = f.barangay;
  document.getElementById("fCrop").value     = f.crop !== "—" ? f.crop : "";
  document.getElementById("fArea").value     = f.area !== "—" ? f.area : "";
  document.getElementById("fContact").value  = f.contact;
  document.getElementById("fDesc").value     = f.desc;
  document.getElementById("fPrivate").checked = f.priv;
  updatePrivacyLabel();
  updateCoordDisplay();

  document.querySelectorAll(".ftype-btn").forEach(b => b.classList.toggle("active", b.dataset.ftype === f.type));
  document.getElementById("addFarmTitle").innerHTML = '<i class="fas fa-pen"></i> Edit Pin';
  document.getElementById("addFarmModal").classList.remove("hidden");
}

function clearFarmForm() {
  ["fName","fBarangay","fCrop","fArea","fContact","fDesc"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("fPrivate").checked = false;
  updatePrivacyLabel();
}

function closeAddFarmModal() { document.getElementById("addFarmModal").classList.add("hidden"); }

function setFarmType(type) {
  currentFarmType = type;
  document.querySelectorAll(".ftype-btn").forEach(b => b.classList.toggle("active", b.dataset.ftype === type));
  const cropWrap = document.getElementById("cropFieldWrap");
  cropWrap.style.display = type === "farm" ? "" : "";
}

function updatePrivacyLabel() {
  const isPrivate = document.getElementById("fPrivate").checked;
  document.getElementById("privacyLbl").textContent  = isPrivate ? "Private" : "Public";
  document.getElementById("privacySub").textContent  = isPrivate
    ? "Only you can see the exact location"
    : "Location visible to all users";
}

function saveFarm() {
  const name = document.getElementById("fName").value.trim();
  if (!name) { showToast("⚠️ Please enter a name"); return; }
  if (!editingId && (!pendingLat || !pendingLng)) { showToast("⚠️ Please click the map to set a location"); return; }

  const obj = {
    type:      currentFarmType,
    name,
    barangay:  document.getElementById("fBarangay").value.trim() || "Oroquieta City",
    crop:      document.getElementById("fCrop").value.trim()     || "—",
    area:      document.getElementById("fArea").value.trim()     || "—",
    contact:   document.getElementById("fContact").value.trim()  || "+63 917 123 4567",
    desc:      document.getElementById("fDesc").value.trim()     || "No description.",
    priv:      document.getElementById("fPrivate").checked,
    seller:    "Kuya Mario Santos", avatar:"👨‍🌾",
    verified:  true, mine: true,
    lat:       pendingLat || 8.4856,
    lng:       pendingLng || 123.7949
  };

  if (editingId) {
    const idx = farms.findIndex(f => f.id === editingId);
    const old = { ...farms[idx] };
    farms[idx] = { ...farms[idx], ...obj };
    historyStack.push({ action:"edit", id:editingId, old });
    removeMarker(editingId);
    addMarker(farms[idx]);
    showToast("✅ Pin updated!");
  } else {
    const newFarm = { id: Date.now(), ...obj };
    farms.push(newFarm);
    historyStack.push({ action:"add", id:newFarm.id });
    addMarker(newFarm);
    flyToFarm(newFarm);
    showToast("📍 Farm pinned!");
  }

  redoStack = [];
  pendingLat = null; pendingLng = null;
  closeAddFarmModal();
  renderStats(); filterFarms();
}

/* ══════════════════════════════════════════════
   FARM DETAIL
══════════════════════════════════════════════ */
function openFarmDetail(id) {
  const f = farms.find(x => x.id === id);
  if (!f) return;

  const typeLabel = { farm:"🌾 Farm", buyer:"🏪 Buyer / Market", da:"🏛️ DA Office" }[f.type];
  const iconClass = { farm:"fic-farm", buyer:"fic-buyer", da:"fic-da" }[f.type];
  const iconMine  = f.mine ? "fic-mine" : iconClass;
  const emoji     = { farm:"🌾", buyer:"🏪", da:"🏛️" }[f.type];

  const privLine  = f.mine ? `<div class="fm-detail-info-row"><i class="fas fa-${f.priv ? "lock" : "globe"}"></i>${f.priv ? "Private — only visible to you" : "Public — visible to all"}</div>` : "";
  const editBtn   = f.mine ? `<button class="btn secondary" onclick="closeFarmDetail();openEditFarm(${f.id})"><i class="fas fa-pen"></i> Edit</button>` : "";

  document.getElementById("farmDetailContent").innerHTML = `
    <div class="fm-detail-header">
      <div class="farm-list-icon ${iconMine}" style="width:60px;height:60px;border-radius:16px;font-size:26px;">${f.mine ? "⭐" : emoji}</div>
      <div>
        <div class="fm-detail-name">${f.name}</div>
        <div class="fm-detail-type">${typeLabel}${f.mine ? " • <strong style='color:#F57C00'>My Pin</strong>" : ""}${f.verified ? " • <span style='color:#2E7D32'><i class='fas fa-shield-alt'></i> DA Verified</span>" : ""}</div>
      </div>
    </div>
    <div class="fm-detail-info-row"><i class="fas fa-map-marker-alt"></i>${f.barangay}</div>
    ${f.crop !== "—" ? `<div class="fm-detail-info-row"><i class="fas fa-seedling"></i>${f.crop}</div>` : ""}
    ${f.area !== "—" ? `<div class="fm-detail-info-row"><i class="fas fa-ruler-combined"></i>${f.area}</div>` : ""}
    <div class="fm-detail-info-row"><i class="fas fa-phone"></i>${f.contact}</div>
    <div class="fm-detail-info-row"><i class="fas fa-user"></i>${f.seller}</div>
    ${privLine}
    <div class="fm-detail-info-row"><i class="fas fa-map-pin"></i>${f.lat.toFixed(4)}°N, ${f.lng.toFixed(4)}°E</div>
    <div style="margin:12px 0;padding:12px;background:var(--chip-bg);border-radius:10px;font-size:14px;color:var(--text);line-height:1.55;">${f.desc}</div>
    <div class="fm-detail-actions">
      <button class="btn primary" onclick="contactFarmById(${f.id})"><i class="fas fa-comment"></i> Contact</button>
      ${editBtn}
    </div>
  `;
  document.getElementById("farmDetailModal").classList.remove("hidden");
}

function closeFarmDetail() { document.getElementById("farmDetailModal").classList.add("hidden"); }

/* ══════════════════════════════════════════════
   CONTACT
══════════════════════════════════════════════ */
function contactFarm(id, e) { if (e) e.stopPropagation(); contactFarmById(id); }
function contactFarmById(id) {
  const f = farms.find(x => x.id === id);
  if (!f) return;
  closeFarmDetail();
  chatMessages = [{ sender:"them", message:`Hi! I'm ${f.seller}. Asking about ${f.name}? How can I help you?`, time:"now" }];
  document.getElementById("messengerName").textContent = f.seller;
  document.getElementById("messengerAvatar").textContent = f.avatar;
  renderChatMessages();
  document.getElementById("messengerModal").classList.remove("hidden");
}

/* ══════════════════════════════════════════════
   DELETE
══════════════════════════════════════════════ */
function askDelete(id, e) {
  if (e) e.stopPropagation();
  const f = farms.find(x => x.id === id);
  if (!f) return;
  deletingId = id;
  document.getElementById("deleteMsg").textContent = `Remove pin for "${f.name}"?`;
  document.getElementById("deleteModal").classList.remove("hidden");
}

function confirmDelete() {
  const idx = farms.findIndex(f => f.id === deletingId);
  if (idx !== -1) {
    historyStack.push({ action:"delete", item: { ...farms[idx] } });
    removeMarker(deletingId);
    farms.splice(idx, 1);
    redoStack = [];
    showToast("🗑️ Pin removed");
    renderStats(); filterFarms();
  }
  closeDeleteModal();
}

function closeDeleteModal() { document.getElementById("deleteModal").classList.add("hidden"); }

/* ══════════════════════════════════════════════
   UNDO / REDO
══════════════════════════════════════════════ */
function undoLastAction() {
  if (!historyStack.length) { showToast("Nothing to undo"); return; }
  const last = historyStack.pop();
  redoStack.push(last);
  if (last.action === "add") {
    const idx = farms.findIndex(f => f.id === last.id);
    if (idx !== -1) { removeMarker(last.id); farms.splice(idx, 1); }
    showToast("↩️ Pin add undone");
  } else if (last.action === "edit") {
    const idx = farms.findIndex(f => f.id === last.id);
    if (idx !== -1) { removeMarker(last.id); farms[idx] = { ...farms[idx], ...last.old }; addMarker(farms[idx]); }
    showToast("↩️ Edit undone");
  } else if (last.action === "delete") {
    farms.push(last.item); addMarker(last.item);
    showToast("↩️ Pin restored");
  }
  renderStats(); filterFarms();
}

function redoLastAction() {
  if (!redoStack.length) { showToast("Nothing to redo"); return; }
  const last = redoStack.pop();
  historyStack.push(last);
  showToast("↪️ Redo applied");
  renderStats(); filterFarms();
}

function goBack() { if (historyStack.length) { undoLastAction(); return; } showToast("No previous action"); }

/* ══════════════════════════════════════════════
   VOICE SEARCH
══════════════════════════════════════════════ */
function startVoiceSearch() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = "en-PH"; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = () => showToast("🎤 Listening...");
    rec.onresult = e => {
      const t = e.results[0][0].transcript;
      document.getElementById("searchInput").value = t;
      filterFarms(); showToast(`🔍 "${t}"`);
    };
    rec.onerror = () => showToast("❌ Voice search failed");
    rec.start();
  } else { showToast("❌ Voice search not supported"); }
}

/* ══════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════ */
function showMyPins(e) {
  e.preventDefault(); closeSidebar();
  activeFilter = "Mine"; renderChips(); filterFarms();
  showToast("⭐ Showing My Pins");
}
function exportMapData(e) {
  e.preventDefault(); closeSidebar();
  const data = JSON.stringify(farms.filter(f=>f.mine), null, 2);
  const blob = new Blob([data], { type:"application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "roots-farm-pins.json"; a.click();
  showToast("📁 Farm data exported!");
}
function showSettings(e)        { e.preventDefault(); closeSidebar(); showToast("⚙️ Settings coming soon"); }
function showAccountSettings(e) { e.preventDefault(); closeSidebar(); showToast("👤 Account settings coming soon"); }
function showLanguages(e)       { e.preventDefault(); closeSidebar(); showToast("🌍 Language selection coming soon"); }

/* ══════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════ */
function switchModule(n) {
  const m = ["Dashboard","Videos","Livestock","Fruits & Veg","Land & Equip","Map","Calendar","Documents","Payments","Community"];
  if (n === 5) { showToast("📍 You are here: Farm Map"); return; }
  showToast(`📍 Switching to ${m[n]}…`);
}

function setViewport(w) {
  document.body.style.width = w + "px";
  document.body.style.margin = "0 auto";
  document.body.style.overflowY = "auto";
  document.documentElement.style.overflowY = "auto";
  setTimeout(() => map && map.invalidateSize(), 400);
  showToast(`📱 Viewport: ${w}px`);
}

/* ══════════════════════════════════════════════
   SIDEBAR / THEME
══════════════════════════════════════════════ */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.body.classList.toggle("sidebar-open");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("active");
  document.body.classList.remove("sidebar-open");
}
function setTheme(theme) {
  document.body.classList.remove("dark-theme","light-theme");
  document.body.classList.add(theme + "-theme");
  localStorage.setItem("theme", theme);
  document.querySelector(".light-mode").classList.toggle("active", theme === "light");
  document.querySelector(".dark-mode").classList.toggle("active",  theme === "dark");
  showToast(theme === "dark" ? "🌙 Dark mode" : "☀️ Light mode");
}
function initTheme() { setTheme(localStorage.getItem("theme") || "light"); }

function toggleNavLabels() {
  const nav = document.getElementById("bottomNav");
  const btn = document.getElementById("toggle-nav-labels");
  nav.classList.toggle("hide-others");
  nav.classList.toggle("hide-nav");
  btn.innerHTML = nav.classList.contains("hide-nav") ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
  showToast(nav.classList.contains("hide-nav") ? "Navigation hidden" : "Navigation shown");
}

/* ══════════════════════════════════════════════
   FARMER INFO / NOTIFICATIONS / MESSENGER
══════════════════════════════════════════════ */
function showFarmerInfo()  { document.getElementById("farmerInfoModal").classList.remove("hidden"); }
function closeFarmerInfo() { document.getElementById("farmerInfoModal").classList.add("hidden"); }

function showNotifications() { renderNotifications(); document.getElementById("notificationsModal").classList.remove("hidden"); }
function closeNotifications() { document.getElementById("notificationsModal").classList.add("hidden"); }

function renderNotifications() {
  const list = document.getElementById("notificationsList");
  list.innerHTML = "";
  notifications.forEach(n => {
    const item = document.createElement("div");
    item.className = `notification-item${n.unread ? " unread" : ""}`;
    item.onclick = () => { n.unread = false; renderNotifications(); showToast("📋 " + n.message.substring(0,45) + "…"); };
    item.innerHTML = `
      <div class="notification-avatar">${n.avatar}</div>
      <div class="notification-content">
        <div class="notification-message">${n.message}</div>
        <div class="notification-time">${n.time}</div>
      </div>
      <div class="notification-action">${n.action}</div>
    `;
    list.appendChild(item);
  });
  const unread = notifications.filter(n => n.unread).length;
  const badge  = document.querySelector(".notif .badge");
  if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? "flex" : "none"; }
}
function markAllAsRead()          { notifications.forEach(n => n.unread = false); renderNotifications(); showToast("✅ All read"); }
function clearAllNotifications()  { notifications = []; renderNotifications(); showToast("🗑️ Cleared"); }

function closeMessenger() { document.getElementById("messengerModal").classList.add("hidden"); }
function renderChatMessages() {
  const chat = document.getElementById("messengerChat");
  chat.innerHTML = chatMessages.map(m =>
    `<div class="chat-message ${m.sender === "me" ? "sent" : "received"}">
       <div class="message-content">${m.message}</div>
       <div class="message-time">${m.time}</div>
     </div>`
  ).join("");
  chat.scrollTop = chat.scrollHeight;
}
function sendMessage() {
  const input = document.getElementById("messageInput");
  const msg   = input.value.trim();
  if (!msg) return;
  chatMessages.push({ sender:"me", message:msg, time:"now" });
  input.value = "";
  renderChatMessages();
  setTimeout(() => {
    chatMessages.push({ sender:"them", message:"Thank you! I'll get back to you shortly.", time:"now" });
    renderChatMessages();
  }, 1600);
}
function handleMessageKeyPress(e) { if (e.key === "Enter") sendMessage(); }
function startVoiceCall() { showToast("📞 Starting voice call…"); }
function startVideoCall() { showToast("📹 Starting video call…"); }

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.style.display = "block"; t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.display = "none"; }, 3000);
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
window.onload = () => {
  initTheme();
  initMap();
  renderStats();
  renderChips();
  filterFarms();
  renderNotifications();

  document.getElementById("toggle-nav-labels").addEventListener("click", toggleNavLabels);

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undoLastAction(); }
    if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redoLastAction(); }
    if (e.key === "Escape") {
      ["addFarmModal","farmDetailModal","deleteModal","farmerInfoModal","notificationsModal","messengerModal"]
        .forEach(id => document.getElementById(id).classList.add("hidden"));
      cancelPinMode();
      closeSidebar();
    }
  });

  setViewport(375);
};
