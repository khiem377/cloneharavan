const mongoose = require('mongoose');

const supplierDebtSchema = new mongoose.Schema(
  {
    debtNumber: {
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
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Tên khoản công nợ không được để trống'],
      trim: true,
    },
    debtType: {
      type: String,
      enum: ['payable', 'receivable'],
      default: 'payable', // payable: Công nợ phải trả, receivable: Công nợ phải thu
      index: true,
    },
    referenceType: {
      type: String,
      enum: ['purchase_order', 'purchase_return', 'manual', 'adjustment'],
      default: 'manual',
      index: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
      default: null,
    },
    referenceModel: {
      type: String,
      enum: ['PurchaseOrder', 'PurchaseReturn', null],
      default: null,
    },
    referenceCode: {
      type: String,
      trim: true,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Số tiền nợ không được nhỏ hơn 0'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Số tiền đã trả không được nhỏ hơn 0'],
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: [0, 'Số tiền còn lại không được nhỏ hơn 0'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Tự động sinh debtNumber nếu chưa có
supplierDebtSchema.pre('validate', async function () {
  if (!this.debtNumber) {
    const count = await mongoose.model('SupplierDebt').countDocuments();
    const prefix = this.debtType === 'payable' ? 'CNP' : 'CNT';
    this.debtNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
  if (this.remainingAmount === undefined) {
    this.remainingAmount = Math.max(0, (this.totalAmount || 0) - (this.paidAmount || 0));
  }
});

module.exports = mongoose.model('SupplierDebt', supplierDebtSchema);
