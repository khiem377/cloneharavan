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
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
      index: true,
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
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Giá vốn không được nhỏ hơn 0'],
    },
    // cachedPrice / cachedSalePrice — denormalized từ Default Variant
    // Sync tự động khi tạo/update variant, dùng để filter giá TRƯỚC paginate
    cachedPrice: {
      type: Number,
      default: null,
      index: true,
    },
    cachedSalePrice: {
      type: Number,
      default: null,
    },
    allocated: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng giữ chỗ không được nhỏ hơn 0'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng tồn kho không được nhỏ hơn 0'],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng đã bán không được nhỏ hơn 0'],
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
    unit: {
      type: String,
      default: 'Cái',
      trim: true,
    },
    itemType: {
      type: String,
      enum: ['merchandise', 'finished_good', 'raw_material', 'service', 'combo'],
      default: 'merchandise',
    },
    // Vận hành bán lẻ thực chiến (Pancake Standard)
    allowNegativeStock: {
      type: Boolean,
      default: false,
    },
    hideNameOnPrint: {
      type: Boolean,
      default: false,
    },
    hideOnInvoice: {
      type: Boolean,
      default: false,
    },
    weightBasedPricing: {
      type: Boolean,
      default: false,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    keywords: [{
      type: String,
      trim: true,
    }],
    // Trọng lượng & Kích thước tương thích ngược (đồng bộ với package)
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
    dimensions: {
      length: { type: Number, default: 0, min: 0 },
      width: { type: Number, default: 0, min: 0 },
      height: { type: Number, default: 0, min: 0 },
    },
    // 1. Thông số sản phẩm trần (kích thước & cân nặng thật của sản phẩm, hiển thị cho khách xem)
    productWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    productDimensions: {
      length: { type: Number, default: 0, min: 0 },
      width: { type: Number, default: 0, min: 0 },
      height: { type: Number, default: 0, min: 0 },
    },
    // 2. Thông số kiện hàng đóng gói (kích thước sau đóng hộp / gập túi, chuyên biệt tính cước GHN)
    packageWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    packageDimensions: {
      length: { type: Number, default: 0, min: 0 },
      width: { type: Number, default: 0, min: 0 },
      height: { type: Number, default: 0, min: 0 },
    },
    // Trạng thái dữ liệu vận chuyển
    shippingDataStatus: {
      type: String,
      enum: ['verified', 'estimated', 'missing'],
      default: 'missing',
    },
    shippingDataSource: {
      type: String,
      default: '',
      trim: true,
    },
    shippingDataUpdatedAt: {
      type: Date,
      default: null,
    },
    giftProduct: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
      variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
      note: { type: String, default: '' },
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
    // Sản phẩm cấu thành (BOM / Composite / Assembly Kits)
    isComposite: {
      type: Boolean,
      default: false,
      index: true,
    },
    bomItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        costPrice: { type: Number, default: 0 },
      },
    ],
    // Bảng giá bán sỉ theo bậc số lượng (Tiered Wholesale Pricing)
    wholesaleTiers: [
      {
        minQuantity: { type: Number, required: true, min: 2 },
        price: { type: Number, required: true, min: 0 },
        discountPercent: { type: Number, default: 0 },
      },
    ],
    // Quản lý lô hàng & Hạn sử dụng (Batch / Expiry Tracking)
    batchNumber: {
      type: String,
      default: '',
      trim: true,
    },
    manufacturingDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    searchTokens: [{ type: String, index: true }],
  },
  { timestamps: true }
);

productSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
  
  try {
    const { removeVietnameseTones, extractAcronyms } = require('../utils/searchEngine');
    const nameNorm = removeVietnameseTones(this.name);
    const acronyms = extractAcronyms(this.name);
    const words = nameNorm.split(/\s+/).filter(Boolean);

    const tokens = new Set([
      nameNorm,
      ...acronyms,
      ...words,
      (this.productCode || '').toLowerCase(),
      (this.sku || '').toLowerCase(),
    ]);

    this.searchTokens = Array.from(tokens).filter(Boolean);
  } catch (err) {
    // Ignore error if searchEngine not loaded yet
  }
});

productSchema.index({ name: 'text', sku: 'text' });
productSchema.index({ isActive: 1, status: 1, createdAt: -1 });
productSchema.index({ isActive: 1, status: 1, stock: 1 });
productSchema.index({ categories: 1, isActive: 1, status: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ isActive: 1, status: 1, viewsCount: -1 });
productSchema.index({ isActive: 1, cachedPrice: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ isActive: 1, status: 1, sold: -1 });
productSchema.index({ categories: 1, isActive: 1, status: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
