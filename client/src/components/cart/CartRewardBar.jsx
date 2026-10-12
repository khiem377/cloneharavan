'use client';

import React from 'react';

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
    <div className="bg-blue-50/50 border border-blue-200 rounded-[6px] p-3.5 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#284ea1]" />
          <span className="text-xs sm:text-sm font-bold text-[#284ea1]">
            Ưu đãi đơn hàng
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
          {statusMsg}
        </span>
      </div>

      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[#284ea1] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-1 text-[11px] text-center">
        <div className={`p-1 rounded-[4px] ${current >= FREESHIP_THRESHOLD ? 'text-[#284ea1] font-bold' : 'text-slate-500'}`}>
          <div className="font-semibold">Mốc 500k</div>
          <span className="text-[10px]">Freeship</span>
        </div>

        <div className={`p-1 rounded-[4px] ${current >= VOUCHER_THRESHOLD ? 'text-[#284ea1] font-bold' : 'text-slate-500'}`}>
          <div className="font-semibold">Mốc 1.5M</div>
          <span className="text-[10px]">Voucher 100k</span>
        </div>

        <div className={`p-1 rounded-[4px] ${current >= GIFT_THRESHOLD ? 'text-[#284ea1] font-bold' : 'text-slate-500'}`}>
          <div className="font-semibold">Mốc 3.0M</div>
          <span className="text-[10px]">Quà tặng 0₫</span>
        </div>
      </div>
    </div>
  );
}
