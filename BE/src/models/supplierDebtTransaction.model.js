const mongoose = require('mongoose');

const supplierDebtTransactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Nhà cung cấp không được để trống'],
      index: true,
    },
    debtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplierDebt',
      default: null,
      index: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Kho hàng phát sinh thanh toán không được để trống'],
      index: true,
    },
    voucherType: {
      type: String,
      enum: ['payment', 'receipt'], // payment: Phiếu chi, receipt: Phiếu thu
      default: 'payment',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Số tiền giao dịch không được để trống'],
      min: [1, 'Số tiền giao dịch phải lớn hơn 0'],
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card', 'momo'],
      default: 'bank_transfer', // Tiền mặt, Tiền chuyển khoản, Quẹt thẻ, MoMo
    },
    accountingRecorded: {
      type: Boolean,
      default: true, // Hạch toán tài chính
    },
    debtCleared: {
      type: Boolean,
      default: true, // Thanh toán công nợ
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: {
      type: [String],
      default: [],
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Tự động sinh transactionNumber nếu chưa có
supplierDebtTransactionSchema.pre('validate', async function () {
  if (!this.transactionNumber) {
    const count = await mongoose.model('SupplierDebtTransaction').countDocuments();
    const prefix = this.voucherType === 'payment' ? 'PC' : 'PT';
    this.transactionNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('SupplierDebtTransaction', supplierDebtTransactionSchema);
