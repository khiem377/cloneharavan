const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['IMPORT', 'EXPORT', 'ADJUSTMENT', 'RETURN_IMPORT', 'RETURN', 'PO_RECEIPT'],
      required: true,
    },
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
    beforeStock: { type: Number, required: true },
    changeQty: { type: Number, required: true },
    afterStock: { type: Number, required: true },
    referenceNumber: { type: String, default: '' }, // PO number, Export number, or Audit number
    reason: { type: String, default: '' },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

stockMovementSchema.index({ variantId: 1, createdAt: -1 });
stockMovementSchema.index({ referenceNumber: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
