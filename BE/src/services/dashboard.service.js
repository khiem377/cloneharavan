const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const BlogPost = require('../models/blogPost.model');
const Media = require('../models/media.model');
const Folder = require('../models/folder.model');
const StockMovement = require('../models/stockMovement.model');
const User = require('../models/user.model');
const Coupon = require('../models/coupon.model');
const Comment = require('../models/comment.model');

// ─ Helper: format bytes ───────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ─ Helper: parse period ──────────────────────────────────────────────
const parsePeriod = (period = '30days') => {
  const now = new Date();
  const map = {
    '7days':   { days: 7,   label: '7 ngày' },
    '30days':  { days: 30,  label: '30 ngày' },
    '90days':  { days: 90,  label: '90 ngày' },
    '6months': { days: 180, label: '6 tháng' },
  };
  const cfg = map[period] || map['30days'];
  const start = new Date(now.getTime() - cfg.days * 24 * 60 * 60 * 1000);
  return { start, end: now, label: cfg.label, days: cfg.days };
};

// ─ Helper: build month/day slots ─────────────────────────────────────
const MONTHS = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];

const buildMonthSlots = (numMonths) => {
  const now = new Date();
  return Array.from({ length: numMonths }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (numMonths - 1 - i), 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    return { label: MONTHS[d.getMonth()], start, end, year: d.getFullYear(), month: d.getMonth() + 1 };
  });
};

const buildDaySlots = (numDays) => {
  const now = new Date();
  return Array.from({ length: numDays }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (numDays - 1 - i));
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      start, end,
      year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(),
    };
  });
};

// ==========================================================================
// getOverviewStats — Main dashboard data (enhanced)
// ==========================================================================
const getOverviewStats = async (period = '30days') => {
  const now = new Date();
  const { start: periodStart, label: periodLabel } = parsePeriod(period);

  // Previous period for delta comparison
  const { days } = parsePeriod(period);
  const prevStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    publishedProducts,
    lowStockProducts,
    outOfStockProducts,
    totalVariants,
    totalCategories,
    totalBrands,
    totalBlogPosts,
    publishedBlogPosts,
    draftBlogPosts,
    pendingBlogPosts,
    totalMedia,
    totalMediaBytesAgg,
    rawFolderCount,
    distinctMediaFolders,
    // Customers
    totalCustomers,
    activeCustomers,
    newCustomers,
    prevNewCustomers,
    // Blog delta
    newBlogPosts,
    prevNewBlogPosts,
    newProducts,
    prevNewProducts,
    newMedia,
    // Comments
    totalComments,
    // Coupons
    totalCoupons,
    activeCoupons,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, status: 'published' }),
    Product.countDocuments({ isActive: true, status: 'published', stock: { $gt: 0, $lte: 10 } }),
    Product.countDocuments({ isActive: true, status: 'published', stock: { $lte: 0 } }),
    ProductVariant.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    Brand.countDocuments({ isActive: true }),
    BlogPost.countDocuments({}),
    BlogPost.countDocuments({ status: 'published' }),
    BlogPost.countDocuments({ status: 'draft' }),
    BlogPost.countDocuments({ status: 'pending' }),
    Media.countDocuments({}),
    Media.aggregate([{ $group: { _id: null, total: { $sum: '$size' } } }]),
    Folder.countDocuments({}),
    Media.distinct('folderId'),
    // Customers (role = 'user')
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', isActive: true }),
    User.countDocuments({ role: 'user', createdAt: { $gte: periodStart } }),
    User.countDocuments({ role: 'user', createdAt: { $gte: prevStart, $lt: periodStart } }),
    // Content deltas
    BlogPost.countDocuments({ createdAt: { $gte: periodStart } }),
    BlogPost.countDocuments({ createdAt: { $gte: prevStart, $lt: periodStart } }),
    Product.countDocuments({ isActive: true, createdAt: { $gte: periodStart } }),
    Product.countDocuments({ isActive: true, createdAt: { $gte: prevStart, $lt: periodStart } }),
    Media.countDocuments({ createdAt: { $gte: periodStart } }),
    // Comments
    Comment.countDocuments({}),
    // Coupons
    Coupon.countDocuments({}),
    Coupon.countDocuments({
      isActive: true,
      $or: [{ endDate: { $gte: now } }, { endDate: null }, { endDate: { $exists: false } }],
    }),
  ]);

  const totalMediaBytes = totalMediaBytesAgg[0]?.total || 0;
  const formattedMediaSize = formatBytes(totalMediaBytes);
  const totalFolders = Math.max(rawFolderCount || 0, (distinctMediaFolders || []).filter(Boolean).length);

  // Helper for growth %
  const growthPct = (cur, prev) => {
    if (!prev) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  // ── Category Distribution ────────────────────────────────────────────
  let categoryDistribution = [];
  try {
    const catAgg = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: { $ifNull: ['$cat.name', 'Khác'] }, count: 1 } },
    ]);
    categoryDistribution = catAgg.map((item) => ({
      _id: item._id,
      name: item.name,
      count: item.count,
      percent: totalProducts > 0 ? Math.round((item.count / totalProducts) * 100) : 0,
    }));
  } catch (err) {
    console.error('Category distribution error:', err);
  }

  // ── Top Products by interactions/views ───────────────────────────────
  let topProducts = [];
  try {
    topProducts = await Product.find({ isActive: true, status: 'published' })
      .sort({ viewsCount: -1 })
      .limit(6)
      .select('name sku price salePrice thumbnail stock viewsCount brand')
      .populate('brand', 'name')
      .lean();
  } catch (e) {}

  // ── Brand Distribution ───────────────────────────────────────────────
  let brandDistribution = [];
  try {
    const brandAgg = await Product.aggregate([
      { $match: { isActive: true, brand: { $ne: null } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $lookup: { from: 'brands', localField: '_id', foreignField: '_id', as: 'b' } },
      { $unwind: { path: '$b', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: { $ifNull: ['$b.name', 'Khác'] }, logo: '$b.logo', count: 1 } },
    ]);
    brandDistribution = brandAgg.map((item, i) => ({
      _id: item._id,
      name: item.name,
      logo: item.logo,
      count: item.count,
      percent: totalProducts > 0 ? Math.round((item.count / totalProducts) * 100) : 0,
    }));
  } catch (e) {}

  // ── User Growth Trend (last 6 months) ───────────────────────────────
  let userGrowthTrend = [];
  try {
    const slots = buildMonthSlots(6);
    const userAgg = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: slots[0].start } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);
    const uMap = {};
    userAgg.forEach((u) => { uMap[`${u._id.year}-${u._id.month}`] = u.count; });
    userGrowthTrend = slots.map((s) => ({
      month: s.label,
      kh_moi: uMap[`${s.year}-${s.month}`] || 0,
    }));
  } catch (e) {}

  // ── Product Growth Trend (last 6 months) ────────────────────────────
  let productGrowthTrend = [];
  try {
    const slots = buildMonthSlots(6);
    const prodAgg = await Product.aggregate([
      { $match: { isActive: true, createdAt: { $gte: slots[0].start } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);
    const pMap = {};
    prodAgg.forEach((p) => { pMap[`${p._id.year}-${p._id.month}`] = p.count; });
    productGrowthTrend = slots.map((s) => ({
      month: s.label,
      sp_moi: pMap[`${s.year}-${s.month}`] || 0,
    }));
  } catch (e) {}

  // ── Recent Products ──────────────────────────────────────────────────
  const recentProducts = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name sku price salePrice thumbnail status stock brand viewsCount')
    .populate('brand', 'name')
    .lean();

  // ── Recent Blog Posts ────────────────────────────────────────────────
  const rawRecentBlogPosts = await BlogPost.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title slug status thumbnailUrl thumbnailMediaId viewsCount createdAt publishedAt')
    .populate('thumbnailMediaId', 'url')
    .lean();

  const recentBlogPosts = rawRecentBlogPosts.map((post) => ({
    ...post,
    thumbnailUrl: post.thumbnailUrl || post.thumbnailMediaId?.url || '',
  }));

  // ── Recent New Customers ─────────────────────────────────────────────
  let recentCustomers = [];
  try {
    recentCustomers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email phone avatar isActive createdAt')
      .lean();
  } catch (e) {}

  return {
    stats: {
      totalProducts,
      publishedProducts,
      lowStockProducts,
      outOfStockProducts,
      totalVariants,
      totalCategories,
      totalBrands,
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      pendingBlogPosts,
      totalMedia,
      totalMediaBytes,
      formattedMediaSize,
      totalFolders,
      // Customers
      totalCustomers,
      activeCustomers,
      newCustomers,
      customerGrowth: growthPct(newCustomers, prevNewCustomers),
      // Deltas
      newProducts,
      productGrowth: growthPct(newProducts, prevNewProducts),
      newBlogPosts,
      blogGrowth: growthPct(newBlogPosts, prevNewBlogPosts),
      newMedia,
      periodLabel,
      // Content
      totalComments,
      totalCoupons,
      activeCoupons,
    },
    distributions: { categoryDistribution },
    categoryDistribution,
    brandDistribution,
    topProducts,
    userGrowthTrend,
    productGrowthTrend,
    recentProducts,
    recentBlogPosts,
    recentCustomers,
    period,
  };
};

// ==========================================================================
// getInventoryDashboardStats
// ==========================================================================
const getInventoryDashboardStats = async (range = '6months') => {
  const now = new Date();

  let slots, groupByDay;
  if (range === '7days') {
    slots = buildDaySlots(7);
    groupByDay = true;
  } else if (range === '30days') {
    slots = buildDaySlots(30);
    groupByDay = true;
  } else if (range === '90days') {
    slots = buildMonthSlots(3);
    groupByDay = false;
  } else {
    slots = buildMonthSlots(6);
    groupByDay = false;
  }

  const rangeStart = slots[0].start;

  const movementAgg = await StockMovement.aggregate([
    { $match: { createdAt: { $gte: rangeStart, $lte: now } } },
    {
      $group: {
        _id: {
          year:  { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          ...(groupByDay && { day: { $dayOfMonth: '$createdAt' } }),
          sign:  { $cond: [{ $gt: ['$changeQty', 0] }, 'nhap', 'xuat'] },
        },
        total: { $sum: { $abs: '$changeQty' } },
      },
    },
  ]);

  const movMap = {};
  for (const m of movementAgg) {
    const key = groupByDay
      ? `${m._id.year}-${m._id.month}-${m._id.day}-${m._id.sign}`
      : `${m._id.year}-${m._id.month}-${m._id.sign}`;
    movMap[key] = (movMap[key] || 0) + m.total;
  }

  const monthlyData = slots.map((s) => {
    const yr = s.year;
    const mo = s.month;
    if (groupByDay) {
      return {
        month: s.label,
        nhap: movMap[`${yr}-${mo}-${s.day}-nhap`] || 0,
        xuat: movMap[`${yr}-${mo}-${s.day}-xuat`] || 0,
      };
    }
    return {
      month: s.label,
      nhap: movMap[`${yr}-${mo}-nhap`] || 0,
      xuat: movMap[`${yr}-${mo}-xuat`] || 0,
    };
  });

  const [published, lowStock, outOfStock] = await Promise.all([
    Product.countDocuments({ isActive: true, status: 'published' }),
    Product.countDocuments({ isActive: true, status: 'published', stock: { $gt: 0, $lte: 10 } }),
    Product.countDocuments({ isActive: true, status: 'published', stock: { $lte: 0 } }),
  ]);

  return {
    monthlyData,
    range,
    stockStatus: { published, lowStock, outOfStock },
  };
};

// ==========================================================================
// searchGlobal
// ==========================================================================
const searchGlobal = async (q) => {
  if (!q?.trim()) return { products: [], categories: [], brands: [], blogPosts: [] };
  const regex = new RegExp(q.trim(), 'i');

  const [products, categories, brands, blogPosts] = await Promise.all([
    Product.find({ isActive: true, $or: [{ name: regex }, { sku: regex }] })
      .select('name sku price salePrice thumbnail status')
      .limit(5).lean(),
    Category.find({ isActive: true, name: regex })
      .select('name slug').limit(5).lean(),
    Brand.find({ isActive: true, name: regex })
      .select('name slug').limit(5).lean(),
    BlogPost.find({ $or: [{ title: regex }, { slug: regex }] })
      .select('title slug status createdAt').limit(5).lean(),
  ]);

  return { products, categories, brands, blogPosts };
};

module.exports = {
  getOverviewStats,
  getInventoryDashboardStats,
  searchGlobal,
};
