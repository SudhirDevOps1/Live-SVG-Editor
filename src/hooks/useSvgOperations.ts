import { useState, useCallback } from 'react';

interface UseSvgOperationsOptions {
  initialCode: string;
  maxHistory?: number;
}

export function useSvgOperations({ initialCode, maxHistory = 50 }: UseSvgOperationsOptions) {
  const [code, setCode] = useState(initialCode);
  const [history, setHistory] = useState<string[]>([initialCode]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushHistory = useCallback(
    (newCode: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(newCode);
        if (newHistory.length > maxHistory) {
          newHistory.shift();
        }
        return newHistory;
      });
      setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1));
      setCode(newCode);
    },
    [currentIndex, maxHistory]
  );

  const updateCode = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setCode(history[currentIndex - 1]);
    }
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCode(history[currentIndex + 1]);
    }
  }, [currentIndex, history]);

  const reset = useCallback(() => {
    setHistory([initialCode]);
    setCurrentIndex(0);
    setCode(initialCode);
  }, [initialCode]);

  return {
    code,
    updateCode,
    pushHistory,
    undo,
    redo,
    reset,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}
