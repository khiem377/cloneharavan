import { api } from '@/lib/axios';

export const userService = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data?.data?.user || res.data?.data || null;
  },

  updateProfile: async (payload) => {
    const res = await api.put('/users/profile', payload);
    return res.data?.data?.user || res.data?.data || null;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteAvatar: async () => {
    const res = await api.delete('/users/avatar');
    return res.data;
  },

  getAddresses: async () => {
    const res = await api.get('/users/addresses');
    return res.data?.data?.addresses || [];
  },

  addAddress: async (payload) => {
    const res = await api.post('/users/addresses', payload);
    return res.data;
  },

  updateAddress: async (addressId, payload) => {
    const res = await api.put(`/users/addresses/${addressId}`, payload);
    return res.data;
  },

  deleteAddress: async (addressId) => {
    const res = await api.delete(`/users/addresses/${addressId}`);
    return res.data;
  },

  setDefaultAddress: async (addressId) => {
    const res = await api.patch(`/users/addresses/${addressId}/default`);
    return res.data;
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
