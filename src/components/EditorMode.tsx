import { useRef, useState } from 'react';
import { CodeHighlighter } from './CodeHighlighter';

interface EditorModeProps {
  svgCode: string;
  onCodeChange: (code: string) => void;
  onFormatCode?: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  onReset: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const backgrounds = [
  { key: 'checker', label: 'Checker', icon: '🏁' },
  { key: 'grid-light', label: 'Grid Light', icon: '📐' },
  { key: 'grid-dark', label: 'Grid Dark', icon: '⬛' },
  { key: 'dot-light', label: 'Dot Light', icon: '⚪' },
  { key: 'dot-dark', label: 'Dot Dark', icon: '⚫' },
  { key: 'white', label: 'White', icon: '⬜' },
  { key: 'black', label: 'Black', icon: '▪️' },
  { key: 'gray', label: 'Gray', icon: '🔘' },
  { key: 'blueprint', label: 'Blueprint', icon: '📘' },
];

function getBgStyle(key: string): React.CSSProperties {
  switch (key) {
    case 'checker':
      return {
        backgroundColor: '#fff',
        backgroundImage:
          'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      };
    case 'grid-light':
      return {
        backgroundColor: '#fff',
        backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'grid-dark':
      return {
        backgroundColor: '#1a1a2e',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'dot-light':
      return {
        backgroundColor: '#fff',
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'dot-dark':
      return {
        backgroundColor: '#1a1a2e',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'white':
      return { backgroundColor: '#ffffff' };
    case 'black':
      return { backgroundColor: '#000000' };
    case 'gray':
      return { backgroundColor: '#6b7280' };
    case 'blueprint':
      return {
        backgroundColor: '#1e3a5f',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      };
    default:
      return { backgroundColor: '#fff' };
  }
}

export function EditorMode({
  svgCode,
  onCodeChange,
  onFormatCode,
  zoom,
  onZoomChange,
  rotation,
  onRotationChange,
  onReset,
  onFileUpload,
}: EditorModeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bgKey, setBgKey] = useState('blueprint');
  const [showBgPicker, setShowBgPicker] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[500px] animate-fade-in">
      {/* Code Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors font-medium"
          >
            📂 Open SVG
          </button>
          <input ref={fileInputRef} type="file" accept=".svg,image/svg+xml" onChange={onFileUpload} className="hidden" />
          {onFormatCode && (
            <button
              onClick={onFormatCode}
              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors font-medium"
              title="Format/Beautify SVG code (Ctrl+Shift+F)"
            >
              ✨ Format
            </button>
          )}
          <div className="flex-1" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {svgCode.length} chars · {svgCode.split('\n').length} lines
          </span>
        </div>
        <CodeHighlighter code={svgCode} onChange={onCodeChange} placeholder="Paste or type SVG code here..." />
      </div>

      {/* Preview + Controls */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Zoom</label>
            <input type="range" min="10" max="300" value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} className="w-24 accent-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{zoom}%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rotate</label>
            <input type="range" min="0" max="360" value={rotation} onChange={(e) => onRotationChange(Number(e.target.value))} className="w-24 accent-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{rotation}°</span>
          </div>
          <button onClick={onReset} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium">
            Reset
          </button>
          <div className="flex-1" />
          {/* Background picker */}
          <div className="relative">
            <button onClick={() => setShowBgPicker((p) => !p)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1.5"
              title="Change preview background">
              <span>{backgrounds.find((b) => b.key === bgKey)?.icon}</span>
              <span className="hidden sm:inline">{backgrounds.find((b) => b.key === bgKey)?.label}</span>
              <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showBgPicker && (
              <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 grid grid-cols-3 gap-1 w-52 animate-fade-in"
                onMouseLeave={() => setShowBgPicker(false)}>
                {backgrounds.map((b) => (
                  <button key={b.key} onClick={() => { setBgKey(b.key); setShowBgPicker(false); }}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium transition-all ${
                      bgKey === b.key
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/50'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                    <span className="text-base">{b.icon}</span>
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="w-full h-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
            style={getBgStyle(bgKey)}>
            <div className="flex items-center justify-center w-full h-full p-4">
              <div className="transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                dangerouslySetInnerHTML={{
                  __html: svgCode
                    .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
                    .replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
                    .replace(/javascript:/gi, ''),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
