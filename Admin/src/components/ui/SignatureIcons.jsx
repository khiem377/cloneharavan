import React from 'react';

/**
 * ═════════════════════════════════════════════════════════════════════
 *   BỘ ICON ĐỘC BẢN SIGNATURE DUOTONE & PUNCH-OUT BADGE (QMS-IKY STYLE)
 *   - Chuẩn viewBox="0 0 32 32", overflow="visible"
 *   - Đa tầng hình khối (Multi-layered Geometric Vectors)
 *   - Lớp bóng mờ tinh tế (fillOpacity: 0.12 - 0.20)
 *   - Đường viền dứt khoát sắc nét (strokeWidth: 2.0 - 2.2)
 *   - ĐIỂM NHẤN ĐẶC TRƯNG: Huy hiệu góc tròn đặc (Punch-out Accent Badge)
 *     với biểu tượng trắng tương phản 100% không thể nhầm lẫn!
 * ═════════════════════════════════════════════════════════════════════
 */

// ── 1. BẢNG ĐIỀU KHIỂN (Dashboard) ──────────────────────────────────────────
export const DashboardSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Khung màn hình điều khiển chính */}
    <rect x="2" y="5" width="22" height="23" rx="3.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
    {/* Thẻ widget trên bên trong */}
    <rect x="5" y="8.5" width="16" height="5" rx="1.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    {/* 2 cột widget dưới */}
    <rect x="5" y="16" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.2" />
    <line x1="7.5" y1="22" x2="9.5" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <rect x="14" y="16" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <line x1="16.5" y1="19" x2="18.5" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <line x1="16.5" y1="22" x2="18.5" y2="22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    {/* Huy hiệu tia chớp / hashtag góc phải trên */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <path d="M28 2.2 L25.5 5.2 H28.5 L26 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// ── 2. THƯ VIỆN MEDIA (Media Library) ───────────────────────────────────────
export const MediaSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Khung ảnh chính */}
    <rect x="2" y="7" width="22" height="21" rx="3.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
    {/* Dãy núi / dải ảnh */}
    <path d="M4 23 L10 16 L15 21 L18 18 L22 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
    {/* Mặt trời trong tranh */}
    <circle cx="8" cy="12.5" r="2.2" fill="currentColor" opacity="0.8" />
    {/* Lớp khung phụ xếp chồng phía sau */}
    <path d="M6 4 H21 Q24 4 24 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
    {/* Huy hiệu Play góc phải trên */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <polygon points="25.5,3.2 29.5,5 25.5,6.8" fill="white" />
  </svg>
);

// ── 3. DỌN DẸP ẢNH THỪA (Clean Media) ───────────────────────────────────────
export const CleanMediaSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Thùng rác duotone */}
    <path d="M5 11 L7 27 Q7 29 9 29 H19 Q21 29 21 27 L23 11" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {/* Nắp thùng */}
    <line x1="3" y1="11" x2="25" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 11 V8 Q10 6 12 6 H16 Q18 6 18 8 V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Các khe thoáng của thùng */}
    <line x1="10" y1="16" x2="10" y2="24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    <line x1="14" y1="16" x2="14" y2="24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    <line x1="18" y1="16" x2="18" y2="24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    {/* Huy hiệu tia sáng / sao lấp lánh góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <path d="M27 2.5 V7.5 M24.5 5 H29.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ── 4. BANNER QUẢNG CÁO (Banners) ───────────────────────────────────────────
