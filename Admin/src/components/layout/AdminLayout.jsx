import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useEffect, useState } from 'react';

const pageTitles = {
  '/media': 'Thư viện ảnh',
  '/banners': 'Banners',
  '/categories': 'Danh mục',
  '/products': 'Sản phẩm',
  '/settings': 'Cài đặt',
  '/dashboard': 'Dashboard',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? 'Admin';
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    window.__navigate__ = navigate;
    return () => { delete window.__navigate__; };
  }, [navigate]);

  // Auto-close mobile sidebar on page navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="admin-shell">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="admin-content">
        <Topbar
          title={title}
          onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
