const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên vai trò là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã vai trò là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false, // true đối với 'administrator' (không cho sửa/xóa)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roleSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
