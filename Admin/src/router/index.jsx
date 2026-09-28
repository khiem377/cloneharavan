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
import AuditLogListPage from '@/pages/audit/AuditLogListPage';
import UnusedMediaPage from '@/pages/media/UnusedMediaPage';

// Inventory / Kho & Cung ứng
import SupplierListPage from '@/pages/inventory/SupplierListPage';
import PurchaseOrderListPage from '@/pages/inventory/PurchaseOrderListPage';
import PurchaseOrderCreatePage from '@/pages/inventory/PurchaseOrderCreatePage';
import StockReceivingListPage from '@/pages/inventory/StockReceivingListPage';
import StockReceivingCreatePage from '@/pages/inventory/StockReceivingCreatePage';
import PurchaseReturnListPage from '@/pages/inventory/PurchaseReturnListPage';
import PurchaseReturnCreatePage from '@/pages/inventory/PurchaseReturnCreatePage';
import StockExportListPage from '@/pages/inventory/StockExportListPage';
import StockAuditListPage from '@/pages/inventory/StockAuditListPage';
import StockAlertPage from '@/pages/inventory/StockAlertPage';
import StockMovementListPage from '@/pages/inventory/StockMovementListPage';
import InventoryReportPage from '@/pages/inventory/InventoryReportPage';
import StockDocumentListPage from '@/pages/inventory/StockDocumentListPage';

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
                    { path: 'audit-logs', element: <AuditLogListPage /> },
                    { path: 'settings', element: <PermissionGuard requiredPermission="role.manage"><ComingSoonPage title="Cài đặt hệ thống" /></PermissionGuard> },

                    // ── Kho & Cung Ứng ─────────────────────────────────────────────────────────────────────
                    { path: 'suppliers',               element: <PermissionGuard requiredPermission="supplier.view"><SupplierListPage /></PermissionGuard> },
                    { path: 'purchase-orders',         element: <PermissionGuard requiredPermission="purchase_order.view"><PurchaseOrderListPage /></PermissionGuard> },
                    { path: 'purchase-orders/create',  element: <PermissionGuard requiredPermission="purchase_order.create"><PurchaseOrderCreatePage /></PermissionGuard> },
                    { path: 'stock-receivings',        element: <PermissionGuard requiredPermission="purchase_order.view"><StockReceivingListPage /></PermissionGuard> },
                    { path: 'stock-receivings/create', element: <PermissionGuard requiredPermission="purchase_order.manage"><StockReceivingCreatePage /></PermissionGuard> },
                    { path: 'purchase-returns',        element: <PermissionGuard requiredPermission="purchase_order.view"><PurchaseReturnListPage /></PermissionGuard> },
                    { path: 'purchase-returns/create', element: <PermissionGuard requiredPermission="purchase_order.manage"><PurchaseReturnCreatePage /></PermissionGuard> },
                    { path: 'stock-exports',           element: <PermissionGuard requiredPermission="stock_export.view"><StockExportListPage /></PermissionGuard> },
                    { path: 'stock-audits',            element: <PermissionGuard requiredPermission="stock_audit.view"><StockAuditListPage /></PermissionGuard> },
                    { path: 'stock-alerts',            element: <PermissionGuard requiredPermission="stock_movement.view"><StockAlertPage /></PermissionGuard> },
                    { path: 'stock-movements',         element: <PermissionGuard requiredPermission="stock_movement.view"><StockMovementListPage /></PermissionGuard> },
                    { path: 'inventory-report',        element: <PermissionGuard requiredPermission="stock_audit.view"><InventoryReportPage /></PermissionGuard> },
                    { path: 'stock-documents',         element: <PermissionGuard requiredPermission="stock_audit.view"><StockDocumentListPage /></PermissionGuard> },

                    { path: 'media/unused', element: <PermissionGuard requiredPermission="media.manage"><UnusedMediaPage /></PermissionGuard> },

                    { path: '*', element: <ComingSoonPage title="Trang không tồn tại" /> },
                ],
            },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}

