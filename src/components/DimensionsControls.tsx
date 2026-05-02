interface DimensionsControlsProps {
  width: number;
  height: number;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
}

export function DimensionsControls({ width, height, onWidthChange, onHeightChange }: DimensionsControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">W</label>
        <input
          type="number"
          value={width}
          onChange={(e) => onWidthChange(Math.max(1, Number(e.target.value)))}
          className="w-16 px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
        />
      </div>
      <span className="text-gray-400">×</span>
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">H</label>
        <input
          type="number"
          value={height}
          onChange={(e) => onHeightChange(Math.max(1, Number(e.target.value)))}
          className="w-16 px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>
  );
}
