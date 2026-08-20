const Category = require('../models/category.model');
const Media = require('../models/media.model');
const { AppError } = require('../utils/AppError');
const { slugify } = require('../utils/slugify');

const resolveMedia = async (mediaId) => {
  if (!mediaId) return null;
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return { mediaId: media._id, url: media.url, publicId: media.publicId };
};

const buildTree = (list) => {
  const map = {};
  const tree = [];

  list.forEach((cat) => {
    map[cat._id.toString()] = { ...cat.toObject(), children: [] };
  });

  list.forEach((cat) => {
    const parentIdStr = cat.parentId?._id
      ? cat.parentId._id.toString()
      : cat.parentId?.toString() ?? null;

    if (parentIdStr && map[parentIdStr]) {
      map[parentIdStr].children.push(map[cat._id.toString()]);
    } else {
      tree.push(map[cat._id.toString()]);
    }
  });

  return tree;
};

const createCategory = async (data) => {
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  const existing = await Category.findOne({
    $or: [{ name: data.name }, { slug: generatedSlug }],
  });
  if (existing) throw new AppError('Tên danh mục hoặc slug đã tồn tại', 400);

  if (data.parentId) {
    const parent = await Category.findById(data.parentId);
    if (!parent) throw new AppError('Danh mục cha không tồn tại', 404);

    if (parent.parentId) {
      const grandParent = await Category.findById(parent.parentId);
      if (grandParent?.parentId) {
        throw new AppError('Chỉ cho phép tối đa 3 cấp danh mục', 400);
      }
    }
  }

  const image = await resolveMedia(data.imageMediaId);
  const icon = await resolveMedia(data.iconMediaId);

  const category = await Category.create({
    name: data.name,
    slug: generatedSlug,
    parentId: data.parentId || null,
    brandId: data.brandId || null,
    link: data.link || '',
    image: image || undefined,
    icon: icon || undefined,
    description: data.description,
    order: data.order,
    showOnMenu: data.showOnMenu,
    isActive: data.isActive,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
  });

  return category.populate('parentId', 'name slug');
};

const getAllCategories = async (query = {}) => {
  const filter = { isActive: true };
  if (query.showOnMenu !== undefined) filter.showOnMenu = query.showOnMenu === 'true';
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };

  const categories = await Category.find(filter)
    .populate('parentId', 'name slug')
    .populate('brandId', 'name slug logo')
    .sort({ order: 1, createdAt: 1 });

  if (query.tree === 'true') return buildTree(categories);
  return categories;
};

const getAllCategoriesAdmin = async (query = {}) => {
  const filter = {};
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const categories = await Category.find(filter)
    .populate('parentId', 'name slug')
    .populate('brandId', 'name slug logo')
    .sort({ order: 1, createdAt: 1 });

  if (query.tree === 'true') return buildTree(categories);
  return categories;
};

const getCategoryById = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const category = await Category.findOne(filter)
    .populate('parentId', 'name slug')
    .populate('brandId', 'name slug logo');
  if (!category) throw new AppError('Không tìm thấy danh mục', 404);
  return category;
};

const updateCategory = async (id, data) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Không tìm thấy danh mục', 404);

  if (data.name && data.name !== category.name) {
    const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existing = await Category.findOne({ slug: generatedSlug, _id: { $ne: id } });
    if (existing) throw new AppError('Tên danh mục hoặc slug đã bị trùng lặp', 400);
    data.slug = generatedSlug;
  }

  if (data.parentId !== undefined) {
    if (data.parentId && data.parentId.toString() === id) {
      throw new AppError('Danh mục không thể là cha của chính nó', 400);
    }
    if (data.parentId) {
      const parent = await Category.findById(data.parentId);
      if (!parent) throw new AppError('Danh mục cha không tồn tại', 404);
      if (parent.parentId) {
        const grandParent = await Category.findById(parent.parentId);
        if (grandParent?.parentId) {
          throw new AppError('Chỉ cho phép tối đa 3 cấp danh mục', 400);
        }
      }
    }
  }

  if (data.imageMediaId !== undefined) {
    const image = await resolveMedia(data.imageMediaId);
    category.image = image || { mediaId: null, url: '', publicId: '' };
  }

  if (data.iconMediaId !== undefined) {
    const icon = await resolveMedia(data.iconMediaId);
    category.icon = icon || { mediaId: null, url: '', publicId: '' };
  }

  const { imageMediaId, iconMediaId, ...rest } = data;
  if (rest.brandId === '') rest.brandId = null;
  Object.assign(category, rest);
  await category.save();

  return category.populate([
    { path: 'parentId', select: 'name slug' },
    { path: 'brandId', select: 'name slug logo' },
  ]);
};

const toggleCategoryStatus = async (id, isActive) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Không tìm thấy danh mục', 404);

  category.isActive = isActive !== undefined ? isActive : !category.isActive;
  await category.save();
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Không tìm thấy danh mục', 404);

  const hasChildren = await Category.exists({ parentId: id });
  if (hasChildren) throw new AppError('Danh mục đang có danh mục con, không thể xóa', 400);

  await category.deleteOne();
  return { message: 'Đã xóa danh mục thành công' };
};

const deleteBulkCategories = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Danh sách ID danh mục không hợp lệ', 400);
  }

  const result = await Category.deleteMany({ _id: { $in: ids } });
  return { message: `Đã xóa thành công ${result.deletedCount} danh mục` };
};

module.exports = {
  createCategory,
  getAllCategories,
  getAllCategoriesAdmin,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  deleteBulkCategories,
};
