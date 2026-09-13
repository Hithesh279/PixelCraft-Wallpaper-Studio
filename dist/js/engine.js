const DESKTOP_W = 3840, DESKTOP_H = 2160;
const MOBILE_W = 1290, MOBILE_H = 2796;

const PALETTES = [
  { name: 'Charcoal', colors: ['#000000','#141414','#2a2a2a','#404040','#595959','#737373','#8c8c8c','#b3b3b3','#d9d9d9','#ffffff'] },
  { name: 'Stone',    colors: ['#1a1714','#2c2825','#3e3a35','#534e47','#6b655c','#857d72','#9f9688','#b8b0a3','#d1c9bd','#ece6dc'] },
  { name: 'Blue',     colors: ['#01052b','#04137a','#0825c7','#0d39ff','#1552ff','#2f73ff','#58a3ff','#7dc3ff','#aedfff','#edf8ff'] },
  { name: 'Sunrise',  colors: ['#031c35','#05284a','#063862','#0b4b7a','#ff5b40','#ff7240','#ff9438','#ffb33f','#ffd064','#fff0c8'] },
  { name: 'Fire',     colors: ['#1a0000','#450000','#7a0000','#b30000','#e63900','#ff6a00','#ff9500','#ffb700','#ffd166','#fff1c2'] },
  { name: 'Purple',   colors: ['#100014','#22002e','#3f005a','#5c0085','#7a00b3','#9b1fff','#b84dff','#cf88ff','#e4c2ff','#f7ebff'] },
  { name: 'Toxic Glow', colors: ['#050807','#0c1410','#14221a','#1e3325','#2a4d2e','#3f6b2f','#5f8a2c','#86b326','#b9e83f','#f6ffe0'] },
  { name: 'Arctic Winter', colors: ['#081018','#112131','#1d3348','#33516a','#55768f','#7d9eb5','#a7c2d3','#cfe0ea','#e8f0f5','#ffffff']},
  { name: 'Neon Horizon', colors: ['#13051a','#290d3a','#3c1259','#3b2285','#2b42b0','#1d6cd4','#2ca1e8','#59cef2','#94f2f7','#e0fbfd'] },
  { name: 'Solar Flare', colors: ['#1f0505','#3a0d0d','#611111','#871c26','#ab3037','#cb4f41','#e6744a','#f79d5c','#fcc579','#fdf2a6'] },
  { name: 'Deep Forest', colors: ['#051214','#0b2426','#123a39','#18524c','#226b5d','#32856c','#49a07a','#68ba89','#91d49d','#c3ebd0'] },
  { name: 'Cosmic Blush Nebula', colors: ['#120414','#260824','#3f0f3d','#5c1a5c','#7a2a7a','#a33a86','#c85b98','#e98fb6','#ffd0dd','#fff1f6'] },
  { name: 'Ocean Depths', colors: ['#020c1b','#0a1628','#0f2847','#0d3b6e','#0e5a8a','#1a7fa0','#30a5b8','#5eccc5','#96ead8','#d4fff2'] },
  { name: 'Blood Moon', colors: ['#000000','#0f0000','#1f0000','#330000','#4d0000','#6b0000','#880000','#a50000','#c40000','#e60000'] },
];

// Custom palette slot (index 14)
let _customPalette = { name: 'Custom', colors: ['#1a1a2e','#16213e','#0f3460','#533483','#e94560','#f5a623','#f8e71c','#7ed321','#4a90e2','#ffffff'] };

export function setCustomPalette(colors) {
  _customPalette = { name: 'Custom', colors };
}

export function getCustomPalette() {
  return _customPalette;
}

function getPaletteEntry(idx) {
  if (idx === 14) return _customPalette;
  return PALETTES[idx] || PALETTES[0];
}

const PATTERNS = [
  'flowing-hills',   // 0
  'smooth-wave',     // 1
  'sand-dunes',      // 2
  'mountains',       // 3
  'concentric-arcs', // 4
  'desert-dunes',    // 5
  'topographic',     // 6
  'crystal',         // 7
  'rain-streaks',    // 8
  'hex-grid',        // 9
  'marble-veins',    // 10
  'low-poly'         // 11
];

