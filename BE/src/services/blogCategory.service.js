const { slugify } = require('../utils/slugify');
const BlogCategory = require('../models/blogCategory.model');
const BlogPost     = require('../models/blogPost.model');
const { AppError } = require('../utils/AppError');

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = slugify(base);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await BlogCategory.findOne(query);
    if (!exists) return candidate;
    suffix++;
  }
};

const getAllBlogCategories = async (query = {}) => {
  const filter = {};
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.parentId !== undefined) filter.parentId = query.parentId || null;

  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.max(1, parseInt(query.limit) || 100);
  const skip  = (page - 1) * limit;

  const [data, total] = await Promise.all([
    BlogCategory.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
    BlogCategory.countDocuments(filter),
  ]);

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getBlogCategoryBySlug = async (slug) => {
  const cat = await BlogCategory.findOne({ slug });
  if (!cat) throw new AppError('Không tìm thấy danh mục blog', 404);
  return cat;
};

const createBlogCategory = async (data) => {
  data.slug = await ensureUniqueSlug(data.slug || data.name);
  if (!data.metaTitle) data.metaTitle = data.name.slice(0, 70);
  if (!data.metaDescription) data.metaDescription = (data.description || data.name).slice(0, 160);
  return BlogCategory.create(data);
};

const updateBlogCategory = async (id, data) => {
  if (data.name && !data.slug) {
    data.slug = await ensureUniqueSlug(data.name, id);
  } else if (data.slug) {
    data.slug = await ensureUniqueSlug(data.slug, id);
  }
  const cat = await BlogCategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!cat) throw new AppError('Không tìm thấy danh mục blog', 404);
  return cat;
};

const checkCategoryInUse = async (id) => {
  const posts = await BlogPost.find({ categories: id })
    .select('_id title slug')
    .limit(10)
    .lean();
  return posts;
};

const deleteBlogCategory = async (id) => {
  const inUse = await checkCategoryInUse(id);
  if (inUse.length > 0) {
    const err = new AppError('Danh mục đang được sử dụng, không thể xóa', 400);
    err.inUsePosts = inUse;
    throw err;
  }
  const cat = await BlogCategory.findByIdAndDelete(id);
  if (!cat) throw new AppError('Không tìm thấy danh mục blog', 404);
};

const deleteBulkBlogCategories = async (ids) => {
  const inUseMap = {};
  await Promise.all(
    ids.map(async (id) => {
      const posts = await checkCategoryInUse(id);
      if (posts.length > 0) inUseMap[id] = posts;
    })
  );

  if (Object.keys(inUseMap).length > 0) {
    const err = new AppError('Một số danh mục đang được sử dụng, không thể xóa', 400);
    err.inUseMap = inUseMap;
    throw err;
  }

  const result = await BlogCategory.deleteMany({ _id: { $in: ids } });
  return { deleted: result.deletedCount };
};

const reorderBlogCategories = async (items) => {
  if (!items?.length) return;
  await Promise.all(
    items.map(({ id, order }) =>
      BlogCategory.findByIdAndUpdate(id, { $set: { order: Number(order) } }, { new: true })
    )
  );
};

const toggleBlogCategoryStatus = async (id, isActive) => {
  const cat = await BlogCategory.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!cat) throw new AppError('Không tìm thấy danh mục blog', 404);
  return cat;
};

module.exports = {
  getAllBlogCategories,
  getBlogCategoryBySlug,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  deleteBulkBlogCategories,
  reorderBlogCategories,
  toggleBlogCategoryStatus,
};
