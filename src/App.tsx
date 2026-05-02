import { useState, useCallback, useEffect, useRef } from 'react';
import type { Mode, ToastMessage } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOfflineSync } from './hooks/useOfflineSync';
import { optimizeSvg } from './utils/svgOptimizer';
import { formatSvgCode } from './utils/svgFormatter';
import { downloadSvg } from './utils/exportHelpers';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ModeToggle } from './components/ModeToggle';
import { EditorMode } from './components/EditorMode';
import { DrawMode } from './components/DrawMode';
import { CustomizeMode } from './components/CustomizeMode';
import { CodeMode } from './components/CodeMode';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { PngExport } from './components/PngExport';
import { PrivacyPage } from './components/PrivacyPage';
import { SvgIconSearch } from './components/SvgIconSearch';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <filter id="paperNoise" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="5" stitchTiles="stitch" result="turbulence"/>
      <feComponentTransfer in="turbulence" result="fadedNoise">
        <feFuncR type="linear" slope="0.04" intercept="0.96"/>
        <feFuncG type="linear" slope="0.04" intercept="0.955"/>
        <feFuncB type="linear" slope="0.04" intercept="0.94"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="fadedNoise" mode="multiply"/>
    </filter>
    <filter id="inkShadow" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="1" dy="2" stdDeviation="0.5" flood-color="#555" flood-opacity="0.12"/>
    </filter>
    <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
      <stop offset="50%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#5C4A3A" stop-opacity="0.04"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="#FFFDF6"/>
  <rect width="1080" height="1080" filter="url(#paperNoise)"/>
  <rect width="1080" height="1080" fill="url(#vignette)"/>
  <text x="130" y="260" font-family="system-ui, sans-serif" font-size="250" fill="#e74c3c" opacity="0.10" transform="rotate(-4 130 260)">&#8220;</text>
  <text x="860" y="770" font-family="system-ui, sans-serif" font-size="250" fill="#e74c3c" opacity="0.10" transform="rotate(3 860 770)">&#8221;</text>
  <line x1="65" y1="65" x2="140" y2="65" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/>
  <line x1="65" y1="65" x2="65" y2="140" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/>
  <line x1="1015" y1="65" x2="940" y2="65" stroke="#3498db" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/>
  <line x1="1015" y1="65" x2="1015" y2="140" stroke="#3498db" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/>
  <line x1="65" y1="1015" x2="140" y2="1015" stroke="#3498db" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/>
  <line x1="65" y1="1015" x2="65" y2="940" stroke="#3498db" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/>
  <line x1="1015" y1="1015" x2="940" y2="1015" stroke="#2ecc71" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/>
  <line x1="1015" y1="1015" x2="1015" y2="940" stroke="#2ecc71" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/>
  <line x1="370" y1="748" x2="710" y2="748" stroke="#e74c3c" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="12 8" opacity="0.18"/>
  <text x="540" y="300" font-family="system-ui, sans-serif" font-weight="700" font-size="92" text-anchor="middle" transform="rotate(-1.3 540 300)" filter="url(#inkShadow)">
    <tspan fill="#e74c3c">I don't care</tspan>
  </text>
  <text x="540" y="425" font-family="system-ui, sans-serif" font-weight="400" font-size="78" text-anchor="middle" transform="rotate(0.7 540 425)" filter="url(#inkShadow)">
    <tspan fill="#444">you are </tspan>
    <tspan fill="#3498db" font-weight="700">good</tspan>
    <tspan fill="#444"> or </tspan>
    <tspan fill="#3498db" font-weight="700">bad</tspan>
  </text>
  <text x="540" y="548" font-family="system-ui, sans-serif" font-weight="400" font-size="80" text-anchor="middle" transform="rotate(-0.5 540 548)" filter="url(#inkShadow)">
    <tspan fill="#444">if you </tspan>
    <tspan fill="#2ecc71" font-weight="700">respect</tspan>
    <tspan fill="#444"> me,</tspan>
  </text>
  <text x="540" y="670" font-family="system-ui, sans-serif" font-weight="400" font-size="80" text-anchor="middle" transform="rotate(1.1 540 670)" filter="url(#inkShadow)">
    <tspan fill="#444">I will </tspan>
    <tspan fill="#2ecc71" font-weight="700">respect</tspan>
    <tspan fill="#444"> you ...</tspan>
  </text>
  <text x="540" y="840" font-family="system-ui, sans-serif" font-size="38" fill="#aaa" text-anchor="middle" font-style="italic" opacity="0.7">— wise words</text>
  <circle cx="440" cy="835" r="3" fill="#e74c3c" opacity="0.25"/>
  <circle cx="640" cy="835" r="3" fill="#2ecc71" opacity="0.25"/>
