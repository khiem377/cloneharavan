const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên quyền là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã quyền là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    module: {
      type: String,
      required: [true, 'Nhóm chức năng (module) là bắt buộc'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

permissionSchema.index({ code: 1 }, { unique: true });
permissionSchema.index({ module: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
