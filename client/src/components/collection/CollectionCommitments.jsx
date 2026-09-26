import React from 'react';

// 1. 100% Chính Hãng - Huy hiệu Khiên bảo chứng Hoàng gia & Ngôi sao kim cương
function AuthenticShieldSvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="shieldGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E30019" />
          <stop offset="1" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="10" y1="8" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="0.5" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <filter id="shieldShadow" x="0" y="2" width="36" height="34" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#E30019" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Outer shield container */}
      <path
        d="M18 3L6 8.2V16.8C6 24.2 11.2 31.1 18 33C24.8 31.1 30 24.2 30 16.8V8.2L18 3Z"
        fill="url(#shieldGrad)"
        filter="url(#shieldShadow)"
      />
      {/* Inner facet contour */}
      <path
        d="M18 5.6L8.4 9.8V16.5C8.4 22.6 12.5 28.3 18 30.1C23.5 28.3 27.6 22.6 27.6 16.5V9.8L18 5.6Z"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
      {/* Central Certified Checkmark */}
      <path
        d="M13 17.5L16.2 20.8L23.2 13.5"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top 100% Star Accent */}
      <path
        d="M18 8.5L19.1 10.8L21.5 11.1L19.7 12.8L20.2 15.2L18 14L15.8 15.2L16.3 12.8L14.5 11.1L16.9 10.8L18 8.5Z"
        fill="url(#goldGrad)"
      />
    </svg>
  );
}

// 2. Giao Hàng 2H - Xe tốc hành khí động học & Huy hiệu 2H phát sáng
function ExpressDeliverySvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="deliveryGrad" x1="2" y1="8" x2="34" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E30019" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="badgeGrad" x1="16" y1="3" x2="33" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF416C" />
          <stop offset="1" stopColor="#E30019" />
        </linearGradient>
      </defs>
      {/* Speed motion lines behind vehicle */}
      <path d="M2.5 13H7M1 18H9M3 23H8" stroke="#E30019" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.45" />
      {/* Express Van Cabin & Body */}
      <path
        d="M9 12H21C22.1 12 23 12.9 23 14V22C23 22.6 22.6 23 22 23H9C8.4 23 8 22.6 8 22V13C8 12.4 8.4 12 9 12Z"
        fill="url(#deliveryGrad)"
      />
      <path
        d="M23 15H27.4C28 15 28.5 15.3 28.8 15.8L31.4 19.4C31.8 19.9 32 20.4 32 21V22C32 22.6 31.6 23 31 23H23V15Z"
        fill="url(#deliveryGrad)"
      />
      {/* Front Windshield Glass */}
      <path
        d="M24 16.5H26.8L29.5 20H24V16.5Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      {/* Wheels */}
      <circle cx="13" cy="24" r="3.2" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="27" cy="24" r="3.2" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="13" cy="24" r="1.2" fill="#E30019" />
      <circle cx="27" cy="24" r="1.2" fill="#E30019" />
      {/* Floating 2H Speed Pill Badge */}
      <rect x="15" y="3.5" width="18" height="11.5" rx="5.75" fill="url(#badgeGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
      <text x="24" y="12" fill="#FFFFFF" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        2H
      </text>
    </svg>
  );
}

// 3. Miễn Phí Lắp Đặt - Cờ lê bánh răng cơ khí chuẩn xác & Điểm sáng kỹ thuật
function ProInstallSvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="toolGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E30019" />
          <stop offset="1" stopColor="#BE123C" />
        </linearGradient>
        <linearGradient id="gearGrad" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1F5F9" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      {/* Background Precision Hex-Gear */}
      <path
        d="M18 7L21.5 9V13.5L25 15.5L28.5 13.5L30.5 17L27 19L27 23.5L30.5 25.5L28.5 29L25 27L21.5 29V33.5L18 35.5L14.5 33.5V29L11 27L7.5 29L5.5 25.5L9 23.5V19L5.5 17L7.5 13.5L11 15.5L14.5 13.5V9L18 7Z"
        fill="url(#gearGrad)"
        fillOpacity="0.4"
      />
      {/* Crossed Stylized Torque Tool & Screwdriver */}
      <path
        d="M8.5 27.5L20 16M20 16L24.5 11.5C25.3 10.7 26.7 10.7 27.5 11.5C28.3 12.3 28.3 13.7 27.5 14.5L23 19M20 16L23 19M8.5 27.5L6.5 25.5C5.8 24.8 5.8 23.7 6.5 23L12 17.5M8.5 27.5L10.5 29.5C11.2 30.2 12.3 30.2 13 29.5L18.5 24"
        stroke="url(#toolGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Screwdriver Shaft & Tip */}
      <path
        d="M27 9L29 7M11 25L9 27M13 23L15 25"
        stroke="#E30019"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Central Star Sparkle of Quality */}
      <circle cx="20" cy="16" r="2.5" fill="#E30019" stroke="#FFFFFF" strokeWidth="1" />
      <path d="M29 11L30 8L33 9L30 11L29 14L28 11L25 10L28 9L29 11Z" fill="#F59E0B" />
    </svg>
  );
}

