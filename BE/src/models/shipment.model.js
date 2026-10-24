const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    shipmentCode: {
      type: String,
      required: [true, 'Mã phiếu giao hàng là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'ID đơn hàng là bắt buộc'],
      index: true,
    },
    orderCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    deliveryType: {
      type: String,
      enum: ['carrier', 'self_delivery'],
      default: 'carrier',
      index: true,
    },
    carrierCode: {
      type: String,
      required: [true, 'Mã đối tác giao hàng là bắt buộc'],
      lowercase: true,
      trim: true,
      index: true,
    },
    carrierName: {
      type: String,
      required: true,
      trim: true,
    },
    trackingCode: {
      type: String,
      required: [true, 'Mã vận đơn đối tác là bắt buộc'],
      uppercase: true,
      trim: true,
      index: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
      index: true,
    },
    warehouseName: {
      type: String,
      default: 'Cửa hàng chính',
      trim: true,
    },
    senderInfo: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    receiverInfo: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      province: { type: String, default: '' },
      district: { type: String, default: '' },
      ward: { type: String, default: '' },
      detailAddress: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
    },
    packageInfo: {
      weight: { type: Number, default: 500, min: 0 }, // gram
      length: { type: Number, default: 10, min: 0 }, // cm
      width: { type: Number, default: 10, min: 0 },
      height: { type: Number, default: 10, min: 0 },
      note: { type: String, default: '' },
      requiredNote: {
        type: String,
        enum: [
          'CHOTHOXEM',
          'CHOXEMKHONGTHU',
          'KHONGCHOXEM',
          'CHOXEMHANGKHONGTHU',
          'CHOTHUHANG',
          'KHONGCHOXEMHANG',
        ],
        default: 'CHOXEMHANGKHONGTHU',
      },
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
        productName: { type: String, required: true },
        sku: { type: String, default: '' },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, default: 0 },
      },
    ],
    codAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    codStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'reconciled', 'discrepancy'],
      default: 'pending',
      index: true,
    },
    codReceivedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    codDiscrepancyAmount: {
      type: Number,
      default: 0,
    },
    reconciliationCode: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    codReconciledAt: {
      type: Date,
      default: null,
    },
    codReconciledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    codNote: {
      type: String,
      default: '',
      trim: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    payer: {
      type: String,
      enum: ['shop', 'receiver'],
      default: 'shop',
    },
    status: {
      type: String,
      enum: [
        'ready_to_pick', // Chờ lấy hàng
        'picking', // Đang lấy hàng
        'delivering', // Đang giao hàng
        'delivery_fail', // Chờ giao lại
        'returning', // Đang hoàn hàng
        'returned', // Đã hoàn hàng
        'delivered', // Đã giao hàng
        'cancelled', // Hủy giao hàng
      ],
      default: 'ready_to_pick',
      index: true,
    },
    statusText: {
      type: String,
      default: 'Chờ lấy hàng',
    },
    historyLogs: [
      {
        status: { type: String, required: true },
        description: { type: String, default: '' },
        location: { type: String, default: '' },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

shipmentSchema.index({ createdAt: -1 });
shipmentSchema.index({ status: 1, createdAt: -1 });
shipmentSchema.index({ carrierCode: 1, createdAt: -1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
