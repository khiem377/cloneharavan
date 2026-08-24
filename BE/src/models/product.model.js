const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // productCode: mã định danh ngắn tự sinh từ tên, dùng để prefix SKU biến thể
    // Ví dụ: "Tủ lạnh Samsung 409 lít" → "TU-LANH-SAMSUNG-409"
    productCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    // SKU cũ — giữ lại để backward compat, deprecated (dùng variant.sku thay thế)
    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    categories: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      required: [true, 'Danh mục sản phẩm là bắt buộc'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Sản phẩm phải có ít nhất 1 danh mục',
      },
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Thương hiệu sản phẩm là bắt buộc'],
    },
    // price / salePrice / stock: deprecated — giờ nằm ở Default Variant
    // Giữ lại để không break data cũ, không bắt buộc
    price: {
      type: Number,
      default: null,
      min: [0, 'Giá sản phẩm không được nhỏ hơn 0'],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, 'Giá khuyến mãi không được nhỏ hơn 0'],
    },
    stock: {
      type: Number,
      default: null,
      min: [0, 'Số lượng tồn kho không được nhỏ hơn 0'],
    },
    thumbnail: {
      mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
      url: { type: String, required: [true, 'Ảnh đại diện chính là bắt buộc'] },
      publicId: { type: String, default: '' },
    },
    images: [
      {
        mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    description: {
      type: String,
      default: '',
    },
    specifications: [
      {
        group: { type: String, default: 'Thông tin chung' },
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isHot: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'out_of_stock'],
      default: 'published',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    options: [
      {
        name: { type: String, required: [true, 'Tên thuộc tính là bắt buộc'] },
        type: { type: String, enum: ['color', 'text'], default: 'text' },
        values: [
          {
            value: { type: String, required: [true, 'Giá trị thuộc tính là bắt buộc'] },
            colorCode: { type: String, default: '' },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

productSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
  // Không tự đổi status theo stock nữa (stock nằm ở variant)
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
