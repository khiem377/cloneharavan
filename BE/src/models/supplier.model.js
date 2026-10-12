const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên nhà cung cấp không được để trống'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã nhà cung cấp không được để trống'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    supplierType: {
      type: String,
      trim: true,
      default: 'Sản phẩm',
      // 'Sản phẩm / Nguyên vật liệu' | 'Sản phẩm' | 'Nguyên phụ liệu'
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    // Địa chỉ chi tiết (hỗ trợ phân biệt địa chỉ mới 2 cấp và địa chỉ cũ 3 cấp)
    addressType: {
      type: String,
      enum: ['new', 'old'],
      default: 'old',
    },
    province: {
      type: String,
      trim: true,
      default: '',
    },
    provinceId: {
      type: Number,
      default: null,
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    districtId: {
      type: Number,
      default: null,
    },
    ward: {
      type: String,
      trim: true,
      default: '',
    },
    wardCode: {
      type: String,
      trim: true,
      default: '',
    },
    detailAddress: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    taxCode: {
      type: String,
      trim: true,
      default: '',
    },
    // Thông tin thanh toán / Ngân hàng theo chuẩn VietQR
    bankInfo: {
      bankCode: { type: String, trim: true, default: '' },
      bankName: { type: String, trim: true, default: '' },
      bankShortName: { type: String, trim: true, default: '' },
      bankLogo: { type: String, trim: true, default: '' },
      accountNumber: { type: String, trim: true, default: '' },
      accountHolder: { type: String, trim: true, uppercase: true, default: '' },
      branch: { type: String, trim: true, default: '' },
    },
    // Công nợ & mua sắm
    debt: {
      type: Number,
      default: 0,
    },
    totalPurchase: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
