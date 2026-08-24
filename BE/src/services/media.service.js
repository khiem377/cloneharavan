const Media = require('../models/media.model');
const Folder = require('../models/folder.model');
const { AppError } = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { getOrCreateDateSubFolder } = require('./folder.service');
const mediaRegistry = require('../config/mediaRegistry');

const uploadMedia = async (file, folderId) => {
  if (!file) throw new AppError('Vui lòng chọn file', 400);

  const targetFolder = await Folder.findById(folderId);
  if (!targetFolder) throw new AppError('Không tìm thấy folder', 404);

  let uploadFolder = targetFolder;
  let cloudinaryFolder = targetFolder.slug;

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

  const resp = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://ega-dien-may.myharavan.com/',
    },
  });
  if (!resp.ok) throw new AppError(`Không thể tải ảnh từ URL (${resp.status} ${resp.statusText})`, 400);
  const mimeType = resp.headers.get('content-type') || 'image/jpeg';
  if (!mimeType.startsWith('image/')) throw new AppError('URL không phải là ảnh', 400);
  const arrayBuffer = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filename = url.split('/').pop().split('?')[0] || 'image.jpg';
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


const getAllSubFolderIds = async (rootId) => {
  const allIds = [rootId];
  let currentIds = [rootId];
  while (currentIds.length > 0) {
    const children = await Folder.find({ parentId: { $in: currentIds } }, '_id').lean();
    if (children.length === 0) break;
    const childIds = children.map((c) => c._id);
    allIds.push(...childIds);
    currentIds = childIds;
  }
  return allIds;
};

const browseMedia = async ({ folderId, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' }) => {
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  if (folderId) {
    const allFolderIds = await getAllSubFolderIds(folderId);
    const subFolders = await Folder.find({ parentId: folderId }, 'name slug position').sort('position');

    const skip = (page - 1) * limit;
    const total = await Media.countDocuments({ folderId: { $in: allFolderIds } });
    const items = await Media.find({ folderId: { $in: allFolderIds } })
      .populate('folderId', 'name slug _id')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      type: subFolders.length > 0 ? 'parent' : 'leaf',
      subFolders: subFolders.map((f) => ({ _id: f._id, name: f.name, slug: f.slug })),
      media: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  const skip = (page - 1) * limit;
  const total = await Media.countDocuments({});
  const items = await Media.find()
    .populate('folderId', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return { type: 'all', media: items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const searchMedia = async ({ q, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'desc' }) => {
  if (!q || !q.trim()) {
    return { folders: [], media: [], total: 0, page, limit, totalPages: 0 };
  }

  const regex = new RegExp(q.trim(), 'i');
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  // 1. Find all matching folders by name or slug
  const directFolders = await Folder.find(
    { $or: [{ name: regex }, { slug: regex }] },
    'name slug parentId _id'
  ).lean();

  let folderIds = directFolders.map((f) => f._id);

  // 2. Collect all subfolders recursively
  if (folderIds.length > 0) {
    let currentIds = [...folderIds];
    while (currentIds.length > 0) {
      const children = await Folder.find({ parentId: { $in: currentIds } }, '_id').lean();
      if (children.length === 0) break;
      const childIds = children.map((c) => c._id);
      folderIds.push(...childIds);
      currentIds = childIds;
    }
  }

  // 3. Match media by filename, publicId OR any folderId in matching folders
  const mediaQuery = {
    $or: [
      { filename: regex },
      { publicId: regex },
      ...(folderIds.length > 0 ? [{ folderId: { $in: folderIds } }] : []),
    ],
  };

  const skip = (page - 1) * limit;

  const [total, mediaItems] = await Promise.all([
    Media.countDocuments(mediaQuery),
    Media.find(mediaQuery)
      .populate('folderId', 'name slug _id')
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ]);

  return {
    folders: directFolders,
    media: mediaItems,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};


const checkMediaUsages = async (ids) => {
  if (!ids || ids.length === 0) return {};

  const result = {};

  for (const entry of mediaRegistry) {
    const { model, displayName, mediaFields, getEntityName, getAdminUrl } = entry;

    const orConditions = mediaFields.map((field) => ({
      [field]: { $in: ids },
    }));

    const docs = await model.find({ $or: orConditions }).lean();

    for (const doc of docs) {
      for (const field of mediaFields) {
        const parts = field.split('.');
        let values = [doc];
        for (const part of parts) {
          values = values.flatMap((v) => {
            if (!v) return [];
            const val = v[part];
            return Array.isArray(val) ? val : [val];
          });
        }

        for (const mediaId of values) {
          if (!mediaId) continue;
          const mediaIdStr = mediaId.toString();
          if (!ids.map(String).includes(mediaIdStr)) continue;

          if (!result[mediaIdStr]) result[mediaIdStr] = [];

          const alreadyAdded = result[mediaIdStr].some(
            (u) => u.entityId === doc._id.toString() && u.displayName === displayName
          );
          if (!alreadyAdded) {
            result[mediaIdStr].push({
              displayName,
              entityId: doc._id.toString(),
              entityName: getEntityName(doc),
              adminUrl: getAdminUrl(doc),
            });
          }
        }
      }
    }
  }

  return result;
};


const deleteMedia = async (id) => {
  const media = await Media.findById(id);
  if (!media) throw new AppError('Không tìm thấy file', 404);
  await deleteFromCloudinary(media.publicId);
  await media.deleteOne();
};

const deleteMediaBulk = async (ids) => {
  const medias = await Media.find({ _id: { $in: ids } });
  for (const m of medias) {
    await deleteFromCloudinary(m.publicId).catch(() => {});
  }
  await Media.deleteMany({ _id: { $in: medias.map(m => m._id) } });
  return { deleted: medias.length };
};

module.exports = {
  uploadMedia, uploadMediaFromUrl,
  browseMedia, searchMedia,
  checkMediaUsages,
  deleteMedia, deleteMediaBulk,
};
