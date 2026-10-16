const mongoose = require('mongoose');

const productWarehouseStockSchema = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Tồn kho không được nhỏ hơn 0'],
    },
    allocated: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng giữ chỗ không được nhỏ hơn 0'],
    },
    binLocation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: mỗi biến thể chỉ có đúng 1 bản ghi tồn kho cho 1 kho nhất định
productWarehouseStockSchema.index({ variantId: 1, warehouseId: 1 }, { unique: true });
productWarehouseStockSchema.index({ warehouseId: 1, productId: 1 });

module.exports = mongoose.model('ProductWarehouseStock', productWarehouseStockSchema);
