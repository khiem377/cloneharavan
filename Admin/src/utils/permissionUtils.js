/**
 * permissionUtils.js
 * Helper tính toán đường dẫn chuyển hướng mặc định theo quyền hạn thực tế của tài khoản.
 */

export function getDefaultRedirectPath(user) {
  if (!user) return '/login';

  // Administrator hoặc Super Admin -> Luôn về Dashboard
  if (user.role === 'administrator' || user.role === 'admin' || user.permissions?.includes('*')) {
    return '/dashboard';
  }

  const permissions = user.permissions || [];

  // Thứ tự ưu tiên chuyển hướng thông minh dựa vào quyền khả dụng:
  if (permissions.includes('dashboard.view')) return '/dashboard';
  if (permissions.includes('order.view') || permissions.includes('order.manage')) return '/orders';
  if (permissions.includes('product.view')) return '/products';
  if (permissions.includes('purchase_order.view') || permissions.includes('purchase_order.manage')) return '/warehouses';
  if (permissions.includes('promotion.view') || permissions.includes('promotion.manage')) return '/promotions/coupons';
  if (permissions.includes('user.view') || permissions.includes('user.manage')) return '/customers';
  if (permissions.includes('blog.view') || permissions.includes('blog.create') || permissions.includes('blog.edit')) return '/blog/posts';
  if (permissions.includes('media.manage') || permissions.includes('media.upload')) return '/media';
  if (permissions.includes('category.manage')) return '/categories';
  if (permissions.includes('brand.manage')) return '/brands';
  if (permissions.includes('menu.manage')) return '/menus';
  if (permissions.includes('role.manage') || permissions.includes('role.assign')) return '/roles';
  if (permissions.includes('setting.view') || permissions.includes('setting.manage')) return '/settings';
  if (permissions.includes('audit_log.view')) return '/audit-logs';

  // Trường hợp không có bất kỳ quyền nào trong các trang chính
  return '/403';
}

