import React from 'react';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                  BESPOKE SVG ICON SYSTEM — CLIENT SHOP                      ║
 * ║  Handcrafted Dual-Tone Vector Icons with High-Precision Geometry & Depth   ║
 * ║  Designed for Modern E-Commerce, Tech Retail & Admin Platforms               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const SvgBase = ({
  children,
  size = 20,
  className = '',
  style,
  strokeWidth = 1.75,
  viewBox = '0 0 24 24',
  ...rest
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={viewBox}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block shrink-0 transition-colors ${className}`}
    style={style}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. NAVIGATION & STORE BRANDING
// ─────────────────────────────────────────────────────────────────────────────

/** Store / Shop front with curved canopy and glass window */
export const StoreFrontIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M3 9l1.5-6h15L21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="none"
    />
    <path d="M3 9l1.5-6h15L21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <path d="M3 9c0 1.66 1.34 3 3 3s3-1.34 3-3c0 1.66 1.34 3 3 3s3-1.34 3-3c0 1.66 1.34 3 3 3s3-1.34 3-3" />
    <path d="M9 22V15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
    <line x1="10" y1="6" x2="14" y2="6" strokeWidth="1.5" />
  </SvgBase>
);

/** Flash Sale — Multi-faceted Lightning Bolt with energy aura */
export const FlashSaleIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M13 2L3.5 13.5h7L9.5 22 20.5 10.5h-7L13 2z"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="none"
    />
    <path
      d="M13 2L3.5 13.5h7L9.5 22 20.5 10.5h-7L13 2z"
      strokeLinejoin="round"
    />
    {/* Dynamic energy glint */}
    <path d="M11 5.5l-4 5.5h4" strokeWidth="1.2" strokeOpacity="0.7" />
  </SvgBase>
);

/** Hot Flame Deal — 3-layer stylized fire ember */
export const FlameIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="none"
    />
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    <path
      d="M12 18c1.5 0 2.5-1 2.5-2.5 0-1.2-1-2-1.5-3-.5 1-1 1.5-1 2.5 0 .5.3 1.5.5 2z"
      fill="currentColor"
      stroke="none"
    />
  </SvgBase>
);

/** Trả góp 0% — Smart Credit Card with Chip & 0% Badge */
export const InstallmentIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="3"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="none"
    />
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M2 10h20" strokeWidth="1.5" />
    {/* Chip EMV */}
    <rect x="5" y="13" width="3.5" height="3" rx="0.75" fill="currentColor" stroke="none" />
    {/* 0% Symbol on right */}
    <circle cx="14.5" cy="13.5" r="1.2" strokeWidth="1.2" />
    <circle cx="17.5" cy="15.5" r="1.2" strokeWidth="1.2" />
    <line x1="18" y1="12.5" x2="14" y2="16.5" strokeWidth="1.2" />
  </SvgBase>
);

/** Đặt lịch sửa chữa / Bảo hành — Precision Wrench & Calendar */
export const RepairIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="none"
    />
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    <circle cx="5.5" cy="18.5" r="1" fill="currentColor" stroke="none" />
  </SvgBase>
);

/** Editorial Blog / Tin công nghệ — Modern Tabloid Magazine */
export const NewsIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M4 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2z"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="none"
    />
    <path d="M4 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2z" />
    {/* Article image thumbnail */}
    <rect x="6" y="8" width="5" height="4" rx="1" fill="currentColor" fillOpacity="0.25" stroke="none" />
    <line x1="13" y1="8" x2="16" y2="8" strokeWidth="1.8" />
    <line x1="13" y1="11" x2="16" y2="11" strokeWidth="1.5" />
    <line x1="6" y1="15" x2="16" y2="15" strokeWidth="1.5" />
  </SvgBase>
);

/** Hệ thống cửa hàng / Map Pin — Geolocation Pin with Store Building */
export const StoreLocationIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M12 2a8 8 0 0 0-8 8c0 5.25 7 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="none"
    />
    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 7 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
    {/* Inner Store silhouette */}
    <circle cx="12" cy="10" r="3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r="1.2" fill="#ffffff" stroke="none" />
  </SvgBase>
);

/** Shopping Cart with items indicator */
export const CartIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="none"
    />
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
    <line x1="3" y1="6" x2="21" y2="6" strokeWidth="1.5" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </SvgBase>
);

/** User Account Profile Avatar */
export const UserIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.18" stroke="none" />
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="none"
    />
    <circle cx="12" cy="7" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </SvgBase>
);

/** Search Magnifier with Optical Lens Glint */
export const SearchIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <circle cx="11" cy="11" r="8" fill="currentColor" fillOpacity="0.12" stroke="none" />
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2.2" />
    {/* Curved lens glint */}
    <path d="M8 8a4.5 4.5 0 0 1 5 0" strokeWidth="1.2" strokeOpacity="0.6" />
  </SvgBase>
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. COMMITMENT & VALUE PROPOSITIONS (EGA / CELLPHONES STANDARD)
// ─────────────────────────────────────────────────────────────────────────────

/** Cam kết 100% Chính Hãng — Shield with Verified Embossed Checkmark */
export const ShieldCheckIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="none"
    />
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    {/* Inner dual-layer checkmark */}
    <polyline
      points="9 12 11.5 14.5 15.5 9.5"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgBase>
);

/** Giao hàng hỏa tốc — High-speed Express Delivery Van with Dynamic Aerodynamic Streaks */
export const SpeedDeliveryIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    {/* Cargo Cab & Body */}
    <path
      d="M1 4h13v11H1z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="none"
    />
    <rect x="1" y="4" width="13" height="11" rx="2" />
    <path
      d="M14 8h4.5l3.5 3.5V15h-8V8z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="none"
    />
    <path d="M14 8h4.5l3.5 3.5V15h-8V8z" />
    {/* Wheels with Hubcaps */}
    <circle cx="5.5" cy="18.5" r="2.5" fill="currentColor" />
    <circle cx="5.5" cy="18.5" r="1" fill="#ffffff" stroke="none" />
    <circle cx="17.5" cy="18.5" r="2.5" fill="currentColor" />
    <circle cx="17.5" cy="18.5" r="1" fill="#ffffff" stroke="none" />
    {/* Fast Speed Lines */}
    <line x1="2" y1="8" x2="6" y2="8" strokeWidth="1.4" strokeOpacity="0.7" />
    <line x1="1" y1="11" x2="4" y2="11" strokeWidth="1.4" strokeOpacity="0.7" />
  </SvgBase>
);

/** Đổi trả dễ dàng 30 ngày — Reversible Sync Dual Arc */
export const EasyReturnIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L2 9"
      strokeWidth="1.9"
    />
    <polyline points="2 3 2 9 8 9" strokeWidth="1.9" />
    <path
      d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L22 15"
      strokeWidth="1.9"
    />
    <polyline points="22 21 22 15 16 15" strokeWidth="1.9" />
    {/* Center 30D / Refresh Badge */}
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </SvgBase>
);

/** Hỗ trợ kỹ thuật 24/7 — Audio Headset with Soundwave Indicator */
export const Support247Icon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path d="M3 14v-3a9 9 0 0 1 18 0v3" strokeWidth="1.8" />
    {/* Ear cushions */}
    <rect
      x="2"
      y="13"
      width="4"
      height="7"
      rx="2"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <rect
      x="18"
      y="13"
      width="4"
      height="7"
      rx="2"
      fill="currentColor"
      fillOpacity="0.25"
    />
    {/* Mic Boom */}
    <path d="M20 18v1a3 3 0 0 1-3 3h-3" strokeWidth="1.6" />
    <circle cx="13" cy="22" r="1.5" fill="currentColor" stroke="none" />
  </SvgBase>
);

/** Live Stream / Video Podcast Live Broadcast Pulse */
export const LiveStreamIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    <path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4" strokeWidth="1.8" />
    <path
      d="M3.5 3.5a12 12 0 0 0 0 17M20.5 3.5a12 12 0 0 1 0 17"
      strokeWidth="1.6"
      strokeOpacity="0.5"
    />
  </SvgBase>
);

/** Voucher / Discount Coupon with Scalloped Edge */
export const VoucherIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M2 9a3 3 0 0 1 0-6h20a3 3 0 0 1 0 6 3 3 0 0 0 0 6 3 3 0 0 1 0 6H2a3 3 0 0 1 0-6 3 3 0 0 0 0-6z"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="none"
    />
    <path d="M2 9a3 3 0 0 1 0-6h20a3 3 0 0 1 0 6 3 3 0 0 0 0 6 3 3 0 0 1 0 6H2a3 3 0 0 1 0-6 3 3 0 0 0 0-6z" />
    <line x1="9" y1="3" x2="9" y2="21" strokeDasharray="2 3" strokeWidth="1.5" />
    <circle cx="15.5" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
  </SvgBase>
);

/** Gift Box with 3D Ribbon Bow */
export const GiftIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <rect
      x="3"
      y="8"
      width="18"
      height="13"
      rx="2"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="none"
    />
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M12 8v13" strokeWidth="1.8" />
    <path d="M3 12h18" strokeWidth="1.5" />
    {/* Ribbon Bow */}
    <path d="M12 8C10.5 4 6.5 4 6.5 6.5S10 8 12 8z" fill="currentColor" fillOpacity="0.3" />
    <path d="M12 8C13.5 4 17.5 4 17.5 6.5S14 8 12 8z" fill="currentColor" fillOpacity="0.3" />
  </SvgBase>
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. UI CONTROLS, ACCENTS & STATUS
// ─────────────────────────────────────────────────────────────────────────────

export const HeartIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </SvgBase>
);

export const HeartFillIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill="currentColor"
    />
  </SvgBase>
);

export const CompareIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeWidth="1.8" />
  </SvgBase>
);

export const CheckCircleIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.16" stroke="none" />
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11.5 14.5 15.5 9" strokeWidth="2.2" />
  </SvgBase>
);

export const ClockIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" stroke="none" />
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 15.5 14" strokeWidth="1.9" />
  </SvgBase>
);

export const LockIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2.5"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="none"
    />
    <rect x="3" y="11" width="18" height="11" rx="2.5" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="1.8" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
  </SvgBase>
);

export const KeyIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <circle cx="7.5" cy="15.5" r="5.5" fill="currentColor" fillOpacity="0.18" stroke="none" />
    <circle cx="7.5" cy="15.5" r="5.5" />
    <circle cx="7.5" cy="15.5" r="2" fill="#ffffff" stroke="none" />
    <path d="M11.5 11.5L21 2M17 6l2 2M14.5 8.5l2 2" strokeWidth="1.9" />
  </SvgBase>
);

export const SparklesIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="none"
    />
    <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z" />
    <path d="M19 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" stroke="none" />
  </SvgBase>
);

export const ChevronDownIcon = ({ size = 18, className = '', ...p }) => (
  <SvgBase size={size} className={className} strokeWidth={2} {...p}>
    <polyline points="6 9 12 15 18 9" />
  </SvgBase>
);

export const ChevronRightIcon = ({ size = 18, className = '', ...p }) => (
  <SvgBase size={size} className={className} strokeWidth={2} {...p}>
    <polyline points="9 18 15 12 9 6" />
  </SvgBase>
);

export const ChevronLeftIcon = ({ size = 18, className = '', ...p }) => (
  <SvgBase size={size} className={className} strokeWidth={2} {...p}>
    <polyline points="15 18 9 12 15 6" />
  </SvgBase>
);

export const XIcon = ({ size = 18, className = '', ...p }) => (
  <SvgBase size={size} className={className} strokeWidth={2} {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </SvgBase>
);

export const FilterIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="currentColor" fillOpacity="0.12" stroke="none" />
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </SvgBase>
);

export const ArrowRightIcon = ({ size = 18, className = '', ...p }) => (
  <SvgBase size={size} className={className} strokeWidth={2} {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </SvgBase>
);

export const PhoneIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="none"
    />
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </SvgBase>
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. TECH DEVICES & SMART HOME CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

export const SmartphoneIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <rect x="5" y="2" width="14" height="20" rx="3" fill="currentColor" fillOpacity="0.12" stroke="none" />
    <rect x="5" y="2" width="14" height="20" rx="3" />
    {/* Screen Notch / Dynamic Island */}
    <rect x="9.5" y="4" width="5" height="1.5" rx="0.75" fill="currentColor" stroke="none" />
    <line x1="11" y1="18" x2="13" y2="18" strokeWidth="2" strokeLinecap="round" />
  </SvgBase>
);

export const LaptopIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.12" stroke="none" />
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M1 19h22a1 1 0 0 0 1-1v-1H0v1a1 1 0 0 0 1 1z" />
    <line x1="9" y1="17" x2="15" y2="17" strokeWidth="1.5" />
  </SvgBase>
);

export const SmartwatchIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <rect x="6" y="5" width="12" height="14" rx="4" fill="currentColor" fillOpacity="0.12" stroke="none" />
    <rect x="6" y="5" width="12" height="14" rx="4" />
    <path d="M9 5V2h6v3M9 19v3h6v-3" strokeWidth="1.8" />
    {/* Crown button */}
    <path d="M18 10v4" strokeWidth="2" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="none" />
  </SvgBase>
);

export const RobotVacuumIcon = ({ size = 20, className = '', ...p }) => (
  <SvgBase size={size} className={className} {...p}>
    <circle cx="12" cy="12" r="9.5" fill="currentColor" fillOpacity="0.12" stroke="none" />
    <circle cx="12" cy="12" r="9.5" />
    {/* LiDAR Turret on top */}
    <circle cx="12" cy="8.5" r="3" fill="currentColor" fillOpacity="0.25" stroke="none" />
    <circle cx="12" cy="8.5" r="3" />
    <circle cx="12" cy="8.5" r="1" fill="#ffffff" stroke="none" />
    {/* Bumper line */}
    <path d="M3.5 14h17" strokeWidth="1.5" />
  </SvgBase>
);
