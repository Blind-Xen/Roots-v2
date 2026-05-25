/* ────────────────────────────────────────────────────────────
   ROOTS SELLER DASHBOARD — JavaScript
   Complete seller order management system
──────────────────────────────────────────────────────────── */

// ═══════════════════════════════════════════════════════════
// 1. SAMPLE DATA & INITIALIZATION
// ═══════════════════════════════════════════════════════════

const sampleOrders = [
  {
    id: 'TXN-2026-001',
    buyerName: 'Juan Dela Cruz',
    buyerEmail: 'juan@email.com',
    buyerPhone: '09951234567',
    buyerAddress: 'Block 5, Lot 12, Manolo Fortich, Northern Mindanao',
    status: 'pending',
    date: '2026-05-23T10:30:00',
    items: [
      { name: 'Fresh Organic Tomatoes', emoji: '🍅', quantity: 2, price: 150 },
      { name: 'Fresh Milk (1L)', emoji: '🥛', quantity: 1, price: 80 }
    ],
    subtotal: 380,
    shipping: 50,
    total: 430,
    paymentMethod: 'cod',
    notes: 'Please deliver in the morning'
  },
  {
    id: 'TXN-2026-002',
    buyerName: 'Maria Santos',
    buyerEmail: 'maria@email.com',
    buyerPhone: '09871234567',
    buyerAddress: 'Purok 3, Barangay Cugman, Cagayan de Oro City',
    status: 'processing',
    date: '2026-05-22T14:15:00',
    items: [
      { name: 'Native Chicken (Live)', emoji: '🐔', quantity: 2, price: 450 },
      { name: 'Fresh Eggs (1 Dozen)', emoji: '🥚', quantity: 3, price: 120 }
    ],
    subtotal: 1260,
    shipping: 50,
    total: 1310,
    paymentMethod: 'cod',
    notes: ''
  },
  {
    id: 'TXN-2026-003',
    buyerName: 'Ramon Rodriguez',
    buyerEmail: 'ramon@email.com',
    buyerPhone: '09761234567',
    buyerAddress: 'Consolacion, Misamis Oriental',
    status: 'shipped',
    date: '2026-05-21T09:45:00',
    items: [
      { name: 'Fresh Milk (1L)', emoji: '🥛', quantity: 5, price: 80 },
      { name: 'Fresh Butter (500g)', emoji: '🧈', quantity: 1, price: 200 }
    ],
    subtotal: 600,
    shipping: 50,
    total: 650,
    paymentMethod: 'cod',
    notes: 'Handle with care - dairy products'
  },
  {
    id: 'TXN-2026-004',
    buyerName: 'Angela Torres',
    buyerEmail: 'angela@email.com',
    buyerPhone: '09551234567',
    buyerAddress: 'Misamis Oriental Agricultural Market',
    status: 'completed',
    date: '2026-05-20T11:20:00',
    items: [
      { name: 'Fresh Organic Tomatoes', emoji: '🍅', quantity: 5, price: 150 },
      { name: 'Fresh Bell Peppers', emoji: '🫑', quantity: 3, price: 120 }
    ],
    subtotal: 1110,
    shipping: 50,
    total: 1160,
    paymentMethod: 'cod',
    notes: ''
  },
  {
    id: 'TXN-2026-005',
    buyerName: 'Carlos Mendoza',
    buyerEmail: 'carlos@email.com',
    buyerPhone: '09451234567',
    buyerAddress: 'Barangay Puntod, Cagayan de Oro',
    status: 'processing',
    date: '2026-05-19T16:30:00',
    items: [
      { name: 'Native Chicken (Live)', emoji: '🐔', quantity: 1, price: 450 },
      { name: 'Fresh Organic Tomatoes', emoji: '🍅', quantity: 2, price: 150 }
    ],
    subtotal: 750,
    shipping: 50,
    total: 800,
    paymentMethod: 'cod',
    notes: 'Customer will pick up at farm'
  },
  {
    id: 'TXN-2026-006',
    buyerName: 'Rosa Fernandez',
    buyerEmail: 'rosa@email.com',
    buyerPhone: '09351234567',
    buyerAddress: 'Tagoloan, Misamis Oriental',
    status: 'completed',
    date: '2026-05-18T13:45:00',
    items: [
      { name: 'Fresh Milk (1L)', emoji: '🥛', quantity: 3, price: 80 },
      { name: 'Fresh Cheese (250g)', emoji: '🧀', quantity: 2, price: 150 }
    ],
    subtotal: 540,
    shipping: 50,
    total: 590,
    paymentMethod: 'cod',
    notes: ''
  },
  {
    id: 'TXN-2026-007',
    buyerName: 'Paul Gutierrez',
    buyerEmail: 'paul@email.com',
    buyerPhone: '09251234567',
    buyerAddress: 'Initao, Misamis Oriental',
    status: 'pending',
    date: '2026-05-17T10:00:00',
    items: [
      { name: 'Fresh Organic Tomatoes', emoji: '🍅', quantity: 3, price: 150 },
      { name: 'Fresh Milk (1L)', emoji: '🥛', quantity: 2, price: 80 }
    ],
    subtotal: 610,
    shipping: 50,
    total: 660,
    paymentMethod: 'cod',
    notes: 'Bulk order - please confirm stock'
  },
  {
    id: 'TXN-2026-008',
    buyerName: 'Nina Reyes',
    buyerEmail: 'nina@email.com',
    buyerPhone: '09151234567',
    buyerAddress: 'Barangay Balangiga, Surigao del Sur',
    status: 'shipped',
    date: '2026-05-16T15:20:00',
    items: [
      { name: 'Fresh Eggs (1 Dozen)', emoji: '🥚', quantity: 5, price: 120 },
      { name: 'Native Chicken (Live)', emoji: '🐔', quantity: 1, price: 450 }
    ],
    subtotal: 1050,
    shipping: 50,
    total: 1100,
    paymentMethod: 'cod',
    notes: ''
  }
];

