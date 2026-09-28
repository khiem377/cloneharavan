import axiosClient from '@/lib/axios';

export const auditLogService = {
  getLogs: (params) => axiosClient.get('/audit-logs', { params }),
  getLogById: (id) => axiosClient.get(`/audit-logs/${id}`),
  rollback: (id) => axiosClient.post(`/audit-logs/${id}/rollback`),
};

export default auditLogService;
