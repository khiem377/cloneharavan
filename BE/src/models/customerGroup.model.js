const mongoose = require('mongoose');

const conditionRuleSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
      enum: ['totalSpent', 'orderCount', 'createdAtDays'],
    },
    operator: {
      type: String,
      required: true,
      enum: ['gte', 'lte', 'eq'],
      default: 'gte',
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const customerGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên nhóm khách hàng là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã nhóm là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['manual', 'automatic'],
      default: 'manual',
      index: true,
    },
    conditions: [conditionRuleSchema],
    conditionLogic: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND',
    },
    color: {
      type: String,
      enum: ['blue', 'emerald', 'amber', 'purple', 'rose', 'slate'],
      default: 'blue',
    },
    memberCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
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

customerGroupSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CustomerGroup', customerGroupSchema);
