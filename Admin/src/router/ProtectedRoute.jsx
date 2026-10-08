import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';

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
 * 1. Kiểm tra token trong localStorage (sync, không gây nhấp nháy).
 * 2. Sau khi mount, gọi GET /auth/me để đồng bộ user/permissions mới nhất từ BE.
 *    - Nếu 401 → clearAuth + redirect /login?reason=session_expired
 *    - Nếu thành công → cập nhật store với permissions mới (ví dụ ['*'] sau khi admin được sync)
 */
export default function ProtectedRoute() {
  const { token, user } = getStoredAuth();
  const navigate = useNavigate();
  const hasSynced = useRef(false);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    if (!token || hasSynced.current) {
      setSyncing(false);
      return;
    }
    hasSynced.current = true;

    api.get('/auth/me')
      .then(({ data }) => {
        const freshUser = data?.data?.user;
        if (freshUser) {
          // Cập nhật store với thông tin user + permissions mới nhất
          useAuthStore.getState().setAuth({
            user: freshUser,
            accessToken: useAuthStore.getState().accessToken,
            refreshToken: useAuthStore.getState().refreshToken,
          });
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        // 401: token hết hạn / không hợp lệ → đẩy về login
        if (status === 401) {
          useAuthStore.getState().clearAuth();
          navigate('/login?reason=session_expired', { replace: true });
        }
        // 403, 500, network error: bỏ qua, không làm gián đoạn session
      })
      .finally(() => {
        setSyncing(false);
      });
  }, [navigate, token]);

  // Chưa có token → về login ngay
  if (!token) return <Navigate to="/login" replace />;

  // Tài khoản khách hàng thường không được vào admin
  if (user && user.role === 'user') {
    return <Navigate to="/login?reason=no_admin_access" replace />;
  }

  // Đang đồng bộ lần đầu → giữ nguyên (không render children để tránh flash permission cũ)
  if (syncing) return null;

  return <Outlet />;
}
