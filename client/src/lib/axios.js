import axios from 'axios';
import useAuthStore from '../store/authStore';

const BASE_URL =
  typeof window !== 'undefined'
    ? '/api/v1'
    : process.env.API_SERVER_URL || 'http://localhost:5000/api/v1';

const AUTH_ROUTES = ['/auth/login', '/auth/refresh-token', '/auth/register', '/auth/forgot-password'];
const isAuthRoute = (url = '') => AUTH_ROUTES.some((r) => url.includes(r));

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const authApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const { accessToken, anonymousId, getOrCreateAnonymousId } = useAuthStore.getState();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      const sessionId = anonymousId || getOrCreateAnonymousId();
      if (sessionId) {
        config.headers['x-session-id'] = sessionId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      originalRequest?._retry ||
      isAuthRoute(originalRequest?.url)
    ) {
      return Promise.reject(error);
    }

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

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken } = useAuthStore.getState();
      const { data } = await authApi.post(
        '/auth/refresh-token',
        refreshToken ? { refreshToken } : {}
      );
      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      useAuthStore.getState().setAuth({
        user: useAuthStore.getState().user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
