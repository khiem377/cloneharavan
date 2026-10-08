'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Info, HelpCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Singleton Subscriber Pattern for Imperative confirm() ─────────────────
let confirmListeners = [];
let currentDialog = null;

const notifyConfirmListeners = () => {
  confirmListeners.forEach((listener) => listener(currentDialog));
};

export const confirm = (optionsOrMessage) => {
  return new Promise((resolve) => {
    let opts = {};
    if (typeof optionsOrMessage === 'string') {
      opts = {
        title: 'Xác nhận hành động',
        description: optionsOrMessage,
        variant: 'destructive',
      };
    } else {
      opts = { ...optionsOrMessage };
    }

    currentDialog = {
      id: Math.random().toString(36).substring(2, 9),
      title: opts.title || 'Xác nhận',
      description: opts.description || opts.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
      confirmText: opts.confirmText || 'Xác nhận',
      cancelText: opts.cancelText || 'Hủy bỏ',
      variant: opts.variant || 'destructive',
      resolve,
    };

    notifyConfirmListeners();
  });
};

export const useConfirm = () => {
  return { confirm };
};

// ─── Variants config ────────────────────────────────────────────────────────
const VARIANT_CONFIG = {
  destructive: {
    iconBg: 'bg-red-50 text-red-600 border border-red-200',
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  },
  warning: {
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
  },
  default: {
    iconBg: 'bg-slate-100 text-slate-700 border border-slate-200',
    icon: <HelpCircle className="w-5 h-5 text-slate-700" />,
    confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-900',
  },
  info: {
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-200',
    icon: <Info className="w-5 h-5 text-blue-600" />,
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
  },
};

// ─── Presentational Confirm Dialog ──────────────────────────────────────────
export function ConfirmDialogView({
  open,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'destructive',
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null);
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.destructive;

  // Auto focus & Keyboard handle (Esc to cancel, Enter to confirm)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus button for keyboard navigation
    const timer = setTimeout(() => confirmBtnRef.current?.focus(), 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-fadeIn cursor-pointer"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative z-10 w-full max-w-md bg-white rounded-[6px] border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden animate-fadeIn"
      >
        <div className="flex items-start gap-4">
          {/* Icon Badge */}
          <div className={cn('shrink-0 w-10 h-10 rounded-[6px] flex items-center justify-center', cfg.iconBg)}>
            {cfg.icon}
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-slate-900 leading-snug">
              {title}
            </h3>
            <p id="confirm-dialog-description" className="mt-2 text-sm text-slate-600 leading-relaxed break-words">
              {description}
            </p>
          </div>

          {/* Close X button */}
          <button
            onClick={onCancel}
            className="shrink-0 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-[6px] transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-[6px] hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              'w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium rounded-[6px] shadow-xs active:scale-[0.98] transition-all cursor-pointer text-center',
              cfg.confirmButton
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Global Container Mount (Place in root layout) ───────────────────────────
export function ConfirmDialogContainer() {
  const [dialogState, setDialogState] = useState(null);

  useEffect(() => {
    const handler = (dlg) => setDialogState(dlg ? { ...dlg } : null);
    confirmListeners.push(handler);
    return () => {
      confirmListeners = confirmListeners.filter((l) => l !== handler);
    };
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState?.resolve) {
      dialogState.resolve(true);
    }
    currentDialog = null;
    setDialogState(null);
  }, [dialogState]);

  const handleCancel = useCallback(() => {
    if (dialogState?.resolve) {
      dialogState.resolve(false);
    }
    currentDialog = null;
    setDialogState(null);
  }, [dialogState]);

  if (!dialogState) return null;

  return (
    <ConfirmDialogView
      open={Boolean(dialogState)}
      title={dialogState.title}
      description={dialogState.description}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      variant={dialogState.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}

export default confirm;
