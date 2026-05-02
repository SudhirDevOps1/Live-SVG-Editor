import { useState, useCallback, useEffect, useRef } from 'react';
import type { Mode, ToastMessage } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOfflineSync } from './hooks/useOfflineSync';
import { optimizeSvg } from './utils/svgOptimizer';
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

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.15" />
    </linearGradient>
    <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1" />
      <stop offset="100%" style="stop-color:#8b5cf6" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="380" height="280" rx="20" fill="url(#bgGrad)" stroke="#6366f1" stroke-width="1" />
  <circle cx="120" cy="110" r="50" fill="url(#circleGrad)" opacity="0.9" />
  <circle cx="200" cy="110" r="50" fill="url(#circleGrad)" opacity="0.7" />
  <circle cx="280" cy="110" r="50" fill="url(#circleGrad)" opacity="0.5" />
  <rect x="140" y="170" width="120" height="70" rx="12" fill="#6366f1" />
  <text x="200" y="212" text-anchor="middle" fill="white" font-size="22" font-family="system-ui, sans-serif" font-weight="bold">SVG Editor</text>
  <path d="M40 260 Q100 240 160 260 Q220 280 280 260 Q340 240 370 260" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="40" cy="260" r="4" fill="#a78bfa" />
  <circle cx="370" cy="260" r="4" fill="#a78bfa" />
</svg>`;

type Page = 'editor' | 'privacy';

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('svg-dark-mode', true);
  const [savedSvg] = useLocalStorage('svg-saved', SAMPLE_SVG);
  const [page, setPage] = useState<Page>('editor');
  const [mode, setMode] = useState<Mode>('editor');
  const [svgCode, setSvgCode] = useState(savedSvg);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [history, setHistory] = useState<string[]>([savedSvg]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOnline } = useOfflineSync();

  // Apply dark mode class to <html> on mount + changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Also apply on initial load (in case localStorage has it set)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('svg-dark-mode');
      if (stored !== null) {
        const isDark = JSON.parse(stored);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      }
    } catch {
      // ignore
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
    (code: string) => {
      pushHistory(code);
    },
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
          pushHistory(content);
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

  // Keyboard shortcuts
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDownload, handleUndo, handleRedo, handleClear]);

  // Privacy page
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
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <main className="flex-1 p-3 sm:p-4 overflow-auto">
        {mode === 'editor' && (
          <EditorMode
            svgCode={svgCode}
            onCodeChange={handleCodeChange}
            zoom={zoom}
            onZoomChange={setZoom}
            rotation={rotation}
            onRotationChange={setRotation}
            onReset={() => {
              setZoom(100);
              setRotation(0);
            }}
            onFileUpload={handleFileSelect}
          />
        )}
        {mode === 'draw' && <DrawMode onExport={handleCodeChange} addToast={addToast} />}
        {mode === 'customize' && (
          <CustomizeMode svgCode={svgCode} onCodeChange={handleCodeChange} addToast={addToast} />
        )}
        {mode === 'code' && <CodeMode svgCode={svgCode} addToast={addToast} />}

        {/* PNG Export Bar — visible below main content */}
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

      <div className="fixed bottom-16 right-4 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}
