// ======================================================================
// videos-script.js – Roots Videos Module (YouTube-style)
// Fully functional – search, categories, real YouTube player, trending
// ======================================================================

let videosData = [
  { id:1, title:"Ampalaya (Bitter Gourd) Farming – Complete Step-by-Step Guide", category:"vegetables", thumbnail:"https://i.ytimg.com/vi/-egP2IpYFSg/hqdefault.jpg", duration:"—", views:"—", uploader:"Farmer boy tv", youtubeId:"-egP2IpYFSg", date:"Featured", isLocal:false },
  { id:2, title:"Start Hydroponics Farming with ₱500 – Beginner Tutorial", category:"vegetables", thumbnail:"https://i.ytimg.com/vi/rp7MeQYmm5k/hqdefault.jpg", duration:"—", views:"—", uploader:"OG", youtubeId:"rp7MeQYmm5k", date:"Featured", isLocal:false },
  { id:3, title:"Build Your Own Calamansi Farm – Step-by-Step Guide", category:"vegetables", thumbnail:"https://i.ytimg.com/vi/GAPJgjLiMAI/hqdefault.jpg", duration:"—", views:"—", uploader:"AgriVibes TV", youtubeId:"GAPJgjLiMAI", date:"Featured", isLocal:false },
  { id:4, title:"Watermelon Farming – Complete Guide from an Expert Grower", category:"vegetables", thumbnail:"https://i.ytimg.com/vi/TB4Mh83IwUM/hqdefault.jpg", duration:"—", views:"—", uploader:"Agribusiness How It Works", youtubeId:"TB4Mh83IwUM", date:"Featured", isLocal:false },
  { id:5, title:"Kalabasa (Squash) Farming – How to Grow Step by Step", category:"vegetables", thumbnail:"https://i.ytimg.com/vi/P9APD79fd0s/hqdefault.jpg", duration:"—", views:"—", uploader:"Farmer boy tv", youtubeId:"P9APD79fd0s", date:"Featured", isLocal:false },
  { id:6, title:"Rhode Island Red Chicken Farm – Earn ₱40K Monthly", category:"livestock", thumbnail:"https://i.ytimg.com/vi/7ETeiofaK-A/hqdefault.jpg", duration:"—", views:"—", uploader:"Manok Tambayan Atbp.", youtubeId:"7ETeiofaK-A", date:"Featured", isLocal:false },
  { id:7, title:"75 Days on the Farm – Gardening, Livestock & Daily Life", category:"da", thumbnail:"https://i.ytimg.com/vi/mw-S5V2gTHA/hqdefault.jpg", duration:"—", views:"—", uploader:"Sơn Thôn", youtubeId:"mw-S5V2gTHA", date:"Featured", isLocal:false },
  { id:8, title:"Backyard Farming Success – ₱1M Income in 3–4 Months", category:"livestock", thumbnail:"https://i.ytimg.com/vi/a6z1iIAIN_4/hqdefault.jpg", duration:"—", views:"—", uploader:"Avidio Stories", youtubeId:"a6z1iIAIN_4", date:"Featured", isLocal:false },
  { id:9, title:"Rice Farming – Complete Guide from Seed to Harvest", category:"rice", thumbnail:"https://i.ytimg.com/vi/J_mMS3EkHok/hqdefault.jpg", duration:"—", views:"—", uploader:"Agribusiness How It Works", youtubeId:"J_mMS3EkHok", date:"Featured", isLocal:false },
  { id:10, title:"Traditional Corn Seedling Cultivation Methods", category:"corn", thumbnail:"https://i.ytimg.com/vi/Cau10GzuMtg/hqdefault.jpg", duration:"—", views:"—", uploader:"Farm Stories", youtubeId:"Cau10GzuMtg", date:"Featured", isLocal:false },
  { id:11, title:"Calamansi Marcotting & Air Layering for Beginners", category:"vegetables", thumbnail:"https://i.ytimg.com/vi/0vX--elh1xs/hqdefault.jpg", duration:"—", views:"—", uploader:"Mr. Saluyot", youtubeId:"0vX--elh1xs", date:"Featured", isLocal:false }
];

const CURRENT_USER = { name: 'Kuya Mario', avatar: '👨‍🌾' };
let commentSortOrder = 'newest';
let shareVideoContext = null;
let activeReplyParentId = null;

function isVideoLiked(id) {
  return localStorage.getItem(`liked_${id}`) === 'true';
}

function isCommentLiked(videoId, commentId) {
  return localStorage.getItem(`commentLiked_${videoId}_${commentId}`) === 'true';
}

function buildCardActionButtons(v) {
  const liked = isVideoLiked(v.id);
  const likeCls = liked ? 'vc-action-btn vc-action-like active' : 'vc-action-btn vc-action-like';
  const likeLabel = liked ? 'Liked' : 'Like';

  if (v.isReshared) {
    return `
      <button class="${likeCls}" onclick="event.stopPropagation(); likeVideo(${v.id})"><i class="fas fa-thumbs-up"></i> ${likeLabel}</button>
      <button class="vc-action-btn vc-action-download" onclick="event.stopPropagation(); downloadVideo(${v.id})"><i class="fas fa-download"></i> Save</button>
      <button class="vc-action-btn vc-action-delete" onclick="event.stopPropagation(); deleteVideo(${v.id})"><i class="fas fa-trash"></i> Delete</button>
    `;
  }
  if (v.isLocal) {
    const isApproved = v.isApproved === undefined || v.isApproved === true;
    if (checkAdminAccess()) {
      return `
        <button class="vc-action-btn" onclick="event.stopPropagation(); adminApproveVideo(${v.id}, ${!isApproved})" style="background:${isApproved ? '#FF9800' : '#4CAF50'};color:#fff;border:none;">
          <i class="fas fa-${isApproved ? 'ban' : 'check'}"></i> ${isApproved ? 'Revoke' : 'Approve'}
        </button>
        <button class="vc-action-btn vc-action-delete" onclick="event.stopPropagation(); adminDeleteVideo(${v.id})"><i class="fas fa-trash"></i> Delete</button>
        <button class="${likeCls}" onclick="event.stopPropagation(); likeVideo(${v.id})"><i class="fas fa-thumbs-up"></i> ${likeLabel}</button>
      `;
    }
    return `
      <button class="${likeCls}" onclick="event.stopPropagation(); likeVideo(${v.id})"><i class="fas fa-thumbs-up"></i> ${likeLabel}</button>
      <button class="vc-action-btn vc-action-reshare" onclick="event.stopPropagation(); reshareVideo(${v.id})"><i class="fas fa-retweet"></i> Reshare</button>
      <button class="vc-action-btn vc-action-delete" onclick="event.stopPropagation(); deleteVideo(${v.id})"><i class="fas fa-trash"></i> Delete</button>
    `;
  }
  return `
    <button class="${likeCls}" onclick="event.stopPropagation(); likeVideo(${v.id})"><i class="fas fa-thumbs-up"></i> ${likeLabel}</button>
    <button class="vc-action-btn vc-action-download" onclick="event.stopPropagation(); downloadVideo(${v.id})"><i class="fas fa-download"></i> Save</button>
    <button class="vc-action-btn vc-action-reshare" onclick="event.stopPropagation(); reshareVideo(${v.id})"><i class="fas fa-retweet"></i> Reshare</button>
  `;
}

function buildPlayerActionButtons(video) {
  const liked = isVideoLiked(video.id);
  const likeCls = liked ? 'yt-action-btn yt-action-like active' : 'yt-action-btn yt-action-like';
  const likeLabel = liked ? 'Liked' : 'Like';
  let html = `
    <button class="${likeCls}" id="modalLikeBtn" type="button" onclick="likeVideoYT(${video.id})"><i class="fas fa-thumbs-up"></i><span>${likeLabel}</span></button>
  `;
  if (!video.isLocal) {
    html += `<button class="yt-action-btn yt-action-download" type="button" onclick="downloadVideo(${video.id})"><i class="fas fa-download"></i><span>Save</span></button>`;
  }
  html += `
    <button class="yt-action-btn yt-action-reshare" type="button" onclick="reshareVideo(${video.id})"><i class="fas fa-retweet"></i><span>Reshare</span></button>
    <button class="yt-action-btn yt-action-share" type="button" onclick="openShareModal(${video.id})"><i class="fas fa-share-alt"></i><span>Share</span></button>
  `;
  if (checkAdminAccess() && video.isLocal) {
    html += `
      <button class="yt-action-btn" type="button" onclick="adminApproveVideo(${video.id}, ${!video.isApproved})" style="background:${video.isApproved ? '#FF9800' : '#4CAF50'};color:#fff;border:none;">
        <i class="fas fa-${video.isApproved ? 'ban' : 'check'}"></i><span>${video.isApproved ? 'Revoke' : 'Approve'}</span>
      </button>
      <button class="yt-action-btn yt-action-delete" type="button" onclick="adminDeleteVideo(${video.id})"><i class="fas fa-trash"></i><span>Delete</span></button>
    `;
  } else if (!checkAdminAccess() && video.isLocal) {
    html += `<button class="yt-action-btn yt-action-delete" type="button" onclick="deleteVideo(${video.id})"><i class="fas fa-trash"></i><span>Delete</span></button>`;
  }
  return html;
}

