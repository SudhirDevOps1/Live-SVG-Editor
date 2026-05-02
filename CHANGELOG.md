<div align="center">

# 📜 Changelog

**Live SVG Editor — PrivMITLab**

All notable changes to this project will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/)

</div>

---

## [2.0.0] — 2026-01-15

### 🎉 Major Release — Complete Rewrite

This is a major update with significant new features, bug fixes, and improvements.

### ✅ Added

#### 🔍 SVG Icon Search (NEW)
- Multi-API icon search with automatic fallback (Iconify → theSVG → Simple Icons)
- 200,000+ free open-source icons from Material Design, Lucide, Heroicons, Bootstrap, Font Awesome, Remix, Phosphor, and more
- Quick search tags with popular terms
- Search history persisted in localStorage
- Preview panel with color picker and size selector
- One-click insert into editor (replaces current SVG)
- Keyboard shortcut: `Ctrl+Shift+I`
- Service worker caching for offline icon browsing

#### 📝 SVG Code Formatter (NEW)
- Smart XML/SVG pretty-printer with proper indentation
- Auto-formats on: icon insert, file upload, manual trigger
- "✨ Format" button in Editor toolbar
- Keyboard shortcut: `Ctrl+Shift+F`

#### 📐 Draw Mode — Major Enhancements
- **4 new drawing tools**: Diamond, Star, Polygon, Arrow
- **Draw undo/redo**: Separate 100-state history for drawing
- **Resize handles**: 8-point resize (corners + edges)
- **Duplicate / Bring to Front / Send to Back / Delete** controls
- **Arrow keys nudge**: 1px (Shift = 10px) for precise positioning
- **Snap to Grid** toggle for aligned drawing
- **Double-click text to edit** existing text elements
- **Font selector** with 13 fonts (Hindi, English, Serif, Sans-serif, Handwritten, Monospace)
- **Live text preview** in modal as you type
- **Layers panel** showing all elements in reverse order
- **Opacity & Rotation sliders** for selected elements
- **Color presets sidebar** with 10 quick-pick colors
- **Polygon sides** configurable (3–12)
- **Arrow markers** with proper SVG `<marker>` definitions
- **Export** generates complete SVG with defs for arrows

#### 🎨 Editor Mode — Enhancements
- **9 preview backgrounds**: Checker, Grid Light, Grid Dark, Dot Light, Dot Dark, White, Black, Gray, Blueprint (default)
- Background picker dropdown with visual previews
- Default background changed to Blueprint

