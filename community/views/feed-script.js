/* ══════════════════════════════════════════
   community/views/feed-script.js
══════════════════════════════════════════ */

// ── Mock Data for Posts ──
const MOCK_POSTS = [
  {
    id: 1,
    author: 'Department of Agriculture',
    initials: 'DA',
    role: 'Official',
    time: '2 hours ago',
    type: 'news',
    text: '📢 New subsidy program for organic farmers! Starting next month, registered farmers can apply for up to ₱50,000 in support for organic farming equipment and seeds. Visit your local DA office for more details.',
    likes: 234,
    comments: 45,
    shares: 89,
    isLiked: false
  },
  {
    id: 2,
    author: 'Karlo Mendoza',
    initials: 'KM',
    role: 'Farmer',
    time: '3 hours ago',
    type: 'photo',
    text: 'Just harvested my first batch of organic tomatoes! 🍅 The taste is incredible compared to conventional ones. #organicfarming #harvest',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
    likes: 156,
    comments: 32,
    shares: 28,
    isLiked: true
  },
  {
    id: 3,
    author: 'Maria Santos',
    initials: 'MS',
    role: 'Non-Farmer',
    time: '4 hours ago',
    type: 'qa',
    text: 'Has anyone tried vermicomposting? I want to start but not sure where to begin. Any tips for beginners?',
    likes: 89,
    comments: 67,
    shares: 12,
    isLiked: false
  },
  {
    id: 4,
    author: 'Department of Agriculture',
    initials: 'DA',
    role: 'Official',
    time: '5 hours ago',
    type: 'video',
    text: '🎥 Watch our latest tutorial on proper rice planting techniques for maximum yield!',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    likes: 445,
    comments: 78,
    shares: 156,
    isLiked: false
  },
  {
    id: 5,
    author: 'Juan Dela Cruz',
    initials: 'JC',
    role: 'Farmer',
    time: '6 hours ago',
    type: 'tip',
    text: '💡 Pro tip: Plant marigolds around your vegetable garden to naturally repel pests. It\'s been working great for my peppers!',
    likes: 234,
    comments: 45,
    shares: 89,
    isLiked: true
  },
  {
    id: 6,
    author: 'Ana Reyes',
    initials: 'AR',
    role: 'Non-Farmer',
    time: '7 hours ago',
    type: 'photo',
    text: 'Visited the local farmers market today! So much fresh produce. Supporting local farmers is the way to go! 🥬🥕',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600',
    likes: 123,
    comments: 28,
    shares: 45,
    isLiked: false
  },
  {
    id: 7,
    author: 'Department of Agriculture',
    initials: 'DA',
    role: 'Official',
    time: '8 hours ago',
    type: 'news',
    text: '🌱 Weather alert: Heavy rains expected in the next 3 days. Farmers in low-lying areas are advised to take necessary precautions to protect their crops.',
    likes: 567,
    comments: 134,
    shares: 234,
    isLiked: false
  },
  {
    id: 8,
    author: 'Pedro Martinez',
    initials: 'PM',
    role: 'Farmer',
    time: '9 hours ago',
    type: 'photo',
    text: 'My rice paddies are looking great this season! Expecting a bumper harvest. 🌾',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
    likes: 189,
    comments: 41,
    shares: 67,
    isLiked: true
  }
];

let currentPage = 0;
const POSTS_PER_PAGE = 5;
let isLoading = false;
let hasMorePosts = true;
let currentFilter = 'all';

