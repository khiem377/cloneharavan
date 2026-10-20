'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function CartVoucherCard({
  coupon,
  isApplied,
  isEligible = true,
  currentSubtotal = 0,
  isUpdating = false,
  onApply,
}) {
  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  if (!coupon) return null;

  const isShipping = coupon.category === 'shipping';

  const discountDisplay = isShipping
    ? coupon.type === 'free_shipping'
      ? 'Miễn phí 100% cước vận chuyển'
      : coupon.type === 'percent'
      ? `Giảm ${coupon.value}% phí ship${coupon.maxDiscount ? ` (Tối đa ${formatPrice(coupon.maxDiscount)})` : ''}`
      : `Giảm ${formatPrice(coupon.value)} phí ship`
    : coupon.type === 'percent'
    ? `Giảm ${coupon.value}%${coupon.maxDiscount ? ` (Tối đa ${formatPrice(coupon.maxDiscount)})` : ''}`
    : `Giảm ${formatPrice(coupon.value)}`;

  if (!isEligible) {
    const missingAmount = Math.max(0, (coupon.minOrderValue || 0) - currentSubtotal);
    return (
      <div className="p-3 rounded-[6px] bg-slate-50/70 border border-slate-200 text-slate-400 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-[4px] bg-slate-200 text-slate-700">
              {coupon.code}
            </span>
            <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              {isShipping ? 'Freeship' : 'Đơn hàng'}
            </span>
          </div>
          {missingAmount > 0 && (
            <span className="text-[11px] text-amber-700 font-medium">
              Mua thêm <strong className="font-mono tabular-nums">{formatPrice(missingAmount)}</strong> để áp dụng
            </span>
          )}
        </div>
        <div className="text-xs font-medium text-slate-600">
          {coupon.name} (Đơn tối thiểu {formatPrice(coupon.minOrderValue)}{coupon.usageLimitPerUser ? ` • Tối đa ${coupon.usageLimitPerUser} lần/khách` : ''})
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-[6px] border transition-all flex items-start justify-between gap-3 ${
        isApplied
          ? isShipping
            ? 'bg-sky-50/70 border-sky-600 ring-1 ring-sky-600'
            : 'bg-blue-50/60 border-[#284ea1] ring-1 ring-[#284ea1]'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono tabular-nums font-bold text-xs px-2 py-0.5 rounded-[4px] border ${
              isShipping
                ? 'text-sky-700 bg-sky-50 border-sky-200'
                : 'text-[#284ea1] bg-blue-50 border-blue-200'
            }`}
          >
            {coupon.code}
          </span>
          <span className="text-xs font-bold text-slate-900 truncate">
            {coupon.name}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
              isShipping
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-blue-50 text-[#284ea1] border-blue-200'
            }`}
          >
            {isShipping ? 'Vận chuyển' : 'Đơn hàng'}
          </span>
        </div>

        <div className={`text-xs font-semibold ${isShipping ? 'text-sky-800' : 'text-slate-800'}`}>
          {discountDisplay}
        </div>

        {coupon.minOrderValue > 0 && (
          <div className="text-[11px] text-slate-500">
            Đơn tối thiểu: <span className="font-mono tabular-nums">{formatPrice(coupon.minOrderValue)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10.5px] text-slate-400">
          <span>HSD: {formatDate(coupon.endDate)}</span>
          {coupon.usageLimitPerUser && (
            <span>• Tối đa {coupon.usageLimitPerUser} lần/tài khoản</span>
          )}
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={() => onApply(coupon.code, coupon.category || 'order')}
        disabled={isApplied || isUpdating}
        className={`h-8 px-4 text-xs font-bold rounded-[4px] shrink-0 transition cursor-pointer active:scale-[0.98] ${
          isApplied
            ? 'bg-emerald-600 text-white cursor-default'
            : isShipping
            ? 'bg-sky-600 hover:bg-sky-700 text-white'
            : 'bg-[#284ea1] hover:bg-[#1e3b82] text-white'
        }`}
      >
        {isApplied ? 'Đang dùng' : 'Áp dụng'}
      </Button>
    </div>
  );
}
