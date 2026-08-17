import api from '@/lib/axios';

export const authService = {
  login:          (data)   => api.post('/auth/login', data),
  logout:         ()       => api.post('/auth/logout'),
  refreshToken:   (token)  => api.post('/auth/refresh-token', { refreshToken: token }),
  getMe:          ()       => api.get('/auth/me'),
  changePassword: (data)   => api.post('/auth/change-password', data),
};
