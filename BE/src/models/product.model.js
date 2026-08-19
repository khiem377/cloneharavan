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
    sku: {
      type: String,
      required: [true, 'Mã SKU sản phẩm là bắt buộc'],
      unique: true,
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
    price: {
      type: Number,
      required: [true, 'Giá niêm yết sản phẩm là bắt buộc'],
      min: [0, 'Giá sản phẩm không được nhỏ hơn 0'],
    },
    salePrice: {
      type: Number,
      default: 0,
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

  if (this.stock <= 0) {
    this.status = 'out_of_stock';
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
