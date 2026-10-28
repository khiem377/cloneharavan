import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import AdminShellSkeleton from '@/components/layout/AdminShellSkeleton';

function getStoredAuth() {
  try {
    const stored = localStorage.getItem('admin-auth');
    if (!stored) return { token: null, user: null };
    const parsed = JSON.parse(stored)?.state;
    return { token: parsed?.accessToken, user: parsed?.user };
  } catch {
    return { token: null, user: null };
  }
}

/**
 * ProtectedRoute
 * 1. Optimistic Render: Đọc token & user từ storage để render giao diện ngay lập tức (0ms).
 * 2. Background Revalidation (SWR): Gọi GET /auth/me ngầm để đồng bộ user/permissions mới nhất.
 *    - Nếu 401: clearAuth + redirect về /login
 *    - Nếu thành công: cập nhật thông tin mới nhất vào store
 * 3. Nếu cần chờ đồng bộ: render AdminShellSkeleton thay vì trả về null gây trắng trang.
 */
export default function ProtectedRoute() {
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const { token: localToken, user: localUser } = getStoredAuth();

  const token = storeToken || localToken;
  const user = storeUser || localUser;
  const navigate = useNavigate();
  const hasSynced = useRef(false);

  // Nhận diện nếu user hiện tại là khách hàng thường (bị nhiễm token từ client)
  const isCustomer = Boolean(user && user.role === 'user');

  // Nếu đã có token và user hợp lệ quản trị trong storage -> render ngay (không chặn màn hình)
  const isOptimisticReady = Boolean(token && user && !isCustomer);
  const [syncing, setSyncing] = useState(!isOptimisticReady);

  useEffect(() => {
    // Tài khoản khách hàng thường tuyệt đối không được phép ở lại Admin
    if (isCustomer) {
      useAuthStore.getState().clearAuth();
      navigate('/login?reason=no_admin_access', { replace: true });
      return;
    }

    if (!token || hasSynced.current) {
      setSyncing(false);
      return;
    }
    hasSynced.current = true;

    api.get('/auth/me')
      .then(({ data }) => {
        const freshUser = data?.data?.user;
        if (freshUser) {
          if (freshUser.role === 'user') {
            useAuthStore.getState().clearAuth();
            navigate('/login?reason=no_admin_access', { replace: true });
            return;
          }
          useAuthStore.getState().setAuth({
            user: freshUser,
            accessToken: useAuthStore.getState().accessToken || token,
            refreshToken: useAuthStore.getState().refreshToken,
          });
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          useAuthStore.getState().clearAuth();
          navigate('/login?reason=session_expired', { replace: true });
        }
      })
      .finally(() => {
        setSyncing(false);
      });
  }, [navigate, token, isCustomer]);

  // Chưa có token hoặc là khách hàng thường → về login ngay
  if (!token) return <Navigate to="/login" replace />;
  if (isCustomer) {
    useAuthStore.getState().clearAuth();
    return <Navigate to="/login?reason=no_admin_access" replace />;
  }

  // Đang đồng bộ lần đầu mà chưa có dữ liệu lạc quan -> hiển thị Skeleton khung giao diện
  if (syncing) {
    return <AdminShellSkeleton />;
  }

  return <Outlet />;
}
