import api from '@/lib/axios';

export const supplierService = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  // Chỉ số theo kỳ + lịch sử đơn nhập/đơn trả của NCC
  getActivity: (id, params) => api.get(`/suppliers/${id}/activity`, { params }),
  // Danh sách nhân viên để chọn phụ trách
  getStaffOptions: () => api.get('/suppliers/staff-options'),
};
