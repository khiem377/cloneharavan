const Folder = require('../models/folder.model');
const { slugify } = require('../utils/slugify');


const findOrCreateFolder = async (name, parentId = null, explicitSlug = null) => {
  const slug = explicitSlug || slugify(name);
  return Folder.findOneAndUpdate(
    { slug, parentId },
    { $setOnInsert: { name, slug, parentId, position: 0 } },
    { upsert: true, new: true }
  );
};


const getOrCreateDateSubFolder = async (parentId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const slug = `${year}-${month}`;
  const name = `${month}/${year}`;
  return findOrCreateFolder(name, parentId, slug);
};



const getFolderContents = async (folderId, { q, page = 1, limit = 20 } = {}) => {
  const Media = require('../models/media.model');

  const subFolders = await Folder.find({ parentId: folderId }).sort('position');

  if (subFolders.length > 0) {

    const result = await Promise.all(
      subFolders.map(async (sub) => {
        const mediaFilter = { folderId: sub._id };
        if (q) mediaFilter.filename = { $regex: q, $options: 'i' };

        const items = await Media.find(mediaFilter)
          .sort({ createdAt: -1 })
          .limit(limit);

        return { ...sub.toObject(), media: items };
      })
    );
    return { type: 'grouped', folders: result };
  }


  const filter = { folderId };
  if (q) filter.filename = { $regex: q, $options: 'i' };

  const skip = (page - 1) * limit;
  const total = await Media.countDocuments(filter);
  const items = await Media.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { type: 'flat', items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getFolderTree = async () => {
  const all = await Folder.find().sort('position');

  const map = {};
  const tree = [];

  all.forEach((f) => {
    map[f._id] = { ...f.toObject(), children: [] };
  });

  all.forEach((f) => {
    if (f.parentId) {
      const parent = map[f.parentId];
      if (parent) parent.children.push(map[f._id]);
    } else {
      tree.push(map[f._id]);
    }
  });

  return tree;
};


const createFolder = async ({ name, parentId }) => {
  const slug = slugify(name);
  const { AppError } = require('../utils/AppError');

  // Kiểm tra giới hạn 3 cấp: cha → con → cháu
  if (parentId) {
    const parent = await Folder.findById(parentId);
    if (!parent) throw new AppError('Folder cha không tồn tại', 404);
    if (parent.parentId) {
      // parent đã là cấp 2 → thêm vào sẽ thành cấp 3 là tối đa
      const grandParent = await Folder.findById(parent.parentId);
      if (grandParent?.parentId) {
        throw new AppError('Chỉ cho phép tối đa 3 cấp thư mục', 400);
      }
    }
  }

  const existing = await Folder.findOne({ slug, parentId: parentId || null });
  if (existing) throw new AppError('Tên folder đã tồn tại', 400);

  const count = await Folder.countDocuments({ parentId: parentId || null });
  return Folder.create({ name, slug, parentId: parentId || null, position: count });
};


const reorderFolders = async (items) => {
  const bulkOps = items.map(({ id, position }) => ({
    updateOne: { filter: { _id: id }, update: { position } },
  }));
  await Folder.bulkWrite(bulkOps);
};


const deleteFolder = async (id) => {
  const Media = require('../models/media.model');
  const { AppError } = require('../utils/AppError');

  const hasMedia = await Media.exists({ folderId: id });
  if (hasMedia) throw new AppError('Folder đang chứa file ảnh, không thể xóa', 400);

  const hasChildren = await Folder.exists({ parentId: id });
  if (hasChildren) throw new AppError('Folder còn thư mục con, không thể xóa', 400);

  await Folder.findByIdAndDelete(id);
};

const renameFolder = async (id, name) => {
  const { AppError } = require('../utils/AppError');
  if (!name?.trim()) throw new AppError('Tên folder không được để trống', 400);

  const folder = await Folder.findById(id);
  if (!folder) throw new AppError('Folder không tồn tại', 404);

  const slug = slugify(name);
  const dup = await Folder.findOne({ slug, parentId: folder.parentId, _id: { $ne: id } });
  if (dup) throw new AppError('Tên folder đã tồn tại trong cùng cấp', 400);

  folder.name = name.trim();
  folder.slug = slug;
  return folder.save();
};

module.exports = {
  findOrCreateFolder,
  getOrCreateDateSubFolder,
  getFolderContents,
  getFolderTree,
  createFolder,
  renameFolder,
  reorderFolders,
  deleteFolder,
};