export const BannerSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Tấm biển quảng cáo rộng */}
    <rect x="2" y="6" width="22" height="15" rx="3" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2" />
    <line x1="5" y1="10.5" x2="13" y2="10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="5" y1="14.5" x2="10" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    {/* Chân cột biển */}
    <line x1="8" y1="21" x2="6" y2="29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="21" x2="20" y2="29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="4" y1="29" x2="22" y2="29" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
    {/* Huy hiệu ngôi sao chất lượng góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <polygon points="27,2.8 27.8,4.3 29.5,4.5 28.2,5.7 28.6,7.3 27,6.4 25.4,7.3 25.8,5.7 24.5,4.5 26.2,4.3" fill="white" />
  </svg>
);

// ── 5. QUẢN LÝ ĐƠN HÀNG (Orders) ────────────────────────────────────────────
export const OrderSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Thùng carton bưu kiện 3D */}
    <polygon points="12,4 22,8.5 12,13 2,8.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="2,8.5 2,21 12,26 12,13" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="22,8.5 22,21 12,26 12,13" fill="currentColor" fillOpacity="0.30" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {/* Băng keo dán thùng */}
    <line x1="7" y1="6.2" x2="17" y2="10.8" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    {/* Huy hiệu dấu checkmark xanh góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <polyline points="24.8,5 26.5,7 29.5,3.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// ── 6. VẬN CHUYỂN (Shipments & Logistics) ──────────────────────────────────
export const ShippingSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Thùng sau xe tải */}
    <rect x="2" y="8" width="13" height="13" rx="1.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
    <line x1="5.5" y1="12" x2="9.5" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    {/* Đầu cabin xe tải */}
    <path d="M15 11 H20.5 L24 16 V21 H15 V11 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="17,13 19.8,13 22,16 17,16" fill="currentColor" opacity="0.4" />
    {/* Bánh xe tải */}
    <circle cx="6.5" cy="24" r="3" fill="currentColor" />
    <circle cx="6.5" cy="24" r="1.2" fill="white" />
    <circle cx="19.5" cy="24" r="3" fill="currentColor" />
    <circle cx="19.5" cy="24" r="1.2" fill="white" />
    {/* Huy hiệu mũi tên siêu tốc góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <path d="M25 5 H29 M27 3 L29 5 L27 7" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// ── 7. QUẢN LÝ SẢN PHẨM (Products & Catalog) ────────────────────────────────
export const ProductSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Hộp quà / Khối sản phẩm trưng bày */}
    <rect x="3" y="10" width="20" height="18" rx="3" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2" />
    {/* Nắp hộp / Đường phân tách */}
    <line x1="3" y1="15" x2="23" y2="15" stroke="currentColor" strokeWidth="1.8" />
    {/* Nơ dây gói dọc */}
    <line x1="13" y1="10" x2="13" y2="28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="11" y="7" width="4" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
    {/* Huy hiệu dấu cộng tạo mới góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <line x1="24.5" y1="5" x2="29.5" y2="5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="27" y1="2.5" x2="27" y2="7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ── 8. QUẢN LÝ KHO HÀNG (Warehouses & WMS) ──────────────────────────────────
export const WarehouseSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Mái nhà kho dốc */}
    <polygon points="12,4 23,10 1,10" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {/* Thân nhà kho chính */}
    <rect x="3" y="10" width="18" height="17" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
    {/* Cửa cuốn nhà kho */}
    <rect x="8" y="15" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.2" />
    <line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="8" y1="24" x2="16" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    {/* Huy hiệu hộp pallet góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <rect x="24.5" y="3" width="5" height="4" rx="0.8" fill="white" />
  </svg>
);

// ── 9. KHUYẾN MÃI & GIẢM GIÁ (Promotions & Coupons) ─────────────────────────
export const PromotionSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Vé Voucher cuống răng cưa */}
    <path
      d="M3 8 Q3 6 5 6 H21 Q23 6 23 8 V13 Q21 14.5 21 17 Q21 19.5 23 21 V26 Q23 28 21 28 H5 Q3 28 3 26 V21 Q5 19.5 5 17 Q5 14.5 3 13 Z"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Đường chỉ gấp xé voucher */}
    <line x1="10" y1="7" x2="10" y2="27" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
    {/* Huy hiệu phần trăm % góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <line x1="25" y1="6.8" x2="29" y2="3.2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="25.5" cy="3.8" r="0.8" fill="white" />
    <circle cx="28.5" cy="6.2" r="0.8" fill="white" />
  </svg>
);

// ── 10. TIN TỨC & BÀI VIẾT (Blog & News) ────────────────────────────────────
export const BlogSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Tờ báo / Tạp chí tin tức */}
    <rect x="3" y="6" width="20" height="23" rx="2.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
    {/* Khối ảnh tin tiêu điểm */}
    <rect x="6" y="9.5" width="14" height="6.5" rx="1.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
    {/* Các dòng chữ tin bài */}
    <line x1="6" y1="19.5" x2="20" y2="19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="6" y1="23.5" x2="16" y2="23.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    {/* Huy hiệu ngòi bút ký góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <path d="M25.5 6.5 L28.5 3.5 L29.5 4.5 L26.5 7.5 Z M25 7 L25.5 6.5 L26.5 7.5 Z" fill="white" />
  </svg>
);

// ── 11. KHÁCH HÀNG (Customers & CRM) ────────────────────────────────────────
export const CustomerSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Thẻ thành viên / Khung chân dung */}
    <rect x="2" y="6" width="22" height="22" rx="3.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
    {/* Đầu người dùng */}
    <circle cx="13" cy="13.5" r="3.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.8" />
    {/* Thân vai người dùng */}
    <path d="M6 24 C6 19.5 9 18.5 13 18.5 C17 18.5 20 19.5 20 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="currentColor" fillOpacity="0.15" />
    {/* Huy hiệu khiên bảo vệ góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <path d="M25 3.5 H29 V5.5 Q29 7.5 27 8.5 Q25 7.5 25 5.5 Z" fill="white" />
  </svg>
);

// ── 12. NHÂN VIÊN & QUẢN TRỊ (Staff & Admins) ──────────────────────────────
export const StaffSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Khiên bảo mật huy hiệu hiệp sĩ */}
    <path
      d="M12 3 L22 7 V15 Q22 22 12 28 Q2 22 2 15 V7 Z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12 7 V24 Q18 19 18 14 V9.5 Z" fill="currentColor" fillOpacity="0.2" />
    {/* Huy hiệu vương miện sao góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <path d="M25 6 L25.5 3.5 L27 5 L28.5 3.5 L29 6 Z" fill="white" />
  </svg>
);

// ── 13. VAI TRÒ & PHÂN QUYỀN (Roles & Permissions) ─────────────────────────
export const RoleSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Chùm chìa khóa Master Key */}
    <circle cx="9" cy="11" r="6" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 14 L24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="19" y1="19" x2="22" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="22" y1="22" x2="25" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Huy hiệu ổ khóa bấm góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <rect x="25" y="4.5" width="4" height="3" rx="0.8" fill="white" />
    <path d="M26 4.5 V3 Q26 2 27 2 Q28 2 28 3 V4.5" stroke="white" strokeWidth="1" fill="none" />
  </svg>
);

