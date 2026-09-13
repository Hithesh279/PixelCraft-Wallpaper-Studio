import { drawPattern, drawClockOverlay, exportWallpaper, setCustomPalette, getCustomPalette, PALETTES, PATTERNS, PATTERN_LABELS, DESKTOP_W, DESKTOP_H, MOBILE_W, MOBILE_H } from './engine.js';
import { initI18n, t } from './i18n.js';

// Pre-fill from URL params (e.g. from "Open in Editor" on Today's Wallpaper)
const _urlParams = new URLSearchParams(window.location.search);
let currentPattern = parseInt(_urlParams.get('p') ?? '0', 10);
let currentPalette = parseInt(_urlParams.get('pal') ?? '0', 10);
let seed = parseInt(_urlParams.get('s') ?? String(Math.random() * 10000 | 0), 10);
let inverted = _urlParams.get('inv') === '1';
let sliderOpts = { complexity: 5, amplitude: 5, density: 5 };

const dCanvas = document.getElementById('previewDesktop');
const mCanvas = document.getElementById('previewMobile');

function render() {
  const dCtx = dCanvas.getContext('2d');
  const mCtx = mCanvas.getContext('2d');
  drawPattern(dCtx, 640, 360, currentPattern, currentPalette, seed, inverted, sliderOpts);
  drawPattern(mCtx, 145, 314, currentPattern, currentPalette, seed, inverted, sliderOpts);
  drawClockOverlay(dCtx, 640, 360, 'desktop', currentPalette, inverted);
  drawClockOverlay(mCtx, 145, 314, 'mobile', currentPalette, inverted);
}

// ── Pattern grid ──────────────────────────────────────────────────────────────
const grid = document.getElementById('styleGrid');
PATTERNS.forEach((_, i) => {
  const btn = document.createElement('button');
  btn.className = 'style-btn' + (i === currentPattern ? ' active' : '');
  btn.title = PATTERN_LABELS[i];
  const c = document.createElement('canvas');
  c.width = 120;
  c.height = 75;
  btn.appendChild(c);
  grid.appendChild(btn);
  drawPattern(c.getContext('2d'), 120, 75, i, 0, 42, false);
  btn.onclick = () => {
    currentPattern = i;
    grid.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  };
});

// ── Palette row ───────────────────────────────────────────────────────────────
const row = document.getElementById('paletteRow');

function buildPaletteRow() {
  row.innerHTML = '';
  // Built-in palettes
  PALETTES.forEach((pal, i) => {
    const swatch = document.createElement('button');
    swatch.className = 'palette-swatch' + (i === currentPalette ? ' active' : '');
    swatch.title = pal.name;
    swatch.style.background = pal.colors[Math.floor(pal.colors.length / 2)];
    row.appendChild(swatch);
    swatch.onclick = () => {
      currentPalette = i;
      row.querySelectorAll('.palette-swatch').forEach(b => b.classList.remove('active'));
      swatch.classList.add('active');
      document.getElementById('customPaletteEditor').style.display = 'none';
      render();
    };
  });

  // Custom palette swatch (index 14)
  const customSwatch = document.createElement('button');
  customSwatch.className = 'palette-swatch custom-swatch' + (currentPalette === 14 ? ' active' : '');
  customSwatch.title = 'Custom';
  customSwatch.id = 'customPaletteSwatch';
  const cp = getCustomPalette();
  customSwatch.style.background = `linear-gradient(135deg, ${cp.colors.slice(0,3).join(', ')})`;
  customSwatch.innerHTML = `<span style="font-size:12px;line-height:1;color:rgba(255,255,255,0.9);text-shadow:0 1px 2px rgba(0,0,0,0.8);">✦</span>`;
  customSwatch.style.display = 'flex';
  customSwatch.style.alignItems = 'center';
  customSwatch.style.justifyContent = 'center';
  row.appendChild(customSwatch);

  customSwatch.onclick = () => {
    currentPalette = 14;
    row.querySelectorAll('.palette-swatch').forEach(b => b.classList.remove('active'));
    customSwatch.classList.add('active');
    const editor = document.getElementById('customPaletteEditor');
    editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
    render();
  };
}

buildPaletteRow();

