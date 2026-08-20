import api from '@/lib/axios';

export const blogPostService = {
  getAll:  (params) => api.get('/blog-posts', { params }),
  getById: (id)     => api.get(`/blog-posts/id/${id}`),
  getBySlug: (slug) => api.get(`/blog-posts/${slug}`),
  create:  (data)   => api.post('/blog-posts', data),
  update:  (id, data) => api.put(`/blog-posts/${id}`, data),
  remove:  (id)     => api.delete(`/blog-posts/${id}`),
  removeBulk: (ids) => api.delete('/blog-posts/bulk', { data: { ids } }),
  toggleStatus: (id, isActive) => api.patch(`/blog-posts/${id}/status`, { isActive }),
  incrementView: (slug) => api.post(`/blog-posts/${slug}/view`),
};

export const blogCategoryService = {
  getAll:       (params)       => api.get('/blog-categories', { params }),
  getBySlug:    (slug)         => api.get(`/blog-categories/${slug}`),
  create:       (data)         => api.post('/blog-categories', data),
  update:       (id, data)     => api.put(`/blog-categories/${id}`, data),
  remove:       (id)           => api.delete(`/blog-categories/${id}`),
  removeBulk:   (ids)          => api.delete('/blog-categories/bulk', { data: { ids } }),
  reorder:      (items)        => api.patch('/blog-categories/reorder', { items }),
  toggleStatus: (id, isActive) => api.patch(`/blog-categories/${id}/status`, { isActive }),
};

export const tagService = {
  getAll:  (params) => api.get('/tags', { params }),
  create:  (data)   => api.post('/tags', data),
  update:  (id, data) => api.put(`/tags/${id}`, data),
  remove:  (id)     => api.delete(`/tags/${id}`),
  removeBulk: (ids) => api.delete('/tags/bulk', { data: { ids } }),
  toggleStatus: (id, isActive) => api.patch(`/tags/${id}/status`, { isActive }),
};
