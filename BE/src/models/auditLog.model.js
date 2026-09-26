const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      default: '',
    },
    userEmail: {
      type: String,
      default: '',
    },
    userRole: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'ROLLBACK', 'LOGIN', 'EXPORT'],
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: [
        'PRODUCT',
        'PRODUCT_VARIANT',
        'CATEGORY',
        'BRAND',
        'COUPON',
        'PROMOTION',
        'GIFT_PROGRAM',
        'FLASH_SALE',
        'USER',
        'ROLE',
        'SUPPLIER',
        'PURCHASE_ORDER',
        'STOCK_AUDIT',
        'STOCK_EXPORT',
        'STOCK_RECEIVING',
        'BANNER',
        'MENU',
        'MEDIA',
        'TAG',
        'BLOG',
      ],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: null,
      index: true,
    },
    targetName: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    changes: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
      },
    ],
    isRollbacked: {
      type: Boolean,
      default: false,
      index: true,
    },
    rollbackedAt: {
      type: Date,
      default: null,
    },
    rollbackedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
