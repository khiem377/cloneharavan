'use client';

import React from 'react';
import { Truck, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CheckoutShippingSection({
  effectiveShippingFee = 0,
  shippingDiscount = 0,
  finalShippingFee = undefined,
  shippingFeeData = null,
  calculatingFee = false,
  loadingPreview = false,
  formatPrice,
}) {
  const actualFee = finalShippingFee !== undefined
    ? finalShippingFee
    : Math.max(0, effectiveShippingFee - shippingDiscount);

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-slate-100 flex items-center justify-center text-slate-800">
            <Truck size={15} />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Phương thức vận chuyển
          </h2>
        </div>
      </div>

      <div className="p-3.5 rounded-[6px] border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Giao hàng tiêu chuẩn
            </span>
            {shippingFeeData?.isEstimated && (
              <Badge variant="outline" className="text-[10px] py-0 border-amber-300 bg-amber-50 text-amber-800 font-medium">
                Cước ước tính
              </Badge>
            )}
            {shippingDiscount > 0 && (
              <Badge variant="outline" className="text-[10px] py-0 border-emerald-300 bg-emerald-50 text-emerald-800 font-medium">
                Đã áp mã Freeship
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-600">
            {calculatingFee || loadingPreview ? (
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Loader2 size={12} className="animate-spin text-[#e30019]" />
                Đang tính cước vận chuyển theo địa chỉ...
              </span>
            ) : effectiveShippingFee > 0 ? (
              <span>Thời gian giao dự kiến: 2 - 3 ngày làm việc</span>
            ) : (
              <span className="text-slate-500">
                Đang chờ địa chỉ để tính cước vận chuyển tự động...
              </span>
            )}
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0 flex items-center gap-1.5 flex-wrap sm:justify-end">
          {calculatingFee || loadingPreview ? (
            <span className="text-sm font-mono text-slate-500">Đang tính...</span>
          ) : shippingDiscount > 0 ? (
            <>
              <span className="text-xs line-through text-slate-400 font-mono tabular-nums">
                {formatPrice(effectiveShippingFee)}
              </span>
              <span className={`text-sm sm:text-base font-mono font-bold tabular-nums ${actualFee === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {actualFee === 0 ? '0 đ' : formatPrice(actualFee)}
              </span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-mono font-bold text-slate-900 tabular-nums">
              {effectiveShippingFee > 0 ? formatPrice(effectiveShippingFee) : '0 đ'}
            </span>
          )}
        </div>
      </div>

      {shippingFeeData?.isEstimated && (
        <div className="mt-3 p-2.5 rounded-[4px] bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Lưu ý cước phí:</strong> {shippingFeeData.message}
          </p>
        </div>
      )}
    </div>
  );
}
