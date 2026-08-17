import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

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
      <div className="toast-container">
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

  const icons = {
    success: <CheckCircle2 size={16} className="toast-icon success" />,
    error:   <AlertCircle  size={16} className="toast-icon error" />,
    info:    <Info         size={16} className="toast-icon info" />,
  };

  return (
    <div className={`toast-card toast-${toast.type}`}>
      {icons[toast.type]}
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={13} />
      </button>
    </div>
  );
}
