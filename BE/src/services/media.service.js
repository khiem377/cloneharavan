const crypto = require('crypto');
const mongoose = require('mongoose');
const Media  = require('../models/media.model');
const Folder = require('../models/folder.model');
const { AppError } = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { getOrCreateDateSubFolder } = require('./folder.service');
const mediaRegistry = require('../config/mediaRegistry');

// ---------------------------------------------------------------------------
// SHA-256 hash — Node.js built-in, zero deps, đủ tốt cho duplicate detection
// (BLAKE3 nhanh hơn nhưng @noble/hashes dùng ESM không compatible với CJS)
// ---------------------------------------------------------------------------
const computeHash = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex');

// ---------------------------------------------------------------------------
// Helper: tự sinh altText từ filename
// ---------------------------------------------------------------------------
const generateAltText = (filename = '') =>
  filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------------------
// Helper: lấy tất cả subfolder IDs ($graphLookup — 1 query)
// ---------------------------------------------------------------------------
const getAllSubFolderIds = async (rootId) => {
  const result = await Folder.aggregate([
    { $match: { _id: rootId } },
    {
      $graphLookup: {
        from: 'folders', startWith: '$_id',
        connectFromField: '_id', connectToField: 'parentId',
        as: 'descendants', maxDepth: 10,
      },
    },
    { $project: { descendants: '$descendants._id' } },
  ]);
  if (!result.length) return [rootId];
  return [rootId, ...(result[0].descendants || [])];
};

// ---------------------------------------------------------------------------
// Helper: resolve upload folder
// ---------------------------------------------------------------------------
const resolveUploadFolder = async (folderId) => {
  const targetFolder = await Folder.findById(folderId);
  if (!targetFolder) throw new AppError('Không tìm thấy folder', 404);
  if (!targetFolder.parentId) {
    const sub = await getOrCreateDateSubFolder(targetFolder._id);
    return { uploadFolder: sub, cloudinaryFolder: `${targetFolder.slug}/${sub.slug}` };
  }
  return { uploadFolder: targetFolder, cloudinaryFolder: targetFolder.slug };
};

// ---------------------------------------------------------------------------
// Upload file — có BLAKE3 duplicate detection
// ---------------------------------------------------------------------------
const uploadMedia = async (file, folderId, uploadedBy = null) => {
  if (!file) throw new AppError('Vui lòng chọn file', 400);

  // 1. Tính hash trước khi upload
  const fileHash = computeHash(file.buffer);

  // 2. Kiểm tra duplicate
  const existing = await Media.findOne({ hash: fileHash });
  if (existing) {
    await existing.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });
    // Trả về lỗi 409 kèm file đã tồn tại để FE hiện cảnh báo
    const err = new AppError(`File này đã tồn tại: "${existing.filename}"`, 409);
    err.existingMedia = existing;
    throw err;
  }

  // 3. Upload lên Cloudinary
  const { uploadFolder, cloudinaryFolder } = await resolveUploadFolder(folderId);
  const result = await uploadToCloudinary(file.buffer, cloudinaryFolder);

  const saved = await Media.create({
    filename:   file.originalname,
    url:        result.secure_url,
    publicId:   result.public_id,
    folderId:   uploadFolder._id,
    mimeType:   file.mimetype,
    size:       result.bytes,
    width:      result.width,
    height:     result.height,
    altText:    generateAltText(file.originalname),
    caption:    '',
    uploadedBy,
    hash:       fileHash,
  });

  await saved.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });
  return saved;
};

// ---------------------------------------------------------------------------
// Upload từ URL — có BLAKE3 duplicate detection
// ---------------------------------------------------------------------------
const uploadMediaFromUrl = async (url, folderId, uploadedBy = null) => {
  if (!url) throw new AppError('URL không được để trống', 400);

  const resp = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer':    'https://ega-dien-may.myharavan.com/',
    },
  });
  if (!resp.ok) throw new AppError(`Không thể tải ảnh từ URL (${resp.status})`, 400);
  const mimeType = resp.headers.get('content-type') || 'image/jpeg';
  if (!mimeType.startsWith('image/')) throw new AppError('URL không phải là ảnh', 400);

  const buffer   = Buffer.from(await resp.arrayBuffer());
  const fileHash = computeHash(buffer);

  // Check duplicate
  const existing = await Media.findOne({ hash: fileHash });
  if (existing) {
    await existing.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });
    const err = new AppError(`File này đã tồn tại: "${existing.filename}"`, 409);
    err.existingMedia = existing;
    throw err;
  }

  const filename = url.split('/').pop().split('?')[0] || 'image.jpg';
  const { uploadFolder, cloudinaryFolder } = await resolveUploadFolder(folderId);
  const result = await uploadToCloudinary(buffer, cloudinaryFolder);

  const saved = await Media.create({
    filename,
    url:        result.secure_url,
    publicId:   result.public_id,
    folderId:   uploadFolder._id,
    mimeType,
    size:       result.bytes,
    width:      result.width,
    height:     result.height,
    altText:    generateAltText(filename),
    caption:    '',
    uploadedBy,
    hash:       fileHash,
  });

  await saved.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });
  return saved;
};

