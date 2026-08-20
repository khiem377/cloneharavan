const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    mimeType: { type: String },
    size: { type: Number },
    width: { type: Number },
    height: { type: Number },
  },
  { timestamps: true }
);

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;
