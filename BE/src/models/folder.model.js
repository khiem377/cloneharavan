const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);


folderSchema.index({ slug: 1, parentId: 1 }, { unique: true });

const Folder = mongoose.model('Folder', folderSchema);
module.exports = Folder;
