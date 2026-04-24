import { useState, useCallback } from 'react';
import type { ToastMessage } from '../types';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string, duration = 3000) => {
    const id = `toast-${++toastIdCounter}`;
    setToasts(prev => [...prev, { id, type, message, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 400);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    removeToast,
    toast: {
      success: (msg: string, duration?: number) => addToast('success', msg, duration),
      error: (msg: string, duration?: number) => addToast('error', msg, duration),
      info: (msg: string, duration?: number) => addToast('info', msg, duration),
      warning: (msg: string, duration?: number) => addToast('warning', msg, duration),
    },
  };
}
