import api from '@/lib/axios';

export const customerGroupService = {
  getGroups: (params) => api.get('/customer-groups', { params }).then((res) => res.data),
  getOptions: () => api.get('/customer-groups/options').then((res) => res.data),
  getGroupById: (id) => api.get(`/customer-groups/${id}`).then((res) => res.data),
  createGroup: (data) => api.post('/customer-groups', data).then((res) => res.data),
  updateGroup: (id, data) => api.put(`/customer-groups/${id}`, data).then((res) => res.data),
  deleteGroup: (id) => api.delete(`/customer-groups/${id}`).then((res) => res.data),
  syncMembers: (id) => api.post(`/customer-groups/${id}/sync`).then((res) => res.data),
  seedDefaultGroups: () => api.post('/customer-groups/seed-default').then((res) => res.data),
};

export default customerGroupService;
