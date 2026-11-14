import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastPayload {
  id?: string;
  title: string;
  description?: string;
  type?: ToastType;
}

// Cross-island event helper
export function showToast(payload: Omit<ToastPayload, 'id'>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('cp:toast', {
      detail: { ...payload, id: crypto.randomUUID() },
    })
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Required<Pick<ToastPayload, 'id' | 'title' | 'type'>> & ToastPayload[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastPayload>;
      const newToast = {
        id: customEvent.detail.id || crypto.randomUUID(),
        title: customEvent.detail.title,
        description: customEvent.detail.description,
        type: customEvent.detail.type || 'info',
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener('cp:toast', handleToast);
    return () => window.removeEventListener('cp:toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-6 sm:w-96"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md transition-all',
            toast.type === 'success' && 'border-emerald-500/40',
            toast.type === 'error' && 'border-red-500/40',
            toast.type === 'info' && 'border-cyan-500/40'
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
          {toast.type === 'info' && <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{toast.title}</p>
            {toast.description && (
              <p className="mt-0.5 text-xs text-zinc-400">{toast.description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            aria-label="Dismiss notification"
            className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}