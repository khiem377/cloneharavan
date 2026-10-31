import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import AdminShellSkeleton from '@/components/layout/AdminShellSkeleton';

function getStoredToken() {
  try {
    // Luôn dọn dẹp các key giả mạo nếu có
    if (localStorage.getItem('admin') !== null) {
      localStorage.removeItem('admin');
    }
    const stored = localStorage.getItem('admin-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored)?.state;
    return parsed?.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * ProtectedRoute - Zero-Trust Server Verification
 * 1. Tuyệt đối KHÔNG tin tưởng role hoặc permissions từ localStorage.
 * 2. Mặc định chặn toàn bộ giao diện và hiển thị Skeleton cho đến khi máy chủ Backend
 *    xác thực thành công JWT token qua GET /auth/me và trả về profile thật từ Database.
 * 3. Ngăn chặn tuyệt đối việc gõ localStorage.setItem('admin', ...) hoặc sửa đổi state:
 *    - Token giả mạo -> Backend trả về 401 -> Xóa sạch storage, đẩy về /login.
 *    - Token thật của khách hàng thường (role === 'user') -> Backend trả về role 'user' -> Chặn đứng và đẩy về /login?reason=no_admin_access.
 * 4. Lắng nghe sự kiện 'storage' để bắt quả tang bất kỳ hành vi sửa đổi dữ liệu nào trong DevTools.
 */
export default function ProtectedRoute() {
  const isServerVerified = useAuthStore((s) => s.isServerVerified);
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const token = storeToken || getStoredToken();
  const navigate = useNavigate();
  const location = useLocation();
  const isVerifyingRef = useRef(false);

  // Lắng nghe sự kiện can thiệp trực tiếp vào localStorage từ DevTools hoặc các tab khác
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'admin-auth' || e.key === 'admin' || e.key === null) {
        if (localStorage.getItem('admin') !== null) {
          localStorage.removeItem('admin');
        }
        // Khi phát hiện storage thay đổi, lập tức thu hồi quyền tạm thời và ép re-verify
        useAuthStore.setState({ isServerVerified: false });
        api.get('/auth/me')
          .then(({ data }) => {
            const freshUser = data?.data?.user;
            if (!freshUser || freshUser.role === 'user') {
              useAuthStore.getState().clearAuth();
              navigate('/login?reason=no_admin_access', { replace: true });
            } else {
              useAuthStore.getState().markServerVerified(freshUser);
            }
          })
          .catch(() => {
            useAuthStore.getState().clearAuth();
            navigate('/login?reason=session_expired', { replace: true });
          });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Luôn dọn dẹp key giả mạo nếu có
  useEffect(() => {
    if (localStorage.getItem('admin') !== null) {
      localStorage.removeItem('admin');
    }
  }, [location.pathname]);

  // Bắt buộc xác thực với Server Backend
  useEffect(() => {
    if (!token) {
      useAuthStore.getState().clearAuth();
      return;
    }

    // Nếu đã được server xác thực trong phiên hiện tại thì không cần gọi lại
    if (isServerVerified) return;

    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    api.get('/auth/me')
      .then(({ data }) => {
        const freshUser = data?.data?.user;
        if (!freshUser || freshUser.role === 'user') {
          useAuthStore.getState().clearAuth();
          navigate('/login?reason=no_admin_access', { replace: true });
          return;
        }

        // Chỉ cho phép các vai trò quản trị viên hoặc nhân viên có quyền
        if (!['admin', 'administrator', 'staff'].includes(freshUser.role)) {
          useAuthStore.getState().clearAuth();
          navigate('/login?reason=no_admin_access', { replace: true });
          return;
        }

        // Cập nhật thông tin thực tế từ database và đánh dấu server verified
        useAuthStore.getState().markServerVerified(freshUser);
      })
      .catch((err) => {
        useAuthStore.getState().clearAuth();
        navigate('/login?reason=session_expired', { replace: true });
      })
      .finally(() => {
        isVerifyingRef.current = false;
      });
  }, [token, isServerVerified, navigate]);

  // Chưa có token -> đẩy về Login ngay lập tức
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu user trong store đã từng là khách hàng thường -> xóa và cấm truy cập
  if (storeUser && storeUser.role === 'user') {
    useAuthStore.getState().clearAuth();
    return <Navigate to="/login?reason=no_admin_access" replace />;
  }

  // Đang trong quá trình chờ Server xác thực -> Hiển thị Skeleton giao diện, tuyệt đối KHÔNG lộ nội dung
  if (!isServerVerified) {
    return <AdminShellSkeleton />;
  }

  // Đã được Server xác thực hợp lệ -> Render trang
  return <Outlet />;
}

