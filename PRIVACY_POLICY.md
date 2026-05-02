<div align="center">

# 🔒 Privacy Policy

**Live SVG Editor v2.0.0 — PrivMITLab**

*Last updated: January 2026*

</div>

---

## Our Promise

> **No data collection, all processing is local. Your SVGs never leave your device.**

The Live SVG Editor is built with privacy as a fundamental right, not a feature. This policy explains exactly what happens (and what doesn't happen) when you use our application.

---

## 📋 Data Collection

### What We Collect

**Nothing. Zero. We collect zero data.**

| Data Type | Collected? | Explanation |
|-----------|------------|-------------|
| Personal information | ❌ No | No names, emails, or accounts |
| IP addresses | ❌ No | No server logs |
| Usage analytics | ❌ No | No Google Analytics, no tracking |
| Cookies | ❌ No | No cookies set by the application |
| Device information | ❌ No | No fingerprinting |
| Location data | ❌ No | No geolocation requests |
| SVG content | ❌ No | Never transmitted anywhere |
| Search queries | ⚠️ Sent to public APIs | Icon search queries go to Iconify/theSVG APIs when you search |
| Payment information | ❌ No | No payments; app is free |

> **Honest note:** While we collect zero data ourselves, icon search queries and Google Font requests do reach external servers. We disclose this transparently below.

### What We Store Locally

The application uses `localStorage` (your browser's local storage) for:

| Key | Purpose | Data |
|-----|---------|------|
| `svg-dark-mode` | Theme preference | `true` or `false` |
| `svg-saved` | Last edited SVG | SVG code string |
| `icon-search-history` | Recent search terms | Array of search strings |

**This data never leaves your device.** You can clear it at any time via:
- Browser settings → Clear site data
- "Clear" button in the app toolbar

---

## 🔐 Security Measures

### Content Security Policy (CSP)

The application enforces a strict CSP via `<meta>` tag:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https://api.iconify.design https://thesvg.org
         https://cdn.simpleicons.org https://yesicon.app;
connect-src 'self' https://api.iconify.design https://thesvg.org
            https://cdn.simpleicons.org https://yesicon.app;
font-src 'self' https://fonts.gstatic.com data:;
object-src 'none';
frame-src 'self' data: blob:;
base-uri 'self';
form-action 'self';
```

This prevents:
- ✗ Loading unauthorized external scripts
- ✗ Connecting to unauthorized servers
- ✗ Embedding unauthorized content
- ✗ Executing inline event handlers (`onclick`, etc.)
- ✗ Form submissions to external servers

### SVG Sanitization

All SVG code rendered in the preview is sanitized:
- `on*` event attributes are stripped (e.g., `onclick`, `onload`)
- `javascript:` URLs are blocked
- Content is rendered via `dangerouslySetInnerHTML` with sanitization applied before rendering

---

## 🌐 Third-Party Services

### Icon APIs (User-Initiated Only)

When you **manually search** for icons, the app sends your search query to these public APIs:

| Service | Domain | Data Sent | Privacy Policy |
|---------|--------|-----------|----------------|
| Iconify | `api.iconify.design` | Search query only | [iconify.design](https://iconify.design/legal/) |
| theSVG | `thesvg.org` | Search query only | [thesvg.org](https://thesvg.org/) |
| Simple Icons | `cdn.simpleicons.org` | Icon name only | [simpleicons.org](https://simpleicons.org/) |

**Important:**
- These calls are only made when you actively click "Search"
- No personal data is included in these requests
- No cookies are sent
- Responses are cached by the service worker for offline use
- If you never use icon search, no external calls are made

### Google Fonts

| Service | Domain | Data Sent |
|---------|--------|-----------|
| Google Fonts | `fonts.googleapis.com` | Font name requests |
| Font Files | `fonts.gstatic.com` | Font file downloads |

**Note:** Google Fonts may log your IP address per their privacy policy. The fonts are cached by the service worker for offline use after first load.

If you prefer to avoid Google Fonts entirely, the app falls back to system fonts (system-ui, sans-serif, serif, monospace).

---

## 🔧 Technical Privacy Features

| Feature | Implementation |
|---------|---------------|
| **No analytics** | No tracking scripts loaded |
| **No cookies** | Only `localStorage` used |
| **No server** | Entirely client-side application |
| **No API keys** | All APIs used are keyless and free |
| **CSP enforcement** | Strict Content Security Policy |
| **SVG sanitization** | Event handlers stripped before rendering |
| **Offline-first** | Service worker caches everything locally |
| **No external fonts on app load** | Fonts loaded on-demand only |
| **No telemetry** | Zero data reporting |
| **Open source** | Full source code auditable |

---

## 📱 Offline Capability

The application uses a Service Worker to cache:
- App shell (HTML, CSS, JavaScript)
- Icon API responses (search results)
- Google Fonts (CSS + font files)

After the first visit, the app works completely offline. No network connection is required for:
- Editing SVG code
- Drawing shapes
- Customizing elements
- Generating code
- Exporting SVG/PNG

---

## 👶 Children's Privacy

The application does not collect any data from any users, including children under 13 (COPPA) or any age group. There is no data collection mechanism.

---

## 🌍 GDPR / CCPA Compliance

Since we collect **zero personal data**, GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act) requirements for data processing do not apply. There is:
- No data to request
- No data to delete
- No data to port
- No data processing agreement needed

---

## 🔄 Policy Changes

If this privacy policy is ever updated:
- The "Last updated" date at the top will be changed
- Changes will be documented in [CHANGELOG.md](CHANGELOG.md)
- No retroactive changes to privacy practices

---

## 📞 Contact

For questions about this privacy policy:
- Open a [GitHub Issue](https://github.com/PrivMITLab/svg-editor/issues)
- Visit the in-app Privacy Policy page (click "Privacy Policy" in the footer)

---

## 📄 Summary

| Statement | Status |
|-----------|--------|
| No data collection | ✅ Confirmed |
| No tracking | ✅ Confirmed |
| No cookies | ✅ Confirmed |
| No ads | ✅ Confirmed |
| No server-side processing | ✅ Confirmed |
| All processing is local | ✅ Confirmed |
| SVGs never leave your device | ✅ Confirmed |
| Open source | ✅ MIT License |
| Offline-capable | ✅ Service Worker |
| CSP enforced | ✅ Meta tag |

**Your privacy is not a feature — it's a right.**

---

<div align="center">

*PrivMITLab © 2025–2026 — Built with privacy as a fundamental right.*

</div>
