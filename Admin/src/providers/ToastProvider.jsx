import { useState, useEffect, useCallback } from 'react';

// ─── Subscriber Pattern ────────────────────────────────────────────────────────
let toastListener = null;

export const toast = {
  success: (msg, opts = {}) => toastListener?.({ id: Date.now(), message: msg, type: 'success', ...opts }),
  error:   (msg, opts = {}) => toastListener?.({ id: Date.now(), message: msg, type: 'error', ...opts }),
  warning: (msg, opts = {}) => toastListener?.({ id: Date.now(), message: msg, type: 'warning', ...opts }),
};

// ─── Per-type config ──────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  success: {
    label: 'Thành công',
    accent: '#10b981',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    label: 'Thông báo',
    accent: '#ef4444',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  warning: {
    label: 'Lưu ý',
    accent: '#f59e0b',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
};

// ─── Single Toast Item ─────────────────────────────────────────────────────────
function ToastItem({ item, onClose }) {
  const { message, title, type = 'success', duration = 3000 } = item;
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.success;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderLeft: `3px solid ${cfg.accent}`,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateX(12px) scale(0.97)' : 'translateX(0) scale(1)',
        animation: !isExiting ? 'toastSlideIn 0.22s cubic-bezier(0.16,1,0.3,1) both' : undefined,
      }}
      className="pointer-events-auto relative overflow-hidden w-full bg-white border border-slate-200 rounded-[6px] flex items-start gap-3 p-3.5"
    >
      {/* Solid colored icon */}
      <div
        className="w-[26px] h-[26px] rounded-[4px] flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: cfg.accent }}
      >
        {cfg.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-1">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color: cfg.accent, fontFamily: 'monospace' }}
        >
          {title || cfg.label}
        </p>
        <p className="text-xs text-slate-800 leading-relaxed font-medium break-words">
          {message}
        </p>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={handleClose}
        className="p-1 rounded-[4px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 -mr-0.5 -mt-0.5"
        aria-label="Đóng"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">
          <div
            style={{
              height: '100%',
              backgroundColor: cfg.accent,
              animation: `toastProgress ${duration}ms linear forwards`,
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    };
    return () => { toastListener = null; };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <>
      {children}
      {/* Fixed top-right container */}
      <div
        className="fixed top-4 right-4 z-[99999] pointer-events-none flex flex-col gap-2 max-w-[360px] w-[calc(100vw-32px)]"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </>
  );
}
