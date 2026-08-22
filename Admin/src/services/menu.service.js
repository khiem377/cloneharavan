import apiClient
  from '@/lib/axios';

const BASE = '/menus';

export const menuService = {

  getAll: () => apiClient.get(BASE).then(r => r.data.data),


  getById: (id) => apiClient.get(`${BASE}/${id}`).then(r => r.data.data),


  getByHandle: (handle) => apiClient.get(`${BASE}/handle/${handle}`).then(r => r.data.data),


  create: (data) => apiClient.post(BASE, data).then(r => r.data.data),


  update: (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data.data),


  remove: (id) => apiClient.delete(`${BASE}/${id}`).then(r => r.data),


  duplicate: (id) => apiClient.post(`${BASE}/${id}/duplicate`).then(r => r.data.data),
};