// ── Custom Palette Editor ─────────────────────────────────────────────────────
function initCustomPaletteEditor() {
  const editor = document.getElementById('customPaletteEditor');
  const pickerContainer = document.getElementById('customColorPickers');
  const addBtn = document.getElementById('btnAddColor');
  const removeBtn = document.getElementById('btnRemoveColor');

  let savedColors = (() => {
    try { return JSON.parse(localStorage.getItem('wllpr-custom-palette') || 'null'); } catch { return null; }
  })() || getCustomPalette().colors.slice();

  function updateCustomPalette() {
    setCustomPalette(savedColors);
    const swatch = document.getElementById('customPaletteSwatch');
    if (swatch) swatch.style.background = `linear-gradient(135deg, ${savedColors.slice(0,3).join(', ')})`;
    localStorage.setItem('wllpr-custom-palette', JSON.stringify(savedColors));
    if (currentPalette === 14) render();
  }

  function renderPickers() {
    pickerContainer.innerHTML = '';
    savedColors.forEach((color, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'color-picker-wrap';
      const inp = document.createElement('input');
      inp.type = 'color';
      inp.value = color;
      inp.className = 'color-picker-input';
      inp.title = `Color ${i + 1}`;
      inp.oninput = () => {
        savedColors[i] = inp.value;
        updateCustomPalette();
      };
      wrap.appendChild(inp);
      pickerContainer.appendChild(wrap);
    });
    removeBtn.disabled = savedColors.length <= 3;
    addBtn.disabled = savedColors.length >= 10;
  }

  if (savedColors.length >= 3) {
    setCustomPalette(savedColors);
  }

  renderPickers();

  addBtn.onclick = () => {
    if (savedColors.length < 10) {
      savedColors.push('#ffffff');
      renderPickers();
      updateCustomPalette();
    }
  };

  removeBtn.onclick = () => {
    if (savedColors.length > 3) {
      savedColors.pop();
      renderPickers();
      updateCustomPalette();
    }
  };
}

initCustomPaletteEditor();

// ── Mode toggle ───────────────────────────────────────────────────────────────
document.getElementById('btnDark').onclick = () => {
  inverted = false;
  document.getElementById('btnDark').classList.add('active');
  document.getElementById('btnLight').classList.remove('active');
  render();
};

document.getElementById('btnLight').onclick = () => {
  inverted = true;
  document.getElementById('btnLight').classList.add('active');
  document.getElementById('btnDark').classList.remove('active');
  render();
};

// ── Fine-Tune Sliders ─────────────────────────────────────────────────────────
['complexity', 'amplitude', 'density'].forEach(name => {
  const slider = document.getElementById(`slider-${name}`);
  const val = document.getElementById(`slider-${name}-val`);
  if (!slider) return;
  slider.value = sliderOpts[name];
  val.textContent = sliderOpts[name];
  slider.oninput = () => {
    sliderOpts[name] = parseInt(slider.value);
    val.textContent = slider.value;
    render();
  };
});

// ── Shuffle ───────────────────────────────────────────────────────────────────
document.getElementById('btnShuffle').onclick = () => {
  seed = Math.random() * 100000 | 0;
  render();
};

// ── Download / Apply ──────────────────────────────────────────────────────────
document.getElementById('btnDesktop').onclick = () => {
  exportWallpaper(DESKTOP_W, DESKTOP_H, currentPattern, currentPalette, seed, inverted, 'pixelcraft-desktop-4k.png', sliderOpts);
};

document.getElementById('btnMobile').onclick = () => {
  exportWallpaper(MOBILE_W, MOBILE_H, currentPattern, currentPalette, seed, inverted, 'pixelcraft-mobile.png', sliderOpts);
};

// Apply as wallpaper
document.getElementById('btnApply').addEventListener('click', async () => {
  try {
    if (!window.__TAURI__ && (!window.pywebview || !window.pywebview.api)) {
      alert(t('errorOnlyDesktop'));
      return;
    }
    const btn = document.getElementById('btnApply');
    const span = btn.querySelector('span') || btn;
    span.textContent = t('applying');
    btn.disabled = true;

    const c = document.createElement('canvas');
    c.width = DESKTOP_W;
    c.height = DESKTOP_H;
    drawPattern(c.getContext('2d'), DESKTOP_W, DESKTOP_H, currentPattern, currentPalette, seed, inverted, sliderOpts);
    const blob = await new Promise(resolve => c.toBlob(resolve, 'image/png'));
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = Array.from(new Uint8Array(arrayBuffer));

    if (window.pywebview && window.pywebview.api) {
      await window.pywebview.api.set_wallpaper(bytes, `pixelcraft-custom-${seed}.png`);
    } else if (window.__TAURI__) {
      await window.__TAURI__.core.invoke('set_wallpaper', {
        bytes,
        filename: `pixelcraft-custom-${seed}.png`,
      });
    }

    await new Promise(r => setTimeout(r, 5000));
    span.textContent = t('applied');
    setTimeout(() => {
      span.textContent = t('setWallpaper');
      btn.disabled = false;
    }, 2000);
  } catch (err) {
    alert(t('error') + err);
    const btn = document.getElementById('btnApply');
    const span = btn.querySelector('span') || btn;
    span.textContent = t('setWallpaper');
    btn.disabled = false;
  }
});

render();
initI18n();
