const { slugify } = require('../utils/slugify');
const Tag = require('../models/tag.model');
const { AppError } = require('../utils/AppError');

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = slugify(base);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Tag.findOne(query);
    if (!exists) return candidate;
    suffix++;
  }
};

const getAllTags = async (query = {}) => {
  const filter = {};
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.max(1, parseInt(query.limit) || 20);
  const skip  = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Tag.find(filter).sort({ postCount: -1, createdAt: -1 }).skip(skip).limit(limit),
    Tag.countDocuments(filter),
  ]);

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getTagBySlug = async (slug) => {
  const tag = await Tag.findOne({ slug });
  if (!tag) throw new AppError('Không tìm thấy tag', 404);
  return tag;
};

const createTag = async (data) => {
  data.slug = await ensureUniqueSlug(data.slug || data.name);
  return Tag.create(data);
};

const updateTag = async (id, data) => {
  if (data.name && !data.slug) {
    data.slug = await ensureUniqueSlug(data.name, id);
  } else if (data.slug) {
    data.slug = await ensureUniqueSlug(data.slug, id);
  }
  const tag = await Tag.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!tag) throw new AppError('Không tìm thấy tag', 404);
  return tag;
};

const deleteTag = async (id) => {
  const tag = await Tag.findByIdAndDelete(id);
  if (!tag) throw new AppError('Không tìm thấy tag', 404);
};

const deleteBulkTags = async (ids) => {
  if (!ids?.length) throw new AppError('Không có tag nào được chọn', 400);
  const result = await Tag.deleteMany({ _id: { $in: ids } });
  return { deleted: result.deletedCount };
};

const toggleTagStatus = async (id, isActive) => {
  const tag = await Tag.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!tag) throw new AppError('Không tìm thấy tag', 404);
  return tag;
};

module.exports = {
  getAllTags,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
  deleteBulkTags,
  toggleTagStatus,
};
