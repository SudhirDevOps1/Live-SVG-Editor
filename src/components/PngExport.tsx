import { useState, useCallback } from 'react';
import { exportAsPng } from '../utils/exportHelpers';

interface PngExportProps {
  svgCode: string;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const scales = [
  { value: 1, label: '1x', desc: 'Standard (400×300)' },
  { value: 2, label: '2x', desc: 'High DPI / Retina (800×600)' },
  { value: 3, label: '3x', desc: 'Print quality (1200×900)' },
  { value: 4, label: '4x', desc: 'Ultra HD (1600×1200)' },
];

export function PngExport({ svgCode, addToast }: PngExportProps) {
  const [scale, setScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!svgCode.trim()) {
      addToast('error', 'No SVG to export');
      return;
    }
    if (!svgCode.includes('<svg')) {
      addToast('error', 'Invalid SVG — must contain <svg> tag');
      return;
    }
    setIsExporting(true);
    try {
      await exportAsPng(svgCode, scale);
      addToast('success', `PNG exported at ${scale}x quality`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      addToast('error', msg);
    } finally {
      setIsExporting(false);
    }
  }, [svgCode, scale, addToast]);

  return (
    <div className="flex items-center gap-2">
      {/* Quality selector buttons */}
      <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {scales.map((s) => (
          <button
            key={s.value}
            onClick={() => setScale(s.value)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              scale === s.value
                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-300 dark:ring-indigo-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
            title={s.desc}
          >
            {s.label}
          </button>
        ))}
      </div>
      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !svgCode.trim()}
        className="px-3.5 py-1.5 text-xs rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 active:from-orange-700 active:to-pink-700 transition-all font-medium disabled:opacity-40 shadow-sm whitespace-nowrap"
      >
        {isExporting ? (
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Exporting...
          </span>
        ) : (
          `🖼 Export PNG (${scale}x)`
        )}
      </button>
    </div>
  );
}
