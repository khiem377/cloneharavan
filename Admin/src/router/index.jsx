import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
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
import FlashSalePage from '@/pages/promotions/FlashSalePage';
import ComingSoonPage from '@/pages/common/ComingSoonPage';
import BlogPostListPage from '@/pages/blog/BlogPostListPage';
import BlogPostFormPage from '@/pages/blog/BlogPostFormPage';
import BlogCategoryPage from '@/pages/blog/BlogCategoryPage';
import BlogTagPage from '@/pages/blog/BlogTagPage';
import PermissionGuard from '@/components/auth/PermissionGuard';
import AccessDeniedPage from '@/pages/auth/AccessDeniedPage';
import RoleListPage from '@/pages/roles/RoleListPage';
import MenuListPage from '@/pages/menus/MenuListPage';
import MenuEditorPage from '@/pages/menus/MenuEditorPage';

import RootRedirector from '@/components/auth/RootRedirector';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: <AccessDeniedPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <RootRedirector /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'media', element: <PermissionGuard requiredPermission="media.manage"><MediaPage /></PermissionGuard> },
          { path: 'banners', element: <PermissionGuard requiredPermission="media.manage"><BannerPage /></PermissionGuard> },
          { path: 'categories', element: <PermissionGuard requiredPermission="category.manage"><CategoryPage /></PermissionGuard> },
          { path: 'brands', element: <PermissionGuard requiredPermission="brand.manage"><BrandPage /></PermissionGuard> },
          { path: 'products', element: <PermissionGuard requiredPermission="product.view"><ProductListPage /></PermissionGuard> },
          { path: 'products/new', element: <PermissionGuard requiredPermission="product.create"><ProductFormPage /></PermissionGuard> },
          { path: 'products/import', element: <PermissionGuard requiredPermission="product.create"><ImportExportPage /></PermissionGuard> },
          { path: 'products/:id/edit', element: <PermissionGuard requiredPermission="product.edit"><ProductFormPage /></PermissionGuard> },
          { path: 'products/:id/variants', element: <PermissionGuard requiredPermission="product.view"><ProductVariantsPage /></PermissionGuard> },
          { path: 'products/:id/variants/:variantId/edit', element: <PermissionGuard requiredPermission="product.edit"><VariantEditPage /></PermissionGuard> },
          { path: 'promotions/coupons', element: <PermissionGuard requiredPermission="promotion.view"><CouponPage /></PermissionGuard> },
          { path: 'promotions/discounts', element: <PermissionGuard requiredPermission="promotion.manage"><PromotionPage /></PermissionGuard> },
          { path: 'promotions/gifts', element: <PermissionGuard requiredPermission="promotion.manage"><GiftProgramPage /></PermissionGuard> },
          { path: 'promotions/flash-sales', element: <PermissionGuard requiredPermission="promotion.manage"><FlashSalePage /></PermissionGuard> },
          { path: 'blog/posts', element: <PermissionGuard requiredPermission="blog.view"><BlogPostListPage /></PermissionGuard> },
          { path: 'blog/posts/new', element: <PermissionGuard requiredPermission="blog.create"><BlogPostFormPage /></PermissionGuard> },
          { path: 'blog/posts/:id/edit', element: <PermissionGuard requiredPermission="blog.edit"><BlogPostFormPage /></PermissionGuard> },
          { path: 'blog/categories', element: <PermissionGuard requiredPermission="blog.edit"><BlogCategoryPage /></PermissionGuard> },
          { path: 'blog/tags', element: <PermissionGuard requiredPermission="blog.edit"><BlogTagPage /></PermissionGuard> },
          { path: 'menus', element: <PermissionGuard requiredPermission="menu.manage"><MenuListPage /></PermissionGuard> },
          { path: 'menus/:id/edit', element: <PermissionGuard requiredPermission="menu.manage"><MenuEditorPage /></PermissionGuard> },
          { path: 'roles', element: <PermissionGuard requiredPermission="role.manage"><RoleListPage /></PermissionGuard> },
          { path: 'settings', element: <PermissionGuard requiredPermission="role.manage"><ComingSoonPage title="Cài đặt hệ thống" /></PermissionGuard> },
          { path: '*', element: <ComingSoonPage title="Trang không tồn tại" /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