const PATTERN_LABELS = [
  'Hills',        // 0
  'Wave',         // 1
  'Dunes',        // 2
  'Mountains',    // 3
  'Arcs',         // 4
  'Desert',       // 5
  'Topographic',  // 6
  'Crystals',     // 7
  'Rain Streaks', // 8
  'Hex Grid',     // 9
  'Marble',       // 10
  'Low Poly'      // 11
];

let _seed = 0;

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function noise(x) {
  const ix = Math.floor(x);
  const fx = x - ix;
  const t = fx * fx * (3 - 2 * fx);
  const seedA = Math.sin(ix * 127.1 + _seed * 0.01) * 43758.5453;
  const seedB = Math.sin((ix + 1) * 127.1 + _seed * 0.01) * 43758.5453;
  const a = seedA - Math.floor(seedA);
  const b = seedB - Math.floor(seedB);
  return a + (b - a) * t;
}

function fbm(x, octaves = 4) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise(x * freq);
    amp *= 0.5;
    freq *= 2.1;
  }
  return val;
}

function noise2d(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const tx = fx * fx * (3 - 2 * fx);
  const ty = fy * fy * (3 - 2 * fy);
  
  function hash(ix, iy) {
    const s = Math.sin(ix * 127.1 + iy * 311.7 + _seed * 0.01) * 43758.5453123;
    return s - Math.floor(s);
  }
  
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}

function fbm2d(x, y, octaves = 4) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise2d(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.05;
  }
  return val;
}

function lerpColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
  const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
}