// 4. Lỗi 1 Đổi 1 7 Ngày - Vòng quỹ đạo đối xứng & Khối 1:1 độc quyền
function Exchange7DaysSvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="exchangeGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E30019" />
          <stop offset="1" stopColor="#C026D3" />
        </linearGradient>
        <linearGradient id="circleGrad" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF2F2" />
          <stop offset="1" stopColor="#FEE2E2" />
        </linearGradient>
      </defs>
      {/* Circular Soft Glow Base */}
      <circle cx="18" cy="18" r="14" fill="url(#circleGrad)" stroke="#FECDD3" strokeWidth="1" />
      {/* Dynamic Reciprocal Orbital Arrows */}
      <path
        d="M18 5C24.6 5 30 10.4 30 17C30 18.2 29.8 19.3 29.5 20.4"
        stroke="url(#exchangeGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M26.5 13L30.5 17L34.5 13" fill="none" stroke="url(#exchangeGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

      <path
        d="M18 31C11.4 31 6 25.6 6 19C6 17.8 6.2 16.7 6.5 15.6"
        stroke="url(#exchangeGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M9.5 23L5.5 19L1.5 23" fill="none" stroke="url(#exchangeGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Central 1:1 Badge */}
      <rect x="10.5" y="11.5" width="15" height="13" rx="4" fill="url(#exchangeGrad)" />
      <text x="18" y="20.8" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        1:1
      </text>
    </svg>
  );
}

// 5. Trả Góp 0% Lãi Suất - Thẻ chip điện tử thông minh & Huy hiệu 0% nổi
function ZeroInstallmentSvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="cardGrad" x1="4" y1="10" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E293B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="zeroGrad" x1="16" y1="4" x2="34" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E30019" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      {/* Sleek Credit / Smart Card */}
      <rect x="3" y="10" width="26" height="18" rx="3.5" fill="url(#cardGrad)" stroke="#334155" strokeWidth="1" />
      {/* Magnetic Stripe / Card Header */}
      <rect x="3" y="14" width="26" height="3.5" fill="#475569" />
      {/* EMV Gold Smart Chip */}
      <rect x="6.5" y="19.5" width="4.5" height="3.5" rx="0.8" fill="#F59E0B" />
      {/* Contactless Waves */}
      <path d="M13.5 20C14.5 20.8 14.5 22.2 13.5 23" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <path d="M15.5 19C17 20.5 17 22.5 15.5 24" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      {/* Dynamic Floating 0% Badge */}
      <circle cx="26" cy="11" r="8" fill="url(#zeroGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
      <text x="26" y="14" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        0%
      </text>
    </svg>
  );
}

// 6. Hỗ Trợ 24/7 - Tai nghe chuyên viên âm thanh nổi & Biểu tượng 24/7
function Support247Svg() {
  return (
    <svg width="38" height="38" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="headsetGrad" x1="4" y1="6" x2="32" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E30019" />
          <stop offset="1" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="supportTagGrad" x1="10" y1="18" x2="26" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      {/* Headband Arc */}
      <path
        d="M6 19C6 11.8 11.4 6 18 6C24.6 6 30 11.8 30 19"
        stroke="url(#headsetGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Ear cushions */}
      <rect x="4" y="16.5" width="4.5" height="9" rx="2.2" fill="url(#headsetGrad)" />
      <rect x="27.5" y="16.5" width="4.5" height="9" rx="2.2" fill="url(#headsetGrad)" />
      {/* Microphone Boom */}
      <path
        d="M8 23C8 28.5 12.5 32 17 32H18"
        stroke="url(#headsetGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="32" r="2" fill="#E30019" stroke="#FFFFFF" strokeWidth="1" />
      {/* Central 24/7 Badge */}
      <rect x="11" y="14" width="14" height="10" rx="3.5" fill="url(#supportTagGrad)" stroke="#FFFFFF" strokeWidth="1" />
      <text x="18" y="21.2" fill="#FFFFFF" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
        24/7
      </text>
    </svg>
  );
}

const COMMITMENTS = [
  {
    IconComponent: AuthenticShieldSvg,
    title: '100% Chính hãng',
    desc: 'Cam kết xuất xứ rõ ràng',
  },
  {
    IconComponent: ExpressDeliverySvg,
    title: 'Giao hàng 2H',
    desc: 'Nhanh chóng nội thành',
  },
  {
    IconComponent: ProInstallSvg,
    title: 'Miễn phí lắp đặt',
    desc: 'Kỹ thuật viên tận tình',
  },
  {
    IconComponent: Exchange7DaysSvg,
    title: 'Lỗi 1 đổi 1 7 ngày',
    desc: 'An tâm trải nghiệm',
  },
  {
    IconComponent: ZeroInstallmentSvg,
    title: 'Trả góp 0% lãi suất',
    desc: 'Duyệt nhanh qua thẻ',
  },
  {
    IconComponent: Support247Svg,
    title: 'Hỗ trợ 24/7',
    desc: 'Tư vấn nhiệt tình',
  },
];

export default function CollectionCommitments() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {COMMITMENTS.map((item, idx) => {
          const SvgIcon = item.IconComponent;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50/70 hover:bg-white hover:shadow-md border border-slate-100 hover:border-red-100 transition-all duration-200 group cursor-default"
            >
              <div className="transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5">
                <SvgIcon />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug group-hover:text-[#e30019] transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
