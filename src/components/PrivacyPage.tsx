interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-900 dark:text-gray-100 animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
          ← Back to Editor
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔒</span>
          <h1 className="text-lg font-bold">Privacy Policy — Full Transparency</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Hero */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🛡️</span>
              <h2 className="text-2xl font-bold">Privacy-First Promise</h2>
            </div>
            <p className="text-lg font-medium opacity-95">No data collection, all processing is local. Your SVGs never leave your device.</p>
            <p className="text-sm opacity-70 mt-2">Last updated: January 2026 · Version 2.0.0</p>
          </div>

          <div className="space-y-6">
            {/* Data Collection */}
            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">📋</span>
                What Data We Collect
              </h2>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-4">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Nothing. Zero. No analytics, no cookies, no server logs, no tracking pixels, no fingerprinting.</p>
              </div>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                {['No personal info (no accounts, no sign-up)', 'No IP logging (no server — runs in browser)', 'No usage analytics (no Google Analytics)', 'No cookies set by this app', 'No device fingerprinting', 'No location data', 'SVG content never transmitted'].map((item) => (
                  <li key={item} className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>{item}</span></li>
                ))}
              </ul>
            </section>

            {/* Local Storage */}
            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">💾</span>
                Local Storage Only
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">We use <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono">localStorage</code> for convenience — this data stays on your device:</p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2"><span className="text-indigo-500">•</span><span><strong>Theme preference</strong> — dark/light mode</span></div>
                <div className="flex items-start gap-2"><span className="text-indigo-500">•</span><span><strong>Last edited SVG</strong> — auto-saved for convenience</span></div>
                <div className="flex items-start gap-2"><span className="text-indigo-500">•</span><span><strong>Icon search history</strong> — recent search terms</span></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-3 text-xs">Clear anytime: browser settings → clear site data, or "Clear" button in toolbar.</p>
            </section>

            {/* Honest External Disclosure */}
            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-sm">🌐</span>
                Honest Disclosure: External Services
              </h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                <p className="font-medium text-amber-700 dark:text-amber-300 text-sm">⚠️ Being fully transparent: we do call external APIs in specific scenarios. Here is exactly what, when, and why.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">1. Icon Search APIs (Only When You Search)</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">When you manually click search, your query goes to public APIs. Your IP is logged by their servers (standard HTTP). No personal data, cookies, or SVG content is sent.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'Iconify', domain: 'api.iconify.design', count: '200K+ icons' },
                      { name: 'theSVG', domain: 'thesvg.org', count: '5.6K+ brands' },
                      { name: 'Simple Icons', domain: 'cdn.simpleicons.org', count: '1.5K+ brands' },
                    ].map((api) => (
                      <div key={api.name} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs">
                        <strong className="block text-gray-700 dark:text-gray-300">{api.name}</strong>
                        <span className="text-gray-500 font-mono text-[10px]">{api.domain}</span><br/>
                        <span className="text-gray-400">{api.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">2. Google Fonts (Hindi/Multi-language)</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Google may log your IP when fetching fonts (per Google's Privacy Policy). We cache fonts via Service Worker for offline use after first visit. Falls back to system fonts if avoided.</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">3. PNG Export — Font Embedding</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">When exporting as PNG, the app may download Google Font files to embed as base64 data, ensuring Hindi/English fonts render correctly in the downloaded image.</p>
                </div>
              </div>
            </section>

            {/* CSP */}
            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">🔐</span>
                Security Enforcement
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span><span>No unauthorized external scripts</span></li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span><span>No inline event handlers</span></li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span><span>No connections to unauthorized servers</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>Only allowlisted domains: icon APIs + Google Fonts</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>SVG event handlers stripped before rendering</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>javascript: URLs blocked</span></li>
              </ul>
            </section>

            {/* Truth Table */}
            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">✅</span>
                What We Promise vs What We Don't
              </h2>
              <div className="space-y-2 text-sm">
                {[
                  { claim: 'No analytics or tracking', status: true },
                  { claim: 'No cookies', status: true },
                  { claim: 'No ads', status: true },
                  { claim: 'No server-side processing', status: true },
                  { claim: 'SVGs never leave your device', status: true },
                  { claim: 'Open source (auditable)', status: true },
                  { claim: '100% offline after first load', status: true, note: 'except icon search' },
                  { claim: 'Zero external calls', status: false, note: 'icon search & Google Fonts when used' },
                  { claim: 'Google never sees your data', status: false, note: 'may log IP when fetching fonts' },
                ].map((item) => (
                  <div key={item.claim} className="flex items-start gap-2">
                    <span className={item.status ? 'text-emerald-500' : 'text-amber-500'}>{item.status ? '✅' : '⚠️'}</span>
                    <span className="text-gray-700 dark:text-gray-300">{item.claim}</span>
                    {item.note && <span className="text-gray-400 text-xs ml-1">— {item.note}</span>}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic border-l-4 border-indigo-500 pl-3">We believe in honest privacy. Instead of saying "zero external calls" (which would be a lie), we tell you exactly what happens and give you the choice.</p>
            </section>

            {/* Offline */}
            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">🌐</span>
                Offline Capability
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">After first visit, the app works 100% offline. Service Worker caches: app shell, icon SVGs, Google Fonts. Icon search requires internet.</p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025–2026 PrivMITLab. Built with privacy as a fundamental right, not a marketing slogan.</p>
            <p className="mt-1 italic opacity-70">Your trust is more valuable than your data.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