function getColor(palette, t, inv) {
  const colors = getPaletteEntry(palette).colors;
  const ct = inv ? 1 - t : t;
  const idx = Math.max(0, Math.min(1, ct)) * (colors.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  if (i >= colors.length - 1) return colors[colors.length - 1];
  if (i < 0) return colors[0];
  return lerpColor(colors[i], colors[i+1], f);
}

function getBgColor(palette, inv) {
  const colors = getPaletteEntry(palette).colors;
  return inv ? colors[colors.length - 1] : colors[0];
}

function drawPineTree(ctx, x, bottomY, width, height, rng) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - width * 0.08, bottomY);
  ctx.lineTo(x - width * 0.08, bottomY - height * 0.15);
  ctx.lineTo(x + width * 0.08, bottomY - height * 0.15);
  ctx.lineTo(x + width * 0.08, bottomY);
  ctx.fill();

  const segments = 30;
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const segHeight = height * 1;
    const topY = bottomY - height + (segHeight * t * 0.45);
    const currBottomY = bottomY - height + (segHeight * (t + 0.22));
    const currWidth = width * (0.25 + t * 0.75);
    ctx.beginPath();
    ctx.moveTo(x, topY);
    const jitterL = (rng() - 0.5) * (width * 0.08);
    const jitterR = (rng() - 0.5) * (width * 0.08);
    ctx.lineTo(x - currWidth / 2 + jitterL, currBottomY);
    ctx.lineTo(x + currWidth / 2 + jitterR, currBottomY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// 0. FLOWING HILLS
function drawFlowingHills(ctx, w, h, pal, rng, inv, opts) {
  const complexityMult = opts.complexity / 5;
  const amplitudeMult = opts.amplitude / 5;
  const densityMult = opts.density / 5;
  const layers = Math.round(5 * complexityMult) || 2;
  const isDesktop = w > h;
  for (let i = 0; i < layers; i++) {
    const t = (i + 1) / layers;
    const spacingFactor = isDesktop ? 0.40 : 0.33;
    const baseY = h * (0.5 + (i / layers) * spacingFactor);
    ctx.fillStyle = getColor(pal, t * 0.85 + 0.1, inv);
    ctx.beginPath();
    ctx.moveTo(0, h);
    let ridgePoints = [];
    const geometryStep = Math.max(4, Math.round(w / 120));
    for (let x = 0; x <= w + geometryStep; x += geometryStep) {
      const nx = x / w;
      let y;
      const octaves = Math.max(4, Math.round(10 * complexityMult));
      if (i < 2) {
        const mountainAmplitude = (isDesktop ? 0.32 : 0.12) * amplitudeMult;
        const mountainFreq = isDesktop ? 4.5 : 2.5;
        y = baseY + fbm(nx * mountainFreq + i * 4.5, octaves) * h * mountainAmplitude - (isDesktop ? h * 0.12 : h * 0.05);
      } else {
        const hillAmplitude = (isDesktop ? 0.16 : 0.06) * amplitudeMult;
        const hillFreq = isDesktop ? 2.5 : 1.5;
        y = baseY + fbm(nx * hillFreq + i * 2.1, Math.max(3, octaves - 2)) * h * hillAmplitude - (isDesktop ? h * 0.01 : h * 0.02);
      }
      ridgePoints.push({ x, y });
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    if (i >= 1) {
      let baseTreeWidth, baseTreeHeight;
      if (isDesktop) {
        baseTreeWidth = h * (0.045 + i * 0.004);
        baseTreeHeight = baseTreeWidth * (1 + rng() * 0.2);
      } else {
        baseTreeWidth = w * (0.12 + i * 0.004);
        baseTreeHeight = baseTreeWidth * (1 + rng() * 0.2);
      }
      const stepX = baseTreeWidth * (0.35 / Math.max(0.3, densityMult));
      for (let x = 0; x <= w; x += stepX) {
        const pct = x / w;
        const ptIndex = Math.floor(pct * (ridgePoints.length - 1));
        const pt = ridgePoints[ptIndex] || ridgePoints[ridgePoints.length - 1];
        const rowsDown = isDesktop
          ? (i === 1 ? 3 : 5 + (layers - i))
          : (i === 1 ? 1 : 2 + (layers - i));
        for (let row = 0; row < rowsDown; row++) {
          const yOffset = row * (baseTreeHeight * 0.22);
          const currentBottomY = pt.y + yOffset;
          if (currentBottomY > h + 20) continue;
          const scale = isDesktop ? (0.65 + rng() * 1.1) : (0.8 + rng() * 0.4);
          const currentWidth = baseTreeWidth * (isDesktop ? Math.min(scale, 1.1) : scale);
          const currentHeight = baseTreeHeight * scale;
          const currentX = x + (rng() - 0.5) * (stepX * 0.5);
          drawPineTree(ctx, currentX, currentBottomY, currentWidth, currentHeight, rng);
        }
      }
    }
  }
}

// 1. SMOOTH WAVE
function drawSmoothWave(ctx, w, h, pal, rng, inv, opts) {
  const amplitudeMult = opts.amplitude / 5;
  const complexityMult = opts.complexity / 5;
  const layers = Math.round((8 + (rng() * 5 | 0)) * complexityMult) || 4;
  const centerX = w * (0.45 + rng() * 0.1);
  const baseY = h * (0.75 + rng() * 0.08);
  for (let i = layers; i >= 0; i--) {
    const t = i / layers;
    const spread = h * (0.8 + t * 1.8);
    const peakH = h * (0.05 + t * 0.3) * amplitudeMult;
    const skew = rng() * 0.2 - 0.10;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, baseY + peakH * 0.5);
    const steps = 120;
    for (let s = 0; s <= steps; s++) {
      const st = s / steps;
      const x = st * w;
      const dist = (x - centerX) / spread;
      const bell = Math.exp(-dist * dist * 0.4);
      const asymmetry = 1 + skew * dist;
      const wave = bell * peakH * asymmetry;
      const micro = fbm((x / h) * 2 + i * 1.4, 3) * h * 0.008;
      const y = baseY - wave + micro;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = getColor(pal, 0.1 + (1 - t) * 0.8, inv);
    ctx.fill();
  }
}

// 2. SAND DUNES
function drawSandDunes(ctx, w, h, pal, rng, inv, opts) {
  const amplitudeMult = opts.amplitude / 5;
  const complexityMult = opts.complexity / 5;
  const layers = Math.round((7 + (rng() * 5 | 0)) * complexityMult) || 4;
  for (let i = 0; i < layers; i++) {
    const t = (i + 1) / layers;
    const baseY = h * (0.55 + t * 0.35);
    const freq = 0.5 + rng() * 0.8;
    const phase = rng() * 10;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const nx = x / h;
      const wave = Math.sin(nx * Math.PI * freq + phase) * h * 0.05 * amplitudeMult;
      const n = fbm(nx * 0.8 + i * 2.1, 3) * h * 0.05 * amplitudeMult;
      const y = baseY + wave + n;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = getColor(pal, t * 0.8 + 0.15, inv);
    ctx.fill();
  }
}

// 3. MOUNTAINS
function drawMountains(ctx, w, h, pal, rng, inv, opts) {
  const amplitudeMult = opts.amplitude / 5;
  const complexityMult = opts.complexity / 5;
  const layers = Math.round((5 + (rng() * 3 | 0)) * complexityMult) || 3;
  for (let i = 0; i < layers; i++) {
    const t = (i + 1) / layers;
    const baseY = h * (0.55 + t * 0.35);
    const peakCount = 2 + (rng() * 2 | 0);
    const offset = rng() * 50;
    ctx.beginPath();
    ctx.moveTo(-2, h + 2);
    const peaks = [];
    for (let p = 0; p < peakCount; p++) {
      peaks.push({
        cx: w * (0.1 + rng() * 0.8),
        peakH: h * (0.1 + rng() * 0.15) * (1 - i * 0.08) * amplitudeMult,
        width: h * (0.6 + rng() * 0.6),
      });
    }
    for (let x = -2; x <= w + 2; x += 2) {
      let y = baseY;
      for (const p of peaks) {
        const dist = Math.abs(x - p.cx);
        if (dist < p.width) {
          const rise = (1 - dist / p.width);
          const sharpness = 1.3 + rng() * 0.3;
          const peakY = Math.pow(rise, sharpness) * p.peakH;
          y = Math.min(y, baseY - peakY);
        }
      }
      const micro = fbm((x / h) * 1.5 + i * 2.3 + offset, 3) * h * 0.008;
      ctx.lineTo(x, y + micro);
    }
    ctx.lineTo(w + 2, h + 2);
    ctx.closePath();
    ctx.fillStyle = getColor(pal, t * 0.8 + 0.12, inv);
    ctx.fill();
  }
}

// 4. CONCENTRIC ARCS
function drawConcentricArcs(ctx, w, h, pal, rng, inv, opts) {
  const densityMult = opts.density / 5;
  const amplitudeMult = opts.amplitude / 5;
  const maxR = h * 1.0 * amplitudeMult;
  const originX = w * (0.45 + rng() * 0.1);
  const originY = h * 1.5;
  const rings = Math.round((14 + (rng() * 6 | 0)) * densityMult) || 6;
  for (let i = rings; i >= 0; i--) {
    const t = i / rings;
    const r = maxR * t;
    ctx.beginPath();
    ctx.arc(originX, originY, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = getColor(pal, 0.1 + (1 - t) * 0.8, inv);
    ctx.fill();
  }
}

// 5. DESERT DUNES
function drawDesertDunes(ctx, w, h, pal, rng, inv, opts) {
  const densityMult = opts.density / 5;
  const amplitudeMult = opts.amplitude / 5;
  const count = Math.round(15 * densityMult) || 5;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    ctx.beginPath();
    let x = w * rng(), y = h * (0.5 + rng() * 0.5);
    ctx.moveTo(x, y);
    for (let j = 0; j < 10; j++) {
      x += (rng() - 0.5) * w * 1;
      y += (rng() - 0.4) * h * 0.2 * amplitudeMult;
      const cp1y = h * (0.5 + rng() * 0.5);
      const cp2y = h * (0.5 + rng() * 0.5);
      ctx.bezierCurveTo(w * rng(), cp1y, w * rng(), cp2y, x, y);
    }
    ctx.strokeStyle = getColor(pal, t, inv);
    ctx.lineWidth = rng() * 3;
    ctx.stroke();
  }
}

// 6. TOPOGRAPHIC MAP
function drawTopographic(ctx, w, h, pal, rng, inv, opts) {
  const densityMult = opts.density / 5;
  const amplitudeMult = opts.amplitude / 5;
  const complexityMult = opts.complexity / 5;

  ctx.fillStyle = getColor(pal, 0.05, inv);
  ctx.fillRect(0, 0, w, h);

  const contourLevels = Math.round(28 * densityMult) || 12;
  const scale = (0.0018 * complexityMult);
  const centerX = w * (0.3 + rng() * 0.4);
  const centerY = h * (0.3 + rng() * 0.4);

  const stepX = Math.max(6, Math.round(w / 140));

  for (let c = 0; c < contourLevels; c++) {
    const t = c / contourLevels;
    const isMajor = (c % 5 === 0);
    const strokeCol = getColor(pal, 0.25 + t * 0.7, inv);
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = isMajor ? 2.5 : 1.2;
    ctx.globalAlpha = isMajor ? 0.9 : 0.45;

    const baseElevation = t * h;
    ctx.beginPath();
    for (let x = 0; x <= w + stepX; x += stepX) {
      const dx = (x - centerX) * scale;
      const dy = (baseElevation - centerY) * scale;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      
      const n = fbm2d(
        x * scale,
        baseElevation * scale + Math.sin(distFromCenter * 3),
        Math.round(3 * complexityMult) || 2
      );
      
      const y = baseElevation + (n - 0.5) * (h * 0.35) * amplitudeMult;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// 7. CRYSTAL FACETS
function drawCrystal(ctx, w, h, pal, rng, inv, opts) {
  const complexityMult = opts.complexity / 5;
  const amplitudeMult = opts.amplitude / 5;

  ctx.fillStyle = getColor(pal, 0.05, inv);
  ctx.fillRect(0, 0, w, h);

  const cols = Math.round(12 * complexityMult) || 6;
  const rows = Math.round(8 * complexityMult) || 4;
  const cellW = w / cols;
  const cellH = h / rows;

  const points = [];
  for (let r = 0; r <= rows; r++) {
    points[r] = [];
    for (let c = 0; c <= cols; c++) {
      const jitterX = (c === 0 || c === cols) ? 0 : (rng() - 0.5) * cellW * 0.7 * amplitudeMult;
      const jitterY = (r === 0 || r === rows) ? 0 : (rng() - 0.5) * cellH * 0.7 * amplitudeMult;
      points[r][c] = { x: c * cellW + jitterX, y: r * cellH + jitterY };
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p1 = points[r][c];
      const p2 = points[r][c + 1];
      const p3 = points[r + 1][c + 1];
      const p4 = points[r + 1][c];

      const t1 = ((c + r) / (cols + rows));
      const t2 = ((c + r + 1) / (cols + rows));

      // Triangle 1
      const g1 = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
      g1.addColorStop(0, getColor(pal, t1 * 0.8 + 0.15, inv));
      g1.addColorStop(1, getColor(pal, t1 * 0.5 + 0.05, inv));
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();

      // Triangle 2
      const g2 = ctx.createLinearGradient(p1.x, p1.y, p4.x, p4.y);
      g2.addColorStop(0, getColor(pal, t2 * 0.85 + 0.1, inv));
      g2.addColorStop(1, getColor(pal, t2 * 0.6 + 0.25, inv));
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();

      // Edge highlights
      ctx.strokeStyle = getColor(pal, 0.9, inv).replace('rgb', 'rgba').replace(')', ',0.35)');
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// 8. RAIN STREAKS
function drawRainStreaks(ctx, w, h, pal, rng, inv, opts) {
  const densityMult = opts.density / 5;
  const amplitudeMult = opts.amplitude / 5;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, getColor(pal, 0.05, inv));
  bgGrad.addColorStop(0.7, getColor(pal, 0.15, inv));
  bgGrad.addColorStop(1, getColor(pal, 0.3, inv));
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const streakCount = Math.round(280 * densityMult) || 100;
  const angle = 0.15;

  for (let i = 0; i < streakCount; i++) {
    const t = i / streakCount;
    const len = (h * (0.04 + rng() * 0.12)) * amplitudeMult;
    const currentY = rng() * h;
    const currentX = (rng() * w + currentY * angle) % w;

    const col = getColor(pal, 0.5 + t * 0.45, inv);
    const grad = ctx.createLinearGradient(currentX, currentY, currentX + len * angle, currentY + len);
    grad.addColorStop(0, col.replace('rgb', 'rgba').replace(')', ',0.1)'));
    grad.addColorStop(1, col.replace('rgb', 'rgba').replace(')', ',0.8)'));

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2 + rng() * 1.5;
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(currentX + len * angle, currentY + len);
    ctx.stroke();
  }

  const waterGrad = ctx.createLinearGradient(0, h * 0.85, 0, h);
  waterGrad.addColorStop(0, getColor(pal, 0.4, inv).replace('rgb', 'rgba').replace(')', ',0)'));
  waterGrad.addColorStop(1, getColor(pal, 0.6, inv).replace('rgb', 'rgba').replace(')', ',0.3)'));
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);
}

// 9. HEX GRID
function drawHexGrid(ctx, w, h, pal, rng, inv, opts) {
  const densityMult = opts.density / 5;
  const complexityMult = opts.complexity / 5;

  ctx.fillStyle = getColor(pal, 0.03, inv);
  ctx.fillRect(0, 0, w, h);

  const radius = (Math.min(w, h) * 0.05 / densityMult);
  const hexW = radius * Math.sqrt(3);
  const hexH = radius * 1.5;

  const cols = Math.ceil(w / hexW) + 2;
  const rows = Math.ceil(h / hexH) + 2;

  function drawSingleHex(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * hexW + (r % 2 === 1 ? hexW * 0.5 : 0);
      const cy = r * hexH;

      const n = fbm2d(c * 0.2 * complexityMult, r * 0.2 * complexityMult, 3);
      const col = getColor(pal, n * 0.85 + 0.1, inv);

      drawSingleHex(cx, cy, radius * 0.9);
      ctx.fillStyle = col.replace('rgb', 'rgba').replace(')', `,${0.15 + n * 0.7})`);
      ctx.fill();

      ctx.strokeStyle = getColor(pal, 0.9, inv).replace('rgb', 'rgba').replace(')', ',0.25)');
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// 10. MARBLE VEINS
function drawMarbleVeins(ctx, w, h, pal, rng, inv, opts) {
  const complexityMult = opts.complexity / 5;
  const densityMult = opts.density / 5;
  const amplitudeMult = opts.amplitude / 5;

  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, getColor(pal, 0.08, inv));
  bgGrad.addColorStop(0.5, getColor(pal, 0.18, inv));
  bgGrad.addColorStop(1, getColor(pal, 0.06, inv));
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const veinCount = Math.round(18 * densityMult) || 8;
  for (let v = 0; v < veinCount; v++) {
    const vt = v / veinCount;
    const col = getColor(pal, 0.35 + vt * 0.6, inv);
    const startX = (w * rng()) % w;
    const startY = 0;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    let currX = startX;
    let currY = startY;
    const segs = 60;
    for (let s = 0; s <= segs; s++) {
      currY = (s / segs) * h;
      const turb = fbm(currY * 0.003 * complexityMult + v * 3.5, 4);
      currX = startX + (turb - 0.5) * (w * 0.4) * amplitudeMult;
      ctx.lineTo(currX, currY);
    }

    ctx.strokeStyle = col.replace('rgb', 'rgba').replace(')', ',0.3)');
    ctx.lineWidth = Math.min(w, h) * (0.015 + rng() * 0.025);
    ctx.stroke();

    ctx.strokeStyle = getColor(pal, 0.95, inv).replace('rgb', 'rgba').replace(')', ',0.7)');
    ctx.lineWidth = 1 + rng() * 1.5;
    ctx.stroke();
  }
}

// 11. LOW-POLY TERRAIN
function drawLowPoly(ctx, w, h, pal, rng, inv, opts) {
  const complexityMult = opts.complexity / 5;
  const amplitudeMult = opts.amplitude / 5;

  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, getColor(pal, 0.02, inv));
  skyGrad.addColorStop(0.5, getColor(pal, 0.2, inv));
  skyGrad.addColorStop(1, getColor(pal, 0.45, inv));
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const cols = Math.round(18 * complexityMult) || 10;
  const rows = Math.round(12 * complexityMult) || 6;
  const cellW = w / cols;
  const baseY = h * 0.55;

  const grid = [];
  for (let r = 0; r <= rows; r++) {
    grid[r] = [];
    for (let c = 0; c <= cols; c++) {
      const nx = c / cols;
      const ny = r / rows;
      const heightVal = fbm2d(nx * 4, ny * 4, 4);
      const elevation = (1 - ny) * heightVal * (h * 0.35) * amplitudeMult;
      const y = baseY + ny * (h - baseY) - elevation;
      const x = c * cellW + (rng() - 0.5) * (cellW * 0.3);
      grid[r][c] = { x, y, val: heightVal };
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p1 = grid[r][c];
      const p2 = grid[r][c + 1];
      const p3 = grid[r + 1][c + 1];
      const p4 = grid[r + 1][c];

      const avg1 = (p1.val + p2.val + p3.val) / 3;
      const avg2 = (p1.val + p3.val + p4.val) / 3;

      ctx.fillStyle = getColor(pal, avg1 * 0.8 + 0.15, inv);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = getColor(pal, avg2 * 0.7 + 0.05, inv);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = getColor(pal, 0.0, inv).replace('rgb', 'rgba').replace(')', ',0.15)');
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export function drawClockOverlay(ctx, w, h, type, paletteIdx, inv) {
  const bg = getBgColor(paletteIdx, inv);
  const r = parseInt(bg.slice(1,3), 16), g = parseInt(bg.slice(3,5), 16), b = parseInt(bg.slice(5,7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  ctx.fillStyle = brightness > 125 ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${mins}`;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

  if (type === 'desktop') {
    ctx.font = '300 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText(dateStr, w / 2, h * 0.20);
    ctx.font = '600 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText(time, w / 2, h * 0.30);
  } else if (type === 'mobile') {
    ctx.font = '500 7px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText(dateStr.toUpperCase(), w / 2, h * 0.15);
    ctx.font = '700 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", Roboto';
    ctx.fillText(time, w / 2, h * 0.23);
  }
}

const DEFAULT_OPTS = { complexity: 5, amplitude: 5, density: 5 };

export function drawPattern(ctx, w, h, patternIdx, paletteIdx, s, inv = false, opts = {}) {
  const o = { ...DEFAULT_OPTS, ...opts };
  _seed = s;
  const rng = mulberry32(s);
  ctx.fillStyle = getBgColor(paletteIdx, inv);
  ctx.fillRect(0, 0, w, h);

  switch(PATTERNS[patternIdx]) {
    case 'flowing-hills':   drawFlowingHills(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'smooth-wave':     drawSmoothWave(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'sand-dunes':      drawSandDunes(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'mountains':       drawMountains(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'concentric-arcs': drawConcentricArcs(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'desert-dunes':    drawDesertDunes(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'topographic':     drawTopographic(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'crystal':         drawCrystal(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'rain-streaks':    drawRainStreaks(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'hex-grid':        drawHexGrid(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'marble-veins':    drawMarbleVeins(ctx, w, h, paletteIdx, rng, inv, o); break;
    case 'low-poly':        drawLowPoly(ctx, w, h, paletteIdx, rng, inv, o); break;
    default:                drawFlowingHills(ctx, w, h, paletteIdx, rng, inv, o); break;
  }
}

export async function exportWallpaper(w, h, patternIdx, paletteIdx, s, inv, filename, opts = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  drawPattern(c.getContext('2d'), w, h, patternIdx, paletteIdx, s, inv, opts);

  const blob = await new Promise(resolve => c.toBlob(resolve, 'image/png'));
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = Array.from(new Uint8Array(arrayBuffer));

  if (window.pywebview && window.pywebview.api) {
    await window.pywebview.api.save_wallpaper(bytes, filename);
  } else if (window.__TAURI__) {
    await window.__TAURI__.core.invoke('save_wallpaper', { bytes, filename });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export { PALETTES, PATTERNS, PATTERN_LABELS, DESKTOP_W, DESKTOP_H, MOBILE_W, MOBILE_H };
