// ── PixelCraft: Wallhaven Explore Controller ───────────────────────────────────

let state = {
  query: '',
  page: 1,
  lastPage: 1,
  sorting: 'toplist',
  resolutions: '',
  ratios: '',
  colors: '',
  wallpapers: [],
  activeModalWp: null,
  loading: false,
};

const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const tagChips = document.getElementById('tagChips');
const sortSelect = document.getElementById('sortSelect');
const resSelect = document.getElementById('resSelect');
const ratioSelect = document.getElementById('ratioSelect');
const exploreGrid = document.getElementById('exploreGrid');
const paginationWrap = document.getElementById('paginationWrap');
const btnLoadMore = document.getElementById('btnLoadMore');
const resultCount = document.getElementById('resultCount');
const activeColorFilter = document.getElementById('activeColorFilter');
const activeColorBadge = document.getElementById('activeColorBadge');
const clearColorFilter = document.getElementById('clearColorFilter');
const loadingOverlay = document.getElementById('loadingOverlay');

// Modal Elements
const exploreModal = document.getElementById('exploreModal');
const modalClose = document.getElementById('modalClose');
const modalImg = document.getElementById('modalImg');
const modalId = document.getElementById('modalId');
const modalRes = document.getElementById('modalRes');
const modalCat = document.getElementById('modalCat');
const modalSize = document.getElementById('modalSize');
const modalStats = document.getElementById('modalStats');
const modalColors = document.getElementById('modalColors');
const btnModalSet = document.getElementById('btnModalSet');
const btnModalSetText = document.getElementById('btnModalSetText');
const btnModalDl = document.getElementById('btnModalDl');
const modalSourceLink = document.getElementById('modalSourceLink');

