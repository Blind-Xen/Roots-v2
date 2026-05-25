// Roots Livestock — listing photos
// ===== SECTION: PHOTO UPLOAD =====
// ======================================================================
function handlePhotoSelect(event) {
  const files = Array.from(event.target.files);
  const remaining = 5 - selectedPhotos.length;
  if (remaining <= 0) {
    showToast('⚠️ Maximum 5 photos allowed');
    return;
  }
  const toAdd = files.slice(0, remaining);
  if (files.length > remaining) {
    showToast(`⚠️ Only ${remaining} more photo(s) can be added`);
  }
  toAdd.forEach(file => {
    if (!file.type.startsWith('image/')) { showToast('⚠️ Only image files allowed'); return; }
    if (file.size > 15 * 1024 * 1024)   { showToast('⚠️ File too large (max 15MB)'); return; }
    const url = URL.createObjectURL(file);
    selectedPhotos.push({ file, previewUrl: url });
  });
  renderPhotoPreview();
  event.target.value = '';
}

function setCoverPhoto(index) {
  if (index === 0) return; // already cover
  const [moved] = selectedPhotos.splice(index, 1);
  selectedPhotos.unshift(moved);
  renderPhotoPreview();
  showToast('⭐ Cover photo updated!');
}

function renderPhotoPreview() {
  const dropzone    = document.getElementById('coverPhotoDropzone');
  const placeholder = document.getElementById('coverPhotoPlaceholder');
  const coverImg    = document.getElementById('coverPhotoPreview');
  const coverBadge  = document.getElementById('coverBadge');
  const row         = document.getElementById('photoPreviewRow');
  const hint        = document.getElementById('photoHint');

  if (selectedPhotos.length === 0) {
    // Reset to empty state
    coverImg.src = '';
    coverImg.classList.add('hidden');
    coverBadge.classList.add('hidden');
    placeholder.classList.remove('hidden');
    row.innerHTML = '';
    if (hint) hint.style.display = 'none';
    return;
  }

  // Show cover photo (index 0) in the hero dropzone
  coverImg.src = selectedPhotos[0].previewUrl;
  coverImg.classList.remove('hidden');
  coverBadge.classList.remove('hidden');
  placeholder.classList.add('hidden');

  // Render thumbnails for photos 2-5
  if (selectedPhotos.length > 1) {
    row.innerHTML = selectedPhotos.slice(1).map((p, i) => `
      <div class="photo-thumb" onclick="setCoverPhoto(${i + 1})" title="Set as cover photo">
        <img src="${p.previewUrl}" alt="Photo ${i+2}">
        <button class="photo-thumb-remove" onclick="event.stopPropagation();removePhoto(${i + 1})" title="Remove photo">✕</button>
      </div>
    `).join('') + `
      ${selectedPhotos.length < 5 ? `<div class="photo-thumb add-more-thumb" onclick="document.getElementById('photoFileInput').click()" title="Add more photos">
        <i class="fas fa-plus"></i>
      </div>` : ''}
    `;
    if (hint) hint.style.display = 'block';
  } else {
    // Only 1 photo — show an add-more tile in the strip
    row.innerHTML = `<div class="photo-thumb add-more-thumb" onclick="document.getElementById('photoFileInput').click()" title="Add more photos">
      <i class="fas fa-plus"></i>
    </div>`;
    if (hint) hint.style.display = 'none';
  }
}

function removePhoto(index) {
  const target = selectedPhotos[index];
  if (target && typeof target.previewUrl === 'string' && target.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(target.previewUrl);
  }
  selectedPhotos.splice(index, 1);
  renderPhotoPreview();
}

function clearPhotoPreviews() {
  selectedPhotos.forEach((p) => {
    if (typeof p.previewUrl === 'string' && p.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(p.previewUrl);
    }
  });
  selectedPhotos = [];
  renderPhotoPreview();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

async function resolveSelectedPhotoUrls() {
  const urls = await Promise.all(selectedPhotos.map(async (photo) => {
    if (photo.file && typeof photo.previewUrl === 'string' && photo.previewUrl.startsWith('blob:')) {
      return fileToDataUrl(photo.file);
    }
    return photo.previewUrl;
  }));
  return urls.filter(Boolean);
}

// ======================================================================
