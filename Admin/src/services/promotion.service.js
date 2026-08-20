import api from '@/lib/axios';

export const promotionService = {
  getAll:       (params)       => api.get('/promotions', { params }),
  getById:      (id)           => api.get(`/promotions/${id}`),
  create:       (data)         => api.post('/promotions', data),
  update:       (id, data)     => api.put(`/promotions/${id}`, data),
  toggleStatus: (id, isActive) => api.patch(`/promotions/${id}/status`, { isActive }),
  remove:       (id)           => api.delete(`/promotions/${id}`),
  removeBulk:   (ids)          => api.delete('/promotions/bulk', { data: { ids } }),
  apply:        (cartItems)    => api.post('/promotions/apply', { cartItems }),
};
