import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Bell, X, Eye, EyeOff, Loader2, ShieldCheck, KeyRound, User as UserIcon, Sun, Moon } from 'lucide-react';
import AppSidebar from './Sidebar';
import SessionStreamListener from '@/components/common/SessionStreamListener';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';
import { cn } from '@/lib/utils';

const PAGE_TITLES = {
  '/media':            'Thư viện tệp & ảnh',
  '/banners':          'Banner',
  '/categories':       'Danh mục sản phẩm',
  '/brands':           'Thương hiệu',
  '/products':         'Quản lý sản phẩm',
  '/products/new':     'Tạo sản phẩm mới',
  '/products/import':  'Nhập / Xuất dữ liệu',
  '/customers':        'Quản lý khách hàng',
  '/staffs':           'Nhân viên & Quản trị',
  '/roles':            'Vai trò & Quyền',
  '/menus':            'Điều hướng Menu',
  '/audit-logs':       'Nhật ký thao tác',
  '/settings':         'Cài đặt hệ thống',
  '/dashboard':        'Tổng quan hệ thống',
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

// ── Change Password Modal (Flat, 1px border, 6px radius) ───────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (form.newPassword.length < 6) e.newPassword = 'Tối thiểu 6 ký tự';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 antialiased">
      <div className="w-full max-w-md rounded-[6px] border border-border bg-card p-6 shadow-sm text-card-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Đổi mật khẩu tài khoản</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {[
            { key: 'currentPassword', label: 'Mật khẩu hiện tại', showKey: 'current' },
            { key: 'newPassword', label: 'Mật khẩu mới', showKey: 'next' },
            { key: 'confirmPassword', label: 'Xác nhận mật khẩu mới', showKey: 'confirm' },
          ].map(({ key, label, showKey }) => (
            <div className="flex flex-col gap-1.5" key={key}>
              <label className="text-xs font-semibold text-foreground">{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  className={cn(
                    'h-9 w-full rounded-[6px] border border-input bg-background pl-3 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring',
                    errors[key] && 'border-destructive focus:border-destructive focus:ring-destructive'
                  )}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={`Nhập ${label.toLowerCase()}`}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
                >
                  {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors[key] && <span className="text-[11px] font-medium text-destructive">{errors[key]}</span>}
            </div>
          ))}

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              className="h-9 px-3.5 rounded-[6px] border border-border text-xs font-semibold text-foreground hover:bg-accent transition-colors active:scale-[0.98]"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-[6px] bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
              disabled={loading}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ── Topbar (Clean, Flat, Border-b 1px, 6px controls) ──────────────────────────
function Topbar({ title }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
      localStorage.setItem('admin-theme', 'light');
    } else {
      root.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('admin-theme', 'dark');
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2.5">
        <SidebarTrigger className="-ml-1 size-8 rounded-[6px] border border-border bg-card hover:bg-accent text-foreground flex items-center justify-center transition-colors active:scale-[0.98]" />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumb>
          <BreadcrumbList className="text-xs font-medium">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Quản trị
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="size-8 flex items-center justify-center rounded-[6px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-[0.98] cursor-pointer"
          title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="size-8 flex items-center justify-center rounded-[6px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-[0.98] cursor-pointer"
          title="Thông báo"
        >
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}

// ── AdminLayout ───────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const [modal, setModal] = useState(null); // 'profile' | 'changepass'

  useEffect(() => {
    window.__navigate__ = (...args) => navigateRef.current(...args);
    return () => {
      delete window.__navigate__;
    };
  }, []);

  const title =
    Object.entries(PAGE_TITLES).find(
      ([key]) => pathname === key || (key !== '/' && pathname.startsWith(key + '/'))
    )?.[1] ?? 'Bảng điều khiển';

  return (
    <SidebarProvider defaultOpen={true}>
      <SessionStreamListener />
      <AppSidebar
        onProfile={() => navigate('/profile')}
        onChangePass={() => setModal('changepass')}
      />
      <SidebarInset className="min-h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-background">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12 text-muted-foreground text-xs font-mono">
                <Loader2 className="size-4 animate-spin mr-2" /> Đang tải dữ liệu...
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>

      {/* Modals */}
      {modal === 'changepass' && <ChangePasswordModal onClose={() => setModal(null)} />}
    </SidebarProvider>
  );
}


