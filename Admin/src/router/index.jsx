import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import LoginPage from '@/pages/auth/LoginPage';
import MediaPage from '@/pages/media/MediaPage';
import BannerPage from '@/pages/banners/BannerPage';
import ComingSoonPage from '@/pages/common/ComingSoonPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/banners" replace /> },
          { path: 'dashboard',  element: <ComingSoonPage title="Dashboard" /> },
          { path: 'media',      element: <MediaPage /> },
          { path: 'banners',    element: <BannerPage /> },
          { path: 'categories', element: <ComingSoonPage title="Quản lý Danh mục" /> },
          { path: 'products',   element: <ComingSoonPage title="Quản lý Sản phẩm" /> },
          { path: 'settings',   element: <ComingSoonPage title="Cài đặt hệ thống" /> },
          { path: '*',          element: <ComingSoonPage title="Trang không tồn tại" /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
