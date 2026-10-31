import React from 'react';

export const RoleAdminIcon = ({ size = 14, className = '', strokeWidth = 1.7, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 2L3.5 5.5v6.2c0 5.4 3.6 10.3 8.5 11.8 4.9-1.5 8.5-6.4 8.5-11.8V5.5L12 2z" />
    <path d="M12 6.8l2.2 2.8-2.2 2.8-2.2-2.8L12 6.8z" fill="currentColor" opacity="0.22" />
    <circle cx="12" cy="9.6" r="1.2" fill="currentColor" strokeWidth="0" />
    <path d="M12 14.5v3.2M9.8 16.2h4.4" strokeWidth={strokeWidth * 0.85} />
  </svg>
);

export const RoleManagerIcon = ({ size = 14, className = '', strokeWidth = 1.7, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2.5 9L12 3.5 21.5 9v2.2L12 5.8 2.5 11.2V9z" fill="currentColor" opacity="0.2" />
    <path d="M2.5 9L12 3.5 21.5 9v2.2L12 5.8 2.5 11.2V9z" />
    <path d="M5 13l7 4 7-4" />
    <path d="M7.5 17l4.5 2.8 4.5-2.8" />
    <circle cx="12" cy="10" r="1.4" fill="currentColor" strokeWidth="0" />
    <circle cx="6" cy="7.5" r="1" fill="currentColor" strokeWidth="0" opacity="0.6" />
    <circle cx="18" cy="7.5" r="1" fill="currentColor" strokeWidth="0" opacity="0.6" />
  </svg>
);

export const RoleInventoryIcon = ({ size = 14, className = '', strokeWidth = 1.7, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 2.5L3.5 7.2v9.6L12 21.5l8.5-4.7V7.2L12 2.5z" />
    <path d="M12 2.5v19M3.5 7.2L12 12l8.5-4.8" />
    <path d="M7.8 4.8l8.4 4.8" strokeWidth={strokeWidth * 0.75} strokeDasharray="1.5 1.5" />
    <path d="M7 14.5l5 2.8 5-2.8" strokeWidth={strokeWidth * 0.85} opacity="0.5" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" strokeWidth="0" />
  </svg>
);

export const RoleSalesIcon = ({ size = 14, className = '', strokeWidth = 1.7, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
    <rect x="7.5" y="5" width="9" height="5.5" rx="1.2" fill="currentColor" opacity="0.2" />
    <path d="M8 14h2M12 14h2M16 14h0M8 17.5h2M12 17.5h2M16 17.5h0" strokeWidth={strokeWidth * 1.1} />
    <path d="M10 2.5V4h4V2.5" strokeWidth={strokeWidth * 0.8} />
  </svg>
);

export const RoleSupportIcon = ({ size = 14, className = '', strokeWidth = 1.7, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3.5 13v-2.5a8.5 8.5 0 0 1 17 0V13" />
    <rect x="2" y="11.5" width="4" height="6.5" rx="1.8" fill="currentColor" opacity="0.2" />
    <rect x="2" y="11.5" width="4" height="6.5" rx="1.8" />
    <rect x="18" y="11.5" width="4" height="6.5" rx="1.8" fill="currentColor" opacity="0.2" />
    <rect x="18" y="11.5" width="4" height="6.5" rx="1.8" />
    <path d="M20 18v1a3 3 0 0 1-3 3h-4.5" />
    <circle cx="11" cy="22" r="1.4" fill="currentColor" strokeWidth="0" />
    <path d="M9.5 8a4.5 4.5 0 0 1 5 0" strokeWidth={strokeWidth * 0.8} />
  </svg>
);

export const RoleEditorIcon = ({ size = 14, className = '', strokeWidth = 1.7, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M14 3.5l6.5 6.5L7.5 23H1v-6.5L14 3.5z" />
    <polygon points="14,3.5 17,2 22,7 19.5,9.5" fill="currentColor" opacity="0.2" strokeWidth="0" />
    <path d="M11.5 6l6.5 6.5" strokeWidth={strokeWidth * 0.8} />
    <path d="M5.5 18.5L2 22" strokeWidth={strokeWidth * 0.8} />
    <circle cx="8" cy="16" r="0.8" fill="currentColor" strokeWidth="0" />
  </svg>
);

export const RoleKeyCustomIcon = ({ size = 14, className = '', strokeWidth = 1.7, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 11a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 11z" fill="currentColor" opacity="0.18" />
    <path d="M12 11a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 11z" />
    <path d="M11.5 10l8.5 8.5v3h-3v-2h-2v-2h-2" />
    <circle cx="7.5" cy="6.5" r="1.3" fill="currentColor" strokeWidth="0" />
  </svg>
);

export const RoleDefaultStaffIcon = ({ size = 14, className = '', strokeWidth = 1.7, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="4.5" y="4.5" width="15" height="16.5" rx="2.5" />
    <path d="M9.5 4.5V2.5a1.5 1.5 0 0 1 3 0v2" />
    <circle cx="12" cy="10" r="2.3" fill="currentColor" opacity="0.2" />
    <circle cx="12" cy="10" r="2.3" />
    <path d="M7.5 17.5a4.5 4.5 0 0 1 9 0" />
  </svg>
);

export const ROLE_CUSTOM_ICONS_MAP = {
  administrator: RoleAdminIcon,
  admin: RoleAdminIcon,
  manager: RoleManagerIcon,
  inventory_manager: RoleInventoryIcon,
  warehouse_clerk: RoleInventoryIcon,
  staff: RoleSalesIcon,
  customer_care: RoleSupportIcon,
  content_editor: RoleEditorIcon,
};

export const getRoleCustomIcon = (roleCode) => {
  const code = (roleCode || '').toLowerCase();
  return ROLE_CUSTOM_ICONS_MAP[code] || RoleDefaultStaffIcon;
};
