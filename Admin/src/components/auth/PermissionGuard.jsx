import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import AccessDeniedPage from '../../pages/auth/AccessDeniedPage';

/**
 * PermissionGuard - Bọc bọc các Route cần kiểm tra quyền trực tiếp từ URL
 * @param {string} props.requiredPermission - Mã quyền bắt buộc (ví dụ: 'product.view')
 * @param {string[]} props.requiredPermissions - Mảng mảng quyền (chỉ cần có 1 quyền)
 */
const PermissionGuard = ({ requiredPermission, requiredPermissions, children }) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);

  let allowed = false;

  if (requiredPermission) {
    allowed = hasPermission(requiredPermission);
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    allowed = hasAnyPermission(requiredPermissions);
  } else {
    allowed = true;
  }

  if (!allowed) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};

export default PermissionGuard;
