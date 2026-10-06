import api from '../lib/axios';

export const userService = {
  // Lấy danh sách users (có hỗ trợ userType: 'customer' | 'staff', role, q, page, limit, isActive)
  getUsers: async (params) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  // Chi tiết user
  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  // Khóa / Mở khóa tài khoản (Force logout realtime nếu khóa)
  toggleStatus: async (id, isActive) => {
    const res = await api.patch(`/users/${id}/status`, { isActive });
    return res.data;
  },

  // Cập nhật vai trò (Role & RoleId & CustomPermissions)
  updateRole: async (id, { role, roleId, customPermissions }) => {
    const res = await api.patch(`/users/${id}/role`, { role, roleId, customPermissions });
    return res.data;
  },

  // Tạo tài khoản nhân viên / admin mới
  createStaff: async (data) => {
    const res = await api.post('/users/admin', data);
    return res.data;
  },

  // Thống kê KPI users
  getUserStats: async (userType = 'customer') => {
    const res = await api.get('/users/stats', { params: { userType } });
    return res.data;
  },

  // Cập nhật trạng thái hàng loạt (Khóa / Mở khóa)
  bulkToggleStatus: async ({ userIds, isActive }) => {
    const res = await api.patch('/users/bulk-status', { userIds, isActive });
    return res.data;
  },

  // Đặt lại mật khẩu (Admin reset password)
  resetPassword: async ({ id, newPassword }) => {
    const res = await api.patch(`/users/${id}/reset-password`, { newPassword });
    return res.data;
  },

  // Xóa user
  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};