let allOrders = JSON.parse(JSON.stringify(sampleOrders));
let filteredOrders = [...allOrders];
let currentOrderModal = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
});

/**
 * Initialize the seller dashboard
 */
function initializeDashboard() {
  renderDashboard();
  setupNavigationListeners();
  setupFormListeners();
  showToast('Welcome to Roots Seller Dashboard!', 'success');
  showSwipeInstruction();
}

// ═══════════════════════════════════════════════════════════
// 2. NAVIGATION & PAGE SWITCHING
// ═══════════════════════════════════════════════════════════

/**
 * Switch between different pages
 * @param {string} pageName - Page to switch to
 */
function switchPage(pageName) {
  // Close user dropdown
  closeUserDropdown();
  
  // Hide all pages
  const pages = document.querySelectorAll('.seller-page');
  pages.forEach(page => page.classList.remove('active'));

  // Remove active class from all nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));

  // Show selected page
  const selectedPage = document.getElementById(`${pageName}-page`);
  if (selectedPage) {
    selectedPage.classList.add('active');
  }

  // Update nav link
  const activeLink = document.querySelector(`[data-page="${pageName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  // Render page-specific content
  if (pageName === 'orders') {
    renderOrdersTable();
  } else if (pageName === 'analytics') {
    renderAnalytics();
  }
}

/**
 * Setup navigation link listeners
 */
function setupNavigationListeners() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = link.getAttribute('data-page');
      switchPage(pageName);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 3. DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════

/**
 * Render dashboard with KPIs and recent orders
 */
function renderDashboard() {
  updateKPIs();
  renderRecentOrders();
}

/**
 * Update KPI cards
 */
function updateKPIs() {
  const statuses = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    processing: allOrders.filter(o => o.status === 'processing').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    completed: allOrders.filter(o => o.status === 'completed').length
  };

  document.getElementById('kpi-pending').textContent = statuses.pending;
  document.getElementById('kpi-processing').textContent = statuses.processing;
  document.getElementById('kpi-shipped').textContent = statuses.shipped;
  document.getElementById('kpi-completed').textContent = statuses.completed;

  // Update notification badge
  const totalPending = statuses.pending + statuses.processing;
  const badge = document.getElementById('notificationBadge');
  badge.textContent = totalPending;
  badge.style.display = totalPending > 0 ? 'flex' : 'none';
}

/**
 * Render recent orders (first 5 most recent)
 */
function renderRecentOrders() {
  const recentOrdersList = document.getElementById('recentOrdersList');
  const recent = allOrders.slice(0, 5);

  if (recent.length === 0) {
    recentOrdersList.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
        <div style="font-size: 18px; color: var(--dust); margin-bottom: 8px;">No orders yet</div>
      </div>
    `;
    return;
  }

  recentOrdersList.innerHTML = recent.map(order => {
    const itemSummary = order.items.map(i => i.name).slice(0, 2).join(', ');
    const moreItems = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';

    return `
      <div class="recent-order-item" onclick="openOrderModal('${order.id}')">
        <div class="order-detail-cell">
          <span class="order-detail-label">Order ID</span>
          <span class="order-detail-value">${order.id}</span>
        </div>
        <div class="order-detail-cell">
          <span class="order-detail-label">Buyer</span>
          <span class="order-detail-value">${order.buyerName}</span>
        </div>
        <div class="order-detail-cell">
          <span class="order-detail-label">Items</span>
          <span class="order-items-summary">${itemSummary}${moreItems}</span>
        </div>
        <div class="order-detail-cell">
          <span class="order-detail-label">Amount</span>
          <span class="order-amount">₱${order.total.toLocaleString()}</span>
        </div>
        <div class="order-detail-cell">
          <span class="order-detail-label">Status</span>
          <span class="status-badge ${order.status}">${formatStatus(order.status)}</span>
        </div>
        <button class="action-button" onclick="event.stopPropagation(); openOrderModal('${order.id}')">
          <i class="fas fa-eye"></i>
        </button>
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
// 4. ORDERS PAGE
// ═══════════════════════════════════════════════════════════

/**
 * Setup form listeners for filtering
 */
function setupFormListeners() {
  const searchInput = document.getElementById('orderSearch');
  const statusFilter = document.getElementById('statusFilter');

  if (searchInput) {
    searchInput.addEventListener('keyup', filterOrders);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterOrders);
  }
}

/**
 * Filter orders based on search and status
 */
function filterOrders() {
  const searchTerm = document.getElementById('orderSearch')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';

  filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm) ||
      order.buyerName.toLowerCase().includes(searchTerm) ||
      order.buyerEmail.toLowerCase().includes(searchTerm) ||
      order.buyerPhone.includes(searchTerm);

    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  renderOrdersTable();
}

/**
 * Render orders table
 */
function renderOrdersTable() {
  const tableBody = document.getElementById('ordersTableBody');

  if (filteredOrders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
          <div style="color: var(--dust);">No orders found</div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredOrders.map(order => {
    const itemSummary = order.items.length === 1 
      ? `${order.items[0].name}` 
      : `${order.items[0].name} +${order.items.length - 1}`;

    return `
      <tr>
        <td class="order-id-cell">${order.id}</td>
        <td>${order.buyerName}</td>
        <td>${itemSummary}</td>
        <td>₱${order.total.toLocaleString()}</td>
        <td><span class="status-badge ${order.status}">${formatStatus(order.status)}</span></td>
        <td>${formatDate(order.date)}</td>
        <td style="text-align: center;">
          <button class="action-button" onclick="openOrderModal('${order.id}'); event.stopPropagation();">
            <i class="fas fa-arrow-right"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
// 5. ANALYTICS PAGE
// ═══════════════════════════════════════════════════════════

/**
 * Render analytics page
 */
function renderAnalytics() {
  // Calculate metrics
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = allOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Update cards
  document.getElementById('analytics-revenue').textContent = `₱${totalRevenue.toLocaleString()}`;
  document.getElementById('analytics-orders').textContent = totalOrders;
  document.getElementById('analytics-avg').textContent = `₱${avgOrderValue.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
  document.getElementById('analytics-rating').textContent = '4.8';

  // Render status distribution
  renderStatusChart();

  // Render top products
  renderTopProducts();
}

/**
 * Render status distribution chart
 */
function renderStatusChart() {
  const statusChart = document.getElementById('statusChart');
  
  const statuses = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    processing: allOrders.filter(o => o.status === 'processing').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    completed: allOrders.filter(o => o.status === 'completed').length
  };

  const total = Object.values(statuses).reduce((a, b) => a + b, 0);
  const maxValue = Math.max(...Object.values(statuses));

  const statusLabels = {
    pending: '🟡 Pending',
    processing: '🟢 Processing',
    shipped: '🔵 Shipped',
    completed: '✅ Completed'
  };

  const statusColors = {
    pending: '#E9C46A',
    processing: '#52B788',
    shipped: '#4FACFE',
    completed: '#22C55E'
  };

  statusChart.innerHTML = Object.keys(statuses).map(status => {
    const count = statuses[status];
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return `
      <div class="chart-row">
        <div class="chart-label">${statusLabels[status]}</div>
        <div class="chart-bar-container">
          <div class="chart-bar" style="width: ${percentage}%; background: ${statusColors[status]};">
            ${count}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render top selling products
 */
function renderTopProducts() {
  const topProductsList = document.getElementById('topProductsList');

  // Calculate product sales
  const productStats = {};
  allOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productStats[item.name]) {
        productStats[item.name] = {
          emoji: item.emoji,
          quantity: 0,
          revenue: 0
        };
      }
      productStats[item.name].quantity += item.quantity;
      productStats[item.name].revenue += item.price * item.quantity;
    });
  });

  // Sort by revenue
  const sorted = Object.entries(productStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  if (sorted.length === 0) {
    topProductsList.innerHTML = '<div style="text-align: center; color: var(--dust);">No products sold yet</div>';
    return;
  }

  topProductsList.innerHTML = sorted.map(([name, stats]) => `
    <div class="product-item">
      <div class="product-info">
        <div class="product-name">${stats.emoji} ${name}</div>
        <div class="product-sales">${stats.quantity} units sold</div>
      </div>
      <div class="product-revenue">₱${stats.revenue.toLocaleString()}</div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════
// 6. ORDER MODAL
// ═══════════════════════════════════════════════════════════

/**
 * Open order detail modal
 * @param {string} orderId - Order ID to display
 */
function openOrderModal(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  currentOrderModal = order;

  // Update modal content
  document.getElementById('modalOrderId').textContent = `Order ${order.id}`;
  document.getElementById('modalStatus').className = `modal-status status-badge ${order.status}`;
  document.getElementById('modalStatus').textContent = formatStatus(order.status);

  document.getElementById('modalBuyerName').textContent = order.buyerName;
  document.getElementById('modalBuyerEmail').textContent = order.buyerEmail;
  document.getElementById('modalBuyerPhone').textContent = order.buyerPhone;
  document.getElementById('modalOrderDate').textContent = formatDate(order.date);
  document.getElementById('modalBuyerAddress').textContent = order.buyerAddress;

  // Render items
  const modalItems = document.getElementById('modalOrderItems');
  modalItems.innerHTML = order.items.map(item => `
    <div class="modal-item">
      <div>
        <strong>${item.emoji} ${item.name}</strong> (x${item.quantity})
      </div>
      <div>₱${(item.price * item.quantity).toLocaleString()}</div>
    </div>
  `).join('');

  // Update summary
  document.getElementById('modalSubtotal').textContent = `₱${order.subtotal.toLocaleString()}`;
  document.getElementById('modalShipping').textContent = `₱${order.shipping.toLocaleString()}`;
  document.getElementById('modalTotal').textContent = `₱${order.total.toLocaleString()}`;

  // Render timeline
  renderOrderTimeline(order);

  // Set notes
  document.getElementById('modalNotes').textContent = order.notes || 'No additional notes';

  // Reset status select
  document.getElementById('statusUpdateSelect').value = '';

  // Show modal
  document.getElementById('orderModal').classList.remove('hidden');
}

/**
 * Close order modal
 */
function closeOrderModal() {
  document.getElementById('orderModal').classList.add('hidden');
  currentOrderModal = null;
}

/**
 * Render order timeline
 * @param {Object} order - Order object
 */
function renderOrderTimeline(order) {
  const timeline = document.getElementById('modalTimeline');

  const events = [
    {
      title: 'Order Placed',
      time: order.date
    }
  ];

  // Add status-based events
  if (order.status === 'processing' || order.status === 'shipped' || order.status === 'completed') {
    events.push({
      title: 'Order Confirmed',
      time: new Date(new Date(order.date).getTime() + 3600000).toISOString()
    });
  }

  if (order.status === 'shipped' || order.status === 'completed') {
    events.push({
      title: 'Order Shipped',
      time: new Date(new Date(order.date).getTime() + 86400000).toISOString()
    });
  }

  if (order.status === 'completed') {
    events.push({
      title: 'Order Delivered',
      time: new Date(new Date(order.date).getTime() + 432000000).toISOString()
    });
  }

  timeline.innerHTML = events.map(event => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-title">${event.title}</div>
        <div class="timeline-time">${formatDate(event.time)}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Update order status
 */
function updateOrderStatus() {
  if (!currentOrderModal) return;

  const newStatus = document.getElementById('statusUpdateSelect').value;
  if (!newStatus) {
    showToast('Please select a status', 'error');
    return;
  }

  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!validTransitions[currentOrderModal.status].includes(newStatus)) {
    showToast(`Cannot transition from ${currentOrderModal.status} to ${newStatus}`, 'error');
    return;
  }

  // Update order
  const orderIndex = allOrders.findIndex(o => o.id === currentOrderModal.id);
  if (orderIndex >= 0) {
    allOrders[orderIndex].status = newStatus;
    currentOrderModal.status = newStatus;
  }

  // Re-render
  renderOrderTimeline(currentOrderModal);
  document.getElementById('modalStatus').className = `modal-status status-badge ${newStatus}`;
  document.getElementById('modalStatus').textContent = formatStatus(newStatus);
  
  updateKPIs();
  renderRecentOrders();
  
  showToast(`Order status updated to ${formatStatus(newStatus)}`, 'success');
  document.getElementById('statusUpdateSelect').value = '';
}

// ═══════════════════════════════════════════════════════════
// 7. UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Format order status
 * @param {string} status - Status value
 * @returns {string} Formatted status
 */
function formatStatus(status) {
  const statuses = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return statuses[status] || status;
}

/**
 * Format date to readable string
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('en-PH', options);
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');

  toast.style.background = type === 'error' ? '#DC2626' : 
                          type === 'success' ? '#52B788' : '#1C4A2A';

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

/**
 * Toggle user dropdown menu
 */
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('hidden');

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-user')) {
      dropdown.classList.add('hidden');
    }
  });
}

/**
 * Close user dropdown (helper function)
 */
function closeUserDropdown() {
  document.getElementById('userDropdown').classList.add('hidden');
}

// ═══════════════════════════════════════════════════════════
// SIDE BAR PANEL FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Open side bar panel
 */
function openSideBar() {
  const sideBar = document.getElementById('sideBarPanel');
  const overlay = document.getElementById('sideBarOverlay');
  if (sideBar && overlay) {
    sideBar.classList.add('open');
    overlay.classList.add('open');
  }
}

/**
 * Close side bar panel
 */
function closeSideBar() {
  const sideBar = document.getElementById('sideBarPanel');
  const overlay = document.getElementById('sideBarOverlay');
  if (sideBar && overlay) {
    sideBar.classList.remove('open');
    overlay.classList.remove('open');
  }
}

// ═══════════════════════════════════════════════════════════
// SWIPE GESTURE DETECTION
// ═══════════════════════════════════════════════════════════

let touchStartX = 0;
let touchEndX = 0;
let mouseStartX = 0;
let mouseEndX = 0;
const swipeThreshold = 30; // Reduced threshold for easier swiping

// Touch events for mobile
document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

// Mouse events for desktop fallback
document.addEventListener('mousedown', (e) => {
  mouseStartX = e.clientX;
});

document.addEventListener('mouseup', (e) => {
  mouseEndX = e.clientX;
  handleMouseSwipe();
});

function handleSwipe() {
  const swipeDistance = touchEndX - touchStartX;
  
  // Swipe left to open side bar (more sensitive)
  if (swipeDistance < -swipeThreshold) {
    openSideBar();
  }
  
  // Swipe right to close side bar
  if (swipeDistance > swipeThreshold) {
    closeSideBar();
  }
}

function handleMouseSwipe() {
  const swipeDistance = mouseEndX - mouseStartX;
  
  // Swipe left to open side bar (more sensitive)
  if (swipeDistance < -swipeThreshold) {
    openSideBar();
  }
  
  // Swipe right to close side bar
  if (swipeDistance > swipeThreshold) {
    closeSideBar();
  }
}

// ═══════════════════════════════════════════════════════════
// FIRST VISIT INSTRUCTION
// ═══════════════════════════════════════════════════════════

function showSwipeInstruction() {
  const hasVisited = localStorage.getItem('paymentModuleVisited');
  
  if (!hasVisited) {
    const instruction = document.getElementById('swipeInstruction');
    if (instruction) {
      instruction.style.display = 'block';
      
      // Hide instruction after animation completes (4 seconds)
      setTimeout(() => {
        instruction.style.display = 'none';
      }, 4000);
      
      // Mark as visited
      localStorage.setItem('paymentModuleVisited', 'true');
    }
  }
}

// ═══════════════════════════════════════════════════════════
// END OF SELLERDASHBOARD.JS
// ═══════════════════════════════════════════════════════════
