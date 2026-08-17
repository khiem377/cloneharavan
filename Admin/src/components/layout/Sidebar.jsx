import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Image, ImagePlay, Tag, ShoppingBag,
  Settings, LogOut
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/media',     icon: Image,           label: 'Media'     },
  { to: '/banners',   icon: ImagePlay,        label: 'Banners'   },
  { to: '/categories',icon: Tag,             label: 'Danh mục'  },
  { to: '/products',  icon: ShoppingBag,     label: 'Sản phẩm'  },
  { to: '/settings',  icon: Settings,        label: 'Cài đặt'   },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    clearAuth();
    navigate('/login');
    toast.info('Đã đăng xuất');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">H</div>
        <span className="logo-text">Haravan</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer – user + logout */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {(user?.name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'Admin'}</span>
            <span className="sidebar-user-email">{user?.email || ''}</span>
          </div>
        </div>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
