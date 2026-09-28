import React from 'react';

export const IconOverview = ({ size = 18, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <rect
      x="3"
      y="3"
      width="7.5"
      height="7.5"
      rx="2"
      className={active ? 'fill-[#e30019]/15 stroke-[#e30019]' : 'fill-slate-100/60 stroke-slate-500'}
      strokeWidth="1.75"
    />
    <rect
      x="13.5"
      y="3"
      width="7.5"
      height="4.5"
      rx="1.5"
      className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
    />
    <rect
      x="13.5"
      y="10.5"
      width="7.5"
      height="10.5"
      rx="2"
      className={active ? 'fill-[#e30019]/20 stroke-[#e30019]' : 'fill-slate-100/60 stroke-slate-500'}
      strokeWidth="1.75"
    />
    <rect
      x="3"
      y="13.5"
      width="7.5"
      height="7.5"
      rx="2"
      className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
    />
    <circle cx="6.75" cy="6.75" r="1.2" className={active ? 'fill-[#e30019]' : 'fill-slate-500'} />
  </svg>
);

export const IconOrders = ({ size = 18, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path
      d="M4.5 7.5L6.5 3H17.5L19.5 7.5"
      className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="3"
      y="7.5"
      width="18"
      height="13.5"
      rx="2.5"
      className={active ? 'fill-[#e30019]/15 stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
    />
    <path
      d="M9 11.5C9 13.1569 10.3431 14.5 12 14.5C13.6569 14.5 15 13.1569 15 11.5"
      className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle cx="12" cy="7.5" r="1" className={active ? 'fill-[#e30019]' : 'fill-slate-400'} />
  </svg>
);

export const IconWarranty = ({ size = 18, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path
      d="M12 2.5L20 6.2V11.5C20 16.5 16.5 20.6 12 22C7.5 20.6 4 16.5 4 11.5V6.2L12 2.5Z"
      className={active ? 'fill-[#e30019]/15 stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 12L11 14.5L15.5 9.5"
      className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconProfile = ({ size = 18, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <circle
      cx="12"
      cy="8"
      r="4"
      className={active ? 'fill-[#e30019]/15 stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
    />
    <path
      d="M5 20.5C5 16.91 8.134 14 12 14C15.866 14 19 16.91 19 20.5"
      className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle cx="17.5" cy="5.5" r="1.5" className={active ? 'fill-[#e30019]' : 'fill-slate-300'} />
  </svg>
);

export const IconChangePassword = ({ size = 18, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <circle
      cx="8.5"
      cy="12"
      r="4.5"
      className={active ? 'fill-[#e30019]/15 stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
    />
    <path
      d="M13 12H20.5M17.5 12V15M20.5 12V15"
      className={active ? 'stroke-[#e30019]' : 'stroke-slate-500'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8.5" cy="12" r="1.5" className={active ? 'fill-[#e30019]' : 'fill-slate-400'} />
  </svg>
);

export const IconLogout = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path
      d="M9 4.5H5.5C4.67 4.5 4 5.17 4 6V18C4 18.83 4.67 19.5 5.5 19.5H9"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 8L18.5 12L14.5 16"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M18.5 12H8.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export const IconEditPen = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path
      d="M16.5 3.5L20.5 7.5L7 21H3V17L16.5 3.5Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 6L18 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