function formatFileSize(bytes) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function formatNumber(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

async function apiSearch(params) {
  // Try via Python backend first (no CORS limitations)
  if (window.pywebview && window.pywebview.api && window.pywebview.api.search_wallhaven) {
    return await window.pywebview.api.search_wallhaven(params);
  }

  // Fallback to direct client fetch
  const query = new URLSearchParams({
    apikey: 'JF6rk4r6KRY7FVvOIpkgcSwhYkmyFByR',
    purity: '100',
    categories: '110',
    sorting: params.sorting || 'toplist',
    order: 'desc',
    page: String(params.page || 1),
  });
  if (params.q) query.set('q', params.q);
  if (params.resolutions) query.set('resolutions', params.resolutions);
  if (params.ratios) query.set('ratios', params.ratios);
  if (params.colors) query.set('colors', params.colors);

  const res = await fetch(`https://wallhaven.cc/api/v1/search?${query.toString()}`);
  return await res.json();
}

async function fetchWallpapers(append = false) {
  if (state.loading) return;
  state.loading = true;

  if (!append) {
    state.page = 1;
    loadingOverlay.classList.remove('hidden');
  } else {
    btnLoadMore.disabled = true;
    btnLoadMore.querySelector('span').textContent = 'Loading...';
  }

  try {
    const params = {
      q: state.query,
      page: state.page,
      sorting: state.sorting,
      resolutions: state.resolutions,
      ratios: state.ratios,
      colors: state.colors,
    };

    const res = await apiSearch(params);
    const data = res.data || [];
    const meta = res.meta || { current_page: 1, last_page: 1, total: 0 };

    state.lastPage = meta.last_page || 1;

    if (append) {
      state.wallpapers = [...state.wallpapers, ...data];
    } else {
      state.wallpapers = data;
    }

    renderGrid(append);

    // Update result count header
    if (meta.total !== undefined) {
      resultCount.textContent = `${meta.total.toLocaleString()} wallpapers`;
    }

    // Toggle pagination
    if (state.page < state.lastPage) {
      paginationWrap.style.display = 'flex';
      btnLoadMore.disabled = false;
      btnLoadMore.querySelector('span').textContent = 'Load More Wallpapers';
    } else {
      paginationWrap.style.display = 'none';
    }
  } catch (err) {
    console.error('Failed to fetch Wallhaven wallpapers:', err);
    if (!append) {
      exploreGrid.innerHTML = `
        <div class="explore-empty-state">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="20" cy="20" r="18"/><path d="M20 14v6M20 24v2"/></svg>
          <div style="font-size: 16px; font-weight: 600; color: var(--text);">Could not connect to Wallhaven</div>
          <div>Please check your internet connection.</div>
        </div>
      `;
    }
  } finally {
    state.loading = false;
    loadingOverlay.classList.add('hidden');
  }
}

function renderGrid(append = false) {
  if (!append) {
    exploreGrid.innerHTML = '';
  }

  if (state.wallpapers.length === 0) {
    exploreGrid.innerHTML = `
      <div class="explore-empty-state">
        <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="20" cy="20" r="18"/><path d="M14 20h12M20 14l-6 6 6 6"/></svg>
        <div style="font-size: 16px; font-weight: 600; color: var(--text);">No wallpapers found</div>
        <div>Try adjusting your search query or filters.</div>
      </div>
    `;
    return;
  }

  const itemsToRender = append ? state.wallpapers.slice(-24) : state.wallpapers;

  itemsToRender.forEach(wp => {
    const card = document.createElement('div');
    card.className = 'explore-card';

    // Resolution badge (4K, 8K, 2K)
    const is4K = wp.dimension_x >= 3840 || wp.dimension_y >= 2160;
    const badgeText = is4K ? '4K UHD' : (wp.resolution || `${wp.dimension_x}×${wp.dimension_y}`);

    card.innerHTML = `
      <span class="explore-card-badge">${badgeText}</span>
      <img class="explore-card-img" src="${wp.thumbs?.large || wp.thumbs?.small || wp.path}" alt="Wallpaper ${wp.id}" loading="lazy">
      <div class="explore-card-overlay">
        <div class="explore-card-stats">
          <div class="explore-card-stat">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>${formatNumber(wp.favorites)}</span>
          </div>
          <div class="explore-card-stat">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>${formatNumber(wp.views)}</span>
          </div>
        </div>
        <div class="explore-card-colors">
          ${(wp.colors || []).slice(0, 5).map(c => `
            <div class="explore-color-dot" style="background-color: ${c};" title="Filter by color ${c}"></div>
          `).join('')}
        </div>
      </div>
    `;

    // Click card to open modal
    card.onclick = (e) => {
      // If user clicked directly on a color dot, filter by that color instead of opening modal
      const dot = e.target.closest('.explore-color-dot');
      if (dot) {
        e.stopPropagation();
        const colorHex = dot.style.backgroundColor;
        // Convert to 6-char hex
        const hex = rgbToHex(colorHex).replace('#', '');
        applyColorFilter(hex);
        return;
      }
      openModal(wp);
    };

    exploreGrid.appendChild(card);
  });
}

function rgbToHex(rgbStr) {
  if (rgbStr.startsWith('#')) return rgbStr;
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return '000000';
  const r = parseInt(match[0]).toString(16).padStart(2, '0');
  const g = parseInt(match[1]).toString(16).padStart(2, '0');
  const b = parseInt(match[2]).toString(16).padStart(2, '0');
  return `${r}${g}${b}`;
}

function applyColorFilter(hex) {
  state.colors = hex;
  activeColorFilter.style.display = 'flex';
  activeColorBadge.style.backgroundColor = `#${hex}`;
  fetchWallpapers(false);
}

clearColorFilter.onclick = () => {
  state.colors = '';
  activeColorFilter.style.display = 'none';
  fetchWallpapers(false);
};

// ── Modal Controller ──────────────────────────────────────────────────────────
function openModal(wp) {
  state.activeModalWp = wp;
  modalImg.src = wp.path || wp.thumbs?.large;
  modalTitle.textContent = `Wallpaper #${wp.id}`;
  modalId.textContent = `Wallhaven ID: ${wp.id}`;
  modalRes.textContent = `${wp.dimension_x} × ${wp.dimension_y} (${wp.ratio || '16:9'})`;
  modalCat.textContent = (wp.category || 'General').toUpperCase();
  modalSize.textContent = formatFileSize(wp.file_size);
  modalStats.textContent = `${formatNumber(wp.views)} views · ${formatNumber(wp.favorites)} favs`;
  modalSourceLink.href = wp.url || `https://wallhaven.cc/w/${wp.id}`;

  // Render dominant colors
  modalColors.innerHTML = '';
  (wp.colors || []).forEach(color => {
    const chip = document.createElement('div');
    chip.className = 'explore-modal-color-chip';
    chip.style.backgroundColor = color;
    chip.title = `Search other wallpapers with color ${color}`;
    chip.onclick = () => {
      closeModal();
      applyColorFilter(color.replace('#', ''));
    };
    modalColors.appendChild(chip);
  });

  btnModalSetText.textContent = 'Set as Desktop Wallpaper';
  btnModalSet.disabled = false;

  exploreModal.classList.add('open');
}

function closeModal() {
  exploreModal.classList.remove('open');
  state.activeModalWp = null;
}

modalClose.onclick = closeModal;
exploreModal.onclick = (e) => {
  if (e.target === exploreModal) closeModal();
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && exploreModal.classList.contains('open')) {
    closeModal();
  }
});

