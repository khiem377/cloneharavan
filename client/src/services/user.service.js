import api from '../lib/axios';

export const userService = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data?.data?.user || res.data?.data || null;
  },

  updateProfile: async (payload) => {
    const res = await api.put('/users/profile', payload);
    return res.data?.data?.user || res.data?.data || null;
  },

  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return res.data;
  },
};

export default userService;
