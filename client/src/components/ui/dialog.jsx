'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity animate-fadeIn"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-[6px] shadow-sm overflow-hidden border border-slate-200 animate-fadeIn">
        {children}
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, onClick, ...props }) => (
  <div onClick={onClick} {...props}>
    {children}
  </div>
);

const DialogPortal = ({ children }) => <>{children}</>;

const DialogOverlay = ({ className, onClick, ...props }) => (
  <div
    className={cn('fixed inset-0 bg-black/60 transition-opacity', className)}
    onClick={onClick}
    {...props}
  />
);

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 px-5 py-3.5 border-b border-gray-100 text-left', className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-5 py-3.5 border-t border-gray-100 bg-slate-50/50', className)} {...props} />
);

const DialogTitle = ({ className, ...props }) => (
  <h3 className={cn('font-bold text-sm text-gray-900 tracking-tight', className)} {...props} />
);

const DialogDescription = ({ className, ...props }) => (
  <p className={cn('text-xs text-slate-500', className)} {...props} />
);

const DialogContent = ({ className, ...props }) => (
  <div className={cn('p-5', className)} {...props} />
);

const DialogClose = ({ onClick, className, ...props }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn('p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer', className)}
    aria-label="Đóng"
    {...props}
  >
    <X size={16} />
  </button>
);

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
