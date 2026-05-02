<div align="center">

# 🤝 Contributing to Live SVG Editor

**PrivMITLab — Privacy-First SVG Toolkit**

Thank you for your interest in contributing to the Live SVG Editor! This guide will help you get started.

</div>

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Development Setup](#-development-setup)
- [Project Architecture](#-project-architecture)
- [Code Guidelines](#-code-guidelines)
- [Privacy Rules (Mandatory)](#-privacy-rules-mandatory)
- [Commit Convention](#-commit-convention)
- [Branch Strategy](#-branch-strategy)
- [Pull Request Process](#-pull-request-process)
- [Testing Checklist](#-testing-checklist)
- [Areas for Contribution](#-areas-for-contribution)

---

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful, constructive, and professional in all interactions.

---

## 🛠 Development Setup

### Prerequisites

| Tool | Minimum Version | Recommended |
|------|-----------------|-------------|
| Node.js | 18.x | 22.x (LTS) |
| npm | 9.x | 10.x |
| Git | 2.x | Latest |

### Getting Started

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/svg-editor.git
cd svg-editor

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
# App runs at http://localhost:5173

# 5. Make your changes

# 6. Build and verify
npm run build

# 7. Run preview to test production build
npm run preview
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## 🏗 Project Architecture

```
src/
├── App.tsx                 # Root: routing, state, global handlers
├── components/             # UI components (one per file)
├── hooks/                  # Custom React hooks
├── utils/                  # Pure utility functions (no React)
├── types/                  # TypeScript type definitions
├── index.css               # Global styles + Tailwind + syntax theme
└── main.tsx                # ReactDOM entry point
```

### Key Architectural Decisions

1. **Zero external UI libraries** — All components are custom-built
2. **Pure client-side** — No server, no API keys, no backend
3. **Privacy by design** — CSP enforced, no data ever leaves the browser
4. **Offline-first** — Service worker caches everything
5. **Component-per-file** — Each component is a single `.tsx` file
6. **Hooks for shared logic** — `useLocalStorage`, `useOfflineSync`, `useSvgOperations`
7. **Utils are pure functions** — No side effects, easily testable

---

## 📐 Code Guidelines

### TypeScript

```typescript
// ✅ Always use TypeScript — no `any` types
interface DrawElement {
  id: string;
  type: DrawTool;
  x: number;
  y: number;
  // ...
}

// ✅ Use explicit return types for functions
function formatSvgCode(code: string): string {
  // ...
}

// ✅ Use discriminated unions for state
type Mode = 'editor' | 'draw' | 'customize' | 'code';
```

### React Components

```typescript
// ✅ Named exports (not default)
export function EditorMode({ svgCode, onCodeChange }: EditorModeProps) {
  return <div>...</div>;
}

// ✅ Props interface above component
interface EditorModeProps {
  svgCode: string;
  onCodeChange: (code: string) => void;
}

// ✅ useCallback for event handlers
const handleClick = useCallback(() => {
  // ...
}, [dependency]);
```

### CSS / Styling

```tsx
// ✅ Tailwind classes — no inline styles except dynamic values
<button className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
  Click
</button>

// ✅ Dynamic styles via style prop (only when Tailwind can't express it)
<div style={{ transform: `scale(${zoom / 100})` }}>
  Content
</div>

// ✅ Dark mode via `dark:` variant
<div className="bg-white dark:bg-gray-900">
  Content
</div>
```

### Code Style

| Rule | Value |
|------|-------|
| Indentation | 2 spaces |
| Quotes | Single quotes |
| Semicolons | Always |
| Trailing commas | Yes |
| Max line length | 120 chars (soft limit) |
| Naming convention | camelCase for variables, PascalCase for components |

---

## 🔒 Privacy Rules (Mandatory)

**Every contribution MUST follow these rules — no exceptions.**

| Rule | Enforcement |
|------|-------------|
| ❌ NO analytics scripts | PR rejected if found |
| ❌ NO tracking pixels | PR rejected if found |
| ❌ NO cookies (except localStorage) | PR rejected if found |
| ❌ NO server-side processing | PR rejected if found |
| ❌ NO external API calls with user data | PR rejected if found |
| ❌ NO advertisements | PR rejected if found |
| ❌ NO third-party tracking libraries | PR rejected if found |
| ✅ ALL processing must be client-side | Required |
| ✅ CSP must be maintained | Required |
| ✅ Service worker must be updated if adding assets | Required |

### Allowed External Calls

| Domain | Purpose | Sends User Data? |
|--------|---------|-----------------|
| `api.iconify.design` | Icon search API | ❌ Only search query |
| `thesvg.org` | Brand icon search | ❌ Only search query |
| `cdn.simpleicons.org` | Brand icon CDN | ❌ Only icon name |
| `fonts.googleapis.com` | Google Fonts | ❌ Only font name |
| `fonts.gstatic.com` | Font file CDN | ❌ Only font file |

---

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(draw): add star tool` |
| `fix` | Bug fix | `fix(editor): fix syntax highlighting crash` |
| `docs` | Documentation | `docs: update README with icon search` |
| `style` | Code style (no logic change) | `style: fix indentation in App.tsx` |
| `refactor` | Code refactoring | `refactor(highlighter): rewrite tokenizer` |
| `perf` | Performance improvement | `perf: optimize SVG parser` |
| `test` | Add/update tests | `test: add tests for svgFormatter` |
| `chore` | Build/config changes | `chore: update Vite to v7.3` |
| `ci` | CI/CD changes | `ci: add GitHub Actions deploy workflow` |

### Examples

```bash
git commit -m "feat(draw): add polygon tool with configurable sides"
git commit -m "fix(highlighter): fix invisible text on broken SVG tags"
git commit -m "docs: add LIMITATIONS.md with known issues"
git commit -m "perf(search): add abort controller for icon API calls"
```

---

## 🌿 Branch Strategy

| Branch | Purpose | Merge Into |
|--------|---------|------------|
| `main` | Production-ready code | — |
| `develop` | Integration branch | `main` |
| `feature/*` | New features | `develop` |
| `fix/*` | Bug fixes | `develop` or `main` |
| `docs/*` | Documentation | `develop` |
| `release/*` | Release preparation | `main` |

### Branch Naming

```bash
# Feature branches
git checkout -b feature/icon-search-filters
git checkout -b feature/draw-layers-panel

# Bug fix branches
git checkout -b fix/syntax-highlighter-crash
git checkout -b fix/dark-mode-toggle

# Documentation branches
git checkout -b docs/update-readme
git checkout -b docs/add-limitations
```

---

## 🔀 Pull Request Process

### Before Submitting

1. ✅ Code compiles: `npm run build` passes
2. ✅ No TypeScript errors
3. ✅ No `console.log` left in production code
4. ✅ Privacy rules followed (see above)
5. ✅ Both light and dark modes tested
6. ✅ Mobile and desktop responsive
7. ✅ Keyboard shortcuts still work

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactor
- [ ] Performance improvement

## Screenshots
(if UI changes)

## Checklist
- [ ] `npm run build` passes
- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Tested on mobile viewport
- [ ] Privacy rules followed
- [ ] No external tracking added
```

### Review Process

1. Open PR against `develop` (or `main` for hotfixes)
2. Automated checks must pass
3. At least one maintainer review required
4. Address all review comments
5. Squash merge when approved

---

## ✅ Testing Checklist

Since we don't have automated tests yet, use this manual checklist:

### Editor Mode
- [ ] Paste SVG code → preview updates
- [ ] Upload SVG file → loads correctly
- [ ] Zoom slider works (10%–300%)
- [ ] Rotate slider works (0°–360°)
- [ ] Background selector changes preview background
- [ ] Format button beautifies code
- [ ] Syntax highlighting colors all text (no invisible chars)
- [ ] Line numbers scroll with code
- [ ] Delete a character → code updates correctly
- [ ] Tab key inserts 2 spaces

### Draw Mode
- [ ] All 11 tools work (rect, circle, ellipse, diamond, star, polygon, line, arrow, freehand, text, select)
- [ ] Drag to draw shapes
- [ ] Click with text tool → modal opens
- [ ] Double-click existing text → edit modal opens
- [ ] Undo/Redo works
- [ ] Arrow keys nudge selected element
- [ ] Resize handles work
- [ ] Duplicate/Front/Back/Delete buttons work
- [ ] Export to SVG generates valid SVG
- [ ] Layers panel updates

### Customize Mode
- [ ] Upload SVG → elements listed in sidebar
- [ ] Select element → properties shown
- [ ] Change fill/stroke/opacity → preview updates
- [ ] Transform controls work

### Code Mode
- [ ] React JSX tab generates valid component
- [ ] React Native tab generates valid component
- [ ] HTML tab generates valid HTML
- [ ] Copy button works
- [ ] Download button works

### Global
- [ ] Dark mode toggle works
- [ ] Icon search finds results from all 3 APIs
- [ ] PNG export works at all quality levels
- [ ] Privacy page loads correctly
- [ ] Keyboard shortcuts work
- [ ] Service worker registers
- [ ] App works offline after first load
- [ ] Toast notifications appear and auto-dismiss

---

## 🎯 Areas for Contribution

### High Priority
- [ ] Automated unit tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] i18n / internationalization support

### Medium Priority
- [ ] More drawing tools (star polygon, callout, speech bubble)
- [ ] SVG template library (pre-built designs)
- [ ] Drag & drop SVG files onto canvas
- [ ] Undo/redo for Customize Mode
- [ ] Collaborative editing (WebRTC, no server)
- [ ] SVG diff comparison tool

### Low Priority
- [ ] Animation timeline editor
- [ ] SVG sprite sheet generator
- [ ] PDF export
- [ ] Keyboard shortcut customization
- [ ] Plugin system for custom tools

### Documentation
- [ ] Video tutorials
- [ ] API documentation for utils
- [ ] Component storybook
- [ ] Architecture decision records (ADRs)

---

## 📞 Questions?

- Open a [GitHub Discussion](https://github.com/PrivMITLab/svg-editor/discussions) for questions
- Open a [GitHub Issue](https://github.com/PrivMITLab/svg-editor/issues) for bugs
- See [LIMITATIONS.md](LIMITATIONS.md) for known issues

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

<div align="center">

**Thank you for helping make SVG editing private and accessible! 🙏**

*PrivMITLab — Privacy is a right, not a feature.*

</div>
