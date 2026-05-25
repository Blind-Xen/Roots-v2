/* ══════════════════════════════════════════
   market/market-script.js
══════════════════════════════════════════ */

// ── User dropdown (menu + actions live in userdd.js) ──
initUserDropdown({
  user: { initials: 'KM', name: 'Karlo Mendoza', role: 'Farmer · Zamboanga del Sur' },
  onAction: (action) => {
    if (action === 'logout') alert('Logging out...');
  }
});

// ── Nav link active state ──
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    if (link.getAttribute('href') === '#') e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

console.log('Market gateway page loaded');