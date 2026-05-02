<div align="center">

# 🎨 Live SVG Editor

### PrivMITLab — Privacy-First SVG Toolkit

![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![Privacy](https://img.shields.io/badge/🔒_Privacy-First-orange?style=flat-square)
![Offline](https://img.shields.io/badge/🌐_Offline-Ready-success?style=flat-square)

**A production-grade, privacy-first, offline-capable SVG Editor & Toolkit.**
View, edit, draw, customize, search icons, and generate code from SVG graphics — all in your browser. Zero servers. Zero tracking.

</div>

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/PrivMITLab/svg-editor.git
cd svg-editor

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ✨ Features

### 🎯 Four Integrated Modes

| Mode | Description | Key Tools |
|------|-------------|-----------|
| ✍️ **Editor** | VS Code-style code editor with live SVG preview | Syntax highlighting, zoom, rotate, 9 background themes |
| 📐 **Draw** | Canvas-based vector drawing tool | 11 tools: rect, circle, ellipse, diamond, star, polygon, line, arrow, freehand, text |
| 🖌️ **Customize** | Element-level property editor | Fill, stroke, opacity, transforms — live preview |
| 💻 **Code** | SVG-to-code generator | React JSX, React Native, HTML — copy & download |

### 🔍 SVG Icon Search (NEW)

Search **200,000+ free open-source icons** from three APIs with automatic fallback:

| API | Icons | Auth |
|-----|-------|------|
| **Iconify** | 200,000+ | No key |
| **theSVG** | 5,650+ brands | No key |
| **Simple Icons** | 1,500+ brands | No key |

Quick search tags, search history, color picker, size selector, one-click insert.

### 🎨 Draw Mode — Full Feature Set

- **11 Drawing Tools**: Rectangle, Circle, Ellipse, Diamond, Star, Polygon, Line, Arrow, Freehand, Text, Select
- **Undo/Redo** with 100-state history (separate from Editor)
- **Resize Handles** (8 points: corners + edges)
- **Duplicate / Bring to Front / Send to Back / Delete**
- **Arrow keys nudge** (1px, Shift+Arrow = 10px)
- **Snap to Grid** toggle
- **Double-click text to edit** in-place
- **Font selector** with 13 fonts (Hindi/Devanagari, English, Serif, Sans-serif, Handwritten, Monospace)
- **Live text preview** as you type
- **Layers panel** showing all elements
- **Opacity & Rotation sliders** for selected elements
- **Color presets** sidebar
- **Export to SVG** with proper markers

### 📝 Editor Mode — Pro Features

- **Tokenizer-based syntax highlighting** (VS Code Dark+ theme)
- **9 preview backgrounds**: Checker, Grid Light, Grid Dark, Dot Light, Dot Dark, White, Black, Gray, Blueprint (default)
- **Zoom** (10%–300%) + **Rotation** (0°–360°) with sliders
- **SVG Code Formatter** with one-click beautify (`Ctrl+Shift+F`)
- **Line numbers** with scroll sync
- **Tab key** inserts 2 spaces
- **Character & line count** display

### 🖼 PNG Export

Download SVG as PNG with quality selector:
- **1x** — Standard resolution
- **2x** — High DPI / Retina (default)
- **3x** — Print quality
- **4x** — Ultra HD

### 🌍 Multi-Language Font Support

Google Fonts loaded for global text support:

| Language | Fonts |
|----------|-------|
| English | Inter, Poppins, Roboto, Montserrat, Playfair Display |
| **हिन्दी (Hindi)** | Noto Sans Devanagari, Noto Serif Devanagari |
| Handwritten | Caveat |
| Monospace | JetBrains Mono, Fira Code (fallback) |

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Download SVG |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+Shift+K` | Clear canvas |
| `Ctrl+Shift+F` | Format/beautify code |
| `Ctrl+Shift+I` | Open Icon Search |
| `Ctrl+D` | Duplicate (Draw mode) |
| `Delete` | Delete selected (Draw mode) |
| `Arrow keys` | Nudge selected (Draw mode) |
| `Escape` | Close modals |
| `Tab` | Insert 2 spaces (Editor) |

---

## 🔒 Privacy-First Architecture

<div align="center">

**Zero data collection. Zero cookies. Zero ads. Zero tracking.**

Your SVGs never leave your device. All processing is 100% client-side.

</div>

| Privacy Feature | Status |
|----------------|--------|
| Content Security Policy (CSP) | ✅ Enforced |
| No analytics scripts | ✅ Confirmed |
| No tracking cookies | ✅ Confirmed |
| No server-side processing | ✅ All local |
| No third-party data sharing | ✅ Never |
| Offline-first (Service Worker) | ✅ Active |
| PWA installable | ✅ Manifest.json |
| Open source | ✅ MIT License |

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for full details.

---

## 📁 Project Structure

```
svg-editor/
├── index.html                  # Entry point with CSP meta tag
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── .gitignore                  # Git ignore rules
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker (offline + caching)
│   ├── privacy.html            # Standalone privacy policy page
│   ├── robots.txt              # Search engine rules
│   └── sitemap.xml             # Site map
│
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component with routing
│   ├── index.css               # Global styles + Tailwind + syntax colors
│   ├── vite-env.d.ts           # Vite type declarations
│   │
│   ├── components/             # UI Components
│   │   ├── Header.tsx          # App header with dark mode toggle
│   │   ├── Toolbar.tsx         # Global toolbar (undo/redo/save/optimize)
│   │   ├── ModeToggle.tsx      # Mode selector (Editor/Draw/Customize/Code)
│   │   ├── EditorMode.tsx      # Code editor + live preview
│   │   ├── DrawMode.tsx        # Canvas-based drawing tool
│   │   ├── CustomizeMode.tsx   # Element property editor
│   │   ├── CodeMode.tsx        # Code generator (React/RN/HTML)
│   │   ├── SvgPreview.tsx      # Reusable SVG preview
│   │   ├── CodeHighlighter.tsx # Tokenizer-based syntax highlighter
│   │   ├── SvgIconSearch.tsx   # Multi-API icon search modal
│   │   ├── PngExport.tsx       # PNG export with quality selector
│   │   ├── PrivacyPage.tsx     # In-app privacy policy
│   │   ├── ColorPicker.tsx     # Color input component
│   │   ├── DimensionsControls.tsx # Width/height controls
│   │   ├── Toast.tsx           # Notification component
│   │   └── Footer.tsx          # App footer with privacy link
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useLocalStorage.ts  # Persistent state hook
│   │   ├── useSvgOperations.ts # SVG undo/redo operations
│   │   └── useOfflineSync.ts   # Online/offline detection + SW registration
│   │
│   ├── utils/                  # Utility Functions
│   │   ├── codeGenerators.ts   # SVG → React/RN/HTML converters
│   │   ├── svgOptimizer.ts     # SVG optimizer (regex-based)
│   │   ├── svgFormatter.ts     # SVG pretty-printer / code formatter
│   │   └── exportHelpers.ts    # Download, clipboard, PNG export
│   │
│   └── types/
│       └── index.ts            # TypeScript type definitions
│
└── lib/                        # Empty (no external libraries)
```

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | UI library with concurrent features |
| **Vite** | 7 | Build tool with HMR |
| **TypeScript** | 5.9 | Type safety & DX |
| **Tailwind CSS** | 4 | Utility-first styling |
| **React DOM** | 19 | DOM rendering |
| **clsx + tailwind-merge** | Latest | Class name utilities |

### Browser APIs Used (No External Dependencies)

| API | Purpose |
|-----|---------|
| `DOMParser` | Parse SVG strings into DOM |
| `XMLSerializer` | Serialize DOM back to SVG strings |
| `Canvas 2D` | PNG export rendering |
| `Service Worker` | Offline caching |
| `localStorage` | User preferences persistence |
| `fetch` | Icon API calls (Iconify, theSVG, Simple Icons) |
| `Blob / URL.createObjectURL` | File download |

---

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 15+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Opera | 76+ | ✅ Full support |
| Mobile Chrome | 90+ | ✅ Full support |
| Mobile Safari | 15+ | ✅ Full support |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file — project overview |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [LIMITATIONS.md](LIMITATIONS.md) | Known limitations & roadmap |
| [PRIVACY_POLICY.md](PRIVACY_POLICY.md) | Privacy policy |

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Quick contribution workflow
git checkout -b feature/my-feature
# Make changes
npm run build  # Verify build passes
git commit -m "feat: add my feature"
git push origin feature/my-feature
# Open a Pull Request
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

© 2025–2026 **PrivMITLab**. Built with privacy as a fundamental right.

---

## 🙏 Acknowledgments

- [Iconify](https://iconify.design/) — Free icon API (200,000+ icons)
- [theSVG](https://thesvg.org/) — Brand icon library (5,650+ icons)
- [Simple Icons](https://simpleicons.org/) — Brand icons (1,500+)
- [Google Fonts](https://fonts.google.com/) — Noto Sans Devanagari & multi-language fonts
- [VS Code Dark+ Theme](https://code.visualstudio.com/) — Syntax highlighting color scheme

---

<div align="center">

**Made with ❤️ by PrivMITLab**

*Your privacy is not a feature — it's a right.*

</div>
