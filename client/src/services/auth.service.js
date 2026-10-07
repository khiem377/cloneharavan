import { api } from '@/lib/axios';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  googleLogin: async ({ credential, sessionId }) => {
    const res = await api.post('/auth/google', { credential, sessionId });
    return res.data;
  },

  getTikTokAuthUrl: async (params = {}) => {
    const res = await api.get('/auth/tiktok/auth-url', { params });
    return res.data;
  },

  tiktokLogin: async ({ code, redirectUri, codeVerifier, sessionId, isAdminRequest }) => {
    const res = await api.post('/auth/tiktok', { code, redirectUri, codeVerifier, sessionId, isAdminRequest });
    return res.data;
  },

  getZaloAuthUrl: async (params = {}) => {
    const res = await api.get('/auth/zalo/auth-url', { params });
    return res.data;
  },

  zaloLogin: async ({ code, redirectUri, codeVerifier, sessionId, isAdminRequest }) => {
    const res = await api.post('/auth/zalo', { code, redirectUri, codeVerifier, sessionId, isAdminRequest });
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data, token) => {
    const url = token ? `/auth/reset-password/${token}` : '/auth/reset-password';
    const res = await api.post(url, data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  // Mật khẩu & Bảo mật
  setPassword: async ({ newPassword, confirmPassword }) => {
    const res = await api.post('/auth/set-password', { newPassword, confirmPassword });
    return res.data;
  },

  changePassword: async ({ currentPassword, newPassword, confirmPassword, logoutOtherDevices }) => {
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
      logoutOtherDevices,
    });
    return res.data;
  },

  // Quản lý Phiên Đăng nhập & Thiết bị
  getSessions: async () => {
    const res = await api.get('/auth/sessions');
    return res.data?.data?.sessions || [];
  },

  logoutSession: async (sessionId) => {
    const res = await api.delete(`/auth/sessions/${sessionId}`);
    return res.data;
  },

  logoutOtherSessions: async () => {
    const res = await api.post('/auth/sessions/logout-others');
    return res.data;
  },

  // Tài khoản liên kết mạng xã hội
  getLinkedAccounts: async () => {
    const res = await api.get('/auth/linked-accounts');
    return res.data?.data || {};
  },

  linkGoogle: async (credential) => {
    const res = await api.post('/auth/link/google', { credential });
    return res.data;
  },

  linkZalo: async ({ code, redirectUri, codeVerifier }) => {
    const res = await api.post('/auth/link/zalo', { code, redirectUri, codeVerifier });
    return res.data;
  },

  linkTikTok: async ({ code, redirectUri, codeVerifier }) => {
    const res = await api.post('/auth/link/tiktok', { code, redirectUri, codeVerifier });
    return res.data;
  },

  unlinkSocial: async (provider) => {
    const res = await api.delete(`/auth/unlink/${provider}`);
    return res.data;
  },
};

export default authService;

