interface FooterProps {
  isOnline: boolean;
  onShowPrivacy?: () => void;
}

export function Footer({ isOnline, onShowPrivacy }: FooterProps) {
  return (
    <footer className="flex items-center justify-between px-4 py-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-3">
        <span>PrivMITLab SVG Editor v1.0</span>
        <button
          onClick={onShowPrivacy}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline underline-offset-2 cursor-pointer"
        >
          Privacy Policy
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
        <span className="hidden sm:inline">· All processing is local</span>
      </div>
    </footer>
  );
}