let currentCategory = 'all';
let currentVideoFile = null;
let currentVideoBlob = null;
let currentThumbnailFile = null;
let uploadedVideoId = null;
let allVideos = [];
let currentPreviewObjectUrl = null;
let currentPlaybackObjectUrl = null;
let isAdminMode = false;
let currentAdminUser = null;

// Admin authentication
function checkAdminAccess() {
  const adminToken = localStorage.getItem('rootsAdminToken');
  const adminUser = localStorage.getItem('rootsAdminUser');
  
  if (adminToken && adminUser) {
    currentAdminUser = adminUser;
    return true;
  }
  return false;
}

function requireAdminAccess() {
  if (!checkAdminAccess()) {
    showToast('🔒 Admin access required. Please login to admin dashboard.');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 1500);
    return false;
  }
  return true;
}

function makeSvgThumbnail(title) {
  const safe = String(title || 'Video').slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2E7D32"/>
      <stop offset="100%" stop-color="#1B5E20"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="60" cy="90" r="28" fill="rgba(255,255,255,0.18)"/>
  <polygon points="54,74 54,106 82,90" fill="rgba(255,255,255,0.85)"/>
  <text x="110" y="92" font-family="Segoe UI, Arial" font-size="16" fill="rgba(255,255,255,0.92)">${escapeXml(safe)}</text>
  <text x="110" y="116" font-family="Segoe UI, Arial" font-size="11" fill="rgba(255,255,255,0.75)">Local upload</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function extractLikelyJson(text) {
  const raw = String(text ?? '').trim();
  if (!raw) return raw;
  const firstObj = raw.indexOf('{');
  const lastObj = raw.lastIndexOf('}');
  if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
    return raw.slice(firstObj, lastObj + 1);
  }
  const firstArr = raw.indexOf('[');
  const lastArr = raw.lastIndexOf(']');
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    return raw.slice(firstArr, lastArr + 1);
  }
  return raw;
}

/** Base URL for PHP API (Apache must execute .php — not file:// or Live Server as static files). */
function getApiBase() {
  try {
    const u = new URL(window.location.href);
    const custom = (typeof localStorage !== 'undefined' && localStorage.getItem('rootsApiBase')) || '';
    if (custom) {
      return custom.endsWith('/') ? custom : `${custom}/`;
    }
    if (u.protocol === 'file:') {
      return 'http://localhost/youtube_mod/';
    }
    const port = u.port;
    const devPorts = ['5500', '5501', '5502', '5173', '5174', '3000', '4200', '8081'];
    if (devPorts.includes(port)) {
      return 'http://localhost/youtube_mod/';
    }
    return new URL('./', u.href).href;
  } catch (_) {
    return 'http://localhost/youtube_mod/';
  }
}

function apiUrl(path) {
  const p = String(path).replace(/^\//, '');
  return new URL(p, getApiBase()).href;
}

function isPhpSourceResponse(text) {
  const t = String(text ?? '').trimStart();
  return t.startsWith('<?php') || t.startsWith('<?=') || t.startsWith('<script language="php"');
}

async function fetchJsonLoose(url, options) {
  const resp = await fetch(url, options);
  const text = await resp.text();
  if (isPhpSourceResponse(text)) {
    const err = new Error(
      'The server returned PHP source code instead of running it. Open the app via XAMPP (e.g. http://localhost/youtube_mod/videos.html), not as a local file or a static dev server that does not execute PHP. Optional: localStorage.rootsApiBase = "http://localhost/youtube_mod/"'
    );
    err.name = 'PhpNotExecutedError';
    err.rawText = text;
    throw err;
  }
  const payload = extractLikelyJson(text);
  try {
    const data = payload ? JSON.parse(payload) : null;
    return { ok: resp.ok, status: resp.status, data, rawText: text };
  } catch (e) {
    const preview = String(text).slice(0, 220);
    const err = new SyntaxError(`Non-JSON response from ${url} (HTTP ${resp.status}). First chars: ${preview}`);
    err.cause = e;
    throw err;
  }
}

function openRootsVideosDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('rootsVideosDB', 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('thumbnails')) {
        db.createObjectStore('thumbnails', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPutVideoBlob(id, blob) {
  const db = await openRootsVideosDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore('videos').put({ id, blob });
  });
}

async function idbGetVideoBlob(id) {
  const db = await openRootsVideosDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readonly');
    const req = tx.objectStore('videos').get(id);
    req.onsuccess = () => resolve(req.result?.blob || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbDeleteVideoBlob(id) {
  const db = await openRootsVideosDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore('videos').delete(id);
  });
}

async function idbDeleteThumbnailBlob(id) {
  const db = await openRootsVideosDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction('thumbnails', 'readwrite');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore('thumbnails').delete(id);
  });
}

async function idbPutThumbnailBlob(id, blob) {
  const db = await openRootsVideosDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction('thumbnails', 'readwrite');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore('thumbnails').put({ id, blob });
  });
}

async function idbGetThumbnailBlob(id) {
  const db = await openRootsVideosDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction('thumbnails', 'readonly');
    const req = tx.objectStore('thumbnails').get(id);
    req.onsuccess = () => resolve(req.result?.blob || null);
    req.onerror = () => reject(req.error);
  });
}

function persistLocalVideos() {
  const safe = allVideos.map(v => {
    const copy = { ...v };
    if (typeof copy.videoUrl === 'string' && (copy.videoUrl.startsWith('data:') || copy.videoUrl.startsWith('blob:'))) {
      delete copy.videoUrl;
    }
    return copy;
  });
  localStorage.setItem('rootsLocalVideos', JSON.stringify(safe));
}

function cleanupLegacyLocalVideoCache() {
  try {
    const key = 'rootsLocalVideos';
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    let changed = false;
    const compact = parsed.map(v => {
      const copy = { ...v };
      if (typeof copy.videoUrl === 'string' && (copy.videoUrl.startsWith('data:') || copy.videoUrl.startsWith('blob:'))) {
        delete copy.videoUrl;
        changed = true;
      }
      return copy;
    });
    if (changed) {
      localStorage.setItem(key, JSON.stringify(compact));
    }
  } catch (e) {
    console.warn('Could not cleanup legacy local video cache:', e);
  }
}

function renderVideos(filteredVideos) {
  const grid = document.getElementById('videoGrid');
  if (!grid) {
    console.warn('videoGrid element not found');
    return;
  }
  grid.innerHTML = filteredVideos.length ? filteredVideos.map(v => {
    let badge = '';
    if (v.isReshared) {
      badge = '<div style="position: absolute; top: 8px; left: 8px; background: #9C27B0; color: white; font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: 600;"><i class="fas fa-retweet"></i> RESHARED</div>';
    } else if (v.isLocal) {
      const isApproved = v.isApproved === undefined || v.isApproved === true;
      badge = !isApproved
        ? '<div style="position: absolute; top: 8px; right: 8px; background: #FF9800; color: white; font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: 600;"><i class="fas fa-clock"></i> PENDING</div>'
        : '<div style="position: absolute; top: 8px; left: 8px; background: #4CAF50; color: white; font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: 600;"><i class="fas fa-check"></i> APPROVED</div>';
    }
    const actions = buildCardActionButtons(v);
    
    return `
    <div class="video-card" onclick="openVideoPlayer(${v.id})">
      <div class="thumbnail" style="background-image:url('${v.thumbnail}')">
        <div class="duration">${v.duration || 'N/A'}</div>
        ${badge}
      </div>
      <div class="video-info">
        <div class="video-title">${v.title}</div>
        <div class="video-meta">${v.uploader || 'Your Channel'} • ${v.views || '0'} views • ${v.date || 'just now'}</div>
        <div class="video-actions">
          ${actions}
        </div>
      </div>
    </div>
  `;
  }).join('') : '<div style="text-align: center; padding: 60px 20px; color: #999;"><i class="fas fa-inbox" style="font-size: 48px; display: block; margin-bottom: 16px;"></i><p>No videos found</p></div>';
}

function renderTrending() {
  const trending = videosData.slice(0, 5);
  const container = document.getElementById('trendingVideos');
  container.innerHTML = trending.map(v => `
    <div class="upcoming-item" onclick="openVideoPlayer(${v.id});" style="margin-bottom:12px;">
      <div style="width:80px;height:45px;background:url('${v.thumbnail}') center/cover;border-radius:6px;flex-shrink:0;"></div>
      <div style="flex:1;padding-left:10px;font-size:13px;line-height:1.3;">${v.title}</div>
    </div>
  `).join('');
}

function renderDaVideos() {
  // Get all videos including local uploaded videos
  const allVideosList = [...videosData, ...allVideos];
  // Filter for approved videos (admin approved)
  const approvedVideos = allVideosList.filter(v => v.isApproved && v.status !== 'revoked');
  const container = document.getElementById('daVideos');
  
  if (approvedVideos.length === 0) {
    container.innerHTML = '<p class="empty-state">No approved videos yet</p>';
    return;
  }
  
  container.innerHTML = approvedVideos.map(v => `
    <div class="da-event-item" onclick="openVideoPlayer(${v.id});">
      <div style="font-size:28px;margin-right:12px;">📺</div>
      <div style="flex:1;">${v.title}</div>
    </div>
  `).join('');
}

