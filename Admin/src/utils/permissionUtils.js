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
  if (permissions.includes('product.view')) return '/products';
  if (permissions.includes('blog.view')) return '/blog/posts';
  if (permissions.includes('promotion.view')) return '/promotions/coupons';
  if (permissions.includes('media.manage')) return '/media';
  if (permissions.includes('category.manage')) return '/categories';
  if (permissions.includes('brand.manage')) return '/brands';
  if (permissions.includes('menu.manage')) return '/menus';
  if (permissions.includes('role.manage')) return '/roles';

  // Trường hợp không có bất kỳ quyền nào trong các trang chính
  return '/403';
}