// ── 14. CẤU HÌNH MENU (Menu Structure) ─────────────────────────────────────
export const MenuSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Cây cấu trúc Menu đa cấp */}
    <rect x="3" y="4" width="18" height="5" rx="1.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.8" />
    <line x1="7" y1="9" x2="7" y2="26" stroke="currentColor" strokeWidth="1.8" />
    {/* Nút nhánh con 1 */}
    <line x1="7" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth="1.8" />
    <rect x="11" y="13.5" width="12" height="5" rx="1.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    {/* Nút nhánh con 2 */}
    <line x1="7" y1="24" x2="11" y2="24" stroke="currentColor" strokeWidth="1.8" />
    <rect x="11" y="21.5" width="12" height="5" rx="1.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    {/* Huy hiệu mắt lưới góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <circle cx="27" cy="5" r="1.5" fill="white" />
  </svg>
);

// ── 15. CÀI ĐẶT HỆ THỐNG (Settings & Core Config) ───────────────────────────
export const SettingSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Bánh răng cơ khí đa tầng */}
    <circle cx="12" cy="15" r="9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="15" r="3.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.8" />
    {/* Răng cơ khí viền */}
    <line x1="12" y1="4" x2="12" y2="6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="23.5" x2="12" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="1" y1="15" x2="3.5" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20.5" y1="15" x2="23" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Huy hiệu chấm highlight phản quang góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <circle cx="27" cy="5" r="1.5" fill="white" />
  </svg>
);