function renderCategoryChips() {
  const categories = ['all','rice','corn','livestock','banana','cassava','sweetPotato','coconut','vegetables','da'];
  const labels = ['All','🌾 Rice','🌽 Corn','🐷 Livestock','🍌 Banana','🍠 Cassava','🍠 Kamote','🥥 Coconut','🥬 Vegetables','🏛️ DA'];
  
  const container = document.getElementById('categoryChips');
  container.innerHTML = categories.map((cat, i) => `
    <button class="layer-chip ${cat === currentCategory ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">
      ${labels[i]}
    </button>
  `).join('');
}

function filterByCategory(cat, btn) {
  currentCategory = cat;
  renderCategoryChips();
  filterVideos();
}

function filterVideos() {
  const searchTerm = document.getElementById('videoSearch').value.toLowerCase().trim();
  
  let allContent = [...videosData, ...allVideos];
  let filtered = allContent;
  
  if (!checkAdminAccess()) {
    filtered = filtered.filter(v => {
      if (!v.isLocal) return true;
      if (v.isApproved === undefined || v.isApproved === true) return true;
      if (v.uploader === 'You' || v.uploader === 'Kuya Mario') return true;
      return false;
    });
  }
  
  if (currentCategory !== 'all') {
    filtered = filtered.filter(v => v.category === currentCategory);
  }
  
  if (searchTerm) {
    filtered = filtered.filter(v => 
      v.title.toLowerCase().includes(searchTerm) || 
      v.uploader.toLowerCase().includes(searchTerm)
    );
  }
  
  renderVideos(filtered);
}

function generateRecommendations(currentVideoId) {
  const currentVideo = videosData.find(v => v.id === currentVideoId) || allVideos.find(v => v.id === currentVideoId);
  if (!currentVideo) return '';

  const allAvailableVideos = [...videosData, ...allVideos].filter(v => v.id !== currentVideoId);

  const scoredVideos = allAvailableVideos.map(video => {
    let score = 0;

    if (video.category === currentVideo.category) score += 10;
    if (video.uploader === currentVideo.uploader) score += 8;
    if (video.uploader && video.uploader.includes('DA')) score += 3;

    const viewText = String(video.views || '0');
    const viewNum = parseInt(viewText.replace(/K/g, '000').replace(/,/g, ''), 10) || 0;
    score += Math.min(viewNum / 1000, 5);

    if (video.date && (video.date.includes('day') || video.date.includes('hour'))) score += 2;

    return { ...video, score };
  });

  const recommendations = scoredVideos
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  return recommendations.map(video => `
    <div class="recommendation-item" onclick="openVideoPlayer(${video.id})">
      <div class="recommendation-thumbnail" style="background-image: url('${video.thumbnail}')">
        ${video.duration ? `<div class="recommendation-duration">${video.duration}</div>` : ''}
      </div>
      <div class="recommendation-info">
        <div class="recommendation-title">${video.title}</div>
        <div class="recommendation-meta">
          <span class="recommendation-uploader">${video.uploader || 'Unknown'}</span>
          <span class="recommendation-stats">${video.views || '0'} views • ${video.date || 'recently'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function openVideoPlayer(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) return;
  
  const modal = document.getElementById('videoPlayerModal');
  const content = document.getElementById('playerContent');
  currentPlayingVideoId = id;
  
  let playerHTML = '';
  if (video.isLocal) {
    let src = video.videoUrl;
    if (!src && video.videoBlobId != null) {
      try {
        const blob = await idbGetVideoBlob(video.videoBlobId);
        if (blob) {
          if (currentPlaybackObjectUrl) URL.revokeObjectURL(currentPlaybackObjectUrl);
          currentPlaybackObjectUrl = URL.createObjectURL(blob);
          src = currentPlaybackObjectUrl;
        }
      } catch (e) {
        console.warn('Could not load offline video blob:', e);
      }
    }
    if (!src) {
      showToast('❌ Video file not available offline.');
      return;
    }
    playerHTML = `<video style="width:100%; height:100%;" controls><source src="${src}" type="video/mp4">Your browser does not support video.</video>`;
  } else {
    playerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${video.youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:100%; border:none;" loading="lazy"></iframe>`;
  }
  
  const ownerName = video.uploader || 'Your Channel';
  const ownerAvatar = '👨‍🌾';
  
  content.innerHTML = `
    <div class="youtube-player-layout">
      <div class="main-content">
        <div class="player-section">${playerHTML}</div>
        
        <div class="video-info-section">
          <div class="video-title-large">${video.title}</div>
          
          <div class="video-stats">
            <span>${video.views || '0'} views</span>
            <span class="stats-separator"></span>
            <span>${video.date || 'recently'}</span>
          </div>
          
          <div class="channel-info">
            <div class="channel-details">
              <div class="channel-avatar">${ownerAvatar}</div>
              <div class="channel-text">
                <h3>${ownerName}</h3>
                <p>${video.isLocal ? 'Your Channel' : 'Verified'}</p>
              </div>
            </div>
            <button class="subscribe-btn" type="button" id="subscribeBtn" onclick="toggleSubscribe(${video.id})"><i class="fas fa-bell"></i> Subscribe</button>
          </div>
          
          <div class="video-actions-bar">
            ${buildPlayerActionButtons(video)}
          </div>
          
          ${video.isReshared ? `
            <div style="background: #f3e5f5; border-left: 4px solid #9C27B0; padding: 12px; margin: 15px 0; border-radius: 4px;">
              <div style="font-size: 12px; color: #7b1fa2; font-weight: 600; margin-bottom: 5px;">
                <i class="fas fa-retweet"></i> RESHARED CONTENT
              </div>
              <div style="font-size: 14px; color: #4a148c;">
                Originally created by: <strong>${video.originalUploader || 'Unknown'}</strong>
              </div>
              <div style="font-size: 12px; color: #6a1b9a; margin-top: 5px;">
                Reshared by Kuya Mario • ${video.date || 'recently'}
              </div>
            </div>
          ` : ''}
          
          <div style="font-size: 14px; color: #606060; line-height: 1.6;">
            ${video.category === 'rice' ? 'DA-recommended wet season rice planting tutorial for Mindanao farmers.' : 
              video.category === 'livestock' ? 'Complete guide on livestock vaccination and health management.' : 
              'Practical farming techniques from real Filipino farmers and DA experts.'}
          </div>
        </div>
        
        <div class="comments-section">
          <div class="comments-toolbar">
            <h3 class="comments-header" id="commentsHeader">${getCommentsCount(id)} Comment${getCommentsCount(id) === 1 ? '' : 's'}</h3>
            <select class="comment-sort-select" id="commentSort" onchange="changeCommentSort(${id}, this.value)" aria-label="Sort comments">
              <option value="newest" ${commentSortOrder === 'newest' ? 'selected' : ''}>Newest first</option>
              <option value="oldest" ${commentSortOrder === 'oldest' ? 'selected' : ''}>Oldest first</option>
              <option value="top" ${commentSortOrder === 'top' ? 'selected' : ''}>Top liked</option>
            </select>
          </div>
          
          <div class="comment-input-area" id="commentInputArea">
            <div class="comment-avatar">${CURRENT_USER.avatar}</div>
            <div class="comment-input-box">
              <textarea class="comment-textarea" id="commentInput" placeholder="Share your farming tips or ask a question..." rows="2" oninput="onCommentInputChange()" onkeydown="handleCommentKeydown(event, ${video.id})"></textarea>
              <div class="comment-input-actions">
                <button type="button" class="cancel-btn" onclick="clearCommentInput()">Cancel</button>
                <button type="button" class="comment-btn" id="commentSubmitBtn" onclick="submitComment(${video.id})" disabled><i class="fas fa-paper-plane"></i> Post</button>
              </div>
            </div>
          </div>
          
          <div class="comments-list" id="commentsList">${renderComments(id)}</div>
        </div>
      </div>
      
      <div class="recommendations-section">
        <div class="recommendations-header">Recommended Videos</div>
        <div class="recommendations-list">${generateRecommendations(id)}</div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
  updateSubscribeButton(id);
  updateLikeButton(id, isVideoLiked(id));
  onCommentInputChange();
}

let currentPlayingVideoId = null;

function getVideoComments(videoId) {
  try {
    const key = `comments_${videoId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (err) {
    console.warn('Could not load comments:', err);
    return [];
  }
}

function saveVideoComments(videoId, comments) {
  try {
    const key = `comments_${videoId}`;
    localStorage.setItem(key, JSON.stringify(comments));
  } catch (err) {
    console.warn('Could not save comments:', err);
  }
}

function getCommentsCount(videoId) {
  return getVideoComments(videoId).length;
}

function sortCommentsList(comments) {
  const sorted = [...comments];
  if (commentSortOrder === 'oldest') {
    sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
  } else if (commentSortOrder === 'top') {
    sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
  }
  return sorted;
}

function changeCommentSort(videoId, order) {
  commentSortOrder = order;
  refreshCommentsUI(videoId);
}

function refreshCommentsUI(videoId) {
  const list = document.getElementById('commentsList');
  const header = document.getElementById('commentsHeader');
  const count = getCommentsCount(videoId);
  if (list) list.innerHTML = renderComments(videoId);
  if (header) header.textContent = `${count} Comment${count === 1 ? '' : 's'}`;
}

function onCommentInputChange() {
  const textarea = document.getElementById('commentInput');
  const area = document.getElementById('commentInputArea');
  const btn = document.getElementById('commentSubmitBtn');
  if (!textarea) return;
  const hasText = textarea.value.trim().length > 0;
  if (area) area.classList.toggle('has-text', hasText);
  if (btn) btn.disabled = !hasText;
}

function handleCommentKeydown(event, videoId) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    const btn = document.getElementById('commentSubmitBtn');
    if (btn && !btn.disabled) submitComment(videoId);
  }
}

