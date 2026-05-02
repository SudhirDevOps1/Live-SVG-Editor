# 🎨 Live SVG Editor — PrivMITLab

A production-grade, privacy-first **Live SVG Editor & Toolkit** built with React 19, Vite 7, TypeScript, and Tailwind CSS 4.

## ✨ Features

### Four Integrated Modes
- **✍️ Editor Mode** — Code editor with live SVG preview, zoom, rotation, file upload/download
- **📐 Draw Mode** — Canvas-based drawing with shapes, freehand paths, text, and SVG export
- **🖌️ Customize Mode** — Element-level property editing (fill, stroke, opacity, transforms)
- **💻 Code Mode** — Generate React JSX, React Native, and HTML code from SVG

### Toolbar Actions
- Undo / Redo with full history
- Upload & download SVG files
- Load sample SVG
- Optimize SVG (remove metadata, comments, empty groups)
- Clear canvas

### UI/UX
- 🌗 Dark/Light mode (persisted in localStorage)
- 📱 Fully responsive design
- 🪟 Glassmorphism design system
- ⌨️ Keyboard shortcuts: `Ctrl+S`, `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Shift+K`
- 🔔 Toast notifications
- 🌐 PWA support with offline capability

## 🔒 Privacy-First

**No tracking. No analytics. No cookies. No ads.**

All SVG processing happens entirely in your browser. Your SVGs never leave your device. The app works fully offline after the first load.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
├── src/
│   ├── components/     # UI components
│   │   ├── Header.tsx
│   │   ├── Toolbar.tsx
│   │   ├── ModeToggle.tsx
│   │   ├── EditorMode.tsx
│   │   ├── DrawMode.tsx
│   │   ├── CustomizeMode.tsx
│   │   ├── CodeMode.tsx
│   │   ├── SvgPreview.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── DimensionsControls.tsx
│   │   ├── Footer.tsx
│   │   └── Toast.tsx
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript types
├── public/             # Static assets (PWA files)
└── lib/                # No external libraries
```

## 🛠 Tech Stack

- **React 19** — UI library
- **Vite 7** — Build tool
- **TypeScript** — Type safety
- **Tailwind CSS 4** — Styling
- **Browser APIs** — DOMParser, XMLSerializer, Canvas, Service Worker

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
