const mongoose = require('mongoose');

const purchaseReturnItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
  sku: { type: String, default: '' },
  productName: { type: String, required: true },
  unit: { type: String, default: 'Cái' },
  quantity: { type: Number, required: true, min: 1 },
  returnPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  reason: { type: String, default: 'Hàng lỗi / Không đạt chất lượng' },
});

const purchaseReturnSchema = new mongoose.Schema(
  {
    returnNumber: { type: String, required: true, unique: true },
    poId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierName: { type: String, required: true },
    items: [purchaseReturnItemSchema],
    totalQuantity: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    refundStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid'],
      default: 'unpaid',
    },
    refundAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'completed'],
      default: 'completed',
    },
    note: { type: String, default: '' },
    documentUrl: { type: String, default: '' },
    documentPublicId: { type: String, default: '' },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseReturn', purchaseReturnSchema);
