import React from 'react';

/**
 * BỘ CUSTOM SVG ICONS ĐỘC BẢN CHO DASHBOARD
 * Phong cách Signature Duotone + Corner Badge Punch-Out (cảm hứng từ qms-iky):
 * - Nét vẽ dày dặn 2.0 - 2.5px
 * - Phối nhiều tầng fillOpacity (0.08 - 0.25)
 * - Huy hiệu tròn góc tương phản màu trắng (Corner Badge Punch-Out)
 */

/** 1. Doanh thu hệ thống (Revenue) — Cột tài chính bứt phá + Huy hiệu ngôi sao / tăng trưởng góc */
export const DashRevenueKpiIcon = ({ size = 24, className = 'text-emerald-600', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Trục nền biểu đồ */}
    <path d="M3 26 H27" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.4" />
    {/* 3 cột tài chính tăng dần */}
    <rect x="5" y="17" width="4.5" height="9" rx="1.2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
    <rect x="12" y="12" width="4.5" height="14" rx="1.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
    <rect x="19" y="7" width="4.5" height="19" rx="1.2" fill="currentColor" fillOpacity="0.38" stroke="currentColor" strokeWidth="2" />
    {/* Đường nối xu hướng tăng trưởng đỉnh */}
    <polyline points="7.2,16 14.2,11 21.2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7.2" cy="16" r="1.6" fill="currentColor" />
    <circle cx="14.2" cy="11" r="1.6" fill="currentColor" />
    <circle cx="21.2" cy="6" r="1.6" fill="currentColor" />
    {/* Huy hiệu góc tròn đặc có chữ d trắng */}
    <circle cx="26" cy="6" r="5" fill="currentColor" />
    <text x="26" y="9.2" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="monospace">₫</text>
  </svg>
);

