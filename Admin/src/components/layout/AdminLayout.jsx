import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Bell, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import AppSidebar from './Sidebar';
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

const PAGE_TITLES = {
  '/media':            'Thư viện ảnh',
  '/banners':          'Banners',
  '/categories':       'Danh mục',
  '/brands':           'Thương hiệu',
  '/products':         'Sản phẩm',
  '/products/new':     'Tạo sản phẩm mới',
  '/products/import':  'Import / Export',
  '/settings':         'Cài đặt',
  '/dashboard':        'Dashboard',
};

// ── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => { setForm(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (form.newPassword.length < 6) e.newPassword = 'Tối thiểu 6 ký tự';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Không khớp mật khẩu mới';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Đổi mật khẩu thành công');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-box" onClick={e => e.stopPropagation()}>
        <div className="custom-modal-header">
          <h3 className="custom-modal-title">Đổi mật khẩu</h3>
          <button className="custom-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="custom-modal-body">
            {[
              { key: 'currentPassword', label: 'Mật khẩu hiện tại', showKey: 'current' },
              { key: 'newPassword',     label: 'Mật khẩu mới',      showKey: 'next'    },
              { key: 'confirmPassword', label: 'Xác nhận mật khẩu', showKey: 'confirm' },
            ].map(({ key, label, showKey }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={show[showKey] ? 'text' : 'password'}
                    className="field-input"
                    style={{ paddingRight: 36 }}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={`Nhập ${label.toLowerCase()}`}
                  />
                  <button
                    type="button"
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                    onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
                  >
                    {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors[key] && <span className="form-error">{errors[key]}</span>}
              </div>
            ))}
          </div>
          <div className="custom-modal-footer">
            <button type="button" className="btn-ghost-sm" onClick={onClose} disabled={loading}>Hủy</button>
            <button type="submit" className="btn-primary-sm" disabled={loading}>
              {loading ? <Loader2 size={13} className="spin" /> : null} Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ user, onClose }) {
  const initials = (user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase();
  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-box" onClick={e => e.stopPropagation()}>
        <div className="custom-modal-header">
          <h3 className="custom-modal-title">Thông tin tài khoản</h3>
          <button className="custom-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="custom-modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0f172a', color: '#fff', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {initials}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{user?.fullName || 'Admin User'}</h4>
              <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#475569', textTransform: 'uppercase' }}>
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #f1f5f9' }}>
            {[['Họ và tên', user?.fullName], ['Email', user?.email], ['Số điện thoại', user?.phone]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="custom-modal-footer">
          <button className="btn-primary-sm" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ title }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Quản trị</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}

// ── AdminLayout ───────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'profile' | 'changepass'

  useEffect(() => {
    window.__navigate__ = navigate;
    return () => { delete window.__navigate__; };
  }, [navigate]);

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || (key !== '/' && pathname.startsWith(key + '/'))
  )?.[1] ?? 'Admin';

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        onProfile={() => setModal('profile')}
        onChangePass={() => setModal('changepass')}
      />
      <SidebarInset>
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>

      {/* Modals */}
      {modal === 'profile' && <ProfileModal user={useAuthStore.getState().user} onClose={() => setModal(null)} />}
      {modal === 'changepass' && <ChangePasswordModal onClose={() => setModal(null)} />}
    </SidebarProvider>
  );
}