function submitComment(videoId) {
  const textarea = document.getElementById('commentInput');
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) {
    showToast('❌ Please write something before commenting');
    return;
  }
  const comments = getVideoComments(videoId);
  comments.push({
    id: Date.now(),
    author: CURRENT_USER.name,
    avatar: CURRENT_USER.avatar,
    text,
    timestamp: formatCommentTime(new Date()),
    likes: 0,
    replies: []
  });
  saveVideoComments(videoId, comments);
  textarea.value = '';
  onCommentInputChange();
  refreshCommentsUI(videoId);
  showToast('💬 Comment posted!');
}

function formatCommentTime(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderCommentReplies(videoId, comment) {
  if (!comment.replies || !comment.replies.length) return '';
  return `<div class="comment-replies">${comment.replies.map(r => `
    <div class="comment-reply-item">
      <strong>${escapeHtml(r.author)}</strong>
      <span style="color:var(--dust);font-size:11px;margin-left:6px;">${escapeHtml(r.timestamp || '')}</span>
      <div style="margin-top:4px;">${escapeHtml(r.text)}</div>
    </div>
  `).join('')}</div>`;
}

function renderReplyForm(videoId, commentId) {
  return `
    <div class="comment-reply-form" id="replyForm_${commentId}">
      <input type="text" id="replyInput_${commentId}" placeholder="Write a reply..." maxlength="500" onkeydown="if(event.key==='Enter'){event.preventDefault();submitReply(${videoId},${commentId});}">
      <button type="button" style="background:var(--forest);color:#fff;" onclick="submitReply(${videoId},${commentId})"><i class="fas fa-reply"></i> Reply</button>
      <button type="button" style="background:#f5f5f5;color:#666;" onclick="cancelReply(${commentId})">Cancel</button>
    </div>
  `;
}

function renderComments(videoId) {
  const comments = sortCommentsList(getVideoComments(videoId));
  if (!comments.length) {
    return `<div class="comments-empty"><i class="fas fa-comments"></i><p>No comments yet. Be the first to share your farming experience!</p></div>`;
  }
  const rows = comments.map(comment => {
    const liked = isCommentLiked(videoId, comment.id);
    const likeCount = comment.likes || 0;
    const likeCls = liked ? 'comment-action-btn active' : 'comment-action-btn';
    const canDelete = comment.author === CURRENT_USER.name;
    const replyFormId = `replySlot_${comment.id}`;
    const showReplyForm = activeReplyParentId === comment.id;
    return `
      <tr>
        <td data-label="User">
          <div class="comment-user-cell">
            <div class="comment-avatar">${comment.avatar || '👨‍🌾'}</div>
            <div>
              <span class="comment-author">${escapeHtml(comment.author)}</span>
              <span class="comment-time">${escapeHtml(comment.timestamp || '')}</span>
            </div>
          </div>
        </td>
        <td data-label="Comment" class="comment-text-cell">
          ${escapeHtml(comment.text)}
          ${renderCommentReplies(videoId, comment)}
          <div id="${replyFormId}">${showReplyForm ? renderReplyForm(videoId, comment.id) : ''}</div>
        </td>
        <td data-label="Posted" class="comment-time" style="font-size:12px;color:var(--dust);">${escapeHtml(comment.timestamp || '')}</td>
        <td data-label="Actions" class="comment-actions-cell">
          <button type="button" class="${likeCls}" onclick="likeComment(${videoId}, ${comment.id})"><i class="fas fa-thumbs-up"></i> ${likeCount || ''}</button>
          <button type="button" class="comment-action-btn" onclick="toggleReplyForm(${videoId}, ${comment.id})"><i class="fas fa-reply"></i> Reply</button>
          ${canDelete ? `<button type="button" class="comment-action-btn danger" onclick="deleteComment(${videoId}, ${comment.id})"><i class="fas fa-trash"></i></button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
  return `
    <div class="comments-table-wrap">
      <table class="comments-table">
        <thead>
          <tr><th>Farmer</th><th>Comment</th><th>Posted</th><th>Actions</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function toggleReplyForm(videoId, commentId) {
  activeReplyParentId = activeReplyParentId === commentId ? null : commentId;
  refreshCommentsUI(videoId);
  if (activeReplyParentId === commentId) {
    setTimeout(() => {
      const input = document.getElementById(`replyInput_${commentId}`);
      if (input) input.focus();
    }, 50);
  }
}

function cancelReply(commentId) {
  activeReplyParentId = null;
  const slot = document.getElementById(`replySlot_${commentId}`);
  if (slot) slot.innerHTML = '';
}

function submitReply(videoId, parentId) {
  const input = document.getElementById(`replyInput_${parentId}`);
  if (!input) return;
  const text = input.value.trim();
  if (!text) {
    showToast('❌ Write a reply first');
    return;
  }
  const comments = getVideoComments(videoId);
  const parent = comments.find(c => c.id === parentId);
  if (!parent) return;
  if (!parent.replies) parent.replies = [];
  parent.replies.push({
    id: Date.now(),
    author: CURRENT_USER.name,
    text,
    timestamp: formatCommentTime(new Date())
  });
  saveVideoComments(videoId, comments);
  activeReplyParentId = null;
  refreshCommentsUI(videoId);
  showToast('💬 Reply posted!');
}

function likeComment(videoId, commentId) {
  const key = `commentLiked_${videoId}_${commentId}`;
  const comments = getVideoComments(videoId);
  const comment = comments.find(c => c.id === commentId);
  if (!comment) return;
  const wasLiked = localStorage.getItem(key) === 'true';
  if (wasLiked) {
    localStorage.removeItem(key);
    comment.likes = Math.max(0, (comment.likes || 1) - 1);
  } else {
    localStorage.setItem(key, 'true');
    comment.likes = (comment.likes || 0) + 1;
  }
  saveVideoComments(videoId, comments);
  refreshCommentsUI(videoId);
}

function deleteComment(videoId, commentId) {
  if (!confirm('Delete this comment?')) return;
  const comments = getVideoComments(videoId).filter(c => c.id !== commentId);
  saveVideoComments(videoId, comments);
  localStorage.removeItem(`commentLiked_${videoId}_${commentId}`);
  refreshCommentsUI(videoId);
  showToast('🗑️ Comment removed');
}

function clearCommentInput() {
  const textarea = document.getElementById('commentInput');
  if (textarea) textarea.value = '';
  onCommentInputChange();
}

function likeVideoYT(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) return;
  
  const likeKey = `liked_${id}`;
  const isLiked = localStorage.getItem(likeKey) === 'true';
  
  if (isLiked) {
    localStorage.removeItem(likeKey);
    showToast('👍 Like removed');
  } else {
    localStorage.setItem(likeKey, 'true');
    showToast('👍 You liked this video!');
  }
  
  updateLikeButton(id, !isLiked);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleSubscribe(videoId) {
  const video = videosData.find(v => v.id === videoId) || allVideos.find(v => v.id === videoId);
  if (!video) return;
  
  const channelName = video.uploader || 'Your Channel';
  const key = `subscribed_${channelName}`;
  const isSubscribed = localStorage.getItem(key) === 'true';
  
  if (isSubscribed) {
    localStorage.removeItem(key);
    showToast(`❌ Unsubscribed from ${channelName}`);
  } else {
    localStorage.setItem(key, 'true');
    showToast(`✅ Subscribed to ${channelName}!`);
  }
  
  updateSubscribeButton(videoId);
}

function updateSubscribeButton(videoId) {
  const video = videosData.find(v => v.id === videoId) || allVideos.find(v => v.id === videoId);
  if (!video) return;
  
  const channelName = video.uploader || 'Your Channel';
  const key = `subscribed_${channelName}`;
  const isSubscribed = localStorage.getItem(key) === 'true';
  
  const subscribeBtn = document.getElementById('subscribeBtn') || document.querySelector('.subscribe-btn');
  if (subscribeBtn) {
    if (isSubscribed) {
      subscribeBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Subscribed';
      subscribeBtn.classList.add('subscribed');
      subscribeBtn.setAttribute('aria-pressed', 'true');
    } else {
      subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Subscribe';
      subscribeBtn.classList.remove('subscribed');
      subscribeBtn.setAttribute('aria-pressed', 'false');
    }
  }
}

function closeVideoPlayer() {
  document.getElementById('videoPlayerModal').classList.add('hidden');
  activeReplyParentId = null;
  closeShareModal();
  if (currentPlaybackObjectUrl) {
    URL.revokeObjectURL(currentPlaybackObjectUrl);
    currentPlaybackObjectUrl = null;
  }
}

/* ===== VOICE SEARCH FUNCTIONALITY ===== */
function startVoiceSearch() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  const voiceBtn = document.getElementById('voiceSearchBtn');
  const searchInput = document.getElementById('videoSearch');
  
  if (!recognition) {
    showToast('❌ Voice search not supported in this browser');
    return;
  }
  
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    voiceBtn.classList.add('listening');
    showToast('🎤 Listening... Speak your search query');
  };
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    filterVideos();
    showToast(`🔍 Searching for: "${transcript}"`);
  };
  
  recognition.onerror = (event) => {
    showToast('❌ Voice search failed. Please try again.');
    console.error('Voice search error:', event.error);
  };
  
  recognition.onend = () => {
    voiceBtn.classList.remove('listening');
  };
  
  recognition.start();
}

/* ===== UPLOAD & MODAL FUNCTIONS ===== */
function openUploadModal() {
  document.getElementById('uploadModal').classList.remove('hidden');
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.add('hidden');
  resetUpload();
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('uploadArea').classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect({ target: { files: files } });
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length === 0) return;
  
  const file = files[0];
  
  if (!file.type.startsWith('video/')) {
    showToast('❌ Please select a valid video file');
    return;
  }
  
  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('❌ Video must be smaller than 500MB');
    return;
  }
  
  currentVideoFile = file;
  
  const preview = document.getElementById('uploadPreview');
  const video = document.getElementById('previewVideo');
  preview.style.display = 'block';

  if (currentPreviewObjectUrl) URL.revokeObjectURL(currentPreviewObjectUrl);
  currentPreviewObjectUrl = URL.createObjectURL(file);
  video.src = currentPreviewObjectUrl;
  video.muted = true;
  document.getElementById('videoTitle').focus();
}

function resetUpload() {
  currentVideoFile = null;
  currentVideoBlob = null;
  currentThumbnailFile = null;
  uploadedVideoId = null;
  document.getElementById('uploadArea').style.display = 'block';
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('videoFile').value = '';
  document.getElementById('thumbnailFile').value = '';
  document.getElementById('previewVideo').src = '';
  document.getElementById('videoTitle').value = '';
  document.getElementById('videoCategory').value = 'other';
  document.getElementById('thumbnailPreview').innerHTML = '<span>No thumbnail</span>';
  
  // Reset video editor controls
  document.getElementById('editorBrightness').value = 100;
  document.getElementById('editorContrast').value = 100;
  document.getElementById('editorSaturation').value = 100;
  document.getElementById('previewVideo').style.filter = 'none';
  document.getElementById('videoEditorSection').style.display = 'none';
  document.getElementById('toggleEditorBtn').innerHTML = '<i class="fas fa-chevron-down"></i> Show Editor';
  currentEditorFilter = 'none';
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="none"]').classList.add('active');
  
  if (currentPreviewObjectUrl) {
    URL.revokeObjectURL(currentPreviewObjectUrl);
    currentPreviewObjectUrl = null;
  }
}

function handleThumbnailSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('❌ Thumbnail size exceeds 5MB limit');
      event.target.value = '';
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('❌ Invalid thumbnail format. Allowed: JPG, PNG, WebP');
      event.target.value = '';
      return;
    }
    
    currentThumbnailFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('thumbnailPreview').innerHTML = 
        `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);
    
    showToast('✅ Thumbnail selected');
  }
}

function openThumbnailSelector() {
  const video = document.getElementById('previewVideo');
  if (!video.src || video.src === '') {
    showToast('❌ Please select a video first');
    return;
  }
  
  document.getElementById('thumbnailSelectorModal').classList.remove('hidden');
  
  const selectorVideo = document.getElementById('thumbnailSelectorVideo');
  selectorVideo.src = video.src;
  selectorVideo.muted = true;
  
  selectorVideo.addEventListener('loadedmetadata', function() {
    const scrubber = document.getElementById('thumbnailScrubber');
    scrubber.max = selectorVideo.duration;
    
    document.getElementById('duration').textContent = formatTime(selectorVideo.duration);
    
    scrubber.addEventListener('input', function() {
      selectorVideo.currentTime = this.value;
      document.getElementById('currentTime').textContent = formatTime(this.value);
    });
    
    selectorVideo.addEventListener('timeupdate', function() {
      scrubber.value = selectorVideo.currentTime;
      document.getElementById('currentTime').textContent = formatTime(selectorVideo.currentTime);
    });
  });
}

function closeThumbnailSelector() {
  document.getElementById('thumbnailSelectorModal').classList.add('hidden');
  
  const selectorVideo = document.getElementById('thumbnailSelectorVideo');
  selectorVideo.pause();
  selectorVideo.currentTime = 0;
}

function captureCurrentFrame() {
  const video = document.getElementById('thumbnailSelectorVideo');
  if (!video.src || video.src === '') {
    showToast('❌ Video not loaded');
    return;
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 640;
  canvas.height = 360;
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  canvas.toBlob(function(blob) {
    const fileName = 'thumbnail_' + Date.now() + '.jpg';
    currentThumbnailFile = new File([blob], fileName, { type: 'image/jpeg' });
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      document.getElementById('thumbnailPreview').innerHTML =
        `<img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
      
      const selectorPreview = document.getElementById('thumbnailSelectorPreview');
      if (selectorPreview) {
        selectorPreview.innerHTML =
          `<img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
      }
      
      showToast('📸 Thumbnail captured from video frame');
      closeThumbnailSelector();
    };
    reader.readAsDataURL(currentThumbnailFile);
  }, 'image/jpeg', 0.9);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function uploadVideo() {
  if (!currentVideoFile) {
    showToast('❌ Please select a video file');
    return;
  }
  
  const title = document.getElementById('videoTitle').value.trim();
  if (!title) {
    showToast('❌ Please enter a video title');
    return;
  }
  
  const category = document.getElementById('videoCategory').value;
  
  const maxSize = 500 * 1024 * 1024;
  if (currentVideoFile.size > maxSize) {
    showToast('❌ File size exceeds 500MB limit');
    return;
  }
  
  // Store video in IndexedDB for localStorage-only mode
  const videoId = Date.now();
  const videoBlob = currentVideoFile;
  
  // Get edit settings from video editor
  const brightness = document.getElementById('editorBrightness').value;
  const contrast = document.getElementById('editorContrast').value;
  const saturation = document.getElementById('editorSaturation').value;
  
  showToast('⏳ Uploading video...');
  
  // Store video blob in IndexedDB
  idbPutVideoBlob(videoId, videoBlob)
    .then(() => {
      // Store thumbnail if available
      let thumbnailPromise = Promise.resolve(null);
      let thumbnailBlobId = null;
      
      if (currentThumbnailFile) {
        thumbnailBlobId = videoId + '_thumb';
        thumbnailPromise = idbPutThumbnailBlob(thumbnailBlobId, currentThumbnailFile);
      }
      
      return thumbnailPromise.then(() => {
        const newVideo = {
          id: videoId,
          title: title,
          category: category,
          thumbnail: currentThumbnailFile ? URL.createObjectURL(currentThumbnailFile) : makeSvgThumbnail(title),
          thumbnailBlobId: thumbnailBlobId,
          duration: 'N/A',
          views: '0',
          uploader: 'You',
          date: 'just now',
          isLocal: true,
          isApproved: true,
          videoBlobId: videoId,
          videoUrl: URL.createObjectURL(currentVideoFile),
          edits: {
            brightness: brightness,
            contrast: contrast,
            saturation: saturation,
            filter: currentEditorFilter
          }
        };
        
        allVideos.push(newVideo);
        persistLocalVideos();
        filterVideos();
        closeUploadModal();
        resetUpload();
        showToast('✅ Video uploaded successfully!');
      });
    })
    .catch(error => {
      console.error('Failed to store video:', error);
      showToast('❌ Failed to upload video');
    });
}

function uploadThumbnailForVideo(videoId) {
  // Skip thumbnail upload in localStorage-only mode
  return Promise.resolve(true);
}

function likeVideo(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) return;
  
  const likeKey = `liked_${id}`;
  const isLiked = localStorage.getItem(likeKey) === 'true';
  
  if (isLiked) {
    localStorage.removeItem(likeKey);
    showToast('👍 Like removed');
  } else {
    localStorage.setItem(likeKey, 'true');
    showToast('👍 You liked this video!');
  }
  
  updateLikeButton(id, !isLiked);
  syncAnalyticsWithAdmin();
}