/** 2. Đơn hàng (Orders Pipeline) — Thùng hàng thương mại 3D + Huy hiệu checkmark trắng */
export const DashOrdersKpiIcon = ({ size = 24, className = 'text-blue-600', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Nắp trên hộp */}
    <polygon points="14,3 25,8.5 14,14 3,8.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {/* Thân trái */}
    <polygon points="3,8.5 3,21 14,26.5 14,14" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {/* Thân phải */}
    <polygon points="25,8.5 25,21 14,26.5 14,14" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {/* Băng keo dán thùng */}
    <line x1="8.5" y1="5.7" x2="14" y2="8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="14" y1="14" x2="14" y2="26.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
    {/* Huy hiệu góc tròn đặc có dấu tích trắng */}
    <circle cx="26" cy="6" r="5" fill="currentColor" />
    <polyline points="23.5,6 25.2,8 28.5,4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/** 3. Tồn kho & Sản phẩm (Inventory & Catalog) — Kệ kho công nghiệp đa tầng + Huy hiệu hộp pallet góc */
export const DashInventoryKpiIcon = ({ size = 24, className = 'text-indigo-600', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Khung chân kệ kho đứng 2 bên */}
    <line x1="4" y1="5" x2="4" y2="27" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="24" y1="5" x2="24" y2="27" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    {/* Thanh đà ngang 2 tầng */}
    <line x1="3" y1="16" x2="25" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="3" y1="26" x2="25" y2="26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    {/* Kiện hàng tầng dưới */}
    <rect x="6.5" y="18" width="7" height="8" rx="1.2" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.8" />
    <rect x="15" y="19" width="7" height="7" rx="1.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.8" />
    {/* Kiện hàng tầng trên */}
    <rect x="6.5" y="8" width="9" height="8" rx="1.2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" />
    <line x1="11" y1="8" x2="11" y2="16" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    {/* Huy hiệu góc tròn đặc có ký hiệu xếp dỡ trắng */}
    <circle cx="26" cy="6" r="5" fill="currentColor" />
    <rect x="23.5" y="3.8" width="5" height="4.4" rx="0.8" stroke="white" strokeWidth="1.4" fill="none" />
  </svg>
);

/** 4. Khách hàng (Customer Base) — Avatar người dùng + Thẻ định danh + Huy hiệu verified góc */
export const DashCustomersKpiIcon = ({ size = 24, className = 'text-amber-500', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Đầu người dùng chính */}
    <circle cx="12" cy="10" r="5.5" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.2" />
    {/* Thân vai người dùng chính */}
    <path
      d="M3 26 C3 19.5 7.5 17.5 12 17.5 C16.5 17.5 21 19.5 21 26"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Người dùng phụ phía sau */}
    <path d="M19 12 C20.5 12 22 13 22 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
    <path d="M21 20 C23 20.8 25 22.5 25 26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
    {/* Huy hiệu góc tròn đặc có dấu check trắng (Verified Customer) */}
    <circle cx="26" cy="6" r="5" fill="currentColor" />
    <polyline points="23.5,6 25.2,8 28.5,4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/** 5. Cảnh báo hết hàng (Low Stock Alert) — Tam giác công nghiệp + Huy hiệu chấm than trắng */
export const DashAlertWarningIcon = ({ size = 20, className = 'text-amber-500', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    <path
      d="M14 3 L25 22 C25.8 23.4 24.8 25 23.2 25 H4.8 C3.2 25 2.2 23.4 3 22 L14 3 Z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <line x1="14" y1="10" x2="14" y2="16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="14" cy="20" r="1.4" fill="currentColor" />
    {/* Huy hiệu tròn góc */}
    <circle cx="24" cy="5" r="4.5" fill="currentColor" />
    <line x1="24" y1="3" x2="24" y2="5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="24" cy="7.2" r="0.7" fill="white" />
  </svg>
);

/** 6. Dịch chuyển tồn kho (Warehouse Flow) — Mũi tên logistics xoay vòng */
export const DashWarehouseFlowIcon = ({ size = 20, className = 'text-cyan-600', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    <rect x="3" y="13" width="10" height="11" rx="1.8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" />
    <rect x="15" y="4" width="10" height="11" rx="1.8" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.8" />
    {/* Mũi tên chuyển dịch */}
    <path d="M8 8 C8 5 11 4 14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2,2" />
    <path d="M20 20 C20 23 17 24 14 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2,2" />
    <polyline points="12,2 14.5,4 12,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16,22 13.5,24 16,26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 7. Đơn hàng gần đây (Recent Orders Shopping Bag) */
export const DashRecentOrdersIcon = ({ size = 20, className = 'text-primary', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    <path
      d="M4 8 H24 L22 24 H6 L4 8 Z"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Quai xách túi */}
    <path d="M9 11 V6 C9 4 10.5 2.5 14 2.5 C17.5 2.5 19 4 19 6 V11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="10" cy="12" r="1.5" fill="currentColor" />
    <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    {/* Huy hiệu tia sét góc */}
    <circle cx="23" cy="5" r="4.5" fill="currentColor" />
    <path d="M24 2.5 L22 5 H24 L22.5 7.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 8. Sản phẩm bán chạy nhất (Top Products Trophy) */
export const DashTopProductsIcon = ({ size = 20, className = 'text-amber-500', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Chén cúp */}
    <path
      d="M7 4 H21 V12 C21 16 17.5 19 14 19 C10.5 19 7 16 7 12 V4 Z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* 2 quai cúp */}
    <path d="M7 6 H4 C3 6 2 7 2 8 C2 11 4.5 13 7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M21 6 H24 C25 6 26 7 26 8 C26 11 23.5 13 21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Chân đế cúp */}
    <line x1="14" y1="19" x2="14" y2="23" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <rect x="8" y="23" width="12" height="3" rx="1" fill="currentColor" stroke="none" />
    {/* Ngôi sao số 1 giữa cúp */}
    <circle cx="14" cy="10" r="2.5" fill="currentColor" />
  </svg>
);

/** 9. Phân bổ tồn kho (Stock Donut) */
export const DashStockDonutIcon = ({ size = 20, className = 'text-indigo-600', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="4.5" fill="none" opacity="0.15" />
    <circle
      cx="14"
      cy="14"
      r="11"
      stroke="currentColor"
      strokeWidth="4.5"
      fill="none"
      strokeDasharray="45 25"
      strokeLinecap="round"
    />
    <circle cx="14" cy="14" r="3.5" fill="currentColor" opacity="0.25" />
  </svg>
);
