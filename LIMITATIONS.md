<div align="center">

# ⚠️ Limitations & Known Issues

**Live SVG Editor v2.0.0 — PrivMITLab**

This document lists known limitations, workarounds, and planned improvements.

*Last updated: January 2026*

</div>

---

## 📋 Table of Contents

- [Known Limitations](#-known-limitations)
- [Browser-Specific Issues](#-browser-specific-issues)
- [Workarounds](#-workarounds)
- [Roadmap](#-roadmap)
- [Won't Fix (By Design)](#-wont-fix-by-design)

---

## 🔴 Known Limitations

### 1. Code Editor — Not a Full IDE

| Issue | Details |
|-------|---------|
| **No autocomplete** | The code editor is a `<textarea>` with syntax highlighting, not a full code editor like Monaco/CodeMirror |
| **No find & replace** | Use browser's built-in `Ctrl+F` on the textarea |
| **No multi-cursor** | Single cursor editing only |
| **No code folding** | Cannot collapse XML elements |
| **No minimap** | No overview sidebar |

**Workaround:** For complex SVG editing, use a dedicated IDE (VS Code) and paste the result into the editor.

**Roadmap:** [ ] Integrate Monaco Editor or CodeMirror 6 for full IDE experience.

---

### 2. Syntax Highlighting — Textarea Overlay Approach

| Issue | Details |
|-------|---------|
| **Scroll sync** | On very long SVGs (10,000+ lines), slight scroll desync may occur between the textarea and the highlighted `<pre>` layer |
| **Selection color** | Text selection is blue highlight only (transparent text) — can feel different from normal editors |
| **Line wrapping** | Both `pre` and `textarea` use `white-space: pre-wrap` — word boundaries may differ slightly |
| **Font rendering** | Some fonts may render at slightly different sizes in `<pre>` vs `<textarea>` on certain OS/DPI combos |

**Workaround:** Use a monospace font stack (JetBrains Mono → Fira Code → Consolas) for best alignment.

**Roadmap:** [ ] Migrate to CodeMirror 6 with native syntax highlighting.

---

### 3. Draw Mode — Canvas Limitations

| Issue | Details |
|-------|---------|
| **No bezier curves** | Cannot draw cubic/quadratic bezier curves (only straight lines and freehand) |
| **No undo for resize** | Undo captures element state after resize, not the resize action itself |
| **No grouping** | Cannot group multiple elements into one unit |
| **No layer ordering via drag** | Must use "Front/Back" buttons; no drag-to-reorder in layers panel |
| **No SVG import to draw** | Cannot import existing SVG into the draw canvas for editing |
| **No snapping to objects** | Only snap-to-grid; no snap-to-element edges or centers |
| **Text bounding box** | Text elements have estimated bounding boxes; actual width depends on font rendering |

**Workaround:** For complex drawings, use the Editor Mode to write SVG code directly.

**Roadmap:**
- [ ] Bezier curve tool
- [ ] Element grouping
- [ ] Object snapping
- [ ] Import SVG into draw canvas

---

### 4. Icon Search — Network Dependent

| Issue | Details |
|-------|---------|
| **Requires internet** | Icon search needs network to reach APIs (Iconify, theSVG, Simple Icons) |
| **Rate limits** | Free APIs may rate-limit heavy usage (typically 100+ requests/minute) |
| **No offline search** | Previously searched icons are NOT cached for offline search (only their SVG data is cached by service worker) |
| **API availability** | Third-party APIs may experience downtime |
| **Brand icons — licensing** | Brand icons (logos) are trademarks; check usage rights before commercial use |

**Workaround:** Search results are cached in service worker for offline viewing of previously loaded icons.

**Roadmap:**
- [ ] Cache search results locally for offline use
- [ ] Add local icon database for offline-first mode
- [ ] Show license info for each icon

---

### 5. Customize Mode — Limited Parser

| Issue | Details |
|-------|---------|
| **Element ID matching** | Uses `getElementById()` — elements without `id` attributes get auto-generated IDs that may not match on re-parse |
| **Complex transforms** | Cannot edit `matrix()` transforms, only translate/scale/rotate |
| **CSS styles** | Inline `style` attributes are passed through but not editable via the UI |
| **No undo** | Customize Mode changes are not tracked in the undo/redo history |
| **No SVG animations** | `<animate>`, `<animateTransform>`, `<set>` elements are not parsed or editable |

**Workaround:** Use Editor Mode to manually edit complex transforms or add element IDs.

**Roadmap:**
- [ ] Undo/redo for Customize Mode
- [ ] Better element identification (tag index, CSS selector)
- [ ] Animation timeline editor

---

### 6. Code Generation — Template-Based

| Issue | Details |
|-------|---------|
| **Simple converters** | Code generators use regex/string replacement, not a full AST parser |
| **React JSX** | May not handle all SVG attributes perfectly (e.g., `class` → `className` is basic) |
| **React Native** | Maps SVG tags to react-native-svg components; complex elements may need manual fixes |
| **HTML** | Simple HTML wrapper; does not add responsive `<meta>` tags or CSS reset |
| **No TypeScript types** | Generated React code uses generic types, not strict SVG prop types |

**Workaround:** Review generated code before using in production. Manual adjustments may be needed for complex SVGs.

**Roadmap:**
- [ ] AST-based SVG parser for accurate code generation
- [ ] TypeScript type generation for React components
- [ ] Vue.js and Svelte code generators

---

### 7. SVG Optimizer — Basic Implementation

| Issue | Details |
|-------|---------|
| **Regex-based** | Uses regex patterns, not a full SVG optimizer like SVGO |
| **Limited optimization** | Only removes: comments, metadata, XML declarations, DOCTYPE, empty groups, extra whitespace |
| **No path optimization** | Does not simplify `<path d="...">` data |
| **No attribute minification** | Does not merge redundant attributes or convert colors to shorter forms |
| **No precision control** | Does not round decimal places in coordinates |

**Workaround:** For production SVGs, use [SVGO](https://github.com/svg/svgo) CLI tool for comprehensive optimization.

**Roadmap:**
- [ ] Integrate SVGO WASM for full optimization
- [ ] Path simplification
- [ ] Decimal precision control
- [ ] Color optimization (hex → short hex, named colors → hex)

---

### 8. PWA & Offline Support

| Issue | Details |
|-------|---------|
| **Single-file build** | `vite-plugin-singlefile` inlines everything into one HTML file; service worker may behave differently |
| **CSP limitations** | Service worker cannot cache cross-origin requests that violate CSP (even with allowlisted domains) |
| **Storage limits** | Browser storage limits (typically 50MB) may be hit with many cached icons |
| **Update mechanism** | No automatic update prompt when a new version is available |
| **Install prompt** | No custom "Install App" button — relies on browser's built-in install prompt |

**Workaround:** Clear browser cache periodically if storage is full.

**Roadmap:**
- [ ] Add "Install App" button with beforeinstallprompt handler
- [ ] Show update notification when new version available
- [ ] Implement cache size management

---

### 9. Performance — Large SVGs

| Issue | Details |
|-------|---------|
| **Very large SVGs** | SVGs with 10,000+ elements may cause slow rendering and editing |
| **Syntax highlighting** | Re-tokenizing entire document on every keystroke for very large files |
| **History limit** | Undo history stores full snapshots (50 states × file size) |
| **Icon search grid** | Displaying 80+ icon thumbnails simultaneously may cause layout shifts |

**Workaround:** For very large SVGs, use an external editor and paste results.

**Roadmap:**
- [ ] Virtualized code editor (only render visible lines)
- [ ] Incremental syntax highlighting
- [ ] Debounced preview updates
- [ ] Web Worker for heavy operations

---

### 10. Accessibility (a11y)

| Issue | Details |
|-------|---------|
| **Screen readers** | Code editor is a `<textarea>` — screen readers can read but may not announce syntax colors |
| **Color contrast** | VS Code Dark+ theme colors may not meet WCAG AA contrast ratios for all combinations |
| **Keyboard navigation** | Draw mode tools are not fully keyboard navigable |
| **Focus indicators** | Some interactive elements lack visible focus indicators |
| **ARIA labels** | Many buttons lack proper `aria-label` attributes |

**Workaround:** Use browser zoom (Ctrl+/-) for better visibility.

**Roadmap:**
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure WCAG AA color contrast compliance
- [ ] Full keyboard navigation for Draw mode
- [ ] Screen reader testing and fixes

---

## 🟡 Browser-Specific Issues

| Browser | Issue | Severity |
|---------|-------|----------|
| **Safari** | `backdrop-filter` may cause rendering artifacts on older macOS | Low |
| **Firefox** | `::selection` styling on transparent text may look different | Low |
| **iOS Safari** | Touch events on SVG canvas may not work perfectly for drawing | Medium |
| **Chrome Mobile** | Virtual keyboard may push viewport up, covering the toolbar | Low |
| **Edge** | No known issues | — |

---

## 🛠 Workarounds Summary

| Problem | Quick Fix |
|---------|-----------|
| Text invisible in code editor | Click Format button (`Ctrl+Shift+F`) |
| Icon search not working | Check internet; try a different search term |
| SVG preview not updating | Paste code again or switch modes |
| Draw canvas feels slow | Reduce canvas size in properties bar |
| Dark mode colors look wrong | Refresh page; toggle dark mode off and on |
| Privacy page shows 404 | Use in-app "Privacy Policy" link in footer |
| PNG export blank | Ensure SVG has explicit `width` and `height` attributes |
| Undo not working in Draw | Use Draw Mode's own undo (sidebar or `Ctrl+Z`) |

---

## 🗺 Roadmap

### Short Term (v2.1 — Q1 2026)
- [ ] Monaco Editor or CodeMirror 6 integration
- [ ] Find & Replace in code editor
- [ ] Drag & drop SVG files onto canvas
- [ ] More draw tools: bezier curve, callout, speech bubble
- [ ] Automated unit tests (Vitest)

### Medium Term (v2.5 — Q2 2026)
- [ ] SVG template library (pre-built designs)
- [ ] Undo/redo for Customize Mode
- [ ] Element grouping in Draw Mode
- [ ] Object snapping in Draw Mode
- [ ] Import SVG into Draw canvas
- [ ] SVG animation preview (animate/animateTransform)

### Long Term (v3.0 — Q4 2026)
- [ ] Collaborative editing (WebRTC, no server)
- [ ] SVG sprite sheet generator
- [ ] PDF export
- [ ] Plugin system for custom tools
- [ ] i18n support (multi-language UI)
- [ ] Keyboard shortcut customization
- [ ] Theme customization (beyond light/dark)
- [ ] SVG diff comparison tool
- [ ] WebAssembly-based SVGO optimizer
- [ ] Virtualized code editor for 100K+ line files

---

## 🚫 Won't Fix (By Design)

These are intentional design decisions, not bugs:

| Decision | Reason |
|----------|--------|
| **No server-side processing** | Privacy-first: all processing must be client-side |
| **No user accounts** | No data collection; no authentication needed |
| **No cloud storage** | SVGs stay on your device only |
| **No real-time collaboration** | Would require a server; privacy-first design |
| **No external CDN for app assets** | All bundled for offline-first capability |
| **No TypeScript `any` types** | Strict TypeScript for type safety |
| **No external UI libraries** | Custom components for zero-dependency architecture |
| **No inline event handlers** | CSP prohibits `onclick` etc. for security |
| **Default dark mode** | Most developers prefer dark themes |

---

## 📞 Reporting Issues

Found a new bug? Please:

1. Check this file to see if it's already known
2. Search [GitHub Issues](https://github.com/PrivMITLab/svg-editor/issues)
3. If not found, [open a new issue](https://github.com/PrivMITLab/svg-editor/issues/new) with:
   - Browser & version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshot (if applicable)
   - Console errors (if any)

---

<div align="center">

**[⬆ Back to top](#-limitations--known-issues)**

*PrivMITLab — Transparency builds trust.*

</div>
