import React from 'react';
import greenSmImg from '@/assets/carriers/green_sm.png';
import vnpostImg from '@/assets/carriers/vnpost.png';
import spxImg from '@/assets/carriers/spx.png';
import ghnImg from '@/assets/carriers/ghn.png';
import ghtkImg from '@/assets/carriers/ghtk.png';
import grabExpressImg from '@/assets/carriers/grab_express.png';
import viettelpostImg from '@/assets/carriers/viettelpost.png';
import ahamoveImg from '@/assets/carriers/ahamove.png';
import jtExpressImg from '@/assets/carriers/jt_express.png';


export const GreenSMLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Green SM / Xanh SM Official styling */}
    <path d="M12 28L24 14L36 28L28 36L24 24L20 36L12 28Z" fill="#00B090" />
    <path d="M24 14L28 20L24 24L20 20L24 14Z" fill="#00D2A6" />
    <text x="45" y="27" fill="#00B090" fontFamily="sans-serif" fontWeight="800" fontSize="16" letterSpacing="0.5">
      GREEN SM
    </text>
    <text x="45" y="38" fill="#637381" fontFamily="sans-serif" fontWeight="500" fontSize="8">
      XANH SM EXPRESS
    </text>
  </svg>
);

export const VietnamPostLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* VNPost Golden Wing Envelope */}
    <path d="M8 28C14 18 24 14 36 15C32 20 26 25 18 29L8 28Z" fill="#FDB813" />
    <path d="M18 29C28 21 38 18 48 20C42 25 34 31 22 34L18 29Z" fill="#E5A100" />
    <text x="54" y="24" fill="#004B87" fontFamily="sans-serif" fontWeight="800" fontSize="13">
      VIETNAM POST
    </text>
    <text x="54" y="36" fill="#D32F2F" fontFamily="sans-serif" fontWeight="700" fontSize="9" letterSpacing="1">
      EMS VIETNAM
    </text>
  </svg>
);

export const BestExpressLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <text x="6" y="27" fill="#E3001B" fontFamily="sans-serif" fontWeight="900" fontSize="19" fontStyle="italic">
      BEST
    </text>
    <rect x="6" y="32" width="60" height="2" fill="#E3001B" />
    <text x="6" y="42" fill="#E3001B" fontFamily="sans-serif" fontWeight="700" fontSize="9" letterSpacing="2">
      EXPRESS
    </text>
    <circle cx="80" cy="24" r="14" fill="#E3001B" opacity="0.1" />
    <path d="M75 24L83 18V30L75 24Z" fill="#E3001B" />
  </svg>
);

export const SPXExpressLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="10" width="38" height="28" rx="4" fill="#EE4D2D" />
    <text x="10" y="30" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="16">
      SPX
    </text>
    <text x="48" y="26" fill="#EE4D2D" fontFamily="sans-serif" fontWeight="800" fontSize="14">
      SPX Express
    </text>
    <text x="48" y="37" fill="#637381" fontFamily="sans-serif" fontWeight="500" fontSize="9">
      Shopee Xpress
    </text>
  </svg>
);

export const GHNLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="24" r="14" fill="#F26522" />
    <path d="M12 24L17 29L26 19" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <text x="38" y="27" fill="#002E6E" fontFamily="sans-serif" fontWeight="800" fontSize="13">
      GiaoHangNhanh
    </text>
    <text x="38" y="37" fill="#F26522" fontFamily="sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.5">
      GIAO NHANH 2H
    </text>
  </svg>
);

export const GHTKLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="12" width="28" height="24" rx="4" fill="#008848" />
    <path d="M10 24H26M18 16V32" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <text x="38" y="28" fill="#008848" fontFamily="sans-serif" fontWeight="800" fontSize="15">
      GHTK
    </text>
    <text x="38" y="38" fill="#637381" fontFamily="sans-serif" fontWeight="500" fontSize="8">
      Giao Hàng Tiết Kiệm
    </text>
  </svg>
);

export const GrabExpressLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <text x="4" y="26" fill="#00B14F" fontFamily="sans-serif" fontWeight="800" fontSize="17">
      Grab
    </text>
    <text x="4" y="38" fill="#00B14F" fontFamily="sans-serif" fontWeight="700" fontSize="10" letterSpacing="1">
      Express
    </text>
    <circle cx="68" cy="24" r="8" fill="#00B14F" opacity="0.15" />
    <path d="M65 24L71 20V28L65 24Z" fill="#00B14F" />
  </svg>
);

