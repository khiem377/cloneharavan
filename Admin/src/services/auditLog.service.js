import axiosClient from '@/lib/axios';

export const auditLogService = {
  // Lấy danh sách nhật ký thao tác (hỗ trợ cả getAuditLogs và getLogs)
  getAuditLogs: async (params) => {
    const res = await axiosClient.get('/audit-logs', { params });
    return res.data;
  },
  getLogs: async (params) => {
    const res = await axiosClient.get('/audit-logs', { params });
    return res.data;
  },

  // Chi tiết một bản ghi nhật ký
  getAuditLogById: async (id) => {
    const res = await axiosClient.get(`/audit-logs/${id}`);
    return res.data;
  },
  getLogById: async (id) => {
    const res = await axiosClient.get(`/audit-logs/${id}`);
    return res.data;
  },

  // Khôi phục dữ liệu (Rollback)
  rollbackAuditLog: async (id) => {
    const res = await axiosClient.post(`/audit-logs/${id}/rollback`);
    return res.data;
  },
  rollback: async (id) => {
    const res = await axiosClient.post(`/audit-logs/${id}/rollback`);
    return res.data;
  },
};

export default auditLogService;
