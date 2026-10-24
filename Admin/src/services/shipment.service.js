import api from '@/lib/axios';

export const shipmentService = {
  /**
   * Lấy báo cáo tổng quan vận chuyển
   */
  getOverview: async (params = {}) => {
    const res = await api.get('/shipments/overview', { params });
    return res.data;
  },

  /**
   * Lấy danh sách vận đơn
   */
  getShipmentsList: async (params = {}) => {
    const res = await api.get('/shipments', { params });
    return res.data;
  },

  /**
   * Xem chi tiết 1 vận đơn
   */
  getShipmentById: async (id) => {
    const res = await api.get(`/shipments/${id}`);
    return res.data;
  },

  /**
   * Tra cứu bản đồ vận đơn theo danh sách mã đơn hàng
   */
  getShipmentsByOrderCodes: async (orderCodes = []) => {
    if (!orderCodes.length) return {};
    const res = await api.get('/shipments/by-orders', {
      params: { codes: orderCodes.join(',') },
    });
    return res.data?.data || {};
  },


  getEligibleOrders: async () => {
    const res = await api.get('/shipments/eligible-orders');
    return res.data;
  },


  createShipment: async (payload) => {
    const res = await api.post('/shipments', payload);
    return res.data;
  },


  cancelShipment: async (id, reason) => {
    const res = await api.post(`/shipments/${id}/cancel`, { reason });
    return res.data;
  },


  updateShipmentStatus: async (id, { status, note }) => {
    const res = await api.put(`/shipments/${id}/status`, { status, note });
    return res.data;
  },


  syncShipmentStatus: async (id) => {
    const res = await api.post(`/shipments/${id}/sync`);
    return res.data;
  },

  /**
   * Thống kê đối soát tiền COD
   */
  getCODStats: async () => {
    const res = await api.get('/shipments/cod/stats');
    return res.data;
  },

  /**
   * Đối soát COD 1 vận đơn
   */
  reconcileCOD: async (id, payload) => {
    const res = await api.post(`/shipments/${id}/reconcile-cod`, payload);
    return res.data;
  },

  /**
   * Đối soát COD hàng loạt
   */
  bulkReconcileCOD: async (payload) => {
    const res = await api.post('/shipments/cod/bulk-reconcile', payload);
    return res.data;
  },
};

export default shipmentService;
