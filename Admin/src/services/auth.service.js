import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';

export const authService = {
  login: (data) => {
    // Gửi kèm anonymousId để BE merge interactions guest → user sau khi login
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/login', { ...data, sessionId });
  },

  register: (data) => {
    // Tương tự login — merge guest interactions vào account mới tạo
    const sessionId = useAuthStore.getState().getOrCreateAnonymousId();
    return api.post('/auth/register', { ...data, sessionId });
  },

  logout:         () =>     api.post('/auth/logout'),
  refreshToken:   (token) => api.post('/auth/refresh-token', { refreshToken: token }),
  getMe:          () =>     api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

