import type { Mode } from '../types';

interface ModeToggleProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modes: { key: Mode; label: string; icon: string }[] = [
  { key: 'editor', label: 'Editor', icon: '✍️' },
  { key: 'draw', label: 'Draw', icon: '📐' },
  { key: 'customize', label: 'Customize', icon: '🖌️' },
  { key: 'code', label: 'Code', icon: '💻' },
];

export function ModeToggle({ currentMode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex justify-center px-4 py-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-1 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onModeChange(mode.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentMode === mode.key
                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <span>{mode.icon}</span>
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
