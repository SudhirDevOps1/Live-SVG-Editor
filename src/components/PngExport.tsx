import { useState, useCallback } from 'react';
import { exportAsPng } from '../utils/exportHelpers';

interface PngExportProps {
  svgCode: string;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const scales = [
  { value: 1, label: '1x', desc: 'Standard' },
  { value: 2, label: '2x', desc: 'High DPI' },
  { value: 3, label: '3x', desc: 'Print' },
  { value: 4, label: '4x', desc: 'Ultra HD' },
];

export function PngExport({ svgCode, addToast }: PngExportProps) {
  const [scale, setScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!svgCode.trim()) {
      addToast('error', 'No SVG to export');
      return;
    }
    setIsExporting(true);
    try {
      await exportAsPng(svgCode, scale);
      addToast('success', `PNG exported at ${scale}x resolution`);
    } catch {
      addToast('error', 'Failed to export PNG');
    } finally {
      setIsExporting(false);
    }
  }, [svgCode, scale, addToast]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {scales.map((s) => (
          <button
            key={s.value}
            onClick={() => setScale(s.value)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              scale === s.value
                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title={s.desc}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 shadow-sm"
      >
        {isExporting ? '⏳ Exporting...' : '🖼 PNG'}
      </button>
    </div>
  );
}
