export const translations = {
  "en": {
    "name": "English",
    "home": "Home",
    "create": "Create",
    "featuredBadge": "FEATURED",
    "viewWallpaper": "View Wallpaper",
    "createdBy": "Created by",
    "pattern": "Pattern",
    "palette": "Palette",
    "mode": "Mode",
    "dark": "Dark",
    "light": "Light",
    "generateVariation": "GENERATE VARIATION",
    "setWallpaper": "Set Wallpaper",
    "applying": "Applying...",
    "applied": "Applied!",
    "downloadDesktop": "Download Desktop",
    "downloadMobile": "Download Mobile",
    "errorOnlyDesktop": "Feature only available in the desktop app.",
    "error": "Error: ",
    "patternLabels": [
      "Hills",
      "Wave",
      "Dunes",
      "Mountains",
      "Arcs",
      "Desert",
      "Topographic",
      "Crystals",
      "Rain Streaks",
      "Hex Grid",
      "Marble",
      "Low Poly"
    ],
    "patternSections": {
      "4": { "title": "Arcs", "subtitle": "Concentric shapes and radiant gradients" },
      "0": { "title": "Hills", "subtitle": "Landscape terrain with pine forests" },
      "1": { "title": "Waves", "subtitle": "Smooth mathematical fluid curves" },
      "3": { "title": "Mountains", "subtitle": "Dramatic rocky peaks and jagged ridges" },
      "2": { "title": "Dunes", "subtitle": "Organic desert wind-swept ripples" },
      "5": { "title": "Desert Scribble", "subtitle": "Fluid contour curves and abstract strokes" },
      "6": { "title": "Topography", "subtitle": "Organic contour map elevation isolines" },
      "7": { "title": "Crystals", "subtitle": "Geometric faceted shards and refractions" },
      "8": { "title": "Rain Streaks", "subtitle": "Atmospheric falling rain and wet reflections" },
      "9": { "title": "Hex Grid", "subtitle": "Futuristic honeycomb digital matrix" },
      "10": { "title": "Marble Veins", "subtitle": "Flowing fluid mineral textures and veins" },
      "11": { "title": "Low Poly", "subtitle": "Faceted 3D geometric terrain landscape" }
    }
  }
};

export function getLang() {
  return 'en';
}

export function setLang() {
  // English only
}

export function t(key) {
  return translations["en"][key];
}

export function initI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations["en"][key]) {
      if (el.tagName === 'INPUT' && el.type === 'button') {
        el.value = translations["en"][key];
      } else {
        let hasElementChildren = false;
        for (let i = 0; i < el.childNodes.length; i++) {
          if (el.childNodes[i].nodeType === 1) {
            hasElementChildren = true;
            break;
          }
        }
        if (hasElementChildren) {
          for (let i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim().length > 0) {
              el.childNodes[i].textContent = " " + translations["en"][key] + " ";
              break;
            }
          }
        } else {
          el.textContent = translations["en"][key];
        }
      }
    }
  });
}
