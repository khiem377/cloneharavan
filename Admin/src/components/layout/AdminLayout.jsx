import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import AppSidebar from './Sidebar';
import Topbar from './Topbar';
import SessionStreamListener from '@/components/common/SessionStreamListener';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import CommandPalette from '@/components/command/CommandPalette';
import AdminTourGuide from '@/components/tour/AdminTourGuide';
import ChangePasswordModal from './modals/ChangePasswordModal';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const PAGE_TITLES = {
  '/notifications':    'Thông báo',
  '/media':            'Thư viện tệp & ảnh',
  '/banners':          'Banner',
  '/categories':       'Danh mục sản phẩm',
  '/brands':           'Thương hiệu',
  '/products':         'Quản lý sản phẩm',
  '/products/new':     'Tạo sản phẩm mới',
  '/products/import':  'Nhập / Xuất dữ liệu',
  '/products/combos':  'Combo sản phẩm',
  '/orders':           'Quản lý đơn hàng',
  '/orders/':          'Chi tiết đơn hàng',
  '/shipments/overview': 'Tổng quan vận chuyển',
  '/shipments':        'Danh sách vận đơn',
  '/customers':        'Danh sách khách hàng',
  '/customers/groups': 'Nhóm khách hàng',
  '/staffs':           'Nhân viên & Quản trị',
  '/roles':            'Vai trò & Quyền',
  '/menus':            'Điều hướng Menu',
  '/audit-logs':       'Nhật ký thao tác',
  '/settings':         'Cài đặt hệ thống',
  '/dashboard':        'Tổng quan hệ thống',
  '/warehouses':       'Quản lý kho hàng',
  '/warehouse-map':    'Sơ đồ kho hàng hóa 2D',
  '/stock-transfers':  'Chuyển kho nội bộ',
  '/stock-documents':  'Đơn & Phiếu kho',
  '/suppliers':        'Nhà cung cấp',
  '/purchase-orders':  'Đơn mua hàng (PO)',
  '/stock-receivings': 'Phiếu nhập kho (PNK)',
  '/purchase-returns': 'Trả hàng nhập',
  '/stock-exports':    'Phiếu xuất kho',
  '/stock-audits':     'Kiểm kê & Cân bằng',
  '/stock-alerts':     'Cảnh báo hết kho',
  '/inventory-report': 'Báo cáo tồn kho',
  '/stock-movements':  'Nhật ký biến động',
  '/promotions/coupons':     'Mã giảm giá (Coupon)',
  '/promotions/discounts':   'Chương trình ưu đãi',
  '/promotions/gifts':       'Quà tặng kèm',
  '/promotions/flash-sales': 'Flash Sale giờ vàng',
  '/blog/posts':       'Danh sách bài viết',
  '/blog/posts/new':   'Viết bài mới',
  '/blog/categories':  'Chuyên mục bài viết',
  '/blog/tags':        'Thẻ tag phân loại',
  '/profile':          'Hồ sơ tài khoản & Quản trị',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [modal, setModal] = useState(null); // 'changepass'
  const [commandOpen, setCommandOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    window.__navigate__ = (...args) => navigateRef.current(...args);
    return () => {
      delete window.__navigate__;
    };
  }, []);

  // Global Keyboard Listener for Ctrl + K / Cmd + K
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const title =
    Object.entries(PAGE_TITLES).find(
      ([key]) => pathname === key || (key !== '/' && pathname.startsWith(key + '/'))
    )?.[1] ?? 'Bảng điều khiển';

  return (
    <SidebarProvider defaultOpen={true}>
      <SessionStreamListener />
      <div data-tour="sidebar">
        <AppSidebar
          onProfile={() => navigate('/profile')}
          onChangePass={() => setModal('changepass')}
        />
      </div>

      <SidebarInset className="min-h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-background">
        <Topbar
          title={title}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onStartTour={() => setTourOpen(true)}
        />

        <main data-tour="workspace" className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="space-y-6 max-w-7xl mx-auto animate-pulse select-none">
                  <div className="space-y-2">
                    <div className="h-6 w-48 rounded-[4px] bg-muted/70" />
                    <div className="h-3.5 w-80 rounded-[4px] bg-muted/50" />
                  </div>
                  <div className="rounded-[6px] border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="h-4 w-32 rounded-[4px] bg-muted/70" />
                      <div className="h-8 w-24 rounded-[6px] bg-muted/60" />
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="h-10 w-full rounded-[6px] bg-muted/40" />
                      <div className="h-10 w-full rounded-[6px] bg-muted/30" />
                      <div className="h-10 w-full rounded-[6px] bg-muted/40" />
                    </div>
                  </div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </SidebarInset>

      {/* Command Palette Spotlight (Ctrl + K) */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onChangePass={() => setModal('changepass')}
        onStartTour={() => setTourOpen(true)}
      />

      {/* Interactive Mascot Tour Guide */}
      <AdminTourGuide
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      {/* Change Password Modal */}
      {modal === 'changepass' && <ChangePasswordModal onClose={() => setModal(null)} />}
    </SidebarProvider>
  );
}
