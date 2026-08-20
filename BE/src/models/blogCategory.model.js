const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true },
    description: { type: String, default: '' },

    thumbnailMediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    thumbnailUrl:     { type: String, default: '' },

    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', default: null },
    order:    { type: Number, default: 0 },

    metaTitle:       { type: String, maxlength: 70, default: '' },
    metaDescription: { type: String, maxlength: 160, default: '' },

    postCount: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

blogCategorySchema.index({ slug: 1 }, { unique: true });
blogCategorySchema.index({ parentId: 1 });
blogCategorySchema.index({ order: 1 });

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
