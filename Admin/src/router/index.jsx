import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import LoginPage from '@/pages/auth/LoginPage';
import MediaPage from '@/pages/media/MediaPage';
import BannerPage from '@/pages/banners/BannerPage';
import CategoryPage from '@/pages/categories/CategoryPage';
import BrandPage from '@/pages/brands/BrandPage';
import ProductListPage from '@/pages/products/ProductListPage';
import ProductFormPage from '@/pages/products/ProductFormPage';
import ImportExportPage from '@/pages/products/ImportExportPage';
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
          { path: 'dashboard',         element: <ComingSoonPage title="Dashboard" /> },
          { path: 'media',             element: <MediaPage /> },
          { path: 'banners',           element: <BannerPage /> },
          { path: 'categories',        element: <CategoryPage /> },
          { path: 'brands',            element: <BrandPage /> },
          { path: 'products',          element: <ProductListPage /> },
          { path: 'products/new',      element: <ProductFormPage /> },
          { path: 'products/import',   element: <ImportExportPage /> },
          { path: 'products/:id/edit', element: <ProductFormPage /> },
          { path: 'settings',          element: <ComingSoonPage title="Cai dat he thong" /> },
          { path: '*',                 element: <ComingSoonPage title="Trang khong ton tai" /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
