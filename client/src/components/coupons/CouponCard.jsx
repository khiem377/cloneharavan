'use client';

import React, { useState } from 'react';
import { Ticket, Copy, Check, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CouponCard({ coupon, onCopySuccess }) {
  const [copied, setCopied] = useState(false);

  if (!coupon) return null;

  const {
    code = '',
    name = '',
    description = '',
    discountType = 'fixed',
    discountValue = 0,
    minOrderValue = 0,
    maxDiscount = null,
    endDate = null,
    usageLimit = null,
    usedCount = 0,
  } = coupon;

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopied(true);
    if (onCopySuccess) onCopySuccess(code);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedExpiry = endDate
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(endDate))
    : 'Không giới hạn';

  const usagePercent =
    usageLimit && usageLimit > 0
      ? Math.min(100, Math.round((usedCount / usageLimit) * 100))
      : null;

  return (
    <div className="relative rounded-[6px] border border-slate-200 bg-white hover:border-slate-400 transition-colors duration-150 p-4 flex flex-col justify-between overflow-hidden">
      {/* Left decorative notch */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-[6px] bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Ticket size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
              {discountType === 'percent' ? 'Mã phần trăm' : 'Mã giảm trực tiếp'}
            </span>
            <h3 className="text-sm font-bold text-slate-900 truncate" title={name || code}>
              {name || code}
            </h3>
          </div>
        </div>

        {/* Code Badge */}
        <div className="px-2 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 font-mono tabular-nums text-xs font-bold text-slate-800 shrink-0">
          {code}
        </div>
      </div>

      {/* Discount Headline */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1 font-mono tabular-nums">
          <span className="text-xl sm:text-2xl font-black text-red-600">
            {discountType === 'percent'
              ? `Giảm ${discountValue}%`
              : `Giảm ${Number(discountValue).toLocaleString('vi-VN')}₫`}
          </span>
          {maxDiscount && discountType === 'percent' && (
            <span className="text-xs text-slate-500 font-medium">
              (tối đa {Number(maxDiscount).toLocaleString('vi-VN')}₫)
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 mt-1 line-clamp-2 min-h-8 leading-relaxed">
          {description || (minOrderValue > 0
            ? `Áp dụng cho đơn hàng từ ${Number(minOrderValue).toLocaleString('vi-VN')}₫`
            : 'Áp dụng cho mọi giá trị đơn hàng')}
        </p>
      </div>

      {/* Progress & Meta info */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5">
        {usagePercent !== null && (
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono tabular-nums mb-1">
              <span>Đã sử dụng</span>
              <span className="font-semibold text-slate-700">{usagePercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono tabular-nums">
            <Clock size={12} className="text-slate-400 shrink-0" />
            <span>HSD: {formattedExpiry}</span>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleCopy}
            className={`h-7 px-3 rounded-[6px] text-xs font-bold transition active:scale-[0.98] cursor-pointer gap-1.5 font-mono ${
              copied
                ? 'bg-slate-900 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check size={12} />
                <span>Đã lưu</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Lưu mã</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
