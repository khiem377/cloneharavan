import { useState, useRef, useEffect } from 'react';
import { Bell, User, KeyRound, LogOut, Eye, EyeOff, Loader2, ChevronRight, X, Menu } from '@/components/ui/Icons';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';
import { useNavigate } from 'react-router-dom';

// ── Change Password Modal ──────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

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
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
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
            {/* Current Pass */}
            <div className="form-group">
              <label className="form-label">Mật khẩu hiện tại</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input
                  type={show.current ? 'text' : 'password'}
                  className="field-input"
                  style={{ paddingRight: 36 }}
                  value={form.currentPassword}
                  onChange={e => set('currentPassword', e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                  onClick={() => setShow(p => ({ ...p, current: !p.current }))}
                >
                  {show.current ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.currentPassword && <span className="form-error">{errors.currentPassword}</span>}
            </div>

            {/* New Pass */}
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input
                  type={show.next ? 'text' : 'password'}
                  className="field-input"
                  style={{ paddingRight: 36 }}
                  value={form.newPassword}
                  onChange={e => set('newPassword', e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                  onClick={() => setShow(p => ({ ...p, next: !p.next }))}
                >
                  {show.next ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
            </div>

            {/* Confirm Pass */}
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input
                  type={show.confirm ? 'text' : 'password'}
                  className="field-input"
                  style={{ paddingRight: 36 }}
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                  onClick={() => setShow(p => ({ ...p, confirm: !p.confirm }))}
                >
                  {show.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
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

// ── Profile Modal ────────────────────────────────────────────────────────────
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
          {/* Avatar Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#0f172a', color: '#fff',
              fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {initials}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{user?.fullName || 'Admin User'}</h4>
              <span style={{
                display: 'inline-block', marginTop: 4, padding: '2px 10px', borderRadius: 12,
                fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#475569', textTransform: 'uppercase'
              }}>
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Họ và tên</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{user?.fullName || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Email</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{user?.email || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Số điện thoại</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{user?.phone || '—'}</span>
            </div>
          </div>
        </div>

        <div className="custom-modal-footer">
          <button className="btn-primary-sm" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Topbar ───────────────────────────────────────────────────────────────
export default function Topbar({ title, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'profile' | 'changepass'
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await authService.logout(); } catch (_) {}
    clearAuth();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  const initials = (user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase();

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle Menu">
            <Menu size={20} />
          </button>
          <h1 className="topbar-title">{title}</h1>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" aria-label="Thông báo">
            <Bell size={18} />
          </button>

          {/* User Menu Trigger & Popover */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="topbar-avatar"
              title={user?.fullName || 'Admin'}
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div className="topbar-dropdown">
                {/* Header User Card */}
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar-circle">
                    {initials}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">
                      {user?.fullName || 'Admin'}
                    </span>
                    <span className="dropdown-user-email">
                      {user?.email || 'admin@gmail.com'}
                    </span>
                  </div>
                </div>

                <div className="ctx-divider" />

                {/* Options */}
                <button
                  onClick={() => { setDropdownOpen(false); setModal('profile'); }}
                  className="dropdown-item-btn"
                >
                  <User size={15} style={{ color: '#64748b' }} />
                  <span>Thông tin tài khoản</span>
                  <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); setModal('changepass'); }}
                  className="dropdown-item-btn"
                >
                  <KeyRound size={15} style={{ color: '#64748b' }} />
                  <span>Đổi mật khẩu</span>
                  <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
                </button>

                <div className="ctx-divider" />

                <button
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  className="dropdown-item-btn danger"
                >
                  <LogOut size={15} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {modal === 'profile' && (
        <ProfileModal user={user} onClose={() => setModal(null)} />
      )}

      {modal === 'changepass' && (
        <ChangePasswordModal onClose={() => setModal(null)} />
      )}
    </>
  );
}