// ── Feed Rendering ──
function renderPost(post) {
  const badgeClass = {
    'news': 'badge-news',
    'photo': 'badge-photo',
    'video': 'badge-video',
    'qa': 'badge-qa',
    'tip': 'badge-tip'
  }[post.type] || '';

  const badgeLabel = {
    'news': 'News',
    'photo': 'Photo',
    'video': 'Video',
    'qa': 'Q&A',
    'tip': 'Tip'
  }[post.type] || '';

  let mediaHtml = '';
  if (post.image) {
    mediaHtml = `<img src="${post.image}" alt="Post image" class="post-image">`;
  } else if (post.video) {
    mediaHtml = `<div class="post-video-container"><iframe src="${post.video}" class="post-video" frameborder="0" allowfullscreen></iframe></div>`;
  }

  return `
    <div class="post-card" data-post-id="${post.id}">
      <div class="post-header">
        <div class="post-avatar">${post.initials}</div>
        <div class="post-meta">
          <div class="post-author">${post.author}</div>
          <div class="post-time">
            <span>${post.time}</span>
            ${badgeLabel ? `<span class="post-type-badge ${badgeClass}">${badgeLabel}</span>` : ''}
          </div>
        </div>
        <button class="post-options" aria-label="More options">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
      <div class="post-body">
        <div class="post-text">${post.text}</div>
        ${mediaHtml}
      </div>
            <div class="reaction-bar">
        <div class="reaction-left">
          <div class="reaction-emojis">
            <div class="reaction-emoji">❤️</div>
          </div>
          <span>${post.likes}</span>
        </div>
        <div class="reaction-right">
          <span>${post.comments} comments</span>
          <span class="reaction-dot">·</span>
          <span>${post.shares} shares</span>
        </div>
      </div>
      <div class="post-sep"></div>
      <div class="post-actions">
        <button class="post-action ${post.isLiked ? 'liked' : ''}" data-action="like">
          <svg width="20" height="20" fill="${post.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          <span>Like</span>
        </button>
        <button class="post-action" data-action="comment">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
          </svg>
          <span>Comment</span>
        </button>
        <button class="post-action" data-action="share">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>Share</span>
        </button>
      </div>
            <div class="post-sep"></div>
      <div class="comments-section">
        <div class="comments-list">
          <div class="comment">
            <div class="comment-avatar" style="background:var(--green-400);color:#fff">JD</div>
            <div style="flex:1">
              <div class="comment-bubble">
                <div class="comment-name">Juan Dela Cruz</div>
                <div class="comment-text">Great post! Thanks for sharing.</div>
              </div>
              <div class="comment-actions">
                <button class="comment-action">Like</button>
                <button class="comment-action">Reply</button>
                <span style="font-size:11px;color:var(--text-muted)">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
        <button class="view-more-comments">View more comments</button>
      </div>

      <div class="post-sep"></div>

      <div class="comment-input-row">
        <div class="comment-input-avatar">KM</div>
        <input type="text" class="comment-input" placeholder="Write a comment…">
      </div>
  `;
}

function loadPosts(filter = 'all', page = 0) {
  const feed = document.getElementById('feed');
  if (!feed) return;

  let filteredPosts = MOCK_POSTS;
  if (filter !== 'all') {
    filteredPosts = MOCK_POSTS.filter(post => post.type === filter);
  }

  const startIndex = page * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const postsToLoad = filteredPosts.slice(startIndex, endIndex);

  if (postsToLoad.length === 0) {
    hasMorePosts = false;
    return;
  }

  postsToLoad.forEach(post => {
    feed.insertAdjacentHTML('beforeend', renderPost(post));
  });

  // Re-attach event listeners to new posts
  attachPostEventListeners();
}

function attachPostEventListeners() {
  // Like toggle
  document.querySelectorAll('.post-card').forEach(card => {
    const likeBtn = card.querySelector('[data-action="like"]');
    if (!likeBtn) return;

    likeBtn.addEventListener('click', () => {
      const wasLiked = likeBtn.classList.contains('liked');
      likeBtn.classList.toggle('liked');
      
      const svg = likeBtn.querySelector('svg');
      svg.setAttribute('fill', likeBtn.classList.contains('liked') ? 'currentColor' : 'none');

      // Animate reaction count
      const countEl = card.querySelector('.reaction-left span');
      if (!countEl) return;

      const current = parseInt(countEl.textContent, 10);
      countEl.style.transform = 'scale(1.35)';
      countEl.textContent = wasLiked ? current - 1 : current + 1;
      setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 160);
    });

    // Comment button
    const commentBtn = card.querySelector('[data-action="comment"]');
    if (commentBtn) {
      commentBtn.addEventListener('click', () => {
        const input = card.querySelector('.comment-input');
        if (!input) return;
        input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => input.focus(), 180);
      });
    }

    // Share button
    const shareBtn = card.querySelector('[data-action="share"]');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        alert('Share functionality coming soon!');
      });
    }

    // Comment input
    const commentInput = card.querySelector('.comment-input');
    if (commentInput) {
      commentInput.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' || !commentInput.value.trim()) return;
        e.preventDefault();

        const section = card.querySelector('.comments-section');
        const commentsList = section.querySelector('.comments-list');
        if (!commentsList) return;

        const comment = document.createElement('div');
        comment.className = 'comment new';
        comment.innerHTML = `
          <div class="comment-avatar" style="background:var(--green-400);color:#fff">KM</div>
          <div style="flex:1">
            <div class="comment-bubble">
              <div class="comment-name">Karlo Mendoza</div>
              <div class="comment-text">${escapeHtml(commentInput.value.trim())}</div>
            </div>
            <div class="comment-actions">
              <button class="comment-action">Like</button>
              <button class="comment-action">Reply</button>
              <span style="font-size:11px;color:var(--text-muted)">Just now</span>
            </div>
          </div>`;

        commentsList.appendChild(comment);
        commentInput.value = '';
        comment.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  });
}

