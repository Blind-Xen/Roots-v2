/* ══════════════════════════════════════════════════════
   nonfarmer-profile.js
   Roots — Non-Farmer Profile Page Scripts
══════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════
   TAB SWITCHING
══════════════════════════════ */
(function initTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });
})();


/* ══════════════════════════════
   FOLLOW BUTTON (main profile)
══════════════════════════════ */
(function initFollowBtn() {
  const followBtn = document.getElementById('followBtn');
  if (!followBtn) return;

  let isFollowing = false;

  followBtn.addEventListener('click', () => {
    isFollowing = !isFollowing;

    if (isFollowing) {
      followBtn.classList.add('following');
      followBtn.innerHTML = `<i class="fas fa-user-check"></i><span>Following</span>`;
    } else {
      followBtn.classList.remove('following');
      followBtn.innerHTML = `<i class="fas fa-user-plus"></i><span>Follow</span>`;
    }

    // Animate stat count
    const followerStat = document.querySelector('.stat-item .stat-num');
    if (!followerStat) return;
    const current = parseStatNum(followerStat.textContent);
    animateStatChange(followerStat, isFollowing ? current + 1 : current - 1);
  });
})();


/* ══════════════════════════════
   POST LIKE BUTTONS
══════════════════════════════ */
(function initPostLikes() {
  document.querySelectorAll('.post-action-btn[data-action="like"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasLiked = btn.classList.contains('liked');
      btn.classList.toggle('liked');

      // Swap icon
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = btn.classList.contains('liked')
          ? 'fas fa-heart'
          : 'far fa-heart';
      }

      // Swap label
      const label = btn.querySelector('span');
      if (label) label.textContent = btn.classList.contains('liked') ? 'Liked' : 'Like';

      // Animate count
      const card     = btn.closest('.post-card');
      const countEl  = card?.querySelector('.reaction-count');
      if (!countEl) return;
      const current  = parseInt(countEl.textContent, 10) || 0;
      animateCount(countEl, wasLiked ? current - 1 : current + 1);
    });
  });
})();


/* ══════════════════════════════
   ORDER FILTER PILLS
══════════════════════════════ */
(function initOrderFilters() {
  const pills      = document.querySelectorAll('.order-filter-pill');
  const orderCards = document.querySelectorAll('.order-card');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;

      orderCards.forEach(card => {
        if (filter === 'all' || card.dataset.status === filter) {
          card.classList.remove('hidden');
          // Stagger re-appear
          card.style.animation = 'none';
          void card.offsetWidth; // reflow
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


/* ══════════════════════════════
   LEAVE REVIEW BUTTON
══════════════════════════════ */
(function initReviewBtns() {
  document.querySelectorAll('.review-btn').forEach(btn => {
    if (btn.dataset.reviewed === 'true') return; // already reviewed

    btn.addEventListener('click', () => {
      btn.classList.add('reviewed');
      btn.dataset.reviewed = 'true';
      btn.innerHTML = `<i class="fas fa-check"></i> Reviewed`;
    });
  });
})();


/* ══════════════════════════════
   FOLLOWING / UNFOLLOW BUTTONS
   (Following tab farmer cards)
══════════════════════════════ */
(function initUnfollowBtns() {
  document.querySelectorAll('.following-unfollow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isCurrentlyFollowing = btn.dataset.following === 'true';

      if (isCurrentlyFollowing) {
        // Unfollow
        btn.dataset.following = 'false';
        btn.classList.add('unfollowed');
        btn.textContent = 'Follow';
      } else {
        // Re-follow
        btn.dataset.following = 'true';
        btn.classList.remove('unfollowed');
        btn.textContent = 'Following';
      }
    });
  });
})();


/* ══════════════════════════════
   HELPERS
══════════════════════════════ */

/**
 * Animates a number changing in a count element with a quick scale pop.
 */
function animateCount(el, newVal) {
  el.style.transform = 'scale(1.35)';
  el.textContent     = newVal;
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 160);
}

/**
 * Parse "1.2K" → 1200, "348" → 348
 */
function parseStatNum(text) {
  const t = text.trim().toUpperCase();
  if (t.endsWith('K')) return Math.round(parseFloat(t) * 1000);
  return parseInt(t, 10) || 0;
}

/**
 * Format raw number back to display string (1200 → "1.2K")
 */
function formatStatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/**
 * Animate a stat number with scale + update.
 */
function animateStatChange(el, newRaw) {
  el.style.transform = 'scale(1.35)';
  el.textContent     = formatStatNum(newRaw);
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 160);
}

/**
 * Escape HTML to prevent XSS in any dynamic content.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}