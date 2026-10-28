'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import OrderSuccessMascot from './OrderSuccessMascot';

export default function OrderSuccessHero({ orderCode, createdAt, isPaid = true, paymentMethod = 'ONEPAY' }) {
  const [copied, setCopied] = useState(false);
  const methodUpper = String(paymentMethod || '').toUpperCase();
  const isVnpay = methodUpper === 'VNPAY';
  const methodName = isVnpay ? 'VNPAY' : methodUpper === 'ONEPAY' ? 'ONEPAY' : 'TRỰC TUYẾN';

  const handleCopy = () => {
    if (!orderCode) return;
    navigator.clipboard?.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d);
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-6 text-center space-y-3 relative overflow-hidden">
      {/* Mascot Đặt hàng thành công Vector SVG (Anty Shopy) */}
      <div className="flex justify-center -mt-1">
        <OrderSuccessMascot className="w-36 h-36 sm:w-44 sm:h-44" />
      </div>

      <div className="space-y-1.5 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-[4px] text-xs font-bold font-mono">
          <span>{isPaid ? `ĐÃ THANH TOÁN (${methodName})` : 'ĐẶT HÀNG THÀNH CÔNG'}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Đặt hàng & Thanh toán thành công!
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Cảm ơn bạn đã tin tưởng mua sắm tại cửa hàng. Giao dịch trực tuyến của bạn đã được đối soát thành công qua cổng <strong>{isVnpay ? 'VNPAY' : 'OnePay'}</strong>.
        </p>
      </div>

      {/* Thông tin mã đơn hàng */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
        <span className="text-slate-500">Mã đơn hàng:</span>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-[4px]">
          <span className="font-mono font-bold text-slate-900 tracking-wide">
            #{orderCode || 'N/A'}
          </span>
          {orderCode && (
            <button
              type="button"
              onClick={handleCopy}
              title="Sao chép mã đơn"
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition active:scale-95"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          )}
        </div>

        {createdAt && (
          <span className="text-slate-400 text-[11px] font-mono">
            • {formatDate(createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
