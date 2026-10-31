'use client';

import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutPolicyModal({ isOpen, onClose, title, content }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#0088ff]" />
            <h3 className="text-sm font-bold text-slate-900">{title || 'Chính sách cửa hàng'}</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-slate-400 hover:text-slate-600 rounded-[4px]"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="p-5 overflow-y-auto text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line flex-1">
          {content || 'Nội dung chính sách đang được cập nhật.'}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold rounded-[6px]"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
