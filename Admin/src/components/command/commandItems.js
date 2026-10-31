import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Boxes,
  ClipboardCheck,
  Truck,
  Users,
  Tags,
  Zap,
  FolderTree,
  Bell,
  Settings,
  Plus,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const COMMAND_ITEMS = [
  // Nhóm 1: Điều hướng phân hệ
  { id: 'p-dash', title: 'Tổng quan hệ thống', group: 'Phân hệ', path: '/dashboard', icon: LayoutDashboard },
  { id: 'p-orders', title: 'Quản lý Đơn hàng', group: 'Phân hệ', path: '/orders', icon: ShoppingCart },
  { id: 'p-shipments', title: 'Vận chuyển & Vận đơn', group: 'Phân hệ', path: '/shipments', icon: Truck },
  { id: 'p-products', title: 'Danh mục Sản phẩm', group: 'Phân hệ', path: '/products', icon: Package },
  { id: 'p-warehouses', title: 'Quản lý Kho hàng & Điểm lưu trữ', group: 'Phân hệ', path: '/warehouses', icon: Warehouse },
  { id: 'p-inventory', title: 'Báo cáo Tồn kho đa điểm', group: 'Phân hệ', path: '/inventory-report', icon: Boxes },
  { id: 'p-stock-audit', title: 'Kiểm kê & Cân bằng kho', group: 'Phân hệ', path: '/stock-audits', icon: ClipboardCheck },
  { id: 'p-stock-receive', title: 'Phiếu Nhập kho (PNK)', group: 'Phân hệ', path: '/stock-receivings', icon: Plus },
  { id: 'p-stock-export', title: 'Phiếu Xuất kho', group: 'Phân hệ', path: '/stock-exports', icon: ArrowRight },
  { id: 'p-promotions', title: 'Mã giảm giá (Coupon)', group: 'Phân hệ', path: '/promotions/coupons', icon: Tags },
  { id: 'p-flashsale', title: 'Flash Sale giờ vàng', group: 'Phân hệ', path: '/promotions/flash-sales', icon: Zap },
  { id: 'p-media', title: 'Thư viện Ảnh & Tệp (DAM)', group: 'Phân hệ', path: '/media', icon: FolderTree },
  { id: 'p-customers', title: 'Khách hàng & Nhóm khách', group: 'Phân hệ', path: '/customers', icon: Users },
  { id: 'p-notifications', title: 'Trung tâm Thông báo', group: 'Phân hệ', path: '/notifications', icon: Bell },
  { id: 'p-settings', title: 'Cài đặt hệ thống', group: 'Phân hệ', path: '/settings', icon: Settings },

  // Nhóm 2: Thao tác nhanh (Quick Actions)
  { id: 'a-new-prod', title: 'Thêm sản phẩm mới', group: 'Thao tác nhanh', path: '/products/new', icon: Plus, badge: 'Mới' },
  { id: 'a-new-coupon', title: 'Tạo mã giảm giá mới', group: 'Thao tác nhanh', path: '/promotions/coupons', icon: Tags },
  { id: 'a-new-po', title: 'Tạo đơn đặt hàng nhập kho', group: 'Thao tác nhanh', path: '/purchase-orders', icon: Plus },
  { id: 'a-password', title: 'Đổi mật khẩu tài khoản Admin', group: 'Thao tác nhanh', action: 'changepass', icon: KeyRound },
  { id: 'a-tour', title: 'Khởi động Hướng dẫn sử dụng (Tour Guide)', group: 'Thao tác nhanh', action: 'start-tour', icon: Sparkles, badge: 'Hướng dẫn' },
];

export function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
