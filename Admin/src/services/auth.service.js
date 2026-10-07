import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';

export const authService = {
  login: (data) => {
    // Gửi kèm anonymousId để BE merge interactions guest → user sau khi login
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/login', { ...data, sessionId });
  },

  googleLogin: (credential) => {
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/google', { credential, sessionId, isAdminRequest: true });
  },

  getTikTokAuthUrl: (params = {}) => {
    return api.get('/auth/tiktok/auth-url', { params });
  },

  tiktokLogin: (code, redirectUri, codeVerifier) => {
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/tiktok', { code, redirectUri, codeVerifier, sessionId, isAdminRequest: true });
  },

  getZaloAuthUrl: (params = {}) => {
    return api.get('/auth/zalo/auth-url', { params });
  },

  zaloLogin: (code, redirectUri, codeVerifier) => {
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/zalo', { code, redirectUri, codeVerifier, sessionId, isAdminRequest: true });
  },

  register: (data) => {
    // Tương tự login — merge guest interactions vào account mới tạo
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/register', { ...data, sessionId });
  },

  logout:         () =>     api.post('/auth/logout'),
  refreshToken:   (token) => api.post('/auth/refresh-token', { refreshToken: token }),
  getMe:          () =>     api.get('/auth/me'),
  getMyPermissions: () =>   api.get('/auth/my-permissions'),
  changePassword: (data) => api.post('/auth/change-password', data),

  // Session & Devices Management
  getSessions: () => api.get('/auth/sessions'),
  logoutSession: (sessionId) => api.delete(`/auth/sessions/${sessionId}`),
  logoutOtherSessions: () => api.post('/auth/sessions/logout-others'),

  // Social Account Linking
  getLinkedAccounts: () => api.get('/auth/linked-accounts'),
  linkGoogle: (credential) => api.post('/auth/link/google', { credential }),
  linkZalo: (code, redirectUri, codeVerifier) => api.post('/auth/link/zalo', { code, redirectUri, codeVerifier }),
  linkTikTok: (code, redirectUri, codeVerifier) => api.post('/auth/link/tiktok', { code, redirectUri, codeVerifier }),
  unlinkSocial: (provider) => api.delete(`/auth/unlink/${provider}`),

  // Profile Management
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAvatar: () => api.delete('/users/avatar'),

  // Admin Exclusive OTP & Passkey Authentication
  requestAdminOtp: (email) => api.post('/auth/admin/request-otp', { email }),
  verifyAdminOtp: (email, otp, rememberMe = false) => {
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/admin/verify-otp', { email, otp, rememberMe, sessionId });
  },
  resendAdminOtp: (email) => api.post('/auth/admin/resend-otp', { email }),
  getPasskeyLoginOptions: (email) => api.post('/auth/admin/passkey/login-options', { email }),
  verifyPasskeyLogin: (data) => {
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/admin/passkey/login-verify', { ...data, sessionId });
  },
  getPasskeyRegisterOptions: () => api.post('/auth/admin/passkey/register-options'),
  verifyPasskeyRegister: (data) => api.post('/auth/admin/passkey/register-verify', data),
  deletePasskey: (credentialId) => api.delete(credentialId ? `/auth/admin/passkey/${credentialId}` : '/auth/admin/passkey'),
};



