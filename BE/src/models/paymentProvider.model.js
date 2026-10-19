const mongoose = require('mongoose');

const paymentProviderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      enum: ['vnpay', 'momo', 'zalopay', 'onepay', 'cod'],
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
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['gateway', 'manual'],
      default: 'gateway',
    },
    // Trạng thái kết nối (đã nhập keys cấu hình thành công hay chưa)
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'disconnected',
      index: true,
    },
    // Trạng thái hiển thị tại trang Checkout cho người mua chọn
    isEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Môi trường hoạt động (Sandbox thử nghiệm hoặc Production thực tế)
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox',
    },
    // Dữ liệu mã hóa 2 chiều AES-256-GCM lưu trữ an toàn trong Database, ẩn hoàn toàn khỏi query mặc định
    encryptedCredentials: {
      type: String,
      default: null,
      select: false,
    },
    // Dữ liệu đã che mờ (mask) an toàn để trả về cho giao diện Admin
    maskedCredentials: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Bộ thông số xác thực API (ẩn hoàn toàn khỏi response và query mặc định)
    credentials: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false,
    },
    connectedAt: {
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

paymentProviderSchema.index({ status: 1, isEnabled: 1 });

const PaymentProvider = mongoose.model('PaymentProvider', paymentProviderSchema);

module.exports = PaymentProvider;
