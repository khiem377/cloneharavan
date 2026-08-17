import api from '@/lib/axios';

export const bannerService = {
  // Admin
  getAll:    ()          => api.get('/banners/admin'),
  create:    (data)      => api.post('/banners/admin', data),
  update:    (id, data)  => api.patch(`/banners/admin/${id}`, data),
  remove:    (id)        => api.delete(`/banners/admin/${id}`),
  removeBulk:(ids)       => api.delete('/banners/admin/bulk', { data: { ids } }),
  reorder:   (items)     => api.patch('/banners/admin/reorder', { items }),
};
