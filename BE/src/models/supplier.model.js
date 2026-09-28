const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên nhà cung cấp không được để trống'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã nhà cung cấp không được để trống'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    taxCode: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
