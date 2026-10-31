import React from 'react';

export default function FooterPaymentBadges() {
  return (
    <div className="mt-6 pt-2">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
        Phương thức thanh toán
      </h4>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Visa */}
        <div className="h-8 px-3 bg-white border border-slate-200 rounded-[6px] flex items-center justify-center select-none shadow-xs">
          <span className="font-black italic tracking-tighter text-[#1a1f71] text-xs">
            VISA
          </span>
        </div>

        {/* MasterCard */}
        <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-[6px] flex items-center justify-center gap-1.5 select-none shadow-xs">
          <div className="flex -space-x-1.5 items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#f79e1b]" />
          </div>
          <span className="text-[10px] font-bold text-slate-700">Mastercard</span>
        </div>

        {/* MoMo */}
        <div className="h-8 px-2 bg-white border border-slate-200 rounded-[6px] flex items-center justify-center select-none shadow-xs">
          <img
            src="/images/logo momo.png"
            alt="MoMo"
            className="h-5 w-auto object-contain rounded-[3px]"
            loading="lazy"
          />
        </div>

        {/* ZaloPay */}
        <div className="h-8 px-2 bg-white border border-slate-200 rounded-[6px] flex items-center justify-center select-none shadow-xs">
          <img
            src="/images/logo zalopay.png"
            alt="ZaloPay"
            className="h-5 w-auto object-contain rounded-[3px]"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
