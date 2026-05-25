/* ─── ROUTES (mirrors shared/routes.js) ─────────────────────────────────────
   Keep in sync with shared/routes.js.
   resolveRoute() prepends the app root from <meta name="app-root"> in your
   page, so paths work regardless of where this file is served from.
────────────────────────────────────────────────────────────────────────────── */
const AdminRoutes = {
  documents:    '/dropdown/document/document.html',
  calendar:     '/admin/calendar-admin/calendar-admin.html',
  tanimbase:    '/admin/tanim-admin/tanim-admin.html',
  registration: '/admin/registration/index.html',
  livestock:    '/admin/livestock/index.html',
  fruitsVeg:    '/admin/fruits-veg/index.html',
  equipment:    '/admin/equipment/index.html',
  payment:      '/dropdown/payment/payment.html',
  farmmapping:  '/dropdown/farmmap/farmmap.html',
  farmtube:     '/video/admin/admin-login.html',
};

function resolveRoute(key) {
  const root = document.querySelector('meta[name="app-root"]')?.content || '/';
  const path = AdminRoutes[key] || '#';
  return root.replace(/\/$/, '') + path;
}

// ─── MODULE DATA ─────────────────────────────────────────────────────────────
const MODULES = [
  {
    id: "documents",
    name: "Documents",
    desc: "File management, uploads & document storage",
    icon: "ti-files",
    color: "ic-blue",
    status: "live",
    meta: "Files & folders",
    routeKey: "documents",
  },
  {
    id: "calendar",
    name: "Calendar",
    desc: "Events, schedules & booking management",
    icon: "ti-calendar",
    color: "ic-purple",
    status: "live",
    meta: "Events & dates",
    routeKey: "calendar",
  },
  {
    id: "tanimbase",
    name: "Tanimbase",
    desc: "Core farm database & central data records",
    icon: "ti-database",
    color: "ic-green",
    status: "live",
    meta: "Central records",
    routeKey: "tanimbase",
  },
  {
    id: "registration",
    name: "Registration",
    desc: "Member & farmer onboarding and profiles",
    icon: "ti-user-plus",
    color: "ic-teal",
    status: "live",
    meta: "Members & profiles",
    routeKey: "registration",
  },
  {
    id: "livestock",
    name: "Livestock",
    desc: "Animal inventory, health & breeding records",
    icon: "ti-horse",
    color: "ic-amber",
    status: "live",
    meta: "Animal records",
    routeKey: "livestock",
  },
  {
    id: "fruits-veg",
    name: "Fruits & Vegetables",
    desc: "Crop tracking, harvest & produce catalog",
    icon: "ti-plant",
    color: "ic-lime",
    status: "live",
    meta: "Produce catalog",
    routeKey: "fruitsVeg",
  },
  {
    id: "equipment",
    name: "Equipment",
    desc: "Farm tools, machinery & maintenance logs",
    icon: "ti-tractor",
    color: "ic-orange",
    status: "live",
    meta: "Assets & logs",
    routeKey: "equipment",
  },
  {
    id: "payment",
    name: "Payment",
    desc: "Transactions, invoices & financial records",
    icon: "ti-credit-card",
    color: "ic-rose",
    status: "beta",
    meta: "Finance & billing",
    routeKey: "payment",
  },
  {
    id: "farmmapping",
    name: "Farm Mapping",
    desc: "Land parcels, GPS zones & field visualization",
    icon: "ti-map-2",
    color: "ic-sky",
    status: "live",
    meta: "Maps & parcels",
    routeKey: "farmmapping",
  },
  {
    id: "farmtube",
    name: "FarmTube",
    desc: "Video content, tutorials & farm media library",
    icon: "ti-video",
    color: "ic-amber",
    status: "dev",
    meta: "Media & videos",
    routeKey: "farmtube",
  },
];

// ─── STATUS LABELS / CLASSES ──────────────────────────────────────────────────
const STATUS_LABEL = { live: "Live", beta: "Beta", dev: "Dev" };
const STATUS_CLASS = { live: "status-live", beta: "status-beta", dev: "status-dev" };

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentFilter = "all";

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const grid        = document.getElementById("grid");
const emptyState  = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const filterBtns  = document.querySelectorAll(".filter-btn");
const sLive       = document.getElementById("s-live");
const sBeta       = document.getElementById("s-beta");
const sDev        = document.getElementById("s-dev");

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  const query = searchInput.value.toLowerCase().trim();

  const visible = MODULES.filter((m) => {
    const matchQuery =
      m.name.toLowerCase().includes(query) ||
      m.desc.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query);
    const matchFilter =
      currentFilter === "all" || m.status === currentFilter;
    return matchQuery && matchFilter;
  });

  // Update stat counts (always from full list)
  sLive.textContent = MODULES.filter((m) => m.status === "live").length;
  sBeta.textContent = MODULES.filter((m) => m.status === "beta").length;
  sDev.textContent  = MODULES.filter((m) => m.status === "dev").length;

  // Toggle empty state
  if (visible.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  grid.innerHTML = visible
    .map(
      (m) => `
      <a class="mod-card" href="${resolveRoute(m.routeKey)}" data-id="${m.id}">
        <div class="mod-top">
          <div class="mod-icon ${m.color}">
            <i class="ti ${m.icon}" aria-hidden="true"></i>
          </div>
          <i class="ti ti-arrow-right mod-arrow" aria-hidden="true"></i>
        </div>
        <div class="mod-body">
          <div class="mod-name">${m.name}</div>
          <div class="mod-desc">${m.desc}</div>
        </div>
        <div class="mod-footer">
          <span class="mod-meta">${m.meta}</span>
          <span class="mod-status ${STATUS_CLASS[m.status]}">${STATUS_LABEL[m.status]}</span>
        </div>
      </a>
    `
    )
    .join("");
}

// ─── FILTER BUTTONS ───────────────────────────────────────────────────────────
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

// ─── SEARCH ───────────────────────────────────────────────────────────────────
searchInput.addEventListener("input", render);

// ─── INIT ─────────────────────────────────────────────────────────────────────
render();