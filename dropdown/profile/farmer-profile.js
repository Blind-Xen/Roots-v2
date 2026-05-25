/* ══════════════════════════════════════════════════════
   farmer-profile.js
   Roots — Farmer Profile Page Scripts
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

    // Animate follower count
    const followerStat = document.querySelector('.stat-item .stat-num');
    if (!followerStat) return;
    const current = parseStatNum(followerStat.textContent);
    animateStatChange(followerStat, isFollowing ? current + 1 : current - 1);
  });
})();


/* ══════════════════════════════
   SIDEBAR FOLLOW BUTTONS
   (Similar Farmers widget)
══════════════════════════════ */
(function initSuggestedFollowBtns() {
  document.querySelectorAll('.sug-follow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isFollowing = btn.classList.toggle('following');
      btn.textContent   = isFollowing ? 'Following' : 'Follow';
    });
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

      // Animate count in reaction bar
      const card    = btn.closest('.post-card');
      const countEl = card?.querySelector('.reaction-count');
      if (!countEl) return;
      const current = parseInt(countEl.textContent, 10) || 0;
      animateCount(countEl, wasLiked ? current - 1 : current + 1);
    });
  });
})();


/* ══════════════════════════════
   ADD TO CART BUTTONS
══════════════════════════════ */
(function initCartBtns() {
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasAdded = btn.classList.toggle('added');
      const product  = btn.dataset.product || 'Item';

      if (wasAdded) {
        btn.innerHTML = `<i class="fas fa-check" aria-hidden="true"></i> Added`;
        showToast(`"${product}" added to cart`);
      } else {
        btn.innerHTML = `<i class="fas fa-shopping-cart" aria-hidden="true"></i> Add to Cart`;
      }
    });
  });
})();


/* ══════════════════════════════
   GALLERY CELL CLICK
══════════════════════════════ */
(function initGallery() {
  document.querySelectorAll('.gallery-cell').forEach((cell, i) => {
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Farm photo ${i + 1}`);

    const open = () => {
      // In production this would open a lightbox.
      // For now we just do a subtle scale feedback.
      cell.style.transform = 'scale(1.04)';
      setTimeout(() => { cell.style.transform = ''; }, 200);
    };

    cell.addEventListener('click', open);
    cell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
})();


/* ══════════════════════════════
   SIMPLE TOAST NOTIFICATION
══════════════════════════════ */
let toastTimeout = null;

function showToast(message) {
  // Remove existing toast if any
  let existing = document.getElementById('roots-toast');
  if (existing) existing.remove();
  clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.id    = 'roots-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '24px',
    left:         '50%',
    transform:    'translateX(-50%) translateY(0)',
    background:   '#0f3d22',
    color:        '#fff',
    padding:      '10px 22px',
    borderRadius: '999px',
    fontSize:     '13px',
    fontWeight:   '700',
    fontFamily:   'var(--font, sans-serif)',
    boxShadow:    '0 4px 20px rgba(15,35,24,.3)',
    zIndex:       '9999',
    opacity:      '0',
    transition:   'opacity .25s ease, transform .25s ease',
    pointerEvents:'none',
    whiteSpace:   'nowrap',
  });

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(-50%) translateY(-6px)';
    });
  });

  toastTimeout = setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => toast.remove(), 280);
  }, 2500);
}


/* ══════════════════════════════
   HELPERS
══════════════════════════════ */

function animateCount(el, newVal) {
  el.style.transform = 'scale(1.35)';
  el.textContent     = newVal;
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 160);
}

function parseStatNum(text) {
  const t = text.trim().toUpperCase();
  if (t.endsWith('K')) return Math.round(parseFloat(t) * 1000);
  return parseInt(t, 10) || 0;
}

function formatStatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function animateStatChange(el, newRaw) {
  el.style.transform = 'scale(1.35)';
  el.textContent     = formatStatNum(newRaw);
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 160);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}