// ---------------------------------------------------------------------------
// Browse
// ---------------------------------------------------------------------------
const browseMedia = async ({ folderId, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' }) => {
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  if (folderId) {
    const allFolderIds = await getAllSubFolderIds(folderId);
    const subFolders   = await Folder.find({ parentId: folderId }, 'name slug position').sort('position');
    const skip  = (page - 1) * limit;
    const query = { folderId: { $in: allFolderIds } };
    const total = await Media.countDocuments(query);
    const items = await Media.find(query).populate('folderId', 'name slug _id').sort(sort).skip(skip).limit(limit);
    return {
      type: subFolders.length > 0 ? 'parent' : 'leaf',
      subFolders: subFolders.map((f) => ({ _id: f._id, name: f.name, slug: f.slug })),
      media: items, total, page, limit, totalPages: Math.ceil(total / limit),
    };
  }

  const skip  = (page - 1) * limit;
  const total = await Media.countDocuments({});
  const items = await Media.find().populate('folderId', 'name slug').sort(sort).skip(skip).limit(limit);
  return { type: 'all', media: items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
const searchMedia = async ({ q, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' }) => {
  if (!q?.trim()) return { folders: [], media: [], total: 0, page, limit, totalPages: 0 };
  const regex = new RegExp(q.trim(), 'i');
  const sort  = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  const directFolders = await Folder.find({ $or: [{ name: regex }, { slug: regex }] }, 'name slug parentId _id').lean();
  let folderIds = directFolders.map((f) => f._id);
  if (folderIds.length > 0) {
    const expanded = await Folder.aggregate([
      { $match: { _id: { $in: folderIds } } },
      { $graphLookup: { from: 'folders', startWith: '$_id', connectFromField: '_id', connectToField: 'parentId', as: 'desc', maxDepth: 10 } },
      { $unwind: { path: '$desc', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, ids: { $addToSet: '$desc._id' } } },
    ]);
    if (expanded.length && expanded[0].ids.length) folderIds = [...folderIds, ...expanded[0].ids];
  }

  const mediaQuery = {
    $or: [
      { filename: regex }, { altText: regex }, { publicId: regex },
      ...(folderIds.length > 0 ? [{ folderId: { $in: folderIds } }] : []),
    ],
  };
  const skip = (page - 1) * limit;
  const [total, mediaItems] = await Promise.all([
    Media.countDocuments(mediaQuery),
    Media.find(mediaQuery).populate('folderId', 'name slug _id').sort(sort).skip(skip).limit(limit),
  ]);
  return { folders: directFolders, media: mediaItems, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ---------------------------------------------------------------------------
// Check usages
// ---------------------------------------------------------------------------
const checkMediaUsages = async (ids) => {
  if (!ids?.length) return {};
  const result = {};
  // Cast sang ObjectId de dam bao match dung kieu trong MongoDB (tranh truong hop string vs ObjectId)
  const objectIds = ids.map((id) => {
    try { return new mongoose.Types.ObjectId(id); } catch { return null; }
  }).filter(Boolean);

  for (const entry of mediaRegistry) {
    const { model, displayName, mediaFields, getEntityName, getAdminUrl } = entry;
    const docs = await model.find({ $or: mediaFields.map((f) => ({ [f]: { $in: objectIds } })) }).lean();
    for (const doc of docs) {
      for (const field of mediaFields) {
        let values = [doc];
        for (const part of field.split('.')) {
          values = values.flatMap((v) => { if (!v) return []; const val = v[part]; return Array.isArray(val) ? val : [val]; });
        }
        for (const mediaId of values) {
          if (!mediaId) continue;
          const mid = mediaId.toString();
          if (!ids.map(String).includes(mid)) continue;
          if (!result[mid]) result[mid] = [];
          const dup = result[mid].some((u) => u.entityId === doc._id.toString() && u.displayName === displayName);
          if (!dup) result[mid].push({ displayName, entityId: doc._id.toString(), entityName: getEntityName(doc), adminUrl: getAdminUrl(doc) });
        }
      }
    }
  }
  return result;
};

// ---------------------------------------------------------------------------
// Unused media finder — ảnh không được dùng ở bất kỳ đâu
// ---------------------------------------------------------------------------
const getUnusedMedia = async ({ page = 1, limit = 30 } = {}) => {
  // 1. Thu thập tất cả media IDs đang được dùng
  const usedIds = new Set();
  for (const entry of mediaRegistry) {
    const { model, mediaFields } = entry;
    const docs = await model.find({
      $or: mediaFields.map((f) => ({ [f]: { $exists: true, $ne: null } })),
    }, mediaFields.join(' ')).lean();

    for (const doc of docs) {
      for (const field of mediaFields) {
        let values = [doc];
        for (const part of field.split('.')) {
          values = values.flatMap((v) => { if (!v) return []; const val = v[part]; return Array.isArray(val) ? val : [val]; });
        }
        values.forEach((id) => { if (id) usedIds.add(id.toString()); });
      }
    }
  }

  // 2. Tìm media KHÔNG có trong usedIds
  const query = usedIds.size > 0
    ? { _id: { $nin: Array.from(usedIds) } }
    : {};

  const skip  = (page - 1) * limit;
  const total = await Media.countDocuments(query);
  const items = await Media.find(query)
    .populate('folderId', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { media: items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ---------------------------------------------------------------------------
// Rename
// ---------------------------------------------------------------------------
const renameMedia = async (id, filename) => {
  const media = await Media.findById(id);
  if (!media) throw new AppError('Không tìm thấy file', 404);
  if (!media.altText || media.altText === generateAltText(media.filename)) {
    media.altText = generateAltText(filename);
  }
  media.filename = filename.trim();
  await media.save();
  return media;
};

// ---------------------------------------------------------------------------
// Update metadata
// ---------------------------------------------------------------------------
const updateMediaMeta = async (id, { altText, caption }) => {
  const media = await Media.findById(id);
  if (!media) throw new AppError('Không tìm thấy file', 404);
  if (altText !== undefined) media.altText = altText;
  if (caption !== undefined) media.caption  = caption;
  await media.save();
  return media;
};

// ---------------------------------------------------------------------------
// Bulk Move
// ---------------------------------------------------------------------------
const moveMediaBulk = async (ids, targetFolderId) => {
  const folder = await Folder.findById(targetFolderId);
  if (!folder) throw new AppError('Không tìm thấy folder đích', 404);
  const result = await Media.updateMany({ _id: { $in: ids } }, { $set: { folderId: folder._id } });
  return { moved: result.modifiedCount };
};

// ---------------------------------------------------------------------------
// Delete single — check usage (đồng nhất với deleteMediaBulk)
// ---------------------------------------------------------------------------
const deleteMedia = async (id, force = false) => {
  const media = await Media.findById(id);
  if (!media) throw new AppError('Không tìm thấy file', 404);

  if (!force) {
    const usages = await checkMediaUsages([id]);
    const usedBy = usages[id.toString()] || [];
    if (usedBy.length > 0) {
      const where = usedBy.map((u) => u.displayName).join(', ');
      throw new AppError(
        `File đang được sử dụng bởi: ${where}. Dùng force=true để xóa bắt buộc.`,
        409,
        { usages: usedBy }
      );
    }
  }

  await deleteFromCloudinary(media.publicId);
  await media.deleteOne();
};

// ---------------------------------------------------------------------------
// Bulk Delete — check usages, force flag để bỏ qua
// ---------------------------------------------------------------------------
const deleteMediaBulk = async (ids, force = false) => {
  if (!force) {
    const usages  = await checkMediaUsages(ids);
    const usedIds = Object.keys(usages).filter((k) => usages[k].length > 0);
    if (usedIds.length > 0) {
      throw new AppError(
        `${usedIds.length} file đang được sử dụng. Dùng force=true để xóa bắt buộc.`,
        409,
        { usedIds, usages }
      );
    }
  }
  const medias = await Media.find({ _id: { $in: ids } });
  await Promise.allSettled(medias.map((m) => deleteFromCloudinary(m.publicId)));
  await Media.deleteMany({ _id: { $in: medias.map((m) => m._id) } });
  return { deleted: medias.length };
};

// ---------------------------------------------------------------------------
// Storage Stats
// ---------------------------------------------------------------------------
const getMediaStats = async () => {
  const [stats] = await Media.aggregate([
    {
      $group: {
        _id:        null,
        totalFiles: { $sum: 1 },
        totalSize:  { $sum: '$size' },
        byType:     { $push: { mimeType: '$mimeType', size: '$size' } },
      },
    },
    {
      $project: {
        totalFiles: 1,
        totalSize:  1,
        images: { $size: { $filter: { input: '$byType', as: 'f', cond: { $regexMatch: { input: '$$f.mimeType', regex: '^image/' } } } } },
        videos: { $size: { $filter: { input: '$byType', as: 'f', cond: { $regexMatch: { input: '$$f.mimeType', regex: '^video/' } } } } },
      },
    },
  ]);
  return stats || { totalFiles: 0, totalSize: 0, images: 0, videos: 0 };
};

// ---------------------------------------------------------------------------
// Get usage of a single media item
// ---------------------------------------------------------------------------
const getSingleMediaUsage = async (id) => {
  const usages = await checkMediaUsages([id]);
  return usages[id] || [];
};

// ---------------------------------------------------------------------------
// Bulk fetch media by IDs (for FE to resolve folder info)
// ---------------------------------------------------------------------------
const getMediaByIds = async (ids) => {
  if (!ids?.length) return [];
  return Media.find({ _id: { $in: ids } })
    .populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } })
    .lean();
};

module.exports = {
  uploadMedia, uploadMediaFromUrl,
  browseMedia, searchMedia,
  checkMediaUsages,
  getSingleMediaUsage,
  getMediaByIds,
  getUnusedMedia,
  renameMedia, updateMediaMeta,
  moveMediaBulk,
  deleteMedia, deleteMediaBulk,
  getMediaStats,
};
