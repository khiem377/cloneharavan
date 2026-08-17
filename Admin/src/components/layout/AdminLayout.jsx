import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useEffect } from 'react';

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

  useEffect(() => {
    window.__navigate__ = navigate;
    return () => { delete window.__navigate__; };
  }, [navigate]);

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-content">
        <Topbar title={title} />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
