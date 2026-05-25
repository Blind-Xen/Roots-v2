// ===== ADMIN PANEL FUNCTIONALITY =====

let adminFilter = 'all';

// Check authentication on page load
function checkAuthentication() {
  const isLoggedIn = localStorage.getItem('rootsAdminLoggedIn') === 'true';
  const loginTime = parseInt(localStorage.getItem('rootsAdminLoginTime') || '0');
  const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  
  if (!isLoggedIn || (Date.now() - loginTime >= sessionTimeout)) {
    // Not authenticated or session expired, redirect to login
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}

function adminLogout() {
  localStorage.removeItem('rootsAdminLoggedIn');
  localStorage.removeItem('rootsAdminLoginTime');
  showToast('👋 Logged out successfully');
  setTimeout(() => {
    window.location.href = 'admin-login.html';
  }, 500);
}

function toggleAdminSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('adminSidebarOverlay');
  const content = document.getElementById('adminContent');
  
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  content.classList.toggle('shifted');
}

function filterAdminVideos(filter) {
  adminFilter = filter;
  
  // Update active tab
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.filter === filter) {
      tab.classList.add('active');
    }
  });
  
  renderAdminVideos();
}

function renderAdminVideos() {
  const grid = document.getElementById('adminVideoGrid');
  if (!grid) {
    console.warn('adminVideoGrid element not found');
    return;
  }
  
  // Get all videos (both local and from videosData)
  const allVideosList = [...videosData, ...allVideos];
  
  // Filter based on admin filter
  let filteredVideos = allVideosList;
  
  if (adminFilter === 'pending') {
    filteredVideos = allVideosList.filter(v => !v.isApproved && v.status !== 'revoked');
  } else if (adminFilter === 'approved') {
    filteredVideos = allVideosList.filter(v => v.isApproved && v.status !== 'revoked');
  } else if (adminFilter === 'revoked') {
    filteredVideos = allVideosList.filter(v => v.status === 'revoked');
  }
  
  if (filteredVideos.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="fas fa-shield-alt" style="font-size: 48px; color: var(--dust); margin-bottom: 16px;"></i>
        <h3 style="color: var(--slate); margin-bottom: 8px;">No videos found</h3>
        <p style="color: var(--dust);">No videos match the current filter.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filteredVideos.map(v => {
    const status = v.status === 'revoked' ? 'revoked' : (v.isApproved ? 'approved' : 'pending');
    const statusClass = status === 'pending' ? 'status-pending' : (status === 'approved' ? 'status-approved' : 'status-revoked');
    const statusText = status === 'pending' ? 'Pending' : (status === 'approved' ? 'Approved' : 'Revoked');
    
    return `
      <div class="video-card">
        <div class="thumbnail" style="background-image:url('${v.thumbnail}')" onclick="openVideoPlayer(${v.id})">
          <div class="duration">${v.duration || 'N/A'}</div>
          <div style="position: absolute; top: 8px; right: 8px;">
            <span class="video-status-badge ${statusClass}">${statusText}</span>
          </div>
        </div>
        <div class="video-info">
          <div class="video-title">${v.title}</div>
          <div class="video-meta">
            ${v.uploader || 'Unknown'} • ${v.date || 'recently'}
          </div>
          <div class="video-meta">
            <i class="fas fa-eye"></i> ${v.views || '0'} views
          </div>
          <div class="admin-actions">
            ${status === 'pending' ? `
              <button class="admin-btn approve" onclick="approveVideo(${v.id})">
                <i class="fas fa-check"></i> Approve
              </button>
              <button class="admin-btn revoke" onclick="revokeVideo(${v.id})">
                <i class="fas fa-ban"></i> Revoke
              </button>
            ` : status === 'approved' ? `
              <button class="admin-btn revoke" onclick="revokeVideo(${v.id})">
                <i class="fas fa-ban"></i> Revoke
              </button>
              <button class="admin-btn delete" onclick="deleteVideo(${v.id})">
                <i class="fas fa-trash"></i> Delete
              </button>
            ` : `
              <button class="admin-btn approve" onclick="approveVideo(${v.id})">
                <i class="fas fa-check"></i> Restore
              </button>
              <button class="admin-btn delete" onclick="deleteVideo(${v.id})">
                <i class="fas fa-trash"></i> Delete
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  updateAdminStats();
}

function approveVideo(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) {
    showToast('❌ Video not found');
    return;
  }
  
  video.isApproved = true;
  video.status = 'approved';
  
  // Update in localStorage if it's a local video
  if (allVideos.includes(video)) {
    persistLocalVideos();
  }
  
  // Broadcast approval to main videos page
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('roots_admin_sync');
    channel.postMessage({ type: 'video_approved', videoId: id });
  }
  
  showToast('✅ Video approved successfully');
  renderAdminVideos();
}

function revokeVideo(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) {
    showToast('❌ Video not found');
    return;
  }
  
  if (!confirm('Are you sure you want to revoke this video? It will no longer be visible to users.')) {
    return;
  }
  
  video.isApproved = false;
  video.status = 'revoked';
  
  // Update in localStorage if it's a local video
  if (allVideos.includes(video)) {
    persistLocalVideos();
  }
  
  // Broadcast revocation to main videos page
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('roots_admin_sync');
    channel.postMessage({ type: 'video_revoked', videoId: id });
  }
  
  showToast('⚠️ Video revoked successfully');
  renderAdminVideos();
}

function deleteVideo(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) {
    showToast('❌ Video not found');
    return;
  }
  
  if (!confirm('Are you sure you want to permanently delete this video? This action cannot be undone.')) {
    return;
  }
  
  // Remove from videosData
  const index = videosData.findIndex(v => v.id === id);
  if (index > -1) {
    videosData.splice(index, 1);
  }
  
  // Remove from allVideos
  const localIndex = allVideos.findIndex(v => v.id === id);
  if (localIndex > -1) {
    allVideos.splice(localIndex, 1);
    persistLocalVideos();
  }
  
  // Remove from IndexedDB if blob exists
  if (video.videoBlobId) {
    idbDeleteVideoBlob(video.videoBlobId);
  }
  
  if (video.thumbnailBlobId) {
    idbDeleteThumbnailBlob(video.thumbnailBlobId);
  }
  
  showToast('🗑️ Video deleted permanently');
  renderAdminVideos();
}

function updateAdminStats() {
  const allVideosList = [...videosData, ...allVideos];
  
  const pending = allVideosList.filter(v => !v.isApproved && v.status !== 'revoked').length;
  const approved = allVideosList.filter(v => v.isApproved && v.status !== 'revoked').length;
  const revoked = allVideosList.filter(v => v.status === 'revoked').length;
  
  const pendingEl = document.getElementById('pendingCount');
  const approvedEl = document.getElementById('approvedCount');
  const revokedEl = document.getElementById('revokedCount');
  
  if (pendingEl) pendingEl.textContent = pending;
  if (approvedEl) approvedEl.textContent = approved;
  if (revokedEl) revokedEl.textContent = revoked;
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication first
  if (!checkAuthentication()) {
    return;
  }
  
  renderAdminVideos();
});
