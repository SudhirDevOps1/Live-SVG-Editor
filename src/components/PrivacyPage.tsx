interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-900 dark:text-gray-100 animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          ← Back to Editor
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔒</span>
          <h1 className="text-lg font-bold">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Hero Banner */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🛡️</span>
              <h2 className="text-2xl font-bold">Privacy-First Promise</h2>
            </div>
            <p className="text-lg font-medium opacity-95">
              No data collection, all processing is local. Your SVGs never leave your device.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">📋</span>
                Data Collection
              </h2>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-4">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  We collect zero data. Period.
                </p>
              </div>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>No analytics or tracking scripts are loaded.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>No cookies are set.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>No data is sent to any server.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>No advertisements are displayed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>No third-party scripts or services.</span>
                </li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">💻</span>
                Local Processing
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All SVG editing, drawing, customization, and code generation happens entirely within your browser using client-side JavaScript. Your SVG files and edits are processed locally and never transmitted over the network.
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  <strong>How it works:</strong> The app uses browser APIs like DOMParser, XMLSerializer, and Canvas for all SVG operations. No server-side conversion is ever performed.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">💾</span>
                Local Storage
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                The application uses your browser's <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono">localStorage</code> to save:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>Your dark/light mode preference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>Your last edited SVG (for convenience)</span>
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
                This data stays on your device. You can clear it at any time through your browser settings or by clicking "Clear" in the toolbar.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">🔐</span>
                Content Security Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                The application enforces a strict Content Security Policy (CSP) that prevents:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Loading external scripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Connecting to external servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Embedding external content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Executing inline event handlers</span>
                </li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">🌐</span>
                Offline Capability
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The application uses a service worker to cache all static assets, allowing you to use it completely offline after the first visit. No network connection is required for any feature.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm">📧</span>
                Contact
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                If you have questions about this privacy policy or the application's privacy practices, please reach out through the PrivMITLab website.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025 PrivMITLab. Built with privacy as a fundamental right.</p>
            <p className="mt-1">Last updated: January 2025</p>
          </div>
        </div>
      </main>
    </div>
  );
}
