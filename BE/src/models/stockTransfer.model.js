const mongoose = require('mongoose');

const stockTransferItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },
    sku: { type: String, default: '' },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'Cái' },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const stockTransferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    fromWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Kho xuất chuyển là bắt buộc'],
    },
    toWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Kho nhận chuyển là bắt buộc'],
    },
    status: {
      type: String,
      enum: ['pending_ship', 'in_transit', 'completed', 'cancelled'],
      default: 'pending_ship',
    },
    items: [stockTransferItemSchema],
    totalQuantity: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: '',
    },
    shippedAt: Date,
    receivedAt: Date,
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

stockTransferSchema.index({ fromWarehouseId: 1, toWarehouseId: 1 });
stockTransferSchema.index({ status: 1 });

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
