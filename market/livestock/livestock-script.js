/**
 * @deprecated Logic moved to js/ — loaded from livestock.html in this order:
 *   shared/ → marketplace/ → buyer/ → seller/ → admin/ → app.js
 *
 * Kept so old bookmarks or docs that reference livestock-script.js still work.
 */
(function () {
  var modules = [
    'js/shared/config.js',
    'js/shared/barangays.js',
    'js/shared/legal.js',
    'js/shared/state.js',
    'js/shared/storage.js',
    'js/shared/toast.js',
    'js/shared/market-prices.js',
    'js/shared/api.js',
    'js/shared/ui-shell.js',
    'js/marketplace/notifications.js',
    'js/marketplace/browse.js',
    'js/buyer/mode.js',
    'js/seller/photos.js',
    'js/seller/profile-photo.js',
    'js/seller/post-listing-form.js',
    'js/admin/panel.js',
    'js/seller/submit-listing.js',
    'js/seller/my-listings.js',
    'js/app.js'
  ];
  console.warn('[Roots] livestock-script.js is deprecated. Prefer script tags in livestock.html.');
  modules.forEach(function (src) {
    document.write('<script src="' + src + '"><\/script>');
  });
})();