#### 💻 Syntax Highlighting — Complete Rewrite
- **Tokenizer-based** highlighter replacing regex approach
- **Every character guaranteed colored** (no invisible text)
- **100% of text wrapped** in `<span>` tags
- Line-by-line processing (broken tag on line N doesn't affect line N+1)
- VS Code Dark+ color theme
- Tag-specific colors: shapes (teal), containers (blue), gradients (yellow), text (orange), filters (purple)
- Attribute names (light blue), strings (coral), numbers (green), comments (green italic), entities (gold)
- Line numbers with dark border separator
- Tab key inserts 2 spaces
- `pre` and `textarea` CSS synced for perfect alignment

#### 🖼 PNG Export (NEW)
- Download SVG as PNG image
- Quality selector: 1x, 2x, 3x, 4x
- Client-side Canvas API rendering
- Visible in all modes as persistent bottom bar

#### 🔒 Privacy & PWA
- In-app privacy page (no more 404 on `/privacy.html`)
- Content Security Policy (CSP) with icon API domains allowlisted
- Service worker caches: app shell, icons, Google Fonts
- Separate caches: `svg-editor-v3`, `svg-editor-icons-v1`, `svg-editor-fonts-v1`
- `robots.txt` and `sitemap.xml` for SEO

#### 🌍 Multi-Language Support
- Google Fonts loaded: Noto Sans Devanagari, Noto Serif Devanagari, Poppins, Inter, Roboto, Caveat, Montserrat, Playfair Display
- Hindi/Devanagari text support in Draw Mode text tool
- Font selector with 13 options in text modal

#### ⌨️ Keyboard Shortcuts
- `Ctrl+S` — Download SVG
- `Ctrl+Z` — Undo
- `Ctrl+Shift+Z` — Redo
- `Ctrl+Shift+K` — Clear
- `Ctrl+Shift+F` — Format code (NEW)
- `Ctrl+Shift+I` — Icon Search (NEW)
- `Ctrl+D` — Duplicate (Draw mode, NEW)
- `Delete` — Delete selected (Draw mode, NEW)
- `Arrow keys` — Nudge (Draw mode, NEW)
- `Escape` — Close modals (NEW)
- `Tab` — Insert 2 spaces (Editor, NEW)

#### 📚 Documentation
- Professional README.md with badges, tables, full feature list
- Detailed CONTRIBUTING.md with commit conventions, branch strategy, testing checklist
- LIMITATIONS.md with known issues, roadmap, and workarounds
- CHANGELOG.md with complete version history
- PRIVACY_POLICY.md with full privacy details

### 🔧 Fixed
- **Invisible text in code editor**: Characters between SVG tags were invisible due to regex highlighter missing them. Fixed with tokenizer that wraps 100% of text.
- **Broken tag consuming entire document**: When a user deleted part of a tag (e.g., removed `>`), the old `findTagEnd()` function consumed everything to end-of-string. Fixed with line-by-line processing.
- **Privacy page 404**: Clicking "Privacy Policy" link returned "Not found". Fixed with in-app routing.
- **Dark mode not working**: Tailwind CSS v4 `dark:` variants not applying. Fixed with `@custom-variant dark` directive.
- **Icon search failing**: CSP `connect-src 'self'` blocking external API calls. Fixed by allowlisting icon API domains.
- **Text tool not editable**: No way to edit existing text. Fixed with double-click-to-edit.
- **Code not formatted**: Icons loaded as single-line SVG. Fixed with auto-formatter.

### 🔄 Changed
- Default dark mode: `true` (was `false`)
- Default preview background: Blueprint (was Checker)
- Icon insert: replaces SVG (was appending)
- Default sample SVG: hand-lettered quote design (was simple circles)

### 📦 Technical
- 28 source files (components + hooks + utils + types)
- 3 new utility files: `svgFormatter.ts`, `svgOptimizer.ts`, `exportHelpers.ts`
- 3 new components: `SvgIconSearch.tsx`, `PngExport.tsx`, `PrivacyPage.tsx`
- 16 UI components total
- 3 custom hooks
- 4 utility modules
- TypeScript strict mode
- Zero runtime dependencies beyond React

---

## [1.0.0] — 2025-01-01

### 🎉 Initial Release

### ✅ Added
- ✍️ Editor Mode with code editing and live SVG preview
- 📐 Draw Mode with SVG canvas, shapes, freehand paths, and text
- 🖌️ Customize Mode with element-level property editing
- 💻 Code Mode with React JSX, React Native, and HTML generation
- Dark/Light mode toggle with localStorage persistence
- PWA support with service worker for offline use
- Undo/Redo history (up to 50 states)
- SVG optimization (remove metadata, comments, empty groups)
- Keyboard shortcuts: Ctrl+S, Ctrl+Z, Ctrl+Shift+Z, Ctrl+Shift+K
- Toast notifications for user feedback
- File upload and download
- Sample SVG loading
- Zoom and rotation controls
- Glassmorphism UI design
- Fully responsive layout (mobile + desktop)
- Content Security Policy (CSP) meta tag
- Privacy-first architecture (zero tracking)
- GitHub Actions deploy workflow (GitHub Pages)
- MIT License

---

<div align="center">

**[⬆ Back to top](#-changelog)**

*PrivMITLab — Privacy is a right, not a feature.*

</div>
