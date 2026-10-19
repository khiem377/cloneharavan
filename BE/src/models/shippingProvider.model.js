const mongoose = require('mongoose');

const shippingProviderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortDesc: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'disconnected',
      index: true,
    },
    // Đánh dấu đơn vị vận chuyển mặc định của cửa hàng
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Chuỗi mã hóa 2 chiều AES-256-GCM chứa toàn bộ thông tin nhạy cảm (token, password, key...)
    encryptedCredentials: {
      type: String,
      default: null,
    },
    // Thông tin đã che giấu an toàn để trả về cho Frontend hiển thị
    maskedCredentials: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Kho lấy hàng mặc định liên kết với bên hãng
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    lastTestedAt: {
      type: Date,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShippingProvider', shippingProviderSchema);
