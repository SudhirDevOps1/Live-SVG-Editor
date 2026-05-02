interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onLoadSample: () => void;
  onOptimize: () => void;
  onUpload: () => void;
  onDownload: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({
  onUndo,
  onRedo,
  onClear,
  onLoadSample,
  onOptimize,
  onUpload,
  onDownload,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
        title="Undo (Ctrl+Z)"
      >
        ↩ Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
        title="Redo (Ctrl+Shift+Z)"
      >
        ↪ Redo
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        onClick={onUpload}
        className="px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
      >
        📂 Upload
      </button>
      <button
        onClick={onDownload}
        className="px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
        title="Download SVG (Ctrl+S)"
      >
        💾 Save
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        onClick={onLoadSample}
        className="px-2.5 py-1.5 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors text-indigo-700 dark:text-indigo-300 font-medium"
      >
        🎨 Sample
      </button>
      <button
        onClick={onOptimize}
        className="px-2.5 py-1.5 text-xs rounded-lg bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors text-emerald-700 dark:text-emerald-300 font-medium"
      >
        ⚡ Optimize
      </button>

      <div className="flex-1" />

      <button
        onClick={onClear}
        className="px-2.5 py-1.5 text-xs rounded-lg bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900 transition-colors text-red-700 dark:text-red-300 font-medium"
        title="Clear All (Ctrl+Shift+K)"
      >
        🗑 Clear
      </button>
    </div>
  );
}
