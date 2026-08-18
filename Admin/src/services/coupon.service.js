import api from '@/lib/axios';

export const couponService = {
  getAll:       (params)       => api.get('/coupons', { params }),
  getById:      (id)           => api.get(`/coupons/${id}`),
  create:       (data)         => api.post('/coupons', data),
  update:       (id, data)     => api.put(`/coupons/${id}`, data),
  toggleStatus: (id, isActive) => api.patch(`/coupons/${id}/toggle-status`, { isActive }),
  remove:       (id)           => api.delete(`/coupons/${id}`),
  removeBulk:   (ids)          => api.delete('/coupons/bulk', { data: { ids } }),
  validate:     (data)         => api.post('/coupons/validate', data),
};
