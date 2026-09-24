'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import Icon from '../common/Icon';

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 animate-fadeIn">
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-between px-5 py-3.5 border-b border-gray-100', className)} {...props} />
);

const DialogTitle = ({ className, ...props }) => (
  <h3 className={cn('font-bold text-sm text-gray-900', className)} {...props} />
);

const DialogContent = ({ className, ...props }) => (
  <div className={cn('p-5', className)} {...props} />
);

const DialogClose = ({ onClick, className }) => (
  <button
    onClick={onClick}
    className={cn('p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer', className)}
    aria-label="Đóng"
  >
    <Icon name="close" size={18} />
  </button>
);

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose };
