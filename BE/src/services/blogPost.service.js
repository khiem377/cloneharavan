const { slugify } = require('../utils/slugify');
const { stripHtml } = require('../utils/htmlUtils');
const BlogPost = require('../models/blogPost.model');
const BlogCategory = require('../models/blogCategory.model');
const Tag = require('../models/tag.model');
const { AppError } = require('../utils/AppError');
const { buildSeoFields } = require('./blogSeo.service');

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = slugify(base);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await BlogPost.findOne(query);
    if (!exists) return candidate;
    suffix++;
  }
};

const calcMinRead = (html) => {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  return { minRead: Math.max(1, Math.ceil(words / 200)), wordCount: words };
};

const genExcerpt = (html, max = 300) => {
  const text = stripHtml(html);
  return text.length <= max ? text : text.slice(0, max).replace(/\s+\S*$/, '') + '...';
};

const extractToc = (html) => {
  const headingRe = /<h([23])[^>]*?(?:id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi;
  const result = [];
  let match;
  let order = 0;
  while ((match = headingRe.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id    = match[2] || slugify(stripHtml(match[3]));
    const text  = stripHtml(match[3]);
    result.push({ id, text, level, order: order++ });
  }
  return result;
};

const applyAutoFields = (data) => {
  if (data.content) {
    const { minRead, wordCount } = calcMinRead(data.content);
    if (!data.minRead)   data.minRead   = minRead;
    if (!data.wordCount) data.wordCount = wordCount;
    data.tableOfContents = extractToc(data.content);
    if (!data.excerpt) data.excerpt = genExcerpt(data.content);
  }
  if (!data.metaTitle && data.title)     data.metaTitle       = data.title.slice(0, 70);
  if (!data.metaDescription && data.excerpt) data.metaDescription = data.excerpt.slice(0, 160);
  return data;
};

const updateTagCounts = async (oldTagIds = [], newTagIds = []) => {
  const old_ = oldTagIds.map(String);
  const new_ = newTagIds.map(String);
  const added   = new_.filter((id) => !old_.includes(id));
  const removed = old_.filter((id) => !new_.includes(id));
  if (added.length)   await Tag.updateMany({ _id: { $in: added } },   { $inc: { postCount: 1 } });
  if (removed.length) await Tag.updateMany({ _id: { $in: removed } }, { $inc: { postCount: -1 } });
};

const updateCategoryCounts = async (oldCatIds = [], newCatIds = []) => {
  const old_ = (oldCatIds || []).map(String);
  const new_ = (newCatIds || []).map(String);
  const added   = new_.filter(id => !old_.includes(id));
  const removed = old_.filter(id => !new_.includes(id));
  if (added.length)   await BlogCategory.updateMany({ _id: { $in: added } },   { $inc: { postCount: 1 } });
  if (removed.length) await BlogCategory.updateMany({ _id: { $in: removed } }, { $inc: { postCount: -1 } });
};

const getAllPosts = async (query = {}) => {
  const filter = {};
  const kw = query.keyword || query.q || query.search;
  if (kw) {
    filter.$or = [
      { title: { $regex: kw, $options: 'i' } },
      { slug: { $regex: kw, $options: 'i' } },
      { excerpt: { $regex: kw, $options: 'i' } },
    ];
  }
  if (query.status)     filter.status = query.status;
  if (query.categoryId) filter.categories = query.categoryId;
  if (query.tag) {
    const mongoose = require('mongoose');
    let tagId = null;
    if (mongoose.Types.ObjectId.isValid(query.tag)) {
      tagId = query.tag;
    } else {
      const tagStr = String(query.tag).trim();
      const foundTag = await Tag.findOne({
        $or: [
          { slug: tagStr },
          { slug: tagStr.toLowerCase() },
          { name: new RegExp(`^${tagStr}$`, 'i') },
        ],
      }).select('_id');
      tagId = foundTag ? foundTag._id : null;
    }
    if (tagId) {
      filter.tags = tagId;
    } else {
      filter.tags = new mongoose.Types.ObjectId(); // Không tìm thấy tag → 0 kết quả hợp lệ
    }
  }
  if (query.isFeatured !== undefined && query.isFeatured !== '') filter.isFeatured = query.isFeatured === true || query.isFeatured === 'true';
  if (query.isPinned   !== undefined && query.isPinned !== '') filter.isPinned   = query.isPinned === true || query.isPinned === 'true';

  // Date range filter (from / to / startDate / endDate)
  const fromDate = query.startDate || query.from || query.dateFrom;
  const toDate = query.endDate || query.to || query.dateTo;
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip  = (page - 1) * limit;

  const sortMap = {
    newest:   { publishedAt: -1 },
    oldest:   { publishedAt: 1 },
    views:    { viewsCount: -1 },
    pinned:   { isPinned: -1, publishedAt: -1 },
  };
  const sort = sortMap[query.sort] || { createdAt: -1 };

  const [data, total] = await Promise.all([
    BlogPost.find(filter)
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .populate('authorId', 'firstName lastName email avatar')
      .populate('thumbnailMediaId', 'url')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-content -tableOfContents'),
    BlogPost.countDocuments(filter),
  ]);

  const formattedData = data.map((doc) => {
    const item = doc.toObject();
    if (!item.thumbnailUrl && item.thumbnailMediaId?.url) {
      item.thumbnailUrl = item.thumbnailMediaId.url;
    }
    return item;
  });

  return { data: formattedData, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};

const getPostBySlug = async (slug) => {
  const post = await BlogPost.findOne({ slug })
    .populate('categories', 'name slug')
    .populate('tags', 'name slug')
    .populate('authorId', 'firstName lastName email avatar')
    .populate('thumbnailMediaId', 'url')
    .populate('relatedPostIds', 'title slug thumbnailUrl excerpt publishedAt');
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);

  const obj = post.toObject();
  if (!obj.thumbnailUrl && obj.thumbnailMediaId?.url) {
    obj.thumbnailUrl = obj.thumbnailMediaId.url;
  }

  const seo = buildSeoFields(post);

  return { ...obj, seo };
};

const getPostById = async (id) => {
  const post = await BlogPost.findById(id)
    .populate('categories', 'name slug')
    .populate('tags', 'name slug')
    .populate('authorId', 'firstName lastName email avatar')
    .populate('thumbnailMediaId', 'url');
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);

  const obj = post.toObject();
  if (!obj.thumbnailUrl && obj.thumbnailMediaId?.url) {
    obj.thumbnailUrl = obj.thumbnailMediaId.url;
  }
  return obj;
};

const createPost = async (data, authorId) => {
  data.authorId = authorId;
  data.slug = await ensureUniqueSlug(data.slug || data.title);
  applyAutoFields(data);
  if (data.status === 'published' && !data.publishedAt) data.publishedAt = new Date();

  const post = await BlogPost.create(data);

  if (data.tags?.length)       await Tag.updateMany({ _id: { $in: data.tags } }, { $inc: { postCount: 1 } });
  if (data.categories?.length) await BlogCategory.updateMany({ _id: { $in: data.categories } }, { $inc: { postCount: 1 } });

  const populatedPost = await BlogPost.findById(post._id)
    .populate('categories', 'name slug')
    .populate('tags', 'name slug')
    .populate('thumbnailMediaId', 'url');
  
  const obj = populatedPost.toObject();
  if (!obj.thumbnailUrl && obj.thumbnailMediaId?.url) {
    obj.thumbnailUrl = obj.thumbnailMediaId.url;
  }
  return obj;
};

const updatePost = async (id, data) => {
  const existing = await BlogPost.findById(id);
  if (!existing) throw new AppError('Không tìm thấy bài viết', 404);

  if (data.title && !data.slug) {
    data.slug = await ensureUniqueSlug(data.title, id);
  } else if (data.slug) {
    data.slug = await ensureUniqueSlug(data.slug, id);
  }

  applyAutoFields(data);

  if (data.status === 'published' && existing.status !== 'published' && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  if (data.tags)       await updateTagCounts(existing.tags, data.tags);
  if (data.categories) await updateCategoryCounts(existing.categories, data.categories);

  const post = await BlogPost.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('categories', 'name slug')
    .populate('tags', 'name slug')
    .populate('thumbnailMediaId', 'url');

  const obj = post.toObject();
  if (!obj.thumbnailUrl && obj.thumbnailMediaId?.url) {
    obj.thumbnailUrl = obj.thumbnailMediaId.url;
  }
  return obj;
};

const deletePost = async (id) => {
  const post = await BlogPost.findByIdAndDelete(id);
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);
  if (post.tags?.length)        await Tag.updateMany({ _id: { $in: post.tags } }, { $inc: { postCount: -1 } });
  if (post.categories?.length)  await BlogCategory.updateMany({ _id: { $in: post.categories } }, { $inc: { postCount: -1 } });
};

const deleteBulkPosts = async (ids) => {
  if (!ids?.length) throw new AppError('Không có bài nào được chọn', 400);
  const posts = await BlogPost.find({ _id: { $in: ids } });
  await BlogPost.deleteMany({ _id: { $in: ids } });
  for (const post of posts) {
    if (post.tags?.length)        await Tag.updateMany({ _id: { $in: post.tags } }, { $inc: { postCount: -1 } });
    if (post.categories?.length)  await BlogCategory.updateMany({ _id: { $in: post.categories } }, { $inc: { postCount: -1 } });
  }
  return { deleted: posts.length };
};

const togglePostStatus = async (id, isActive) => {
  const post = await BlogPost.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);
  return post;
};

const incrementViews = async (slug) => {
  await BlogPost.findOneAndUpdate({ slug }, { $inc: { viewsCount: 1 } });
};

const togglePostLike = async (slug, identifier) => {
  const post = await BlogPost.findOne({ slug });
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);

  if (!Array.isArray(post.likedUsers)) {
    post.likedUsers = [];
  }

  const idStr = String(identifier || 'anonymous');
  const index = post.likedUsers.findIndex((id) => String(id) === idStr);

  let isLiked = false;
  if (index > -1) {
    post.likedUsers.splice(index, 1);
    post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
    isLiked = false;
  } else {
    post.likedUsers.push(idStr);
    post.likesCount = (post.likesCount || 0) + 1;
    isLiked = true;
  }

  await post.save();
  return { likesCount: post.likesCount, isLiked };
};

const locatePost = async (id, limit = 10) => {
  const post = await BlogPost.findById(id).select('_id createdAt');
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);
  const positionBefore = await BlogPost.countDocuments({ createdAt: { $gt: post.createdAt } });
  const page = Math.ceil((positionBefore + 1) / limit);
  return { page: Math.max(1, page), postId: id };
};

module.exports = {
  getAllPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  deleteBulkPosts,
  togglePostStatus,
  incrementViews,
  togglePostLike,
  stripHtml,
  locatePost,
};
