const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'ID sản phẩm là bắt buộc'],
      index: true,
    },
    // isDefault: true → đây là Default Variant (sản phẩm không có biến thể thực)
    // Mỗi product luôn có đúng 1 isDefault = true
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    attributes: [
      {
        name: { type: String, required: [true, 'Tên thuộc tính là bắt buộc'] },
        value: { type: String, required: [true, 'Giá trị thuộc tính là bắt buộc'] },
        colorCode: { type: String, default: '' },
      },
    ],
    displayName: {
      type: String,
      trim: true,
    },
    // SKU optional: tự sinh nếu để trống
    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    isManualSku: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'Giá bán là bắt buộc'],
      min: [0, 'Giá không được nhỏ hơn 0'],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, 'Giá khuyến mãi không được nhỏ hơn 0'],
    },
    stock: {
      type: Number,
      required: [true, 'Số lượng tồn kho là bắt buộc'],
      default: 0,
      min: [0, 'Số lượng tồn kho không được nhỏ hơn 0'],
    },
    thumbnail: {
      mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    images: [
      {
        mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    position: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    // Override fields — null = kế thừa từ sản phẩm cha
    nameOverride: { type: String, default: null },
    descriptionOverride: { type: String, default: null },
    specifications: [
      {
        group: { type: String, default: 'Thông tin chung' },
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

productVariantSchema.pre('save', function () {
  if (this.attributes?.length > 0) {
    this.displayName = this.attributes.map((a) => a.value).join(' / ');
  } else if (this.isDefault) {
    this.displayName = 'Mặc định';
  }
});

productVariantSchema.index({ productId: 1, sku: 1 });
productVariantSchema.index({ productId: 1, isDefault: 1 });

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
module.exports = ProductVariant;