// ── Infinite Scroll ──
function setupInfiniteScroll() {
  const feed = document.getElementById('feed');
  if (!feed) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && hasMorePosts) {
      isLoading = true;
      currentPage++;
      loadPosts(currentFilter, currentPage);
      isLoading = false;
    }
  }, {
    root: null,
    rootMargin: '200px',
    threshold: 0.1
  });

  // Add sentinel element
  const sentinel = document.createElement('div');
  sentinel.className = 'scroll-sentinel';
  sentinel.style.height = '100px';
  feed.appendChild(sentinel);
  observer.observe(sentinel);
}

// ── Filter Pills ──
document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.textContent.trim().toLowerCase().replace(' posts', '').replace(' ', '');
    currentFilter = filter === 'all' ? 'all' : filter;
    
    const feed = document.getElementById('feed');
    if (feed) {
      feed.innerHTML = '';
      currentPage = 0;
      hasMorePosts = true;
      loadPosts(currentFilter, currentPage);
      
      // Re-add sentinel
      const sentinel = document.createElement('div');
      sentinel.className = 'scroll-sentinel';
      sentinel.style.height = '100px';
      feed.appendChild(sentinel);
    }
  });
});

// ── Admin Posting Functionality ──
const composeInput = document.querySelector('.compose-input');
const composeSubmit = document.querySelector('.compose-submit');
const photoBtn = document.querySelector('.compose-btn.green');
const videoBtn = document.querySelector('.compose-btn.orange');

let currentPostType = 'text';
let selectedMedia = null;

photoBtn?.addEventListener('click', () => {
  currentPostType = 'photo';
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    if (e.target.files[0]) {
      selectedMedia = {
        type: 'image',
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      };
      composeInput.placeholder = 'Photo selected! Add a caption...';
      photoBtn.classList.add('active');
    }
  };
  input.click();
});

videoBtn?.addEventListener('click', () => {
  currentPostType = 'video';
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';
  input.onchange = (e) => {
    if (e.target.files[0]) {
      selectedMedia = {
        type: 'video',
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      };
      composeInput.placeholder = 'Video selected! Add a caption...';
      videoBtn.classList.add('active');
    }
  };
  input.click();
});

composeSubmit?.addEventListener('click', () => {
  const text = composeInput.value.trim();
  if (!text && !selectedMedia) {
    alert('Please add some content to your post.');
    return;
  }

  const newPost = {
    id: MOCK_POSTS.length + 1,
    author: 'Admin',
    initials: 'AD',
    role: 'Administrator',
    time: 'Just now',
    type: currentPostType === 'text' ? 'news' : currentPostType,
    text: text || '',
    likes: 0,
    comments: 0,
    shares: 0,
    isLiked: false
  };

  if (selectedMedia) {
    if (selectedMedia.type === 'image') {
      newPost.image = selectedMedia.url;
    } else if (selectedMedia.type === 'video') {
      newPost.video = selectedMedia.url;
    }
  }

  MOCK_POSTS.unshift(newPost);
  
  const feed = document.getElementById('feed');
  if (feed) {
    feed.insertAdjacentHTML('afterbegin', renderPost(newPost));
    attachPostEventListeners();
  }

  // Reset compose
  composeInput.value = '';
  composeInput.placeholder = 'Share something with the community, Karlo…';
  selectedMedia = null;
  currentPostType = 'text';
  photoBtn?.classList.remove('active');
  videoBtn?.classList.remove('active');
});

// ── Initialize Feed ──
document.addEventListener('DOMContentLoaded', () => {
  loadPosts(currentFilter, currentPage);
  setupInfiniteScroll();
});

// ── User dropdown ──
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

