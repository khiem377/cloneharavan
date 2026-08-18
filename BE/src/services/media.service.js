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

  const targetFolder = await Folder.findById(folderId);
  if (!targetFolder) throw new AppError('Không tìm thấy folder', 404);

  let uploadFolder = targetFolder;
  let cloudinaryFolder = targetFolder.slug;

  // Chỉ auto-tạo date subfolder nếu đây là ROOT folder (không có parentId)
  if (!targetFolder.parentId) {
    const subFolder = await getOrCreateDateSubFolder(targetFolder._id);
    uploadFolder = subFolder;
    cloudinaryFolder = `${targetFolder.slug}/${subFolder.slug}`;
  }

  const result = await uploadToCloudinary(file.buffer, cloudinaryFolder);

  const saved = await Media.create({
    filename: file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    folderId: uploadFolder._id,
    mimeType: file.mimetype,
    size: result.bytes,
    width: result.width,
    height: result.height,
  });

  await saved.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });
  return saved;
};

/**
 * Upload ảnh từ URL – fetch → upload Cloudinary
 */
const uploadMediaFromUrl = async (url, folderId) => {
  if (!url) throw new AppError('URL không được để trống', 400);

  const targetFolder = await Folder.findById(folderId);
  if (!targetFolder) throw new AppError('Không tìm thấy folder', 404);

  let uploadFolder = targetFolder;
  let cloudinaryFolder = targetFolder.slug;
  if (!targetFolder.parentId) {
    const subFolder = await getOrCreateDateSubFolder(targetFolder._id);
    uploadFolder = subFolder;
    cloudinaryFolder = `${targetFolder.slug}/${subFolder.slug}`;
  }

  // Fetch ảnh từ URL
  const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!resp.ok) throw new AppError('Không thể tải ảnh từ URL', 400);
  const mimeType = resp.headers.get('content-type') || 'image/jpeg';
  if (!mimeType.startsWith('image/')) throw new AppError('URL không phải là ảnh', 400);
  const arrayBuffer = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filename = url.split('/').pop().split('?')[0] || 'image.jpg';

  // Upload lên Cloudinary dùng hàm đã có sẵn
  const result = await uploadToCloudinary(buffer, cloudinaryFolder);

  const saved = await Media.create({
    filename,
    url: result.secure_url,
    publicId: result.public_id,
    folderId: uploadFolder._id,
    mimeType,
    size: result.bytes,
    width: result.width,
    height: result.height,
  });

  await saved.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });
  return saved;
};


const browseMedia = async ({ folderId, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' }) => {
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  if (folderId) {
    const subFolders = await Folder.find({ parentId: folderId }, 'name slug position').sort('position');

    if (subFolders.length > 0) {
      const skip = (page - 1) * limit;
      const total = await Media.countDocuments({ folderId });
      const items = await Media.find({ folderId }).sort(sort).skip(skip).limit(limit);
      return {
        type: 'parent',
        subFolders: subFolders.map((f) => ({ _id: f._id, name: f.name, slug: f.slug })),
        media: items,
        total, page, limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const skip = (page - 1) * limit;
    const total = await Media.countDocuments({ folderId });
    const items = await Media.find({ folderId }).sort(sort).skip(skip).limit(limit);
    return { type: 'leaf', media: items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  const skip = (page - 1) * limit;
  const total = await Media.countDocuments({});
  const items = await Media.find()
    .populate('folderId', 'name slug')
    .sort(sort).skip(skip).limit(limit);
  return { type: 'all', media: items, total, page, limit, totalPages: Math.ceil(total / limit) };
};


const searchMedia = async ({ q, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' }) => {
  if (!q) return { folders: [], media: [], total: 0 };

  const regex = { $regex: q, $options: 'i' };
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  const [folders, total, mediaItems] = await Promise.all([
    Folder.find({ $or: [{ name: regex }, { slug: regex }] }, 'name slug parentId').limit(10),
    Media.countDocuments({ filename: regex }),
    Media.find({ filename: regex })
      .populate('folderId', 'name slug _id')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return { folders, media: mediaItems, total, page, limit, totalPages: Math.ceil(total / limit) };
};


/**
 * Xóa 1 media – luôn cho phép, trả về usedBy info nếu có
 */
const deleteMedia = async (id) => {
  const media = await Media.findById(id);
  if (!media) throw new AppError('Không tìm thấy file', 404);

  const usedBy = media.usedBy ?? [];
  await deleteFromCloudinary(media.publicId);
  await media.deleteOne();

  return { usedBy }; // trả về để frontend hiển thị thông báo
};

/**
 * Xóa nhiều – xóa tất cả, kể cả file đang dùng
 */
const deleteMediaBulk = async (ids) => {
  const medias = await Media.find({ _id: { $in: ids } });

  let usedModels = [];
  for (const m of medias) {
    if (m.usedBy?.length) usedModels.push(...m.usedBy.map(u => u.model));
    await deleteFromCloudinary(m.publicId).catch(() => {}); // ignore cloudinary err
  }
  await Media.deleteMany({ _id: { $in: medias.map(m => m._id) } });

  const uniqueModels = [...new Set(usedModels)];
  return {
    deleted: medias.length,
    skipped: 0,
    usedNote: uniqueModels.length ? `(có ${usedModels.length} file đã được dùng bởi: ${uniqueModels.join(', ')})` : '',
  };
};

module.exports = {
  uploadMedia, uploadMediaFromUrl,
  browseMedia, searchMedia,
  deleteMedia, deleteMediaBulk,
};
