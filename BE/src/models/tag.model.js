const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    postCount: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

tagSchema.index({ slug: 1 }, { unique: true });
tagSchema.index({ postCount: -1 });

module.exports = mongoose.model('Tag', tagSchema);
