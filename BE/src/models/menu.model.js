const mongoose = require('mongoose');

// ── Recursive item schema (max 3 levels deep) ──────────────────────────────
const menuItemSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Label là bắt buộc'],
      trim: true,
    },

    // Loại link: none | url | category | brand | blog | blog_post
    linkType: {
      type: String,
      enum: ['none', 'url', 'category', 'brand', 'blog', 'blog_post'],
      default: 'url',
    },

    // ObjectId ref tuỳ theo linkType (category/brand/blog/blog_post)
    linkRef: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Custom URL (dùng khi linkType = 'url', ví dụ: /pages/chinh-sach-bao-mat)
    customUrl: {
      type: String,
      trim: true,
      default: '',
    },

    openInNewTab: {
      type: Boolean,
      default: false,
    },

    // Icon: hình nhỏ đi kèm item
    icon: {
      mediaId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    // Badge text (e.g. "Hot", "Mới", "Sale")
    badge:      { type: String, trim: true, default: '' },
    badgeColor: { type: String, default: '#ef4444' }, // tailwind red-500

    // Cho item cấp 1: có hiển thị mega menu dạng nhiều cột hay dropdown thường
    megaMenu: { type: Boolean, default: false },

    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // Items cấp con (tối đa 2 cấp con nữa = 3 cấp tổng)
    children: { type: Array, default: [] },
  },
  { _id: true }
);

// ── Menu schema ──────────────────────────────────────────────────────────────
const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên menu là bắt buộc'],
      trim: true,
    },

    // Slug định danh, dùng để client gọi API (e.g. "main-menu", "footer", "header-nav")
    handle: {
      type: String,
      required: [true, 'Handle là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    items: [menuItemSchema],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuSchema.index({ handle: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);
