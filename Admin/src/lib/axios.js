import axios from 'axios';
import useAuthStore from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Routes không cần refresh token
const AUTH_ROUTES = ['/auth/login', '/auth/refresh-token', '/auth/register'];
const isAuthRoute = (url = '') => AUTH_ROUTES.some((r) => url.includes(r));

// ── Instance chính dùng cho toàn app ──────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Instance riêng để gọi refresh (không bị interceptor vòng lặp) ────────────
const authApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ── Queue các request đang chờ khi đang refresh ───────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// ── Request interceptor – gắn accessToken vào header ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor – tự động refresh khi gặp 401 ───────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Bỏ qua: không phải 401, đã retry, hoặc là auth route (login, refresh...)
    if (status !== 401 || originalRequest._retry || isAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Nếu đang refresh → đưa vào queue chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Bắt đầu refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken } = useAuthStore.getState();
      // authApi có withCredentials: true nên browser tự động gửi httpOnly Cookie
      const { data } = await authApi.post('/auth/refresh-token', refreshToken ? { refreshToken } : {});
      const newAccessToken  = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      useAuthStore.getState().setAuth({
        user:         useAuthStore.getState().user,
        accessToken:  newAccessToken,
        refreshToken: newRefreshToken,
      });

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      window.__navigate__?.('/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
