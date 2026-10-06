'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ─── Subscriber Pattern ────────────────────────────────────────────────────────
let listeners = [];
let toasts = [];

const notifyListeners = () => {
  listeners.forEach((fn) => fn([...toasts]));
};

/**
 * Toast Trigger Utility
 * toast.success('Thành công!');
 * toast.error('Có lỗi.');
 * toast.warning('Lưu ý.');
 */
export const toast = (message, options = {}) => {
  const id = options.id || Math.random().toString(36).substring(2, 9);
  const newToast = {
    id,
    message,
    title: options.title || null,
    type: options.type || 'success',
    duration: options.duration !== undefined ? options.duration : 3000,
    ...options,
  };
  toasts = [newToast, ...toasts.slice(0, 4)];
  notifyListeners();
  return id;
};

toast.success = (msg, opts = {}) => toast(msg, { ...opts, type: 'success' });
toast.error   = (msg, opts = {}) => toast(msg, { ...opts, type: 'error' });
toast.warning = (msg, opts = {}) => toast(msg, { ...opts, type: 'warning' });

toast.dismiss = (id) => {
  toasts = id ? toasts.filter((t) => t.id !== id) : [];
  notifyListeners();
};

export const useToast = () => {
  const [activeToasts, setActiveToasts] = useState(toasts);
  useEffect(() => {
    const handler = (updated) => setActiveToasts(updated);
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);
  return { toasts: activeToasts, toast, dismiss: toast.dismiss };
};

// ─── Per-type config ──────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  success: {
    label: 'Thành công',
    accent: '#10b981',      // emerald-500
    iconBg: '#10b981',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    label: 'Thông báo',
    accent: '#ef4444',      // red-500
    iconBg: '#ef4444',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  warning: {
    label: 'Lưu ý',
    accent: '#f59e0b',      // amber-500
    iconBg: '#f59e0b',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
};

// ─── Single Toast Item ─────────────────────────────────────────────────────────
function ToastItem({ toastItem, onDismiss }) {
  const { id, message, title, type = 'success', duration = 3000 } = toastItem;
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.success;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 200);
  }, [id, onDismiss]);

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderLeft: `3px solid ${cfg.accent}`,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateX(12px) scale(0.97)' : undefined,
      }}
      className={`
        relative overflow-hidden pointer-events-auto w-full
        bg-white border border-slate-200 rounded-[6px]
        flex items-start gap-3 p-3.5
        transition-all duration-200 ease-out
        ${!isExiting ? 'animate-toast-slide-in' : ''}
      `}
    >
      {/* Solid icon square – NOT pale bg, uses full color */}
      <div
        className="w-[26px] h-[26px] rounded-[4px] flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: cfg.iconBg }}
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

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="p-1 rounded-[4px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-[0.98] shrink-0 -mr-0.5 -mt-0.5"
        aria-label="Đóng"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress bar at bottom */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">
          <div
            style={{
              height: '100%',
              backgroundColor: cfg.accent,
              animation: `toastProgress ${duration}ms linear forwards`,
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
            onAnimationEnd={handleClose}
          />
        </div>
      )}
    </div>
  );
}

// ─── Container — fixed top-right ──────────────────────────────────────────────
export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[99999] pointer-events-none flex flex-col gap-2 max-w-[360px] w-[calc(100vw-32px)]"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toastItem={item} onDismiss={dismiss} />
      ))}
    </div>
  );
}

export default toast;
