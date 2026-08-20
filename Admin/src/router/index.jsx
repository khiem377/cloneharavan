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
import ProductVariantsPage from '@/pages/products/ProductVariantsPage';
import VariantEditPage from '@/pages/products/VariantEditPage';
import ImportExportPage from '@/pages/products/ImportExportPage';
import CouponPage from '@/pages/promotions/CouponPage';
import PromotionPage from '@/pages/promotions/PromotionPage';
import GiftProgramPage from '@/pages/promotions/GiftProgramPage';
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
          { index: true, element: <Navigate to="/products" replace /> },
          { path: 'dashboard', element: <ComingSoonPage title="Dashboard" /> },
          { path: 'media', element: <MediaPage /> },
          { path: 'banners', element: <BannerPage /> },
          { path: 'categories', element: <CategoryPage /> },
          { path: 'brands', element: <BrandPage /> },
          { path: 'products', element: <ProductListPage /> },
          { path: 'products/new', element: <ProductFormPage /> },
          { path: 'products/import', element: <ImportExportPage /> },
          { path: 'products/:id/edit', element: <ProductFormPage /> },
          { path: 'products/:id/variants', element: <ProductVariantsPage /> },
          { path: 'products/:id/variants/:variantId/edit', element: <VariantEditPage /> },
          { path: 'promotions/coupons', element: <CouponPage /> },
          { path: 'promotions/discounts', element: <PromotionPage /> },
          { path: 'promotions/gifts', element: <GiftProgramPage /> },
          { path: 'settings', element: <ComingSoonPage title="Cài đặt hệ thống" /> },
          { path: '*', element: <ComingSoonPage title="Trang không tồn tại" /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
