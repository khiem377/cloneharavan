import api from '@/lib/axios';

export const categoryService = {
  getAll:      (params)     => api.get('/categories/admin', { params }),
  getById:     (id)         => api.get(`/categories/${id}`),
  create:      (data)       => api.post('/categories', data),
  update:      (id, data)   => api.put(`/categories/${id}`, data),
  toggleStatus:(id, isActive) => api.patch(`/categories/${id}/status`, { isActive }),
  remove:      (id)         => api.delete(`/categories/${id}`),
  removeBulk:  (ids)        => api.delete('/categories/bulk', { data: { ids } }),
};
