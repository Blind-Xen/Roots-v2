/**
 * Roots Landing Page — landing-page.js
 *
 * Smooth background crossfade on feature card hover.
 *
 * HOW IT WORKS:
 * Two fixed divs are stacked (A below, B on top).
 * When switching to a new image:
 *   1. Set the new image on layer B (invisible)
 *   2. Fade B in (opacity 0 → 1)
 *   3. Once faded in, copy B's image to A and hide B instantly
 * This gives a true crossfade with no flash or jump.
 *
 * HOW TO USE:
 * 1. Put your images in an assets/ folder
 * 2. Update the bgImages map below with your actual file names
 */

(function () {

  const OVERLAY = 'linear-gradient(rgba(5, 20, 10, 0.55), rgba(5, 20, 10, 0.55))';
  const DEFAULT_BG = 'assets/landingbg.jpg';

  const bgImages = {
    community:   'assets/feat-community.jpg',
    farmtube:    'assets/feat-farmtube.jpg',
    marketplace: 'assets/feat-marketplace.jpg',
    tanimbase:   'assets/feat-tanimbase.jpg',
  };

  const layerA = document.getElementById('landBgA'); // bottom, always visible
  const layerB = document.getElementById('landBgB'); // top, fades in/out

  if (!layerA || !layerB) return;

  let currentImg = DEFAULT_BG;
  let fadeTimer = null;

  function buildBg(imgPath) {
    return `${OVERLAY}, url('${imgPath}')`;
  }

  function crossfadeTo(imgPath) {
    if (imgPath === currentImg) return;

    // Cancel any in-progress fade
    clearTimeout(fadeTimer);

    // Put new image on top layer and trigger fade-in
    layerB.style.backgroundImage = buildBg(imgPath);
    // Force reflow so the transition fires
    layerB.offsetHeight;
    layerB.classList.add('is-fading');

    // After transition completes (500ms), swap layers silently
    fadeTimer = setTimeout(function () {
      layerA.style.backgroundImage = buildBg(imgPath);
      layerB.classList.remove('is-fading');
      currentImg = imgPath;
    }, 500);
  }

  // Preload all images for smooth first hover
  Object.values(bgImages).forEach(function (src) {
    const img = new Image();
    img.src = src;
  });

  // Wire up feature cards
  const featCards = document.querySelectorAll('.feat-card[data-img]');

  featCards.forEach(function (card) {
    const key = card.getAttribute('data-img');
    const imgPath = bgImages[key];
    if (!imgPath) return;

    card.addEventListener('mouseenter', function () {
      crossfadeTo(imgPath);
    });

    card.addEventListener('mouseleave', function () {
      crossfadeTo(DEFAULT_BG);
    });
  });

})();