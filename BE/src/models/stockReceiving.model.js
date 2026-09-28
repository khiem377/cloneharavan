const mongoose = require('mongoose');

const stockReceivingItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    default: null,
  },
  sku: {
    type: String,
    trim: true,
  },
  productName: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: 'Cái',
  },
  location: {
    type: String,
    default: 'Kho Tổng',
  },
  expectedQty: {
    type: Number,
    required: true,
    min: 0,
  },
  receivedQty: {
    type: Number,
    required: true,
    min: 1,
  },
  importPrice: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
});

const stockReceivingSchema = new mongoose.Schema(
  {
    receivingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    receivedDate: {
      type: Date,
      default: Date.now,
    },
    items: [stockReceivingItemSchema],
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StockReceiving', stockReceivingSchema);
