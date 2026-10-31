import React from 'react';
import {
  ShieldCheckIcon,
  SpeedDeliveryIcon,
  EasyReturnIcon,
  Support247Icon,
} from '@/components/common/Icons';

export default function FlashSaleCommitments() {
  return (
    <div className="bg-white border-b border-slate-200 py-3 shadow-2xs">
      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-[6px] bg-red-50 text-red-600">
            <ShieldCheckIcon size={18} />
          </span>
          <div>
            <p className="font-bold text-slate-900">Cam kết chính hãng</p>
            <p className="text-[11px] text-slate-500">100% thương hiệu uy tín</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-[6px] bg-amber-50 text-amber-600">
            <SpeedDeliveryIcon size={18} />
          </span>
          <div>
            <p className="font-bold text-slate-900">Giao hàng hỏa tốc</p>
            <p className="text-[11px] text-slate-500">Nội thành trong 2 giờ</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-[6px] bg-blue-50 text-blue-600">
            <EasyReturnIcon size={18} />
          </span>
          <div>
            <p className="font-bold text-slate-900">Đổi trả dễ dàng</p>
            <p className="text-[11px] text-slate-500">Lỗi 1 đổi 1 tận nơi</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-[6px] bg-emerald-50 text-emerald-600">
            <Support247Icon size={18} />
          </span>
          <div>
            <p className="font-bold text-slate-900">Hỗ trợ 24/7</p>
            <p className="text-[11px] text-slate-500">Hotline: 099999998</p>
          </div>
        </div>
      </div>
    </div>
  );
}