function updateLikeButton(id, isLiked) {
  document.querySelectorAll('.video-card').forEach(card => {
    const onclick = card.getAttribute('onclick');
    if (onclick && onclick.includes(`openVideoPlayer(${id})`)) {
      const likeBtn = card.querySelector('.vc-action-like');
      if (likeBtn) {
        likeBtn.classList.toggle('active', isLiked);
        likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> ${isLiked ? 'Liked' : 'Like'}`;
      }
    }
  });

  const modalLikeBtn = document.getElementById('modalLikeBtn');
  if (modalLikeBtn) {
    modalLikeBtn.classList.toggle('active', isLiked);
    modalLikeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i><span>${isLiked ? 'Liked' : 'Like'}</span>`;
  }
}

function downloadVideo(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) return;
  
  if (!allVideos.find(v => v.id === id)) {
    showToast('📥 Added to your saved videos');
    const localRef = { ...video, isLocal: true };
    allVideos.push(localRef);
    try {
      localStorage.setItem('rootsLocalVideos', JSON.stringify(allVideos));
    } catch (err) {
      console.warn('LocalStorage issue', err);
    }
    filterVideos();
  } else {
    showToast('📌 Already in your saved videos');
  }
}

function reshareVideo(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) return;
  
  const reshareData = {
    originalVideoId: video.id,
    originalTitle: video.title,
    originalUploader: video.uploader,
    resharedBy: 'Kuya Mario',
    resharedDate: new Date().toISOString(),
    thumbnail: video.thumbnail
  };
  
  const reshareKey = `reshare_${id}_${Date.now()}`;
  localStorage.setItem(reshareKey, JSON.stringify(reshareData));
  
  const resharedVideo = {
    id: Math.max(...videosData.map(v => v.id), ...allVideos.map(v => v.id), 0) + 1,
    title: `RESHARED: ${video.title}`,
    category: video.category,
    thumbnail: video.thumbnail,
    duration: video.duration,
    views: '0',
    uploader: 'Kuya Mario (Reshared)',
    date: 'just now',
    isLocal: true,
    isReshared: true,
    originalVideoId: video.id,
    originalUploader: video.uploader,
    videoUrl: video.videoUrl,
    videoBlobId: video.videoBlobId
  };
  
  allVideos.push(resharedVideo);
  persistLocalVideos();
  
  showToast(`🔄 Reshared "${video.title}" with credit to ${video.uploader}`);
  
  const header = document.querySelector('.module-header h1');
  if (header && header.innerHTML.includes('My Uploaded Videos')) {
    showUploadedVideos();
  } else {
    filterVideos();
  }
  
  syncAnalyticsWithAdmin();
}

function getShareUrl(video) {
  if (video.youtubeId && !video.isLocal) {
    return `https://www.youtube.com/watch?v=${video.youtubeId}`;
  }
  const base = window.location.href.split('#')[0];
  return `${base}#video-${video.id}`;
}

function openShareModal(id) {
  const video = videosData.find(v => v.id === id) || allVideos.find(v => v.id === id);
  if (!video) return;
  shareVideoContext = video;
  const preview = document.getElementById('sharePreviewText');
  if (preview) {
    preview.innerHTML = `<strong>${escapeHtml(video.title)}</strong><br><span style="font-size:12px;color:#7A9585;">${escapeHtml(video.uploader || 'Farming Videos')}</span>`;
  }
  document.getElementById('shareModal')?.classList.remove('hidden');
}

function closeShareModal() {
  document.getElementById('shareModal')?.classList.add('hidden');
  shareVideoContext = null;
}

async function copyShareLink() {
  if (!shareVideoContext) return;
  const url = getShareUrl(shareVideoContext);
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!');
    closeShareModal();
  } catch (e) {
    showToast(url);
  }
}

