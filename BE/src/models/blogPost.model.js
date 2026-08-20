const mongoose = require('mongoose');

const tocItemSchema = new mongoose.Schema(
  {
    id:    { type: String },
    text:  { type: String },
    level: { type: Number },
    order: { type: Number },
  },
  { _id: false }
);

const blogPostSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true, maxlength: 200 },
    slug:    { type: String, required: true, unique: true },
    excerpt: { type: String, maxlength: 500, default: '' },
    content: { type: String, required: true, default: '' },

    thumbnailMediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    thumbnailUrl:     { type: String, default: '' },

    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' }],
    tags:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],

    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    metaTitle:       { type: String, maxlength: 70,  default: '' },
    metaDescription: { type: String, maxlength: 160, default: '' },
    canonicalUrl:    { type: String, default: '' },

    minRead:   { type: Number, default: 1 },
    wordCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt:  { type: Date, default: null },
    scheduledAt:  { type: Date, default: null },

    isActive:     { type: Boolean, default: true },
    isPinned:     { type: Boolean, default: false },
    isFeatured:   { type: Boolean, default: false },
    allowComment: { type: Boolean, default: true },

    viewsCount:    { type: Number, default: 0 },
    likesCount:    { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    tableOfContents: [tocItemSchema],

    relatedPostIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost' }],
  },
  { timestamps: true }
);

blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ categories: 1, status: 1 });
blogPostSchema.index({ tags: 1, status: 1 });
blogPostSchema.index({ authorId: 1, status: 1 });
blogPostSchema.index({ isPinned: -1, publishedAt: -1 });
blogPostSchema.index({ isFeatured: 1, status: 1 });
blogPostSchema.index({ viewsCount: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
