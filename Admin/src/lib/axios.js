import axios from 'axios';
import useAuthStore from '../store/authStore';
import { toast } from '../providers/ToastProvider';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Routes không cần kích hoạt refresh token khi gặp 401
const AUTH_ROUTES = ['/auth/login', '/auth/google', '/auth/refresh-token', '/auth/register', '/auth/logout'];
const isAuthRoute = (url = '') => AUTH_ROUTES.some((r) => url.includes(r));

// ── Instance chính dùng cho toàn app Admin ─────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Instance riêng để gọi refresh token (không bị interceptor lặp vòng) ─────────
const authApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// ── Queue các request đồng thời đang chờ token mới trong khi refresh ──────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// ── Request interceptor – gắn Bearer token & x-session-id vào header ───────────
api.interceptors.request.use(
  (config) => {
    const { accessToken, anonymousId, getOrCreateAnonymousId } = useAuthStore.getState();

    // 1. Gắn Bearer Token nếu đã đăng nhập
    if (accessToken) {
      if (config.headers?.set) {
        config.headers.set('Authorization', `Bearer ${accessToken}`);
      } else if (config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // 2. Gắn anonymousId làm x-session-id để Backend tracking hoạt động
    const sessionId = anonymousId || getOrCreateAnonymousId();
    if (sessionId) {
      if (config.headers?.set) {
        config.headers.set('x-session-id', sessionId);
      } else if (config.headers) {
        config.headers['x-session-id'] = sessionId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor – tự động refresh khi gặp 401 & xử lý 403 ─────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 1. Xử lý lỗi 403 Forbidden
    if (status === 403) {
      const message = error.response?.data?.message || 'Bạn không có quyền thực hiện thao tác này';
      
      // Nếu tài khoản bị khóa / vô hiệu hóa
      if (
        message.toLowerCase().includes('deactivated') ||
        message.toLowerCase().includes('khóa') ||
        message.toLowerCase().includes('bị khóa')
      ) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('session:force_logout', {
              detail: { reason: message || 'Tài khoản quản trị của bạn đã bị khóa.' },
            })
          );
        }
      }
      return Promise.reject(error);
    }

    // 2. Bỏ qua nếu không phải 401, hoặc request đã retry rồi, hoặc thuộc auth routes
    if (!originalRequest || status !== 401 || originalRequest._retry || isAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    // 3. Nếu đang có một tiến trình refresh token đang chạy -> xếp vào hàng đợi
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest._retry = true;
          if (originalRequest.headers?.set) {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
          } else if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // 4. Bắt đầu tiến trình refresh token
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken } = useAuthStore.getState();
      
      // Gửi cả httpOnly cookie và body refreshToken để tương thích tối đa với BE
      const { data } = await authApi.post(
        '/auth/refresh-token',
        refreshToken ? { refreshToken } : {}
      );

      const newAccessToken = data.data?.accessToken;
      const newRefreshToken = data.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error('Dữ liệu accessToken mới không tồn tại');
      }

      // Lưu token mới vào Zustand store
      useAuthStore.getState().setAuth({
        user: useAuthStore.getState().user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || refreshToken,
      });

      // Giải phóng hàng đợi các request đang chờ
      processQueue(null, newAccessToken);

      // Thực thi lại request ban đầu với token mới
      if (originalRequest.headers?.set) {
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
      } else if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại -> Hủy hàng đợi, xóa sạch auth và chuyển hướng về /login
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?reason=session_expired';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
