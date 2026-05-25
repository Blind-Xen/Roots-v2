// Roots Livestock — my listings
// ===== SECTION: MY LISTINGS MODAL =====
// ======================================================================
function openMyListings() {
  document.getElementById('myListingsModal').classList.remove('hidden');
  renderMyListings();
}

function closeMyListings() {
  document.getElementById('myListingsModal').classList.add('hidden');
}

function renderMyListings() {
  const grid  = document.getElementById('myListingsGrid');
  const empty = document.getElementById('myListingsEmpty');
  const mine  = listings.filter(l => l.isMine);

  if (mine.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = mine.map(l => {
    const photos = Array.isArray(l.photos)
      ? l.photos
      : (typeof l.photos === 'string' ? l.photos.split('||').filter(Boolean) : []);

    const typeBadge = {
      sell:'💰 Sale', trade:'🔄 Trade', both:'💰🔄 Both', service:'🐂 Service'
    }[l.listingType] || '💰 Sale';

    const statusClass = l.status === 'active' ? '' : l.status;
    const statusLabel = l.status === 'active' ? '✅ Active' : l.status === 'sold' ? '🏷️ Sold' : '🗑️ Deleted';

    const firstPhoto = photos.length > 0 ? photos[0] : null;
    const photoEl = firstPhoto
      ? `<img src="${firstPhoto}" alt="${l.title}" class="my-listing-img">`
      : `<span class="my-listing-emoji">${l.emoji}</span>`;

    const purokStr = l.locationPurok ? ` • ${l.locationPurok}` : '';

    return `
      <div class="my-listing-row">
        ${photoEl}
        <div class="my-listing-body">
          <div class="my-listing-title">${l.title}</div>
          <div class="my-listing-meta">
            <span>₱${l.price.toLocaleString()}</span>
            <span>${typeBadge}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${l.locationBarangay || l.location}${purokStr}</span>
          </div>
          <div style="margin-top:4px">
            <span class="my-listing-status ${statusClass}">${statusLabel}</span>
          </div>
        </div>
        <div class="my-listing-actions">
          <button class="btn-edit" onclick="closeMyListings(); openAddListingModal(${l.id});" title="Edit listing">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-delete-listing" onclick="deleteListing(${l.id})" title="Delete listing">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function deleteListing(id) {
  if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
  const idx = listings.findIndex(l => l.id === id);
  if (idx === -1) return;
  const title = listings[idx].title;
  const previousStatus = listings[idx].status;
  listings[idx].status = 'deleted';

  // ── Always auto-save to localStorage ──
  saveToStorage();

  // ── Log to admin activity ──
  logAdminActivity('red', `Farmer deleted listing: <strong>${title}</strong>`, 'Just now');

  renderMyListings();
  renderListings();
  renderProfileStats();
  showToast('🗑️ Listing deleted and saved');

  if (USE_API) {
    fetch(`${API_BASE}?action=listing&id=${id}`, { method: 'DELETE' })
      .then(res => { if (!res.ok) throw new Error(`Delete failed (${res.status})`); })
      .then(() => syncListingsFromApi().catch(() => {}))
      .catch(e => {
        console.warn('[Roots] Background API delete failed (kept locally):', e);
      });
  }
}

// ======================================================================
