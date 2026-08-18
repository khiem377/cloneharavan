import api from '@/lib/axios';

export const brandService = {
  getAll:      (params)     => api.get('/brands/admin', { params }),
  getById:     (id)         => api.get(`/brands/${id}`),
  create:      (data)       => api.post('/brands', data),
  update:      (id, data)   => api.put(`/brands/${id}`, data),
  toggleStatus:(id, isActive) => api.patch(`/brands/${id}/status`, { isActive }),
  remove:      (id)         => api.delete(`/brands/${id}`),
  removeBulk:  (ids)        => api.delete('/brands/bulk', { data: { ids } }),
};
