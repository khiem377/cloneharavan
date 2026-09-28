const mongoose = require('mongoose');

const stockAuditItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
  },
  sku: { type: String, default: '' },
  productName: { type: String, required: true },
  price: { type: Number, default: 0 },       // Don gia san pham (de tinh thanh tien chenh lech)
  systemStock: { type: Number, required: true },
  actualStock: { type: Number, required: true },
  difference: { type: Number, required: true }, // actualStock - systemStock
  reason: { type: String, default: '' },
});

const stockAuditSchema = new mongoose.Schema(
  {
    auditNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['draft', 'completed', 'cancelled'],
      default: 'completed',
    },
    items: [stockAuditItemSchema],
    totalDifference: { type: Number, default: 0 },
    note: { type: String, default: '' },
    auditDate: { type: Date, default: Date.now },
    documentUrl: { type: String, default: '' },
    documentPublicId: { type: String, default: '' },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockAudit', stockAuditSchema);