async function copyShareTitle() {
  if (!shareVideoContext) return;
  const text = `${shareVideoContext.title} — ${shareVideoContext.uploader || 'Roots Farming Videos'}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Title copied!');
    closeShareModal();
  } catch (e) {
    showToast(text);
  }
}

function nativeShareVideo() {
  if (!shareVideoContext) return;
  const video = shareVideoContext;
  const payload = {
    title: video.title,
    text: `Check out this farming video: ${video.title}`,
    url: getShareUrl(video)
  };
  if (navigator.share) {
    navigator.share(payload)
      .then(() => { showToast('Shared successfully!'); closeShareModal(); })
      .catch(err => {
        if (err.name !== 'AbortError') copyShareLink();
      });
  } else {
    copyShareLink();
  }
}

function shareVideo(id) {
  openShareModal(id);
}

function deleteVideo(id) {
  if (confirm('Are you sure you want to delete this video permanently?')) {
    showToast('⏳ Deleting...');
    
    // Delete from IndexedDB and localStorage
    const video = allVideos.find(v => v.id === id);
    if (video && video.thumbnailBlobId) {
      idbDeleteThumbnailBlob(video.thumbnailBlobId).catch(() => {});
    }
    idbDeleteVideoBlob(id).catch(() => {});
    allVideos = allVideos.filter(v => v.id !== id);
    
    try {
      persistLocalVideos();
    } catch (err) {
      console.warn('LocalStorage issue');
    }
    
    closeVideoPlayer();
    filterVideos();
    showToast('🗑️ Video deleted');
  }
}

function showUploadedVideos() {
  const uploaded = allVideos.filter(v => v.uploader === 'You' || v.uploader === 'Kuya Mario');
  renderUploadedVideosWithAnalytics(uploaded);
  showToast(uploaded.length ? `📤 Showing ${uploaded.length} uploaded video(s)` : '📤 No uploaded videos yet');

  const header = document.querySelector('.module-header h1');
  const subtitle = document.querySelector('.subtitle');
  if (header) header.innerHTML = '<i class="fas fa-upload"></i> My Uploaded Videos';
  if (subtitle) subtitle.textContent = 'View analytics and manage your uploaded content';
}

function renderUploadedVideosWithAnalytics(videos) {
  const grid = document.getElementById('videoGrid');
  
  if (videos.length === 0) {
    grid.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #999;"><i class="fas fa-cloud-upload-alt" style="font-size: 48px; display: block; margin-bottom: 16px;"></i><p>No uploaded videos yet</p><button onclick="openUploadModal()" class="btn primary"><i class="fas fa-upload"></i> Upload Your First Video</button></div>';
    return;
  }

  const totalViews = videos.reduce((sum, v) => {
    const viewText = String(v.views || '0');
    const viewNum = parseInt(viewText.replace(/K/g, '000').replace(/,/g, ''), 10) || 0;
    return sum + viewNum;
  }, 0);

  const totalLikes = videos.reduce((sum, v) => {
    const likeKey = `liked_${v.id}`;
    return localStorage.getItem(likeKey) === 'true' ? sum + 1 : sum;
  }, 0);

  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const topVideo = videos.reduce((top, v) => {
    const viewText = String(v.views || '0');
    const viewNum = parseInt(viewText.replace(/K/g, '000').replace(/,/g, ''), 10) || 0;
    const topViewText = String(top.views || '0');
    const topViewNum = parseInt(topViewText.replace(/K/g, '000').replace(/,/g, ''), 10) || 0;
    return viewNum > topViewNum ? v : top;
  }, videos[0]);

  const analyticsHTML = `
    <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 15px 0; font-size: 18px;"><i class="fas fa-chart-line"></i> Your Video Analytics</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">${videos.length}</div>
          <div style="font-size: 12px; opacity: 0.9;">Total Videos</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">${totalViews.toLocaleString()}</div>
          <div style="font-size: 12px; opacity: 0.9;">Total Views</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">${avgViews.toLocaleString()}</div>
          <div style="font-size: 12px; opacity: 0.9;">Avg Views</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">${totalLikes}</div>
          <div style="font-size: 12px; opacity: 0.9;">Total Likes</div>
        </div>
      </div>
      ${topVideo ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
          <div style="font-size: 14px; opacity: 0.9;">🏆 Top Performing Video</div>
          <div style="font-weight: 600; margin-top: 5px;">${topVideo.title}</div>
          <div style="font-size: 12px; opacity: 0.8;">${topVideo.views || '0'} views</div>
        </div>
      ` : ''}
    </div>
  `;

  const videosHTML = videos.map(v => `
    <div class="video-card" onclick="openVideoPlayer(${v.id})">
      <div class="thumbnail" style="background-image:url('${v.thumbnail}')">
        <div class="duration">${v.duration || 'N/A'}</div>
        <div style="position: absolute; top: 8px; left: 8px; background: #FF9800; color: white; font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: 600;"><i class="fas fa-upload"></i> UPLOADED</div>
      </div>
      <div class="video-info">
        <div class="video-title">${v.title}</div>
        <div class="video-meta">${v.uploader || 'Your Channel'} • ${v.views || '0'} views • ${v.date || 'just now'}</div>
        <div class="video-actions">${buildCardActionButtons(v)}</div>
      </div>
    </div>
  `).join('');

  grid.innerHTML = analyticsHTML + videosHTML;
}

function showDownloadedVideos() {
  const downloaded = Array.isArray(allVideos) ? allVideos : [];
  renderVideos(downloaded);
  showToast(downloaded.length ? `📥 Showing ${downloaded.length} downloaded video(s)` : '📥 No downloaded videos yet');

  const header = document.querySelector('.module-header h1');
  const subtitle = document.querySelector('.subtitle');
  if (header) header.innerHTML = '<i class="fas fa-download"></i> Downloaded Videos';
  if (subtitle) subtitle.textContent = 'Your saved videos available offline';
}

async function adminApproveVideo(videoId, approved) {
  if (!requireAdminAccess()) return;
  
  // Update approval status in localStorage-only mode
  const video = allVideos.find(v => v.id === videoId);
  if (video) {
    video.isApproved = approved;
    persistLocalVideos();
    showToast(approved ? '✅ Video approved' : '⏸️ Video approval revoked');
    filterVideos();
  }
}

async function adminDeleteVideo(videoId) {
  if (!requireAdminAccess()) return;
  if (!confirm('Delete this video? This action cannot be undone and will remove the video from all users.')) return;

  // Delete from IndexedDB and localStorage in localStorage-only mode
  idbDeleteVideoBlob(videoId).catch(() => {});
  allVideos = allVideos.filter(v => v.id !== videoId);
  persistLocalVideos();
  
  closeVideoPlayer();
  showToast('🗑️ Video deleted successfully');
  filterVideos();
}

function syncAnalyticsWithAdmin() {
  const analytics = {
    total_videos: videosData.length + allVideos.length,
    local_videos: allVideos.length,
    approved_videos: allVideos.filter(v => v.isApproved !== false).length,
    pending_videos: allVideos.filter(v => v.isApproved === false).length,
    total_views: [...videosData, ...allVideos].reduce((sum, v) => {
      const viewText = String(v.views || '0');
      const viewNum = parseInt(viewText.replace(/K/g, '000').replace(/,/g, ''), 10) || 0;
      return sum + viewNum;
    }, 0),
    total_likes: [...videosData, ...allVideos].reduce((sum, v) => {
      const likeKey = `liked_${v.id}`;
      return localStorage.getItem(likeKey) === 'true' ? sum + 1 : sum;
    }, 0),
    reshared_videos: allVideos.filter(v => v.isReshared).length,
    categories: {}
  };
  
  [...videosData, ...allVideos].forEach(v => {
    if (v.category) {
      analytics.categories[v.category] = (analytics.categories[v.category] || 0) + 1;
    }
  });
  
  localStorage.setItem('rootsAnalytics', JSON.stringify(analytics));
  
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('roots_admin_sync');
    channel.postMessage({
      type: 'analytics_update',
      data: analytics
    });
  }
}