// ── 16. NHẬT KÝ THAO TÁC (Audit Logs) ───────────────────────────────────────
export const AuditLogSignatureIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Sổ tay kiểm toán */}
    <rect x="4" y="5" width="19" height="23" rx="2.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
    {/* Gáy lò xo sổ */}
    <line x1="8" y1="5" x2="8" y2="28" stroke="currentColor" strokeWidth="1.6" opacity="0.4" />
    {/* Dòng chữ ghi log */}
    <line x1="11" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="11" y1="16" x2="17" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    <line x1="11" y1="21" x2="19" y2="21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    {/* Huy hiệu đồng hồ giám sát góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <polyline points="27,3 27,5 28.5,5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ═════════════════════════════════════════════════════════════════════
//   BỘ ICON KPI ĐẶC BIỆT CHO TRANG DASHBOARD (4 CARDS CAO CẤP)
// ═════════════════════════════════════════════════════════════════════

/** KPI 1: Doanh thu hệ thống (Hộp két tiền / Doanh thu) */
export const KpiRevenueSignatureIcon = ({ size = 28, className = 'text-emerald-600', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    {/* Khung két tiền / Túi tài chính */}
    <rect x="3" y="6" width="22" height="20" rx="4" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2.2" />
    {/* Nắp túi / Gấp ví */}
    <path d="M3 11 C3 11 9 14 14 14 C19 14 25 11 25 11" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.4" />
    {/* Đồng xu trọng tâm */}
    <circle cx="14" cy="18" r="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.8" />
    <text x="14" y="20" textAnchor="middle" fill="currentColor" fontSize="6.5" fontWeight="900" fontFamily="system-ui, sans-serif">₫</text>
    {/* Huy hiệu tia sét tăng trưởng góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <path d="M28 2.2 L25.5 5.2 H28.5 L26 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/** KPI 2: Đơn hàng (Hộp bưu kiện xử lý) */
export const KpiOrdersSignatureIcon = ({ size = 28, className = 'text-blue-600', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    <polygon points="12,3 23,8 12,13 1,8" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    <polygon points="1,8 1,21 12,27 12,13" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    <polygon points="23,8 23,21 12,27 12,13" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Huy hiệu dấu checkmark duyệt đơn góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <polyline points="24.8,5 26.5,7 29.5,3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/** KPI 3: Tồn kho & Sản phẩm */
export const KpiStockSignatureIcon = ({ size = 28, className = 'text-purple-600', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    <rect x="2" y="7" width="22" height="19" rx="3.5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2.2" />
    {/* Kệ ngăn kho 2 tầng */}
    <line x1="2" y1="16.5" x2="24" y2="16.5" stroke="currentColor" strokeWidth="1.8" />
    {/* Kiện hàng tầng 1 */}
    <rect x="5" y="10" width="6" height="5" rx="1" fill="currentColor" fillOpacity="0.35" />
    <rect x="13" y="10" width="8" height="5" rx="1" fill="currentColor" fillOpacity="0.2" />
    {/* Kiện hàng tầng 2 */}
    <rect x="5" y="19" width="8" height="5" rx="1" fill="currentColor" fillOpacity="0.2" />
    <rect x="15" y="19" width="6" height="5" rx="1" fill="currentColor" fillOpacity="0.35" />
    {/* Huy hiệu pallet hàng góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <rect x="24.5" y="3" width="5" height="4" rx="0.8" fill="white" />
  </svg>
);

/** KPI 4: Khách hàng */
export const KpiCustomersSignatureIcon = ({ size = 28, className = 'text-amber-500', ...props }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    overflow="visible"
    className={`shrink-0 select-none ${className}`}
    {...props}
  >
    <circle cx="12" cy="11" r="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.2" />
    <path d="M3 26 C3 20 7 18 12 18 C17 18 21 20 21 26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="currentColor" fillOpacity="0.12" />
    {/* Huy hiệu ngôi sao khách hàng VIP góc */}
    <circle cx="27" cy="5" r="5" fill="currentColor" />
    <polygon points="27,2.8 27.8,4.3 29.5,4.5 28.2,5.7 28.6,7.3 27,6.4 25.4,7.3 25.8,5.7 24.5,4.5 26.2,4.3" fill="white" />
  </svg>
);

// ── WIDGETS DASHBOARD ──────────────────────────────────────────────────────

/** Widget Trend: Biến động Doanh thu & Tăng trưởng */
export const DashTrendSignatureIcon = ({ size = 20, className = 'text-emerald-600', ...props }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" overflow="visible" className={`shrink-0 select-none ${className}`} {...props}>
    <line x1="4" y1="5" x2="4" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4" y1="27" x2="26" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <polyline points="7,23 12,18 16,21 21,11 25,7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="7" cy="23" r="2.2" fill="currentColor"/>
    <circle cx="12" cy="18" r="2.2" fill="currentColor"/>
    <circle cx="16" cy="21" r="2.2" fill="currentColor"/>
    <circle cx="21" cy="11" r="2.2" fill="currentColor"/>
    <circle cx="27" cy="5" r="5" fill="currentColor"/>
    <path d="M28 2.2 L25.5 5.2 H28.5 L26 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

/** Widget Warning: Cảnh báo sắp hết hàng */
export const DashWarningSignatureIcon = ({ size = 20, className = 'text-amber-500', ...props }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" overflow="visible" className={`shrink-0 select-none ${className}`} {...props}>
    <path d="M14 4 L2 26 H26 L14 4 Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="14" y1="12" x2="14" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
    <circle cx="14" cy="22" r="1.5" fill="currentColor"/>
    <circle cx="27" cy="6" r="4.5" fill="currentColor"/>
    <line x1="27" y1="3.5" x2="27" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/** Widget Donut: Phân bổ tồn kho */
export const DashStockDonutSignatureIcon = ({ size = 20, className = 'text-emerald-600', ...props }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" overflow="visible" className={`shrink-0 select-none ${className}`} {...props}>
    <circle cx="13" cy="15" r="11" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.18"/>
    <circle cx="13" cy="15" r="11" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="42 28" strokeLinecap="round"/>
    <circle cx="13" cy="15" r="4" fill="currentColor" opacity="0.25"/>
    <circle cx="27" cy="5" r="5" fill="currentColor"/>
    <rect x="25" y="3" width="4" height="4" rx="0.8" fill="white"/>
  </svg>
);

/** Widget Top Products: Sản phẩm xem nhiều nhất / Bán chạy */
export const DashTopProductsSignatureIcon = ({ size = 20, className = 'text-indigo-600', ...props }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" overflow="visible" className={`shrink-0 select-none ${className}`} {...props}>
    {/* Chiếc cúp vô địch */}
    <path d="M6 7 H20 V14 C20 18 16.5 21 13 21 C9.5 21 6 18 6 14 V7 Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M6 10 H3 C3 14 6 15 6 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M20 10 H23 C23 14 20 15 20 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="13" y1="21" x2="13" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="26" x2="18" y2="26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="27" cy="5" r="5" fill="currentColor"/>
    <polygon points="27,2.8 27.8,4.3 29.5,4.5 28.2,5.7 28.6,7.3 27,6.4 25.4,7.3 25.8,5.7 24.5,4.5 26.2,4.3" fill="white"/>
  </svg>
);