// ── Filter pills ──
document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Like toggle — with heart pop + count animation ──
document.querySelectorAll('.post-action').forEach(btn => {
  const svg = btn.querySelector('svg path[d*="20.84"]');
  if (!svg) return;

  btn.addEventListener('click', () => {
    const wasLiked = btn.classList.contains('liked');
    btn.classList.toggle('liked');

    // Re-trigger heart animation by forcing reflow
    const svgEl = btn.querySelector('svg');
    if (svgEl) {
      svgEl.style.animation = 'none';
      void svgEl.offsetWidth;
      svgEl.style.animation = '';
    }

    // Animate reaction count
    const card = btn.closest('.post-card');
    if (!card) return;
    const countEl = card.querySelector('.reaction-left span');
    if (!countEl) return;

    const current = parseInt(countEl.textContent, 10);
    countEl.style.transform = 'scale(1.35)';
    countEl.textContent = wasLiked ? current - 1 : current + 1;
    setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 160);
  });
});

// ── Comment action like toggle ──
document.querySelectorAll('.comment-action').forEach(btn => {
  if (btn.textContent.trim() !== 'Like') return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('liked');
    btn.textContent = btn.classList.contains('liked') ? 'Liked ❤' : 'Like';
  });
});

// ── Follow toggle ──
document.querySelectorAll('.sug-follow').forEach(btn => {
  btn.addEventListener('click', () => {
    const isFollowing = btn.classList.toggle('following');
    btn.textContent = isFollowing ? 'Following' : 'Follow';
  });
});

// ── Comment button → smooth scroll + focus input ──
document.querySelectorAll('.post-action').forEach(btn => {
  const label = btn.querySelector('span');
  if (!label || (label.textContent !== 'Comment' && label.textContent !== 'Answer')) return;
  btn.addEventListener('click', () => {
    const card = btn.closest('.post-card');
    if (!card) return;
    const input = card.querySelector('.comment-input');
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => input.focus(), 180);
  });
});

// ── Inline comment submit on Enter ──
document.querySelectorAll('.comment-input').forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !input.value.trim()) return;
    e.preventDefault();

    const card = input.closest('.post-card');
    const section = card?.querySelector('.comments-section');
    if (!section) return;

    const comment = document.createElement('div');
    comment.className = 'comment new';
    comment.innerHTML = `
      <div class="comment-avatar" style="background:var(--green-400);color:#fff">KM</div>
      <div style="flex:1">
        <div class="comment-bubble">
          <div class="comment-name">Karlo Mendoza</div>
          <div class="comment-text">${escapeHtml(input.value.trim())}</div>
        </div>
        <div class="comment-actions">
          <button class="comment-action">Like</button>
          <button class="comment-action">Reply</button>
          <span style="font-size:11px;color:var(--text-muted)">Just now</span>
        </div>
      </div>`;

    const viewMore = section.querySelector('.view-more-comments');
    viewMore ? section.insertBefore(comment, viewMore) : section.appendChild(comment);

    // Wire up like on new comment
    const likeBtn = comment.querySelector('.comment-action');
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('liked');
      likeBtn.textContent = likeBtn.classList.contains('liked') ? 'Liked ❤' : 'Like';
    });

    input.value = '';
    comment.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Mobile right drawer with swipe gesture ──
(function () {
  const drawer   = document.getElementById('mobileRightDrawer');
  const backdrop = document.getElementById('mobileRightDrawerBackdrop');
  const closeBtn = document.getElementById('mobileRightDrawerClose');
  const content  = document.querySelector('.mobile-right-drawer-content');
  const sidebar  = document.querySelector('.sidebar');

  // Clone sidebar content into drawer
  if (sidebar && content) {
    content.innerHTML = sidebar.innerHTML;
    // Re-wire follow buttons inside drawer
    content.querySelectorAll('.sug-follow').forEach(btn => {
      btn.addEventListener('click', () => {
        const isFollowing = btn.classList.toggle('following');
        btn.textContent = isFollowing ? 'Following' : 'Follow';
      });
    });
  }

  function openDrawer() {
    drawer?.classList.add('open');
    backdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  // Swipe gesture (axis-locked so vertical scrolling isn't affected)
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 120;
  const AXIS_LOCK = 30;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dy) > AXIS_LOCK) return;
    if (dx < -SWIPE_THRESHOLD) openDrawer();
    if (dx >  SWIPE_THRESHOLD) closeDrawer();
  }, { passive: true });
})();