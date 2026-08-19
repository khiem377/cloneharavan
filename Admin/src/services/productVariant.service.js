import api from '@/lib/axios';

export const productVariantService = {
  getByProduct:  (productId)           => api.get(`/products/${productId}/variants`),
  getById:       (id)                  => api.get(`/product-variants/${id}`),
  create:        (productId, data)     => api.post(`/products/${productId}/variants`, data),
  bulkCreate:    (productId, variants) => api.post(`/products/${productId}/variants/bulk`, { variants }),
  deleteAll:     (productId)           => api.delete(`/products/${productId}/variants/all`),
  update:        (id, data)            => api.put(`/product-variants/${id}`, data),
  remove:        (id)                  => api.delete(`/product-variants/${id}`),
};

