const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'ID sản phẩm là bắt buộc'],
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: [true, 'ID biến thể là bắt buộc'],
    },
    // Snapshot thông tin hiển thị tại thời điểm đặt hàng
    productName: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    variantName: {
      type: String,
      default: '',
      trim: true,
    },
    sku: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    attributes: [
      {
        name: { type: String, default: '' },
        value: { type: String, default: '' },
        colorCode: { type: String, default: '' },
      },
    ],

    // Snapshot giá & tính toán
    originalPrice: {
      type: Number,
      required: [true, 'Giá gốc là bắt buộc'],
      min: [0, 'Giá gốc không được nhỏ hơn 0'],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, 'Giá khuyến mãi không được nhỏ hơn 0'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Đơn giá thực bán là bắt buộc'],
      min: [0, 'Đơn giá không được nhỏ hơn 0'],
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng tối thiểu là 1'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Tổng tiền hàng không được nhỏ hơn 0'],
    },
    // Phân bổ giảm giá coupon cho item này (phục vụ đối soát & hoàn hàng)
    couponDiscountAllocated: {
      type: Number,
      default: 0,
      min: [0, 'Phân bổ coupon không được nhỏ hơn 0'],
    },
    lineTotal: {
      type: Number,
      required: true,
      min: [0, 'Thành tiền dòng không được nhỏ hơn 0'],
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: [true, 'Mã đơn hàng là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Đơn hàng bắt buộc phải gắn với tài khoản người dùng'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Đơn hàng phải chứa ít nhất 1 sản phẩm',
      },
    },
    shippingAddress: {
      fullName: { type: String, required: [true, 'Họ tên người nhận là bắt buộc'], trim: true },
      phone: { type: String, required: [true, 'Số điện thoại là bắt buộc'], trim: true },
      province: { type: String, required: [true, 'Tỉnh/Thành phố là bắt buộc'], trim: true },
      district: { type: String, required: [true, 'Quận/Huyện là bắt buộc'], trim: true },
      ward: { type: String, required: [true, 'Phường/Xã là bắt buộc'], trim: true },
      detailAddress: { type: String, required: [true, 'Địa chỉ chi tiết là bắt buộc'], trim: true },
    },
    paymentMethod: {
      type: String,
      enum: ['COD'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'REFUNDED'],
      default: 'UNPAID',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'],
      default: 'PENDING',
      index: true,
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      shippingFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      couponCode: {
        type: String,
        default: null,
        trim: true,
        uppercase: true,
      },
      couponDiscount: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    cancelReason: {
      type: String,
      default: null,
      trim: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],
  },
  { timestamps: true }
);

// Indexes phục vụ tìm kiếm & tra cứu danh sách đơn hàng
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
