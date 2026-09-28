const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const BlogPost = require('../models/blogPost.model');
const Media = require('../models/media.model');
const Folder = require('../models/folder.model');
const StockMovement = require('../models/stockMovement.model');

// ─ Helper: format bytes ───────────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ─ Helper: parse period string → { start, end, label } ────────────────────────────────────────────
const parsePeriod = (period = '30days') => {
  const now = new Date();
  const map = {
    '7days':  { days: 7,   label: '7 ngày' },
    '30days': { days: 30,  label: '30 ngày' },
    '90days': { days: 90,  label: '90 ngày' },
    '6months':{ days: 180, label: '6 tháng' },
  };
  const cfg = map[period] || map['30days'];
  const start = new Date(now.getTime() - cfg.days * 24 * 60 * 60 * 1000);
  return { start, end: now, label: cfg.label, days: cfg.days };
};

// ─ Helper: build N-slot time series ─────────────────────────────────────────────────────────────────────
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
      start,
      end,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  });
};


// ==========================================================================
// getOverviewStats — Main dashboard data
// ==========================================================================
const getOverviewStats = async (period = '30days') => {
  const now = new Date();
  const { start: periodStart, label: periodLabel } = parsePeriod(period);

  // ── Basic Counts (all-time totals) ──────────────────────────────────────────────────────────────────────────────────
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
    // ── New-in-period deltas ──
    newProducts,
    newBlogPosts,
    newMedia,
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
    // Deltas
    Product.countDocuments({ isActive: true, createdAt: { $gte: periodStart } }),
    BlogPost.countDocuments({ createdAt: { $gte: periodStart } }),
    Media.countDocuments({ createdAt: { $gte: periodStart } }),
  ]);

  const totalMediaBytes = totalMediaBytesAgg[0]?.total || 0;
  const formattedMediaSize = formatBytes(totalMediaBytes);
  const totalFolders = Math.max(rawFolderCount || 0, (distinctMediaFolders || []).filter(Boolean).length);

  // ── Category Distribution — aggregate 1 query ────────────────────────────────────────────────
  let categoryDistribution = [];
  try {
    const catAgg = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'cat',
        },
      },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$cat.name', 'Khác'] },
          count: 1,
        },
      },
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

  // ── Recent Products ──────────────────────────────────────────────────────────────────────────────────
  const recentProducts = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name sku price salePrice thumbnail status stock brand')
    .populate('brand', 'name')
    .lean();

  // ── Recent Blog Posts ───────────────────────────────────────────────────────────────────────────────
  const recentBlogPosts = await BlogPost.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title slug status thumbnail createdAt')
    .lean();

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
      // ── Period deltas ──
      newProducts,
      newBlogPosts,
      newMedia,
      periodLabel,
    },
    distributions: {
      categoryDistribution,
    },
    categoryDistribution,
    recentProducts,
    recentBlogPosts,
    period,
  };
};

// ==========================================================================
// getInventoryDashboardStats — Inventory chart & kho stats
// range: '7days' | '30days' | '90days' | '6months' (default)
// ==========================================================================
const getInventoryDashboardStats = async (range = '6months') => {
  const now = new Date();

  // Quyết định slots dựa vào range
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
    // '6months' default
    slots = buildMonthSlots(6);
    groupByDay = false;
  }

  const rangeStart = slots[0].start;

  // Aggregate StockMovement — 1 query
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

  // Stock status counts
  const [published, lowStock, outOfStock] = await Promise.all([
    Product.countDocuments({ isActive: true, status: 'published' }),
    Product.countDocuments({ isActive: true, status: 'published', stock: { $gt: 0, $lte: 10 } }),
    Product.countDocuments({ isActive: true, status: 'published', stock: { $lte: 0 } }),
  ]);

  return {
    monthlyData,
    range,
    stockStatus: {
      published,
      lowStock,
      outOfStock,
    },
  };
};

// ==========================================================================
// searchGlobal — Global search across Products, Categories, Brands, BlogPosts
// ==========================================================================
const searchGlobal = async (q) => {
  if (!q?.trim()) return { products: [], categories: [], brands: [], blogPosts: [] };
  const regex = new RegExp(q.trim(), 'i');

  const [products, categories, brands, blogPosts] = await Promise.all([
    Product.find({ isActive: true, $or: [{ name: regex }, { sku: regex }] })
      .select('name sku price salePrice thumbnail status')
      .limit(5)
      .lean(),
    Category.find({ isActive: true, name: regex })
      .select('name slug')
      .limit(5)
      .lean(),
    Brand.find({ isActive: true, name: regex })
      .select('name slug')
      .limit(5)
      .lean(),
    BlogPost.find({ $or: [{ title: regex }, { slug: regex }] })
      .select('title slug status createdAt')
      .limit(5)
      .lean(),
  ]);

  return { products, categories, brands, blogPosts };
};

module.exports = {
  getOverviewStats,
  getInventoryDashboardStats,
  searchGlobal,
};
