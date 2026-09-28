'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// Lightweight subscriber pattern for toast triggers
let listeners = [];
let toasts = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

/**
 * Toast Trigger Utility
 * @example
 * toast.success('Gửi đánh giá thành công!');
 * toast.error('Có lỗi xảy ra.');
 * toast.warning('Chỉ khách hàng đã mua mới được nhận xét.');
 * toast.info('Thông báo hệ thống.');
 */
export const toast = (message, options = {}) => {
  const id = options.id || Math.random().toString(36).substring(2, 9);
  const newToast = {
    id,
    message,
    title: options.title || null,
    type: options.type || 'info', // 'success' | 'error' | 'warning' | 'info'
    duration: options.duration !== undefined ? options.duration : 3000,
    ...options,
  };

  // Limit max concurrent toasts to prevent clutter
  toasts = [newToast, ...toasts.slice(0, 4)];
  notifyListeners();
  return id;
};

toast.success = (message, options = {}) => toast(message, { ...options, type: 'success' });
toast.error = (message, options = {}) => toast(message, { ...options, type: 'error' });
toast.warning = (message, options = {}) => toast(message, { ...options, type: 'warning' });
toast.info = (message, options = {}) => toast(message, { ...options, type: 'info' });

toast.dismiss = (id) => {
  if (id) {
    toasts = toasts.filter((t) => t.id !== id);
  } else {
    toasts = [];
  }
  notifyListeners();
};

export const useToast = () => {
  const [activeToasts, setActiveToasts] = useState(toasts);

  useEffect(() => {
    const handleUpdate = (updatedToasts) => {
      setActiveToasts(updatedToasts);
    };
    listeners.push(handleUpdate);
    return () => {
      listeners = listeners.filter((l) => l !== handleUpdate);
    };
  }, []);

  return {
    toasts: activeToasts,
    toast,
    dismiss: toast.dismiss,
  };
};

const TOAST_THEMES = {
  success: {
    icon: CheckCircle2,
    iconWrapperClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    barClass: 'bg-emerald-600',
    title: 'Thành công',
  },
  error: {
    icon: AlertCircle,
    iconWrapperClass: 'bg-red-50 text-red-600 border border-red-200/60',
    barClass: 'bg-red-600',
    title: 'Thông báo',
  },
  warning: {
    icon: AlertTriangle,
    iconWrapperClass: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    barClass: 'bg-amber-500',
    title: 'Lưu ý',
  },
  info: {
    icon: Info,
    iconWrapperClass: 'bg-blue-50 text-blue-600 border border-blue-200/60',
    barClass: 'bg-blue-600',
    title: 'Thông tin',
  },
};

function ToastItem({ toastItem, onDismiss }) {
  const { id, message, title, type = 'info', duration = 3000 } = toastItem;
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const theme = TOAST_THEMES[type] || TOAST_THEMES.info;
  const IconComponent = theme.icon;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 180);
  }, [id, onDismiss]);

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden pointer-events-auto w-full
        bg-white border border-slate-200 rounded-[6px] shadow-sm
        p-3 sm:p-3.5 flex items-start gap-3
        transition-all duration-200 ease-out
        ${isExiting ? 'opacity-0 translate-x-4 scale-95' : 'animate-toast-slide-in'}
      `}
    >
      {/* Icon Badge */}
      <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 ${theme.iconWrapperClass}`}>
        <IconComponent className="w-4 h-4 shrink-0" strokeWidth={2.2} />
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 pr-1 py-0.5">
        <h4 className="text-xs font-bold text-slate-900 leading-tight mb-0.5">
          {title || theme.title}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed font-medium break-words">
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={handleClose}
        className="p-1 rounded-[6px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-[0.98] shrink-0 -mr-1 -mt-0.5"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar (Countdown ~3s, pauses on hover) */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 overflow-hidden rounded-b-[6px]">
          <div
            className={`h-full ${theme.barClass}`}
            style={{
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

/**
 * Toast Container mounted at the top-right of the viewport
 */
export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[99999] pointer-events-none flex flex-col gap-2.5 max-w-[380px] w-[calc(100vw-32px)]"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toastItem={item} onDismiss={dismiss} />
      ))}
    </div>
  );
}

export default toast;
