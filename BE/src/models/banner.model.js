const mongoose = require('mongoose');

const BANNER_TYPES = ['hero', 'popup', 'sidebar', 'category-top', 'product-top'];

const bannerSchema = new mongoose.Schema(
  {
    mediaId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    title:      { type: String, trim: true },
    altText:    { type: String, trim: true, default: '' },   // SEO
    imageUrl:   { type: String, required: [true, 'Ảnh banner là bắt buộc'] },
    publicId:   { type: String, required: true },
    link:       { type: String, trim: true },
    position:   { type: Number, default: 0 },
    isVisible:  { type: Boolean, default: true },

    // Loại/vị trí banner — FE filter theo type
    type: {
      type:    String,
      enum:    BANNER_TYPES,
      default: 'hero',
    },

    // Lên lịch hiển thị — null = không giới hạn
    startAt: { type: Date, default: null },
    endAt:   { type: Date, default: null },

    // Analytics
    viewCount:  { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bannerSchema.index({ type: 1, position: 1 });
bannerSchema.index({ isVisible: 1, startAt: 1, endAt: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
module.exports.BANNER_TYPES = BANNER_TYPES;
