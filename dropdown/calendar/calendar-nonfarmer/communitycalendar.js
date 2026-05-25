// ======================================================================
// communitycalendar.js — Community Mini Calendar for Roots Feed
// ======================================================================

// State
let miniCalYear = new Date().getFullYear();
let miniCalMonth = new Date().getMonth();

// Community events data (simplified for feed)
const communityEvents = [
  { dateKey: getMiniDateKey(addMiniDays(new Date(), 2)),  emoji: '🌾', title: 'Palay Harvest – Available for Pickup' },
  { dateKey: getMiniDateKey(addMiniDays(new Date(), 5)),  emoji: '🍌', title: 'Banana Harvest – Lakatan Ready' },
  { dateKey: getMiniDateKey(addMiniDays(new Date(), 8)),  emoji: '🌱', title: 'DA Corn Seed Distribution' },
  { dateKey: getMiniDateKey(addMiniDays(new Date(), 11)), emoji: '🥬', title: 'Fresh Vegetables – Farm Gate Sale' },
  { dateKey: getMiniDateKey(addMiniDays(new Date(), 15)), emoji: '🥥', title: 'Coconut Harvest – Copra Ready' }
];

// Date utilities
function getMiniDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function addMiniDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Render mini calendar
function renderCommunityMiniCalendar() {
  const grid = document.getElementById('communityMiniCalGrid');
  const label = document.getElementById('communityMiniCalLabel');
  if (!grid) return;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (label) label.textContent = `${months[miniCalMonth]} ${miniCalYear}`;

  const firstDay = new Date(miniCalYear, miniCalMonth, 1).getDay();
  const daysInMonth = new Date(miniCalYear, miniCalMonth + 1, 0).getDate();
  const todayKey = getMiniDateKey(new Date());

  let html = '';

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="mini-cal-day"></div>';
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${miniCalYear}-${String(miniCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateKey === todayKey;
    const hasEvent = communityEvents.some(e => e.dateKey === dateKey);
    
    html += `<div class="mini-cal-day${isToday ? ' mini-today' : ''}${hasEvent ? ' mini-has-event' : ''}" 
                  title="${hasEvent ? getEventTitle(dateKey) : ''}">${d}</div>`;
  }

  // Fill remaining cells to complete 6-row grid (42 cells)
  const filled = firstDay + daysInMonth;
  for (let i = filled; i < 42; i++) {
    html += '<div class="mini-cal-day"></div>';
  }

  grid.innerHTML = html;
}

function getEventTitle(dateKey) {
  const event = communityEvents.find(e => e.dateKey === dateKey);
  return event ? `${event.emoji} ${event.title}` : '';
}

// Navigation
function miniCalPrevMonth() {
  miniCalMonth--;
  if (miniCalMonth < 0) {
    miniCalMonth = 11;
    miniCalYear--;
  }
  renderCommunityMiniCalendar();
}

function miniCalNextMonth() {
  miniCalMonth++;
  if (miniCalMonth > 11) {
    miniCalMonth = 0;
    miniCalYear++;
  }
  renderCommunityMiniCalendar();
}

function miniCalGoToToday() {
  miniCalYear = new Date().getFullYear();
  miniCalMonth = new Date().getMonth();
  renderCommunityMiniCalendar();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderCommunityMiniCalendar();
});
