import axiosClient from '@/lib/axios';

export const flashSaleService = {
  getAll: (params = {}) => axiosClient.get('/flash-sales', { params }),
  getById: (id) => axiosClient.get(`/flash-sales/${id}`),
  getActive: () => axiosClient.get('/flash-sales/active'),
  create: (data) => axiosClient.post('/flash-sales', data),
  update: (id, data) => axiosClient.put(`/flash-sales/${id}`, data),
  remove: (id) => axiosClient.delete(`/flash-sales/${id}`),
  toggleStatus: (id, isActive) => axiosClient.patch(`/flash-sales/${id}/toggle-status`, { isActive }),
};