// Listen for admin approval updates
if (typeof BroadcastChannel !== 'undefined') {
  const channel = new BroadcastChannel('roots_admin_sync');
  channel.onmessage = (event) => {
    if (event.data.type === 'video_approved' || event.data.type === 'video_revoked') {
      // Reload local videos from localStorage to get updated approval status
      loadLocalVideos();
      // Re-render DA videos panel
      renderDaVideos();
    }
    if (event.data.type === 'request_analytics') {
      syncAnalyticsWithAdmin();
    }
  };
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) {
    console.info('Toast message:', msg);
    return;
  }
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 2800);
}

function loadVideosFromDatabase() {
  // Skip database fetch if running without PHP backend
  // The app works with localStorage-only mode for static hosting
  console.log('Skipping database fetch - using local data only');
  return;
  
  fetchJsonLoose(apiUrl('database_manager.php?action=get_videos&limit=100'))
    .then(({ data }) => {
      if (data.success && data.data) {
        data.data.forEach(video => {
          const existingVideo = allVideos.find(v => v.id === video.id);
          if (!existingVideo) {
            allVideos.push({
              id: video.id,
              title: video.title,
              category: video.category,
              thumbnail: video.thumbnail_path ? apiUrl(video.thumbnail_path) : makeSvgThumbnail(video.title),
              duration: video.duration || 'N/A',
              views: video.views_count || '0',
              uploader: video.uploader_full_name || 'You',
              date: 'saved',
              isLocal: true,
              isApproved: video.is_approved === 1 || video.is_approved === '1',
              videoUrl: video.file_path ? apiUrl(video.file_path) : null
            });
          }
        });
        renderVideos(videosData.concat(allVideos));
      }
    })
    .catch(error => {
      if (error && error.name === 'PhpNotExecutedError') {
        console.warn(error.message);
        showToast('⚠ Open via XAMPP: http://localhost/youtube_mod/videos.html (PHP must run)');
      } else {
        console.log('Database not yet initialized or offline - using local data only:', error);
      }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  cleanupLegacyLocalVideoCache();
  try {
    const saved = localStorage.getItem('rootsLocalVideos');
    if (saved) {
      allVideos = JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Could not load local videos:', err);
    allVideos = [];
  }
  
  loadVideosFromDatabase();
  
  renderVideos(videosData);
  renderTrending();
  renderDaVideos();
  renderCategoryChips();
  
  syncAnalyticsWithAdmin();
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeVideoPlayer();
      closeUploadModal();
    }
  });
  
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('roots_admin_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'request_analytics') {
        syncAnalyticsWithAdmin();
      }
    };
  }
  
  setInterval(syncAnalyticsWithAdmin, 30000);

  // Initialize sidebar and swipe detection
  initSidebar();
  showFirstTimeInstruction();
});

// ===== SIDEBAR & SWIPE FUNCTIONALITY =====

let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50;

function initSidebar() {
  // Touch events for swipe detection
  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  // Mouse events for desktop swipe simulation
  let mouseDown = false;
  let mouseStartX = 0;

  document.addEventListener('mousedown', e => {
    mouseDown = true;
    mouseStartX = e.clientX;
  }, false);

  document.addEventListener('mouseup', e => {
    if (mouseDown) {
      mouseDown = false;
      const deltaX = e.clientX - mouseStartX;
      if (deltaX > SWIPE_THRESHOLD) {
        openSidebar();
      } else if (deltaX < -SWIPE_THRESHOLD) {
        closeSidebar();
      }
    }
  }, false);
}

function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  if (deltaX > SWIPE_THRESHOLD) {
    openSidebar();
  } else if (deltaX < -SWIPE_THRESHOLD) {
    closeSidebar();
  }
}

function openSidebar() {
  const sidebar = document.getElementById('sidebarPanel');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    updateSidebarContent();
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebarPanel');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }
}

