'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CartAppliedVouchers({
  currentCouponCode,
  currentCouponDiscount,
  currentShippingCode,
  currentShippingDiscount,
  onRemove,
  formatPrice,
}) {
  if (!currentCouponCode && !currentShippingCode) return null;

  return (
    <div className="p-2.5 bg-slate-50 rounded-[6px] border border-slate-200 space-y-1.5">
      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
        Voucher đã chọn:
      </div>
      <div className="flex flex-wrap gap-2">
        {currentCouponCode && (
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[4px] text-xs">
            <span className="text-slate-600">Đơn:</span>
            <strong className="font-mono text-[#284ea1]">{currentCouponCode}</strong>
            {currentCouponDiscount > 0 && (
              <span className="text-emerald-700 font-mono font-semibold">(-{formatPrice(currentCouponDiscount)})</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove('order')}
              className="h-4 w-4 p-0 text-slate-400 hover:text-red-600 hover:bg-transparent"
              aria-label="Gỡ mã đơn hàng"
            >
              <X size={12} />
            </Button>
          </div>
        )}
        {currentShippingCode && (
          <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-[4px] text-xs">
            <span className="text-slate-600">Vận chuyển:</span>
            <strong className="font-mono text-sky-700">{currentShippingCode}</strong>
            {currentShippingDiscount > 0 && (
              <span className="text-sky-700 font-mono font-semibold">(-{formatPrice(currentShippingDiscount)})</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove('shipping')}
              className="h-4 w-4 p-0 text-slate-400 hover:text-red-600 hover:bg-transparent"
              aria-label="Gỡ mã vận chuyển"
            >
              <X size={12} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
