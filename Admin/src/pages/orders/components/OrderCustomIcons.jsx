import React from 'react';

/**
 * BỘ ICON ĐỘC BẢN CHO MODULE QUẢN LÝ ĐƠN HÀNG (ORDERS)
 * Phong cách Signature Duotone + Corner Badge Punch-Out
 * - Viền nét 2.0 - 2.2px sắc sảo
 * - Mảng bóng mờ duotone fillOpacity 0.12 - 0.25
 * - Huy hiệu tròn góc tương phản màu trắng
 */

/** 1. Tổng đơn hàng (OrderTotalBoxIcon) */
export const OrderTotalBoxIcon = ({ size = 20, className = 'text-primary', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Nắp hộp 3D */}
    <polygon
      points="12,3 21,7.5 12,12 3,7.5"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Thân trái */}
    <polygon
      points="3,7.5 3,18 12,23 12,12"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Thân phải */}
    <polygon
      points="21,7.5 21,18 12,23 12,12"
      fill="currentColor"
      fillOpacity="0.28"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Huy hiệu tia chớp / hashtag góc */}
    <circle cx="22" cy="5" r="4.5" fill="currentColor" />
    <path
      d="M23 2.5 L21 5 H23 L21.5 7.5"
      stroke="white"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** 2. Đơn chờ duyệt (OrderPendingClockIcon) */
export const OrderPendingClockIcon = ({ size = 20, className = 'text-amber-500', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Thân đồng hồ */}
    <circle cx="12" cy="14" r="9.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
    {/* Kim đồng hồ */}
    <polyline points="12,9 12,14 15.5,14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Nút bấm trên đồng hồ */}
    <line x1="12" y1="2" x2="12" y2="4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    {/* Huy hiệu cát / chấm than góc */}
    <circle cx="22" cy="5" r="4.5" fill="currentColor" />
    <circle cx="22" cy="5" r="1.3" fill="white" />
  </svg>
);

/** 3. Đơn đã duyệt (OrderConfirmedStampIcon) */
export const OrderConfirmedStampIcon = ({ size = 20, className = 'text-blue-600', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Tờ hóa đơn/chứng từ */}
    <rect x="4" y="3" width="16" height="21" rx="1.8" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2.2" />
    <line x1="8" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Con dấu checkmark góc */}
    <circle cx="22" cy="6" r="5" fill="currentColor" />
    <polyline points="19.5,6 21.2,8 24.5,4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/** 4. Đơn đang giao (OrderShippingTruckIcon) */
export const OrderShippingTruckIcon = ({ size = 20, className = 'text-purple-600', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Thùng xe tải */}
    <rect x="2" y="7" width="13" height="11" rx="1.5" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2" />
    {/* Đầu cabin xe */}
    <path
      d="M15 10 H20 L23 14 V18 H15 V10 Z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Cửa sổ cabin */}
    <polygon points="17,12 19.5,12 21.5,14.5 17,14.5" fill="currentColor" opacity="0.5" />
    {/* Bánh xe */}
    <circle cx="6.5" cy="20" r="2.5" fill="currentColor" />
    <circle cx="6.5" cy="20" r="1" fill="white" />
    <circle cx="18.5" cy="20" r="2.5" fill="currentColor" />
    <circle cx="18.5" cy="20" r="1" fill="white" />
    {/* Huy hiệu tốc độ góc */}
    <circle cx="23" cy="5" r="4.5" fill="currentColor" />
    <path d="M21 5 H25 M22 3.5 L24.5 5 L22 6.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 5. Đơn hoàn tất (OrderDeliveredSuccessIcon) */
export const OrderDeliveredSuccessIcon = ({ size = 20, className = 'text-emerald-600', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Vòng tròn khiên bảo vệ */}
    <circle cx="12" cy="14" r="9.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2.2" />
    {/* Dấu checkmark chính */}
    <polyline points="7.5,14 10.5,17 16.5,10.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Huy hiệu ngôi sao chất lượng góc */}
    <circle cx="22" cy="5" r="4.5" fill="currentColor" />
    <polygon points="22,2.5 22.8,4.2 24.5,4.4 23.2,5.6 23.6,7.2 22,6.3 20.4,7.2 20.8,5.6 19.5,4.4 21.2,4.2" fill="white" />
  </svg>
);

/** 6. Đơn đã hủy (OrderCancelledIcon) */
export const OrderCancelledIcon = ({ size = 20, className = 'text-rose-600', ...props }) => (
  <svg
    viewBox="0 0 28 28"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Vòng tròn biển cấm */}
    <circle cx="12" cy="14" r="9.5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2.2" />
    {/* Dấu gạch chéo hủy */}
    <line x1="8" y1="10" x2="16" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="16" y1="10" x2="8" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    {/* Huy hiệu x trắng góc */}
    <circle cx="22" cy="5" r="4.5" fill="currentColor" />
    <line x1="20.5" y1="3.5" x2="23.5" y2="6.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="23.5" y1="3.5" x2="20.5" y2="6.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
