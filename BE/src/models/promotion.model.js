const mongoose = require('mongoose');

// Chương trình khuyến mãi tự động (mua X tặng Y, mua X trả tiền Y, giảm theo số lượng)
const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên chương trình là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // buy_x_get_y: mua X sản phẩm tặng Y sản phẩm miễn phí (cùng sản phẩm)
    // buy_x_pay_y: mua X sản phẩm chỉ tính tiền Y sản phẩm
    // quantity_discount: giảm % hoặc số tiền cố định khi mua đủ số lượng
    type: {
      type: String,
      enum: ['buy_x_get_y', 'buy_x_pay_y', 'quantity_discount'],
      required: [true, 'Loại chương trình là bắt buộc'],
    },
    // Số lượng cần mua để kích hoạt (VD: mua 3)
    triggerQty: {
      type: Number,
      required: true,
      min: 1,
    },
    // Số lượng được tặng miễn phí (dùng cho buy_x_get_y)
    rewardQty: {
      type: Number,
      default: null,
    },
    // Số lượng phải trả tiền (dùng cho buy_x_pay_y, VD: mua 3 trả 2 thì payQty = 2)
    payQty: {
      type: Number,
      default: null,
    },
    // Giảm giá áp dụng khi type = quantity_discount
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      default: null,
    },
    discountValue: {
      type: Number,
      default: null,
    },
    // Phạm vi áp dụng
    scope: {
      type: {
        type: String,
        enum: ['all', 'products', 'categories'],
        default: 'all',
      },
      productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Promotion = mongoose.model('Promotion', promotionSchema);
module.exports = Promotion;
