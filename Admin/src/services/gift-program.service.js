import api from '@/lib/axios';

export const giftProgramService = {
  getAll:       (params)       => api.get('/gift-programs', { params }),
  getById:      (id)           => api.get(`/gift-programs/${id}`),
  create:       (data)         => api.post('/gift-programs', data),
  update:       (id, data)     => api.put(`/gift-programs/${id}`, data),
  toggleStatus: (id, isActive) => api.patch(`/gift-programs/${id}/status`, { isActive }),
  remove:       (id)           => api.delete(`/gift-programs/${id}`),
  removeBulk:   (ids)          => api.delete('/gift-programs/bulk', { data: { ids } }),
  apply:        (cartItems)    => api.post('/gift-programs/apply', { cartItems }),
};