// ── Apply Wallpaper from Modal ────────────────────────────────────────────────
btnModalSet.onclick = async () => {
  if (!state.activeModalWp) return;
  const wp = state.activeModalWp;

  try {
    btnModalSet.disabled = true;
    btnModalSetText.textContent = 'Downloading & Applying...';

    if (window.pywebview && window.pywebview.api && window.pywebview.api.set_wallpaper_from_url) {
      await window.pywebview.api.set_wallpaper_from_url(wp.path, `pixelcraft-online-${wp.id}.jpg`);
      btnModalSetText.textContent = 'Applied to Desktop! ✨';
      setTimeout(() => {
        btnModalSetText.textContent = 'Set as Desktop Wallpaper';
        btnModalSet.disabled = false;
      }, 3000);
    } else {
      alert('Desktop wallpaper setting is available in the desktop app.');
      btnModalSetText.textContent = 'Set as Desktop Wallpaper';
      btnModalSet.disabled = false;
    }
  } catch (err) {
    console.error('Failed to set wallpaper:', err);
    alert('Error setting wallpaper: ' + err);
    btnModalSetText.textContent = 'Set as Desktop Wallpaper';
    btnModalSet.disabled = false;
  }
};

// ── Download Original from Modal ──────────────────────────────────────────────
btnModalDl.onclick = async () => {
  if (!state.activeModalWp) return;
  const wp = state.activeModalWp;

  try {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.download_wallpaper_from_url) {
      const ext = wp.file_type === 'image/png' ? 'png' : 'jpg';
      await window.pywebview.api.download_wallpaper_from_url(wp.path, `pixelcraft-wallhaven-${wp.id}.${ext}`);
      alert(`Wallpaper downloaded to your Downloads folder!`);
    } else {
      const a = document.createElement('a');
      a.href = wp.path;
      a.download = `pixelcraft-wallhaven-${wp.id}.jpg`;
      a.target = '_blank';
      a.click();
    }
  } catch (err) {
    console.error('Download error:', err);
    alert('Download error: ' + err);
  }
};

// ── Search & Filter Listeners ─────────────────────────────────────────────────
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    state.query = searchInput.value.trim();
    updateTagChipsActiveState(state.query);
    searchClear.style.display = state.query ? 'flex' : 'none';
    fetchWallpapers(false);
  }
});

searchInput.addEventListener('input', () => {
  searchClear.style.display = searchInput.value ? 'flex' : 'none';
});

searchClear.onclick = () => {
  searchInput.value = '';
  searchClear.style.display = 'none';
  state.query = '';
  updateTagChipsActiveState('');
  fetchWallpapers(false);
};

// Tag chips
tagChips.querySelectorAll('.explore-tag-chip').forEach(chip => {
  chip.onclick = () => {
    const q = chip.getAttribute('data-query');
    searchInput.value = q;
    searchClear.style.display = q ? 'flex' : 'none';
    state.query = q;
    updateTagChipsActiveState(q);
    fetchWallpapers(false);
  };
});

function updateTagChipsActiveState(query) {
  tagChips.querySelectorAll('.explore-tag-chip').forEach(chip => {
    const chipQ = chip.getAttribute('data-query');
    if (chipQ.toLowerCase() === query.toLowerCase()) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

// Select filters
sortSelect.onchange = (e) => {
  state.sorting = e.target.value;
  fetchWallpapers(false);
};

resSelect.onchange = (e) => {
  state.resolutions = e.target.value;
  fetchWallpapers(false);
};

ratioSelect.onchange = (e) => {
  state.ratios = e.target.value;
  fetchWallpapers(false);
};

// Load More
btnLoadMore.onclick = () => {
  if (state.page < state.lastPage) {
    state.page += 1;
    fetchWallpapers(true);
  }
};

// Initial Load
if (window.pywebview) {
  fetchWallpapers(false);
} else {
  window.addEventListener('pywebviewready', () => {
    fetchWallpapers(false);
  });
  // Fallback if pywebviewready never fires (e.g. standard browser)
  setTimeout(() => {
    if (!window.pywebview && state.wallpapers.length === 0 && !state.loading) {
      fetchWallpapers(false);
    }
  }, 1000);
}
