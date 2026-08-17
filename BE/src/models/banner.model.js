const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    title: { type: String, trim: true },
    imageUrl: { type: String, required: [true, 'Ảnh banner là bắt buộc'] },
    publicId: { type: String, required: true },
    link: { type: String, trim: true },
    position: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
