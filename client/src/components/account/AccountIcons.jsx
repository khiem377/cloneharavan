import React from 'react';

export const NavOverviewIcon = ({ size = 16, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" className={active ? 'fill-[#e30019]/20 stroke-[#e30019]' : 'fill-slate-100/70 stroke-slate-500'} strokeWidth="1.65" />
    <rect x="13.5" y="3" width="7.5" height="4.5" rx="1.5" className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'} strokeWidth="1.65" />
    <rect x="13.5" y="10.5" width="7.5" height="10.5" rx="2" className={active ? 'fill-[#e30019]/25 stroke-[#e30019]' : 'fill-slate-100/70 stroke-slate-500'} strokeWidth="1.65" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'} strokeWidth="1.65" />
    <circle cx="6.75" cy="6.75" r="1.2" className={active ? 'fill-[#e30019]' : 'fill-slate-400'} />
  </svg>
);

export const NavOrdersIcon = ({ size = 16, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path d="M5 8.5L7 3.5h10l2 5" className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="3.5" y="8" width="17" height="13" rx="2.5" className={active ? 'fill-[#e30019]/20 stroke-[#e30019]' : 'fill-slate-100/70 stroke-slate-500'} strokeWidth="1.65" />
    <path d="M9 11.5a3 3 0 0 0 6 0" className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'} strokeWidth="1.65" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" className={active ? 'fill-[#e30019]' : 'fill-slate-400'} />
  </svg>
);

export const NavAddressIcon = ({ size = 16, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path d="M12 21.5s7-6.2 7-11.5a7 7 0 1 0-14 0c0 5.3 7 11.5 7 11.5z" className={active ? 'fill-[#e30019]/20 stroke-[#e30019]' : 'fill-slate-100/70 stroke-slate-500'} strokeWidth="1.65" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.6" className={active ? 'fill-[#e30019]' : 'fill-slate-400'} />
    <circle cx="12" cy="10" r="1" fill="#fff" />
  </svg>
);

export const NavWarrantyIcon = ({ size = 16, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path d="M12 2.5L20 6.2v5.6c0 5.1-3.4 9.6-8 10.7-4.6-1.1-8-5.6-8-10.7V6.2L12 2.5z" className={active ? 'fill-[#e30019]/20 stroke-[#e30019]' : 'fill-slate-100/70 stroke-slate-500'} strokeWidth="1.65" strokeLinejoin="round" />
    <path d="M8.5 12l2.5 2.5 5-5" className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const NavProfileIcon = ({ size = 16, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <circle cx="12" cy="8" r="4" className={active ? 'fill-[#e30019]/20 stroke-[#e30019]' : 'fill-slate-100/70 stroke-slate-500'} strokeWidth="1.65" />
    <path d="M5 20.5a7 7 0 0 1 14 0" className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'} strokeWidth="1.65" strokeLinecap="round" />
    <circle cx="17.5" cy="5.5" r="1.4" className={active ? 'fill-[#e30019]' : 'fill-slate-400'} />
  </svg>
);

export const NavSecurityIcon = ({ size = 16, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect x="5" y="10.5" width="14" height="11" rx="2.5" className={active ? 'fill-[#e30019]/20 stroke-[#e30019]' : 'fill-slate-100/70 stroke-slate-500'} strokeWidth="1.65" />
    <path d="M8 10.5V7a4 4 0 1 1 8 0v3.5" className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'} strokeWidth="1.65" strokeLinecap="round" />
    <circle cx="12" cy="15" r="1.3" className={active ? 'fill-[#e30019]' : 'fill-slate-400'} />
    <line x1="12" y1="16.3" x2="12" y2="18.5" className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'} strokeWidth="1.65" strokeLinecap="round" />
  </svg>
);

export const NavLogoutIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <path d="M9 4.5H5.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H9" />
    <path d="M14.5 8l4 4-4 4" />
    <path d="M18.5 12H8.5" />
  </svg>
);

export const ShopMemberInsignia = ({ size = 13, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`shrink-0 ${className}`}
  >
    <path
      d="M2.5 17.5h19l-2-10-5 5-2.5-7.5-2.5 7.5-5-5-2 10z"
      fill="currentColor"
      opacity="0.22"
    />
    <path
      d="M2.5 17.5h19l-2-10-5 5-2.5-7.5-2.5 7.5-5-5-2 10z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M3.5 20.5h17"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle cx="12" cy="5" r="1.3" fill="currentColor" />
    <circle cx="4.5" cy="7.5" r="1.1" fill="currentColor" />
    <circle cx="19.5" cy="7.5" r="1.1" fill="currentColor" />
    <polygon
      points="12,11 13.5,13.5 12,16 10.5,13.5"
      fill="currentColor"
      opacity="0.85"
    />
  </svg>
);

export const IconMemberStar = ShopMemberInsignia;

export const StatOrdersIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <rect x="3.5" y="7.5" width="17" height="14" rx="2.5" fill="currentColor" opacity="0.12" />
    <path d="M7 7.5V5.5A2.5 2.5 0 0 1 9.5 3h5A2.5 2.5 0 0 1 17 5.5v2" />
    <circle cx="9" cy="11.5" r="1" fill="currentColor" strokeWidth="0" />
    <circle cx="15" cy="11.5" r="1" fill="currentColor" strokeWidth="0" />
    <path d="M9 15h6" strokeWidth="1.3" opacity="0.6" />
  </svg>
);

export const StatShippingIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <rect x="2" y="6" width="13" height="11" rx="2" fill="currentColor" opacity="0.12" />
    <path d="M15 9h4.5l2.5 3.5V17h-7V9z" fill="currentColor" opacity="0.12" />
    <circle cx="6.5" cy="17.5" r="2" />
    <circle cx="17.5" cy="17.5" r="2" />
    <path d="M2 11h3M2 8h2" opacity="0.5" strokeWidth="1.3" />
  </svg>
);

export const StatAddressIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <path d="M12 21.5s7-6.2 7-11.5a7 7 0 1 0-14 0c0 5.3 7 11.5 7 11.5z" fill="currentColor" opacity="0.12" />
    <circle cx="12" cy="10" r="2.8" />
    <circle cx="12" cy="10" r="1.2" fill="currentColor" strokeWidth="0" />
    <path d="M8.5 21.5h7" strokeWidth="1.3" opacity="0.6" />
  </svg>
);

export const StatWarrantyIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <path d="M12 2.5L20 6.2v5.6c0 5.1-3.4 9.6-8 10.7-4.6-1.1-8-5.6-8-10.7V6.2L12 2.5z" fill="currentColor" opacity="0.12" />
    <path d="M9 12l2 2 4-4" strokeWidth="1.8" />
    <circle cx="12" cy="7" r="0.9" fill="currentColor" strokeWidth="0" />
  </svg>
);

export const SecurityShieldHeaderIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <path d="M12 2.5L3.5 6.2v6.1c0 5.2 3.5 10 8.5 11.2 5-1.2 8.5-6 8.5-11.2V6.2L12 2.5z" fill="currentColor" opacity="0.12" />
    <path d="M12 7l2.5 3-2.5 3-2.5-3L12 7z" fill="currentColor" opacity="0.25" strokeWidth="0" />
    <circle cx="12" cy="10" r="1.3" fill="currentColor" strokeWidth="0" />
    <path d="M8.5 16.5l3.5 1.5 3.5-1.5" strokeWidth="1.2" opacity="0.6" />
  </svg>
);

export const SecurityKeycardIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <circle cx="8" cy="12" r="5" fill="currentColor" opacity="0.14" />
    <circle cx="8" cy="12" r="2" />
    <path d="M13 12h8v3h-2.5v-2h-2v2H14" />
    <circle cx="8" cy="12" r="0.9" fill="currentColor" strokeWidth="0" />
  </svg>
);

export const SecurityDevicesIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <rect x="2" y="5.5" width="15" height="10" rx="1.5" fill="currentColor" opacity="0.12" />
    <path d="M1 18.5h17" strokeWidth="1.8" />
    <rect x="16.5" y="9.5" width="6" height="10.5" rx="1.5" fill="currentColor" opacity="0.18" />
    <circle cx="19.5" cy="17.5" r="0.7" fill="currentColor" strokeWidth="0" />
    <circle cx="9.5" cy="10.5" r="1" fill="currentColor" strokeWidth="0" opacity="0.6" />
  </svg>
);

export const OverviewPinIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <path d="M12 21s6.5-5.8 6.5-11a6.5 6.5 0 1 0-13 0c0 5.2 6.5 11 6.5 11z" fill="currentColor" opacity="0.18" />
    <circle cx="12" cy="10" r="2.2" fill="currentColor" strokeWidth="0" />
  </svg>
);

export const OverviewReceiptIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <rect x="4" y="3.5" width="16" height="17" rx="2" fill="currentColor" opacity="0.14" />
    <path d="M8 8h8M8 12h5M8 16h8" strokeWidth="1.4" opacity="0.7" />
  </svg>
);

export const IconOverview = NavOverviewIcon;
export const IconOrders = NavOrdersIcon;
export const IconAddress = NavAddressIcon;
export const IconWarranty = NavWarrantyIcon;
export const IconProfile = NavProfileIcon;
export const IconChangePassword = NavSecurityIcon;
export const IconLogout = NavLogoutIcon;
