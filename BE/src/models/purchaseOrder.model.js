const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
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
  unit: { type: String, default: 'Cái' },
  expectedQty: { type: Number, required: true, min: 1 },
  actualQty: { type: Number, required: true, min: 0 },
  receivedQty: { type: Number, default: 0, min: 0 },
  importPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Nhà cung cấp không được để trống'],
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'in_transit', 'partial_received', 'arrived', 'inspecting', 'completed', 'cancelled'],
      default: 'draft',
    },
    items: [purchaseOrderItemSchema],
    totalQuantity: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: '',
    },
    deliveryDate: Date,
    receivedAt: Date,
    documentUrl: { type: String, default: '' },
    documentPublicId: { type: String, default: '' },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
