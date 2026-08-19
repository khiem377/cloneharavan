import { useState, useEffect } from 'react';
import { CheckCircle2Icon, AlertCircleIcon, InfoIcon, XIcon } from '@/components/ui/Icons';

let toastListener = null;

export const toast = {
  success: (msg) => toastListener?.({ id: Date.now(), message: msg, type: 'success' }),
  error:   (msg) => toastListener?.({ id: Date.now(), message: msg, type: 'error' }),
  info:    (msg) => toastListener?.({ id: Date.now(), message: msg, type: 'info' }),
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [...prev.slice(-4), newToast]);
    };
    return () => { toastListener = null; };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-[calc(100vw-32px)]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.type === 'error' ? 3500 : 2500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const styles = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    error:   'border-destructive/30 bg-destructive/10 text-destructive',
    info:    'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  };

  const icons = {
    success: <CheckCircle2Icon size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />,
    error:   <AlertCircleIcon size={16} className="shrink-0 text-destructive" />,
    info:    <InfoIcon size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />,
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border p-3.5 shadow-lg backdrop-blur-xs text-xs font-medium ${styles[toast.type]}`}>
      {icons[toast.type]}
      <span className="flex-1 leading-normal">{toast.message}</span>
      <button className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" onClick={onClose}>
        <XIcon size={13} />
      </button>
    </div>
  );
}
