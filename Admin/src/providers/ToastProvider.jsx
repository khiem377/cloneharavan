import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Unique ID Generator & Subscriber Pattern ─────────────────────────────────
let toastCounter = 0;
const listeners = new Set();

const createToast = (type, msg, opts = {}) => {
  const id = `t_${Date.now()}_${++toastCounter}`;
  const toastData = { id, message: msg, type, duration: opts.duration ?? 5000, ...opts };
  listeners.forEach((fn) => {
    try {
      fn(toastData);
    } catch (_) {}
  });
};

export const toast = {
  success: (msg, opts = {}) => createToast('success', msg, opts),
  error:   (msg, opts = {}) => createToast('error', msg, opts),
  warning: (msg, opts = {}) => createToast('warning', msg, opts),
  info:    (msg, opts = {}) => createToast('info', msg, opts),
};

// ─── Per-type config (Clean SVG Icons - Anti-Slop, No Emoji) ───────────────────
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
    label: 'Thông báo lỗi',
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
  info: {
    label: 'Thông tin',
    accent: '#3b82f6',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
};

// ─── Single Toast Item ─────────────────────────────────────────────────────────
function ToastItem({ item, onClose }) {
  const { message, title, description, type = 'success', duration = 5000 } = item;
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onCloseRef.current?.();
    }, 180);
  }, []);

  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderLeft: `3px solid ${cfg.accent}`,
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateX(12px) scale(0.96)' : 'translateX(0) scale(1)',
        animation: !isExiting ? 'toastSlideIn 0.2s cubic-bezier(0.16,1,0.3,1) both' : undefined,
      }}
      className="pointer-events-auto relative overflow-hidden w-full bg-white border border-slate-200 rounded-[6px] shadow-sm flex items-start gap-3 p-3.5 z-[100000]"
    >
      {/* Solid colored SVG icon container */}
      <div
        className="w-[26px] h-[26px] rounded-[4px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
        style={{ backgroundColor: cfg.accent }}
      >
        {cfg.icon}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 pr-1">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-0.5 font-mono"
          style={{ color: cfg.accent }}
        >
          {title || cfg.label}
        </p>
        <p className="text-xs text-slate-800 leading-relaxed font-semibold break-words">
          {message}
        </p>
        {description && (
          <p className="text-[11.5px] text-slate-600 leading-relaxed mt-0.5 break-words font-medium">
            {description}
          </p>
        )}
      </div>

      {/* Close button with instant dismiss */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="p-1 rounded-[4px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 -mr-0.5 -mt-0.5 active:scale-95"
        aria-label="Đóng thông báo"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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
    const handleNewToast = (newToast) => {
      setToasts((prev) => [newToast, ...prev.slice(0, 3)]);
    };
    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <>
      {children}
      <div
        className="fixed top-4 right-4 z-[99999] pointer-events-none flex flex-col gap-2.5 max-w-[360px] w-[calc(100vw-32px)]"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </>
  );
}

