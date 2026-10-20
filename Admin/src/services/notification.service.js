import api from '@/lib/axios';

export const notificationService = {
  /**
   * Lấy danh sách thông báo phân trang
   */
  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  /**
   * Đếm nhanh số lượng thông báo chưa đọc
   */
  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  /**
   * Xóa một thông báo
   */
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  /**
   * Xóa nhiều thông báo đã chọn
   */
  deleteBulkNotifications: async (ids) => {
    const res = await api.post('/notifications/bulk-delete', { ids });
    return res.data;
  },

  /**
   * Lấy danh sách mẫu thông báo email & branding
   */
  getTemplates: async () => {
    const res = await api.get('/settings/notifications/templates');
    return res.data;
  },

  /**
   * Xem trước nội dung Live HTML Preview của mẫu email
   */
  previewTemplate: async (templateId, params = {}) => {
    const res = await api.get(`/settings/notifications/preview/${templateId}`, { params });
    return res.data;
  },

  /**
   * Gửi email thử nghiệm cho admin
   */
  sendTestEmail: async (email, templateId) => {
    const res = await api.post('/settings/notifications/send-test', { email, templateId });
    return res.data;
  },

  /**
   * Cập nhật cấu hình thông báo (branding & triggers)
   */
  updateSettings: async (payload) => {
    const res = await api.put('/settings/notifications/update', payload);
    return res.data;
  },

  /**
   * Lấy chi tiết 1 mẫu email kèm biến khả dụng và giá trị custom
   */
  getTemplateDetail: async (templateId) => {
    const res = await api.get(`/settings/notifications/templates/${templateId}`);
    return res.data;
  },

  /**
   * Lưu tùy biến câu chữ của mẫu email
   */
  saveCustomTemplate: async (templateId, customData) => {
    const res = await api.put(`/settings/notifications/templates/${templateId}`, customData);
    return res.data;
  },

  /**
   * Khôi phục mẫu email về mặc định ban đầu
   */
  resetCustomTemplate: async (templateId) => {
    const res = await api.post(`/settings/notifications/templates/${templateId}/reset`);
    return res.data;
  },

  /**
   * Xem trước Live HTML Preview có áp dụng custom data tức thì
   */
  previewCustomTemplate: async (templateId, payload = {}) => {
    const res = await api.post(`/settings/notifications/preview/${templateId}`, payload);
    return res.data;
  },

  /**
   * Gửi email thử nghiệm với nội dung tùy biến đang soạn
   */
  sendTestNotificationEmail: async (payload) => {
    const res = await api.post('/settings/notifications/send-test', payload);
    return res.data;
  },

  /**
   * Cập nhật thông tin SMTP riêng của Shop
   */
  updateSmtpConfig: async (smtpData) => {
    const res = await api.put('/settings/notifications/smtp', smtpData);
    return res.data;
  },

  /**
   * Kiểm tra kết nối SMTP (handshake & gửi test email)
   */
  testSmtpConfig: async (smtpData) => {
    const res = await api.post('/settings/notifications/smtp/test', smtpData);
    return res.data;
  },
};

export default notificationService;
