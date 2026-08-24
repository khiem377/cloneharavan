import api from '../lib/axios';

const roleService = {
  getPermissions: () => api.get('/roles/permissions'),
  getRoles:       () => api.get('/roles'),
  getRoleById:    (id) => api.get(`/roles/${id}`),
  createRole:     (data) => api.post('/roles', data),
  updateRole:     (id, data) => api.put(`/roles/${id}`, data),
  deleteRole:     (id) => api.delete(`/roles/${id}`),
  assignUserRole: (userId, roleId, customPermissions = []) =>
    api.patch(`/roles/users/${userId}/assign`, { roleId, customPermissions }),
};

export default roleService;
