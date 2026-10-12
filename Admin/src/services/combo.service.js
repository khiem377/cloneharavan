import api from '@/lib/axios';

export const comboService = {
  getAll: (params) => api.get('/combos', { params }),
  getById: (id) => api.get(`/combos/${id}`),
  create: (data) => api.post('/combos', data),
  update: (id, data) => api.put(`/combos/${id}`, data),
  toggleStatus: (id) => api.patch(`/combos/${id}/toggle-status`),
  remove: (id) => api.delete(`/combos/${id}`),
  aiSuggestPricing: (data) => api.post('/combos/ai-suggest-pricing', data),
  aiSuggestBundles: () => api.get('/combos/ai-suggest-bundles'),
};
