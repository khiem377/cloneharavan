import api from '@/lib/axios';

export const orderService = {
  // Lấy danh sách toàn bộ đơn hàng (hỗ trợ phân trang, tìm kiếm, lọc theo status, paymentStatus)
  getAllOrders: async (params) => {
    const res = await api.get('/orders/admin/all', { params });
    return res.data;
  },

  // Lấy chi tiết đơn hàng theo ID
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  // Cập nhật trạng thái đơn hàng (CONFIRMED -> SHIPPING -> DELIVERED -> RETURNED)
  updateStatus: async (id, { status, note }) => {
    const res = await api.patch(`/orders/admin/${id}/status`, { status, note });
    return res.data;
  },

  // Hủy đơn hàng (từ PENDING hoặc CONFIRMED)
  cancelOrder: async (id, { reason }) => {
    const res = await api.patch(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  // Lấy trạng thái nhanh đơn hàng
  getStatus: async (id) => {
    const res = await api.get(`/orders/${id}/status`);
    return res.data;
  },
};

export default orderService;
