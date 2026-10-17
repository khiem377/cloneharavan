import React from 'react';
import vnpayImg from '@/assets/payments/vnpay.png';
import momoImg from '@/assets/payments/momo.png';
import zalopayImg from '@/assets/payments/zalopay.png';

export const VnpayLogo = ({ className = 'h-7' }) => (
  <img
    src={vnpayImg}
    alt="VNPAY-QR"
    className={`${className} object-contain object-left`}
    loading="lazy"
  />
);

export const MomoLogo = ({ className = 'h-8' }) => (
  <img
    src={momoImg}
    alt="MoMo"
    className={`${className} object-contain object-left`}
    loading="lazy"
  />
);

export const ZalopayLogo = ({ className = 'h-7' }) => (
  <img
    src={zalopayImg}
    alt="ZaloPay"
    className={`${className} object-contain object-left`}
    loading="lazy"
  />
);

export const CodLogo = ({ className = 'h-7' }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <div className="w-7 h-7 rounded-[4px] bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold text-xs">
      COD
    </div>
    <span className="text-[12.5px] font-semibold text-slate-800 dark:text-foreground">
      Tiền mặt (COD)
    </span>
  </div>
);

export const PaymentMethodLogo = ({ code, className = 'h-7' }) => {
  switch (code) {
    case 'vnpay':
      return <VnpayLogo className={className} />;
    case 'momo':
      return <MomoLogo className={className} />;
    case 'zalopay':
      return <ZalopayLogo className={className} />;
    case 'cod':
      return <CodLogo className={className} />;
    default:
      return (
        <div className="w-8 h-8 rounded-[4px] bg-slate-100 dark:bg-muted border border-border flex items-center justify-center font-bold text-xs uppercase">
          {code?.slice(0, 3) || 'PAY'}
        </div>
      );
  }
};
