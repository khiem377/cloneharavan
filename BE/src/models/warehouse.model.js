const mongoose = require('mongoose');

const binLocationSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true },
    rack: { type: String, trim: true },
    shelf: { type: String, trim: true },
    column: { type: String, trim: true },
  },
  { _id: false }
);

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên kho là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã kho là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      province: { type: String, default: '' },
      provinceId: { type: Number, default: null },
      district: { type: String, default: '' },
      districtId: { type: Number, default: null },
      ward: { type: String, default: '' },
      wardCode: { type: String, default: '' },
      detailAddress: { type: String, default: '' },
      fullAddress: { type: String, default: '' },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    binLocations: [binLocationSchema],
    assignedStaffIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

warehouseSchema.index({ isDefault: 1 });
warehouseSchema.index({ status: 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
