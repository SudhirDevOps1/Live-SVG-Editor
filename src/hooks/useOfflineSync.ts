import { useState, useEffect, useCallback } from 'react';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration may fail in single-file builds; this is expected
      });
    }
  }, []);

  const saveForOffline = useCallback((key: string, data: string) => {
    try {
      localStorage.setItem(`offline_${key}`, data);
    } catch {
      // Storage full or unavailable
    }
  }, []);

  const loadFromOffline = useCallback((key: string): string | null => {
    try {
      return localStorage.getItem(`offline_${key}`);
    } catch {
      return null;
    }
  }, []);

  return { isOnline, saveForOffline, loadFromOffline };
}
