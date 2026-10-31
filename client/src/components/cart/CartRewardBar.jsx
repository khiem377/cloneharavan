'use client';

import React from 'react';
import { Gift, Truck, Tag, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function CartRewardBar({ subtotal = 0 }) {
  const FREESHIP_THRESHOLD = 500000;
  const VOUCHER_THRESHOLD = 1500000;
  const GIFT_THRESHOLD = 3000000;

  const current = Number(subtotal) || 0;
  const progress = Math.min(100, (current / GIFT_THRESHOLD) * 100);

  const formatShortPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);

  let statusMsg = '';
  if (current < FREESHIP_THRESHOLD) {
    statusMsg = `Mua thêm ${formatShortPrice(FREESHIP_THRESHOLD - current)} để được FREESHIP toàn quốc`;
  } else if (current < VOUCHER_THRESHOLD) {
    statusMsg = `Mua thêm ${formatShortPrice(VOUCHER_THRESHOLD - current)} để nhận Voucher giảm 100.000₫`;
  } else if (current < GIFT_THRESHOLD) {
    statusMsg = `Mua thêm ${formatShortPrice(GIFT_THRESHOLD - current)} để nhận Quà tặng cao cấp 0₫`;
  } else {
    statusMsg = 'Chúc mừng! Bạn đã mở khóa toàn bộ đặc quyền cao cấp nhất!';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-3.5 sm:p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 px-2 py-0.5 rounded-[4px] bg-red-50 text-red-600 font-bold border border-red-200 text-xs">
            <Sparkles size={12} />
            <span>Ưu đãi tiến trình đơn hàng</span>
          </Badge>
        </div>
        <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
          {statusMsg}
        </span>
      </div>

      <div className="my-2.5">
        <Progress value={progress} max={100} className="h-2 bg-slate-100" />
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center pt-1">
        <div
          className={`p-1.5 rounded-[4px] border transition-colors flex items-center justify-center gap-1.5 ${
            current >= FREESHIP_THRESHOLD
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
              : 'bg-slate-50/60 border-slate-200 text-slate-500'
          }`}
        >
          <Truck size={13} className={current >= FREESHIP_THRESHOLD ? 'text-emerald-600' : 'text-slate-400'} />
          <span>Freeship 500k</span>
        </div>

        <div
          className={`p-1.5 rounded-[4px] border transition-colors flex items-center justify-center gap-1.5 ${
            current >= VOUCHER_THRESHOLD
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
              : 'bg-slate-50/60 border-slate-200 text-slate-500'
          }`}
        >
          <Tag size={13} className={current >= VOUCHER_THRESHOLD ? 'text-emerald-600' : 'text-slate-400'} />
          <span>Voucher 100k</span>
        </div>

        <div
          className={`p-1.5 rounded-[4px] border transition-colors flex items-center justify-center gap-1.5 ${
            current >= GIFT_THRESHOLD
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
              : 'bg-slate-50/60 border-slate-200 text-slate-500'
          }`}
        >
          <Gift size={13} className={current >= GIFT_THRESHOLD ? 'text-emerald-600' : 'text-slate-400'} />
          <span>Quà tặng 0₫</span>
        </div>
      </div>
    </div>
  );
}