export const ViettelPostLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="24" r="14" fill="#EE0033" />
    <path d="M12 24C12 20 24 20 24 24C24 28 12 28 12 24Z" stroke="#FFFFFF" strokeWidth="2" />
    <text x="38" y="25" fill="#EE0033" fontFamily="sans-serif" fontWeight="800" fontSize="14">
      ViettelPost
    </text>
    <text x="38" y="36" fill="#637381" fontFamily="sans-serif" fontWeight="500" fontSize="8">
      VƯỢT TRỘI PHÁT NHANH
    </text>
  </svg>
);

export const AhamoveLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="12" width="26" height="24" rx="4" fill="#FF5722" />
    <path d="M12 28L17 18L22 28M14 25H20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="36" y="28" fill="#FF5722" fontFamily="sans-serif" fontWeight="800" fontSize="16">
      Ahamove
    </text>
    <text x="36" y="38" fill="#637381" fontFamily="sans-serif" fontWeight="500" fontSize="8">
      GIAO HÀNG TỨC THÌ
    </text>
  </svg>
);

export const JTExpressLogo = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <text x="4" y="28" fill="#FF0000" fontFamily="sans-serif" fontWeight="900" fontSize="18">
      J&amp;T
    </text>
    <text x="40" y="28" fill="#FF0000" fontFamily="sans-serif" fontWeight="700" fontSize="12" letterSpacing="1">
      EXPRESS
    </text>
    <rect x="4" y="33" width="90" height="2" fill="#FF0000" />
  </svg>
);

export const CARRIER_IMAGES = {
  green_sm: greenSmImg || '/images/carriers/green_sm.png',
  vnpost: vnpostImg || '/images/carriers/vnpost.png',
  spx: spxImg || '/images/carriers/spx.png',
  ghn: ghnImg || '/images/carriers/ghn.png',
  ghtk: ghtkImg || '/images/carriers/ghtk.png',
  best_express: null,
  grab_express: grabExpressImg || '/images/carriers/grab_express.png',
  viettelpost: viettelpostImg || '/images/carriers/viettelpost.png',
  ahamove: ahamoveImg || '/images/carriers/ahamove.png',
  jt_express: jtExpressImg || '/images/carriers/jt_express.png',
};

// Định nghĩa CSS riêng biệt cho từng logo hãng vận chuyển để căn chỉnh kích thước & khoảng thở hài hòa, tránh cảm giác bị cắt/bóp nghẹt
export const CARRIER_CUSTOM_CLASSES = {
  ghn: 'h-[25px] max-w-[110px] px-1.5 py-0.5 object-contain object-left',
  viettelpost: 'h-[27px] max-w-[125px] px-1 py-0.5 object-contain object-left',
  grab_express: 'h-[36px] max-w-[125px] object-contain object-left',
  ahamove: 'h-[34px] max-w-[120px] object-contain object-left',
  green_sm: 'h-[34px] max-w-[120px] object-contain object-left',
  spx: 'h-[26px] max-w-[110px] object-contain object-left',
  ghtk: 'h-[27px] max-w-[125px] object-contain object-left',
  vnpost: 'h-[28px] max-w-[120px] object-contain object-left',
  jt_express: 'h-[25px] max-w-[120px] object-contain object-left',
  best_express: 'h-[26px] max-w-[120px] object-contain object-left',
};

export function CarrierLogo({ code, className = 'h-7 w-auto max-w-[130px]' }) {
  const [imgError, setImgError] = React.useState(false);
  const imageUrl = CARRIER_IMAGES[code];
  const customClass = CARRIER_CUSTOM_CLASSES[code];

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={code}
        onError={() => setImgError(true)}
        className={`${customClass || className} shrink-0`}
        loading="lazy"
      />
    );
  }

  // Fallback SVG vector chuẩn nếu CDN bên ngoài gặp sự cố mạng
  switch (code) {
    case 'green_sm':
      return <GreenSMLogo className={className} />;
    case 'vnpost':
      return <VietnamPostLogo className={className} />;
    case 'best_express':
      return <BestExpressLogo className={className} />;
    case 'spx':
      return <SPXExpressLogo className={className} />;
    case 'ghn':
      return <GHNLogo className={className} />;
    case 'ghtk':
      return <GHTKLogo className={className} />;
    case 'grab_express':
      return <GrabExpressLogo className={className} />;
    case 'viettelpost':
      return <ViettelPostLogo className={className} />;
    case 'ahamove':
      return <AhamoveLogo className={className} />;
    case 'jt_express':
      return <JTExpressLogo className={className} />;
    default:
      return <span className="font-bold text-[13px] text-[#212b36]">{code}</span>;
  }
}