</svg>`;

type Page = 'editor' | 'privacy';

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('svg-dark-mode', true);
  const [page, setPage] = useState<Page>('editor');
  const [mode, setMode] = useState<Mode>('editor');
  const [svgCode, setSvgCode] = useState(SAMPLE_SVG);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [history, setHistory] = useState<string[]>([SAMPLE_SVG]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [iconSearchOpen, setIconSearchOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('svg-dark-mode');
      if (stored !== null) {
        const isDark = JSON.parse(stored);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushHistory = useCallback(
    (code: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(code);
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
      setSvgCode(code);
    },
    [historyIndex]
  );

  const handleCodeChange = useCallback(
    (code: string) => { pushHistory(code); },
    [pushHistory]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setSvgCode(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setSvgCode(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const handleClear = useCallback(() => {
    pushHistory('');
    addToast('info', 'Canvas cleared');
  }, [pushHistory, addToast]);

  const handleLoadSample = useCallback(() => {
    pushHistory(SAMPLE_SVG);
    addToast('info', 'Sample SVG loaded');
  }, [pushHistory, addToast]);

  const handleOptimize = useCallback(() => {
    const optimized = optimizeSvg(svgCode);
    pushHistory(optimized);
    addToast('success', `SVG optimized (${svgCode.length} → ${optimized.length} chars)`);
  }, [svgCode, pushHistory, addToast]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const formatted = formatSvgCode(content);
          pushHistory(formatted);
          addToast('success', `Loaded: ${file.name}`);
        };
        reader.readAsText(file);
      }
      e.target.value = '';
    },
    [pushHistory, addToast]
  );

  const handleDownload = useCallback(() => {
    if (!svgCode.trim()) {
      addToast('error', 'Nothing to download');
      return;
    }
    downloadSvg(svgCode, 'image.svg');
    addToast('success', 'SVG downloaded');
  }, [svgCode, addToast]);

  const handleFormatCode = useCallback(() => {
    const formatted = formatSvgCode(svgCode);
    if (formatted !== svgCode) {
      pushHistory(formatted);
      addToast('success', 'Code formatted');
    } else {
      addToast('info', 'Code already formatted');
    }
  }, [svgCode, pushHistory, addToast]);

  const handleInsertIcon = useCallback(
    (iconSvg: string) => {
      // Format and replace current SVG with icon
      const formatted = formatSvgCode(iconSvg);
      pushHistory(formatted);
      setIconSearchOpen(false);
      setMode('editor');
      addToast('success', 'Icon inserted into editor');
    },
    [pushHistory, addToast]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 's') {
        e.preventDefault();
        handleDownload();
      } else if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else if (mod && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        handleClear();
      } else if (mod && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        setIconSearchOpen((prev) => !prev);
      } else if (mod && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        handleFormatCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDownload, handleUndo, handleRedo, handleClear, handleFormatCode]);

  if (page === 'privacy') {
    return <PrivacyPage onBack={() => setPage('editor')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-900 dark:text-gray-100">
      <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)} />
      <ModeToggle currentMode={mode} onModeChange={setMode} />

      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onLoadSample={handleLoadSample}
        onOptimize={handleOptimize}
        onUpload={handleUpload}
        onDownload={handleDownload}
        onIconSearch={() => setIconSearchOpen(true)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <main className="flex-1 p-3 sm:p-4 overflow-auto">
        {mode === 'editor' && (
          <EditorMode
            svgCode={svgCode}
            onCodeChange={handleCodeChange}
            onFormatCode={handleFormatCode}
            zoom={zoom}
            onZoomChange={setZoom}
            rotation={rotation}
            onRotationChange={setRotation}
            onReset={() => { setZoom(100); setRotation(0); }}
            onFileUpload={handleFileSelect}
          />
        )}
        {mode === 'draw' && <DrawMode onExport={handleCodeChange} addToast={addToast} />}
        {mode === 'customize' && (
          <CustomizeMode svgCode={svgCode} onCodeChange={handleCodeChange} addToast={addToast} />
        )}
        {mode === 'code' && <CodeMode svgCode={svgCode} addToast={addToast} />}

        <div className="mt-4 flex items-center justify-between p-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="text-base">🖼</span>
            <span className="font-medium">PNG Export</span>
            <span className="hidden sm:inline">— Choose quality and download as PNG image</span>
          </div>
          <PngExport svgCode={svgCode} addToast={addToast} />
        </div>
      </main>

      <Footer isOnline={isOnline} onShowPrivacy={() => setPage('privacy')} />

      <input ref={fileInputRef} type="file" accept=".svg,image/svg+xml" onChange={handleFileSelect} className="hidden" />

      <SvgIconSearch
        isOpen={iconSearchOpen}
        onClose={() => setIconSearchOpen(false)}
        onInsertSvg={handleInsertIcon}
        addToast={addToast}
      />

      <div className="fixed bottom-16 right-4 flex flex-col gap-2 z-[60] pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}
