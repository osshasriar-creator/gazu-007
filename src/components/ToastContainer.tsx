import React from 'react';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-black text-white p-3.5 shadow-2xl border border-neutral-700 flex items-start justify-between space-x-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start space-x-2.5">
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
            {toast.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-bold tracking-wider uppercase text-white">{toast.title}</p>
              {toast.message && <p className="text-[11px] text-neutral-300 font-light mt-0.5">{toast.message}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-neutral-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
