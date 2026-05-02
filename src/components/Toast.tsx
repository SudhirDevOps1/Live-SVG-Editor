import { useEffect, useCallback } from 'react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const icons: Record<string, string> = {
  success: '✓',
  error: '✗',
  info: 'ℹ',
};

const bgColors: Record<string, string> = {
  success: 'bg-emerald-500/90',
  error: 'bg-red-500/90',
  info: 'bg-blue-500/90',
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const dismiss = useCallback(() => onDismiss(toast.id), [toast.id, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 3500);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <div
      className={`${bgColors[toast.type]} text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2 text-sm font-medium animate-slide-in min-w-[240px]`}
    >
      <span className="text-base">{icons[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}