function showFirstTimeInstruction() {
  const hasSeenInstruction = localStorage.getItem('rootsSidebarInstructionSeen');
  if (!hasSeenInstruction) {
    const overlay = document.getElementById('instructionOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }
}

function dismissInstruction() {
  const overlay = document.getElementById('instructionOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    localStorage.setItem('rootsSidebarInstructionSeen', 'true');
  }
}

function updateSidebarContent() {
  updateAnalytics();
  updateDownloadedVideosList();
  updateUploadedVideosList();
}

function updateAnalytics() {
  const totalViewsEl = document.getElementById('totalViews');
  const totalDownloadsEl = document.getElementById('totalDownloads');
  const totalLikesEl = document.getElementById('totalLikes');

  // Calculate analytics from localStorage
  let totalViews = 0;
  let totalDownloads = 0;
  let totalLikes = 0;

  // Count views from videosData
  videosData.forEach(v => {
    if (v.views) {
      const viewNum = parseInt(String(v.views).replace(/K/g, '000').replace(/,/g, ''), 10) || 0;
      totalViews += viewNum;
    }
  });

  // Count downloads from localStorage (only playable videos)
  const downloadedVideos = getDownloadedVideos();
  totalDownloads = downloadedVideos.filter(v => v.isPlayable === true).length;

  // Count likes from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('liked_')) {
      totalLikes++;
    }
  }

  if (totalViewsEl) totalViewsEl.textContent = formatNumber(totalViews);
  if (totalDownloadsEl) totalDownloadsEl.textContent = totalDownloads;
  if (totalLikesEl) totalLikesEl.textContent = totalLikes;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function getDownloadedVideos() {
  try {
    const downloaded = localStorage.getItem('rootsDownloadedVideos');
    return downloaded ? JSON.parse(downloaded) : [];
  } catch (err) {
    console.warn('Could not load downloaded videos:', err);
    return [];
  }
}

function updateDownloadedVideosList() {
  const container = document.getElementById('downloadedVideosList');
  if (!container) return;

  const downloadedVideos = getDownloadedVideos();
  // Filter to only show videos that are actually playable
  const playableVideos = downloadedVideos.filter(v => v.isPlayable === true);

  if (playableVideos.length === 0) {
    container.innerHTML = '<p class="empty-state">No downloaded videos yet</p>';
    return;
  }

  container.innerHTML = playableVideos.slice(0, 5).map(v => `
    <div class="sidebar-video-item" onclick="openDownloadedVideo('${v.id}', '${v.videoBlobId}')">
      <div class="sidebar-video-thumb" style="background-image: url('${v.thumbnail}')"></div>
      <div class="sidebar-video-info">
        <div class="sidebar-video-title">${v.title}</div>
        <div class="sidebar-video-meta">${v.resolution || 'HD'} • ${v.date || 'recently'}</div>
      </div>
    </div>
  `).join('');
}

async function openDownloadedVideo(videoId, blobId) {
  const downloadedVideos = getDownloadedVideos();
  const video = downloadedVideos.find(v => v.id === videoId);
  
  if (!video) {
    showToast('❌ Video not found in downloads');
    return;
  }

  try {
    const blob = await idbGetVideoBlob(blobId);
    if (!blob) {
      showToast('❌ Video file not available');
      return;
    }

    if (currentPlaybackObjectUrl) URL.revokeObjectURL(currentPlaybackObjectUrl);
    currentPlaybackObjectUrl = URL.createObjectURL(blob);

    const modal = document.getElementById('videoPlayerModal');
    const content = document.getElementById('playerContent');
    
    content.innerHTML = `
      <div class="youtube-player-layout">
        <div class="main-content">
          <div class="player-section">
            <video style="width:100%; height:100%;" controls autoplay>
              <source src="${currentPlaybackObjectUrl}" type="video/mp4">
              Your browser does not support video.
            </video>
          </div>
          
          <div class="video-info-section">
            <div class="video-title-large">${video.title}</div>
            
            <div class="video-stats">
              <span>${video.resolution || 'HD'}</span>
              <span class="stats-separator"></span>
              <span>${video.date || 'recently'}</span>
            </div>
            
            <div class="video-actions">
              <button class="yt-action-btn" onclick="removeDownloadedVideo('${videoId}')">
                <i class="fas fa-trash"></i> Remove from Downloads
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    modal.classList.remove('hidden');
  } catch (error) {
    console.error('Error playing downloaded video:', error);
    showToast('❌ Failed to play downloaded video');
  }
}

function removeDownloadedVideo(videoId) {
  if (!confirm('Remove this video from downloads?')) return;
  
  let downloadedVideos = getDownloadedVideos();
  downloadedVideos = downloadedVideos.filter(v => v.id !== videoId);
  localStorage.setItem('rootsDownloadedVideos', JSON.stringify(downloadedVideos));
  
  showToast('🗑️ Video removed from downloads');
  updateDownloadedVideosList();
  updateSidebarContent();
  closeVideoPlayer();
}

function updateUploadedVideosList() {
  const container = document.getElementById('uploadedVideosList');
  if (!container) return;

  const uploadedVideos = allVideos.filter(v => v.isLocal);

  if (uploadedVideos.length === 0) {
    container.innerHTML = '<p class="empty-state">No uploaded videos yet</p>';
    return;
  }

  container.innerHTML = uploadedVideos.slice(0, 5).map(v => `
    <div class="sidebar-video-item" onclick="openVideoPlayer(${v.id})">
      <div class="sidebar-video-thumb" style="background-image: url('${v.thumbnail}')"></div>
      <div class="sidebar-video-info">
        <div class="sidebar-video-title">${v.title}</div>
        <div class="sidebar-video-meta">${v.views || '0'} views • ${v.date || 'recently'}</div>
      </div>
    </div>
  `).join('');
}

function openOfflineInterface() {
  window.location.href = 'videos-offline.html';
}

// ===== VIDEO EDITOR IN UPLOAD MODAL =====

let currentEditorFilter = 'none';

function toggleVideoEditor() {
  const section = document.getElementById('videoEditorSection');
  const btn = document.getElementById('toggleEditorBtn');
  
  if (section.style.display === 'none') {
    section.style.display = 'block';
    btn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Editor';
  } else {
    section.style.display = 'none';
    btn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Editor';
  }
}

function applyEditorFilters() {
  const video = document.getElementById('previewVideo');
  const brightness = document.getElementById('editorBrightness').value;
  const contrast = document.getElementById('editorContrast').value;
  const saturation = document.getElementById('editorSaturation').value;

  let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  
  // Apply preset filter on top of adjustments
  switch (currentEditorFilter) {
    case 'grayscale':
      filterString += ' grayscale(100%)';
      break;
    case 'sepia':
      filterString += ' sepia(100%)';
      break;
    case 'warm':
      filterString += ' sepia(30%) saturate(140%) brightness(105%)';
      break;
    case 'cool':
      filterString += ' hue-rotate(180deg) saturate(80%)';
      break;
    case 'vintage':
      filterString += ' sepia(50%) contrast(90%) brightness(90%)';
      break;
  }
  
  video.style.filter = filterString;
}

function applyEditorPreset(button) {
  const video = document.getElementById('previewVideo');
  const filter = button.dataset.filter;
  currentEditorFilter = filter;

  // Remove active class from all filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');

  // Apply filter
  applyEditorFilters();
}

function resetEditorFilters() {
  const video = document.getElementById('previewVideo');
  video.style.filter = 'none';
  
  document.getElementById('editorBrightness').value = 100;
  document.getElementById('editorContrast').value = 100;
  document.getElementById('editorSaturation').value = 100;
  
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="none"]').classList.add('active');
  currentEditorFilter = 'none';
}

// ===== DOWNLOAD MODAL FUNCTIONALITY =====

let currentDownloadVideoId = null;

function downloadVideo(id) {
  currentDownloadVideoId = id;
  const modal = document.getElementById('downloadModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeDownloadModal() {
  const modal = document.getElementById('downloadModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  currentDownloadVideoId = null;
}

async function confirmDownload() {
  if (currentDownloadVideoId === null) return;

  const resolution = document.querySelector('input[name="resolution"]:checked')?.value || '360p';
  const saveLocation = document.querySelector('input[name="saveLocation"]:checked')?.value || 'account';

  const video = videosData.find(v => v.id === currentDownloadVideoId) || allVideos.find(v => v.id === currentDownloadVideoId);
  if (!video) {
    showToast('❌ Video not found');
    closeDownloadModal();
    return;
  }

  closeDownloadModal();

  if (saveLocation === 'device') {
    // Save to device (IndexedDB for offline playback)
    await saveToDevice(video, resolution);
  } else {
    // Save to farmer's account (localStorage metadata)
    saveToAccount(video, resolution);
  }
}

async function saveToDevice(video, resolution) {
  showToast('⏳ Downloading video...');

  try {
    // Only local uploaded videos can be saved for offline playback
    // YouTube videos require backend downloader
    if (video.isLocal && video.videoUrl) {
      let blob = null;
      
      if (video.videoUrl.startsWith('blob:')) {
        const response = await fetch(video.videoUrl);
        blob = await response.blob();
      } else if (video.videoBlobId != null) {
        blob = await idbGetVideoBlob(video.videoBlobId);
      } else if (video.videoUrl.startsWith('data:')) {
        // Handle data URLs
        const response = await fetch(video.videoUrl);
        blob = await response.blob();
      }

      if (blob) {
        const blobId = `video_${video.id}_${Date.now()}`;
        await idbPutVideoBlob(blobId, blob);
        
        const downloadedVideos = getDownloadedVideos();
        const existingIndex = downloadedVideos.findIndex(v => v.id === video.id);
        
        const downloadInfo = {
          id: video.id,
          title: video.title,
          thumbnail: video.thumbnail,
          duration: video.duration,
          resolution: resolution,
          date: new Date().toLocaleDateString(),
          videoBlobId: blobId,
          saveLocation: 'device',
          isPlayable: true
        };

        if (existingIndex >= 0) {
          downloadedVideos[existingIndex] = downloadInfo;
        } else {
          downloadedVideos.push(downloadInfo);
        }

        localStorage.setItem('rootsDownloadedVideos', JSON.stringify(downloadedVideos));
        showToast('✅ Video saved to device for offline playback');
        updateSidebarContent();
      } else {
        showToast('⚠️ Video file not available for download');
      }
    } else if (video.youtubeId) {
      // Use backend YouTube downloader
      await downloadYouTubeVideoBackend(video, resolution);
    } else {
      showToast('⚠️ Video file not available for download');
    }
  } catch (error) {
    console.error('Download error:', error);
    showToast('❌ Failed to download video');
  }
}

async function downloadYouTubeVideoBackend(video, resolution) {
  try {
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
    
    showToast('⏳ Downloading YouTube video...');
    
    const response = await fetch('youtube_downloader.php?action=download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(youtubeUrl)}&resolution=${encodeURIComponent(resolution)}`
    });

    const result = await response.json();

    if (result.success) {
      // Download the video file from the backend
      const fileResponse = await fetch(`youtube_downloader.php?action=serve&filename=${result.filename}`);
      const blob = await fileResponse.blob();
      
      // Save to IndexedDB
      const blobId = `youtube_${video.id}_${Date.now()}`;
      await idbPutVideoBlob(blobId, blob);
      
      // Get current downloaded videos from localStorage
      let downloadedVideos = [];
      try {
        const stored = localStorage.getItem('rootsDownloadedVideos');
        downloadedVideos = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.warn('Could not load downloaded videos:', e);
      }
      
      const existingIndex = downloadedVideos.findIndex(v => v.id === video.id);
      
      const downloadInfo = {
        id: video.id,
        title: result.title || video.title,
        thumbnail: result.thumbnail || video.thumbnail,
        duration: result.duration || video.duration,
        resolution: resolution,
        date: new Date().toLocaleDateString(),
        videoBlobId: blobId,
        saveLocation: 'device',
        isPlayable: true,
        youtubeId: video.youtubeId,
        uploader: video.uploader || 'YouTube',
        views: video.views || '0'
      };

      if (existingIndex >= 0) {
        downloadedVideos[existingIndex] = downloadInfo;
      } else {
        downloadedVideos.push(downloadInfo);
      }

      localStorage.setItem('rootsDownloadedVideos', JSON.stringify(downloadedVideos));
      showToast('✅ YouTube video saved to device for offline playback');
      updateSidebarContent();
      updateDownloadedVideosList();
    } else {
      showToast('⚠️ Failed to download YouTube video: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Download error:', error);
    showToast('❌ Failed to download video. Backend may not be available.');
  }
}

function saveToAccount(video, resolution) {
  const downloadedVideos = getDownloadedVideos();
  const existingIndex = downloadedVideos.findIndex(v => v.id === video.id);
  
  const downloadInfo = {
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail,
    duration: video.duration,
    resolution: resolution,
    date: new Date().toLocaleDateString(),
    youtubeId: video.youtubeId,
    saveLocation: 'account'
  };

  if (existingIndex >= 0) {
    downloadedVideos[existingIndex] = downloadInfo;
  } else {
    downloadedVideos.push(downloadInfo);
  }

  localStorage.setItem('rootsDownloadedVideos', JSON.stringify(downloadedVideos));
  showToast('✅ Video saved to your account');
  updateSidebarContent();
}
