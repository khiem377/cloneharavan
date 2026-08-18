import api from '@/lib/axios';

export const productService = {
  getAll:           (params)           => api.get('/products/admin', { params }),
  getById:          (id)               => api.get(`/products/${id}`),
  create:           (data)             => api.post('/products', data),
  update:           (id, data)         => api.put(`/products/${id}`, data),
  toggleStatus:     (id, isActive)     => api.patch(`/products/${id}/status`, { isActive }),
  remove:           (id)               => api.delete(`/products/${id}`),
  removeBulk:       (ids)              => api.delete('/products/bulk', { data: { ids } }),
  downloadTemplate: ()                 => api.get('/products/template', { responseType: 'blob' }),
  exportProducts:   (params)           => api.get('/products/export', { params, responseType: 'blob' }),
  importProducts:   (file, onProgress) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/products/import', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
  },
  syncImages: () => api.post('/products/sync-images'),
};
