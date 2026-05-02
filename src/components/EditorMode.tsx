import { useRef } from 'react';
import { CodeHighlighter } from './CodeHighlighter';

interface EditorModeProps {
  svgCode: string;
  onCodeChange: (code: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  onReset: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditorMode({
  svgCode,
  onCodeChange,
  zoom,
  onZoomChange,
  rotation,
  onRotationChange,
  onReset,
  onFileUpload,
}: EditorModeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[500px] animate-fade-in">
      {/* Code Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors font-medium"
          >
            📂 Open SVG File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={onFileUpload}
            className="hidden"
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {svgCode.length} chars · {svgCode.split('\n').length} lines
          </span>
        </div>
        <CodeHighlighter
          code={svgCode}
          onChange={onCodeChange}
          placeholder="Paste or type SVG code here..."
        />
      </div>

      {/* Preview + Controls */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Zoom</label>
            <input
              type="range"
              min="10"
              max="300"
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{zoom}%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rotate</label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => onRotationChange(Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{rotation}°</span>
          </div>
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
          >
            Reset View
          </button>
        </div>
        <div className="flex-1">
          <div
            className="w-full h-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            <div className="flex items-center justify-center w-full h-full p-4">
              <div
                className="transition-transform duration-200 ease-out"
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
