# PixelCraft Wallpaper Studio

### Free, unlimited procedural 4K wallpapers & online 4K library in a native desktop app.

**Built for better backgrounds. Powered by PixelCraft.**

<p align="center">
  <a href="https://pixel-craft-wallpaper-studio-zhlb-git-main-hithesh279.vercel.app/"><img src="https://img.shields.io/badge/🌐_Live_Demo-Vercel-black?style=for-the-badge&logo=vercel" alt="Live Demo"></a>
  <a href="https://github.com/Hithesh279/PixelCraft-Wallpaper-Studio/releases"><img src="https://img.shields.io/badge/💻_Download-Windows_App_(.exe)-0078D6?style=for-the-badge&logo=windows" alt="Download Windows App"></a>
  <img src="https://img.shields.io/badge/Resolution-4K_UHD-green?style=for-the-badge" alt="4K Resolution">
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="MIT License">
</p>

> 🌐 **Live Web Demo:** [https://pixel-craft-wallpaper-studio-zhlb-git-main-hithesh279.vercel.app/](https://pixel-craft-wallpaper-studio-zhlb-git-main-hithesh279.vercel.app/)  
> 💻 **Standalone Desktop App (.exe):** [Download Latest Windows Release](https://github.com/Hithesh279/PixelCraft-Wallpaper-Studio/releases)

PixelCraft Wallpaper Studio is a lightweight, powerful application that combines **algorithmic procedural canvas generation** with **online search across 1,000,000+ 4K UHD wallpapers** powered by Wallhaven.

---

## 🌟 Key Features

| | Feature | Description |
|---|---|---|
| 🧭 | **Explore Online 4K** | Real-time search & discovery across 1,000,000+ live 4K wallpapers via the Wallhaven API. |
| 🎨 | **12 Procedural Styles** | High-performance HTML5 Canvas procedural algorithms rendered locally in real-time. |
| 🌊 | **Smooth Sliding UI** | Fluid segmented sliding pill indicators with spring cubic-bezier transitions. |
| 🖥️ | **1-Click Apply** | Instantly set any procedural or online 4K wallpaper as your Windows/macOS/Linux desktop background. |
| 4K | **High-Res Export** | Export uncompressed 4K Desktop (3840×2160) and Mobile (1290×2796) images. |
| 🌈 | **Color Swatches** | Click dominant color swatches on any online wallpaper to filter by exact matching hex palettes. |
| 🌗 | **Light & Dark Mode** | Dynamic system theme toggle with smooth pill sliding animations. |
| 🔒 | **Private & Fast** | Local rendering engine running offline with zero trackers. |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python 3.8+** installed on your system.

### Installation & Run

1. **Clone or navigate to the project directory:**
   ```bash
   cd wallpaper-generator-main
   ```

2. **Install requirements:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Launch PixelCraft Wallpaper Studio:**
   ```bash
   python app.py
   ```

---

## 🧭 Navigation & Studio Modes

### 1. 🏠 Home (`index.html`)
Browse a curated collection of 12 procedural wallpaper categories with live canvas preview cards, featured showcase hero, and instant wallpaper viewing.

### 2. 🧭 Explore Online (`explore/index.html`)
- **Live Search**: Query by keywords or select quick genre chips (*Cyberpunk, Nature, Space, Anime, Minimal, Cars, Dark/AMOLED, Abstract*).
- **Advanced Filters**:
  - Sorting: *Toplist, Hot, Most Viewed, Favorites, Latest, Random*
  - Resolution: *4K UHD (3840×2160), 2K QHD (2560×1440), 1080p FHD*
  - Aspect Ratio: *16:9 Desktop, 21:9 Ultrawide, 9:16 Mobile Phone*
- **Interactive Lightbox**: View wallpaper metadata, resolution badges, view counts, and dominant color chips.
- **1-Click Desktop Apply & 4K Download**: Downloads the full-res source directly into your Downloads folder or applies it immediately as your Windows background.

### 3. ➕ Create Studio (`create/index.html`)
- **Procedural Canvas Editor**: Generate custom algorithmic landscapes.
- **Custom Color Palette Builder**: Select preset palettes or customize individual hex colors.
- **Fine-Tune Sliders**: Control wave frequencies, hill roughness, density, seed randomization, and day/night mode.
- **Export Options**: Export 4K Desktop PNG, Mobile PNG, or set as Windows Desktop background directly.

---

## 🎨 12 Procedural Scene Types

1. **Flowing Hills**: Layered landscapes with rolling contours and pine silhouettes.
2. **Smooth Waves**: Minimalist, harmonic compositions with fluid color waves.
3. **Sand Dunes**: Desert landscapes with layered atmospheric sand dunes.
4. **Jagged Mountains**: Dramatic alpine peaks with atmospheric depth and fog.
5. **Concentric Arcs**: Geometric radial shapes and radiant gradient blends.
6. **Desert Scribbles**: Organic procedural lines inspired by abstract topographic contours.
7. **Topographic Neon**: Glowing elevation contour maps with vibrant synthwave neon lines.
8. **Bokeh Orbs**: Dreamy, glowing depth-of-field orb lighting and ambient gradients.
9. **Matrix Rain**: Cyberpunk cascading digital rain glyph streams.
10. **Aurora Borealis**: Shimmering polar night skies with curtain-like aurora bands.
11. **Isometric Cubes**: 3D geometric modular cubic lattices with dynamic ambient shading.
12. **Crystal Facets**: Low-poly prismatic crystal geometric planes and refraction effects.

---

## 🛠️ Tech Stack & Architecture

- **Backend / Wrapper**: Python (`pywebview`), `http.server`, native OS Windows/macOS/Linux wallpaper ctypes API.
- **Frontend**: Pure Vanilla JavaScript (ES Modules), HTML5 Canvas 2D, Modern CSS3 with CSS Variables & Glassmorphism.
- **API Integration**: Wallhaven 4K Wallpaper REST API (`https://wallhaven.cc/api/v1`).
- **Typography & Icons**: Clean SVG icon system, Google Fonts (*Dancing Script, Parisienne, Great Vibes*).

---

## 📄 License & Credits

- **Tagline**: Built for better backgrounds. Powered by PixelCraft.
- **Application**: PixelCraft Wallpaper Studio