const mongoose = require('mongoose');

const stockExportItemSchema = new mongoose.Schema({
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
  quantity: { type: Number, required: true, min: 1 },
  exportPrice: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
});

const stockExportSchema = new mongoose.Schema(
  {
    exportNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    type: {
      type: String,
      enum: ['sale', 'transfer', 'return_supplier', 'other'],
      default: 'sale',
    },
    status: {
      type: String,
      enum: ['pending_pick', 'picking', 'packed', 'completed', 'cancelled', 'draft'],
      default: 'pending_pick',
    },
    activityLogs: [
      {
        status: String,
        note: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    recipientName: { type: String, default: '' },
    recipientAddress: { type: String, default: '' },
    recipientPhone: { type: String, default: '' },
    items: [stockExportItemSchema],
    totalQuantity: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    note: { type: String, default: '' },
    documentUrl: { type: String, default: '' },
    documentPublicId: { type: String, default: '' },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockExport', stockExportSchema);
