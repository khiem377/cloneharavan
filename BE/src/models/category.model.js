const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    icon: {
      mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    showOnMenu: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name);
  }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
