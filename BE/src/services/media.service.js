const Media = require('../models/media.model');
const Folder = require('../models/folder.model');
const { AppError } = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { getOrCreateDateSubFolder } = require('./folder.service');

/**
 * Upload file vào 1 folder cụ thể
 * - Tự tạo sub-folder tháng/năm nếu chưa có
 * - folder path Cloudinary = folderSlugPath
 */
const uploadMedia = async (file, folderId) => {
  if (!file) throw new AppError('Vui lòng chọn file', 400);

  // Lấy thông tin folder cha
  const parentFolder = await Folder.findById(folderId);
  if (!parentFolder) throw new AppError('Không tìm thấy folder', 404);

  // Tự tạo sub-folder tháng/năm dưới folder cha
  const subFolder = await getOrCreateDateSubFolder(parentFolder._id);

  // Build Cloudinary folder path: banners/2026-08
  const cloudinaryFolder = `${parentFolder.slug}/${subFolder.slug}`;

  const result = await uploadToCloudinary(file.buffer, cloudinaryFolder);

  const saved = await Media.create({
    filename: file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    folderId: subFolder._id,
    mimeType: file.mimetype,
    size: result.bytes,
    width: result.width,
    height: result.height,
  });


  await saved.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });
  return saved;
};


const browseMedia = async ({ folderId, page = 1, limit = 20 }) => {
  if (folderId) {
    const subFolders = await Folder.find({ parentId: folderId }, 'name slug position').sort('position');

    if (subFolders.length > 0) {

      const skip = (page - 1) * limit;
      const total = await Media.countDocuments({ folderId });
      const items = await Media.find({ folderId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        type: 'parent',
        subFolders: subFolders.map((f) => ({ _id: f._id, name: f.name, slug: f.slug })),
        media: items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }


    const skip = (page - 1) * limit;
    const total = await Media.countDocuments({ folderId });
    const items = await Media.find({ folderId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return { type: 'leaf', media: items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }


  const skip = (page - 1) * limit;
  const total = await Media.countDocuments({});
  const items = await Media.find()
    .populate('folderId', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { type: 'all', media: items, total, page, limit, totalPages: Math.ceil(total / limit) };
};


const searchMedia = async ({ q, page = 1, limit = 20 }) => {
  if (!q) return { folders: [], media: [], total: 0 };

  const regex = { $regex: q, $options: 'i' };

  const [folders, mediaTotal, mediaItems] = await Promise.all([
    Folder.find({ $or: [{ name: regex }, { slug: regex }] }, 'name slug parentId').limit(20),
    Media.countDocuments({ filename: regex }),
    Media.find({ filename: regex })
      .populate('folderId', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    folders,
    media: mediaItems,
    mediaTotal,
    page,
    limit,
    totalPages: Math.ceil(mediaTotal / limit),
  };
};


/**
 * Xóa 1 media – chặn nếu đang được dùng
 */
const deleteMedia = async (id) => {
  const media = await Media.findById(id);
  if (!media) throw new AppError('Không tìm thấy file', 404);

  if (media.usedBy?.length > 0) {
    throw new AppError(
      `File đang được sử dụng bởi ${media.usedBy.length} tài nguyên, không thể xóa`,
      400
    );
  }

  await deleteFromCloudinary(media.publicId);
  await media.deleteOne();
};

/**
 * Xóa nhiều – bỏ qua file đang dùng
 */
const deleteMediaBulk = async (ids) => {
  const medias = await Media.find({ _id: { $in: ids } });

  const deletable = medias.filter((m) => !m.usedBy?.length);
  const skipped = medias.filter((m) => m.usedBy?.length);

  await Media.deleteMany({ _id: { $in: deletable.map((m) => m._id) } });
  await Promise.all(deletable.map((m) => deleteFromCloudinary(m.publicId)));

  return {
    deleted: deletable.length,
    skipped: skipped.length,
    skippedFiles: skipped.map((m) => m.filename),
  };
};

module.exports = { uploadMedia, browseMedia, searchMedia, deleteMedia, deleteMediaBulk };
