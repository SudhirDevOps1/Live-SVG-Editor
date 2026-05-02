import { useState, useCallback } from 'react';
import { exportAsPng } from '../utils/exportHelpers';

interface PngExportProps {
  svgCode: string;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const scales = [
  { value: 1, label: '1×', desc: 'Standard (72 DPI)' },
  { value: 2, label: '2×', desc: 'Retina (144 DPI)' },
  { value: 3, label: '3×', desc: 'Print (216 DPI)' },
  { value: 4, label: '4×', desc: 'Ultra HD (288 DPI)' },
];

export function PngExport({ svgCode, addToast }: PngExportProps) {
  const [scale, setScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!svgCode.trim()) {
      addToast('error', 'No SVG to export — paste or draw something first');
      return;
    }
    setIsExporting(true);
    try {
      await exportAsPng(svgCode, scale);
      addToast('success', `PNG exported at ${scale}× quality`);
    } catch {
      addToast('error', 'Failed to export PNG. Try with a valid SVG.');
    } finally {
      setIsExporting(false);
    }
  }, [svgCode, scale, addToast]);

  return (
    <div className="flex items-center gap-2">
      {/* Quality selector */}
      <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {scales.map((s) => (
          <button
            key={s.value}
            onClick={() => setScale(s.value)}
            disabled={isExporting}
            className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-50 ${
              scale === s.value
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60'
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
        disabled={isExporting}
        className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 shadow-sm hover:shadow-md"
      >
        {isExporting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span>🖼</span>
            <span>Download PNG</span>
          </>
        )}
      </button>
    </div>
  );
}
