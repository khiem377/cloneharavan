const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Đối tượng nhận thông báo: 'admin' (cho toàn bộ ban quản trị/nhân viên) hoặc userId cụ thể (cho khách hàng)
    recipient: {
      type: String,
      default: 'admin',
      index: true,
      trim: true,
    },

    // Phân loại thông báo
    type: {
      type: String,
      enum: ['ORDER_NEW', 'ORDER_STATUS', 'ORDER_CANCELLED', 'STOCK_LOW', 'SYSTEM'],
      default: 'ORDER_NEW',
      index: true,
    },

    // Tiêu đề ngắn gọn
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Nội dung mô tả chi tiết
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Đường dẫn điều hướng khi click vào thông báo (VD: /orders hoặc /orders?code=ORD-xxx)
    link: {
      type: String,
      default: '',
      trim: true,
    },

    // Trạng thái đã đọc (áp dụng cho thông báo cá nhân)
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Danh sách ID nhân viên đã đọc (đối với thông báo chung 'admin')
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Dữ liệu mở rộng (orderId, orderCode, totalAmount, variantId, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ==============================================================================
// 1. CƠ CHẾ TTL CHỐNG PHÌNH DATABASE (TỰ ĐỘNG DỌN DẸP SAU 30 NGÀY)
// MongoDB background thread tự động xóa các bản ghi quá hạn 30 ngày (30 * 24 * 3600)
// ==============================================================================
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

// 2. Compound index để query danh sách thông báo gần nhất với hiệu năng cao
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
