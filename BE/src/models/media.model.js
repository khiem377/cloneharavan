const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    filename:   { type: String, required: true, trim: true },
    url:        { type: String, required: true },
    publicId:   { type: String, required: true },
    folderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    mimeType:   { type: String },
    size:       { type: Number },
    width:      { type: Number },
    height:     { type: Number },
    // SEO & accessibility — tự sinh từ filename, không bắt buộc, có thể chỉnh sau
    altText:    { type: String, default: '' },
    caption:    { type: String, default: '' },
    // Track người upload
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // BLAKE3 content hash — detect duplicate trước khi upload lên Cloudinary
    hash:       { type: String, default: null },
  },
  { timestamps: true }
);

mediaSchema.index({ filename: 'text' });
mediaSchema.index({ folderId: 1, createdAt: -1 });
mediaSchema.index({ hash: 1 }, { sparse: true });

// Virtual: Cloudinary auto-format URL (WebP cho browser hỗ trợ, JPEG fallback)
// Chèn /f_auto,q_auto/ vào URL → giảm size 30-70% không cần code thêm
mediaSchema.virtual('optimizedUrl').get(function () {
  if (!this.url || !this.url.includes('cloudinary.com')) return this.url;
  return this.url.replace('/upload/', '/upload/f_auto,q_auto/');
});

mediaSchema.set('toJSON',   { virtuals: true });
mediaSchema.set('toObject', { virtuals: true });

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;
