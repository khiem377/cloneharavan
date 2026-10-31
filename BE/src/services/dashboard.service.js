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
const Order = require('../models/order.model');

// ==========================================================================
// In-Memory TTL Cache (Fast local caching, ready to swap to Redis later)
// ==========================================================================
class MemoryCache {
  constructor(defaultTtlMs = 60000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

const dashboardCache = new MemoryCache(60000); // 60s TTL cache

const invalidateDashboardCache = () => {
  dashboardCache.clear();
};

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

// Helper for growth %
const growthPct = (cur, prev) => {
  if (!prev) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
};

// ==========================================================================
// getOverviewStats — High-performance parallel aggregation with TTL cache
// ==========================================================================
const getOverviewStats = async (period = '30days') => {
  const cacheKey = `overview_${period}`;
  const cachedData = dashboardCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const now = new Date();
  const { start: periodStart, label: periodLabel, days } = parsePeriod(period);
  const prevStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);
  const sixMonthSlots = buildMonthSlots(6);
  const sixMonthStart = sixMonthSlots[0].start;

  // Execute ALL aggregate pipelines and collections in a SINGLE parallel batch
  const [
    [productFacetRes],
    [userFacetRes],
    [orderFacetRes],
    [blogFacetRes],
    [mediaStatsRes],
    totalVariants,
    totalCategories,
    totalBrands,
    rawFolderCount,
    distinctMediaFolders,
    totalComments,
    totalCoupons,
    activeCoupons,
    categoryDistributionRaw,
    topProducts,
    brandDistributionRaw,
    userGrowthAgg,
    productGrowthAgg,
    revenueGrowthAgg,
    recentOrders,
    recentProducts,
    rawRecentBlogPosts,
    recentCustomers,
  ] = await Promise.all([
    // 1. Product Facet (Collapses 6 queries into 1 aggregation pipeline)
    Product.aggregate([
      {
        $facet: {
          total: [{ $match: { isActive: true } }, { $count: 'val' }],
          published: [{ $match: { isActive: true, status: 'published' } }, { $count: 'val' }],
          lowStock: [{ $match: { isActive: true, status: 'published', stock: { $gt: 0, $lte: 10 } } }, { $count: 'val' }],
          outOfStock: [{ $match: { isActive: true, status: 'published', stock: { $lte: 0 } } }, { $count: 'val' }],
          newProducts: [{ $match: { isActive: true, createdAt: { $gte: periodStart } } }, { $count: 'val' }],
          prevNewProducts: [{ $match: { isActive: true, createdAt: { $gte: prevStart, $lt: periodStart } } }, { $count: 'val' }],
        },
      },
    ]),

    // 2. User Facet (Collapses 4 customer count queries into 1)
    User.aggregate([
      {
        $facet: {
          totalCustomers: [{ $match: { role: 'user' } }, { $count: 'val' }],
          activeCustomers: [{ $match: { role: 'user', isActive: true } }, { $count: 'val' }],
          newCustomers: [{ $match: { role: 'user', createdAt: { $gte: periodStart } } }, { $count: 'val' }],
          prevNewCustomers: [{ $match: { role: 'user', createdAt: { $gte: prevStart, $lt: periodStart } } }, { $count: 'val' }],
        },
      },
    ]),

    // 3. Order Facet (Financial & Ops KPIs)
    Order.aggregate([
      {
        $facet: {
          totalOrders: [{ $count: 'val' }],
          periodOrders: [{ $match: { createdAt: { $gte: periodStart } } }, { $count: 'val' }],
          prevPeriodOrders: [{ $match: { createdAt: { $gte: prevStart, $lt: periodStart } } }, { $count: 'val' }],
          totalRevenue: [
            { $match: { orderStatus: { $ne: 'CANCELLED' } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } },
          ],
          periodRevenue: [
            { $match: { orderStatus: { $ne: 'CANCELLED' }, createdAt: { $gte: periodStart } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } },
          ],
          prevPeriodRevenue: [
            { $match: { orderStatus: { $ne: 'CANCELLED' }, createdAt: { $gte: prevStart, $lt: periodStart } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } },
          ],
          pending: [{ $match: { orderStatus: 'PENDING' } }, { $count: 'val' }],
          confirmed: [{ $match: { orderStatus: 'CONFIRMED' } }, { $count: 'val' }],
          shipping: [{ $match: { orderStatus: 'SHIPPING' } }, { $count: 'val' }],
          delivered: [{ $match: { orderStatus: 'DELIVERED' } }, { $count: 'val' }],
          cancelled: [{ $match: { orderStatus: 'CANCELLED' } }, { $count: 'val' }],
        },
      },
    ]),

    // 3. Blog Facet (Collapses 6 blog queries into 1)
    BlogPost.aggregate([
      {
        $facet: {
          total: [{ $count: 'val' }],
          published: [{ $match: { status: 'published' } }, { $count: 'val' }],
          draft: [{ $match: { status: 'draft' } }, { $count: 'val' }],
          pending: [{ $match: { status: 'pending' } }, { $count: 'val' }],
          newBlogPosts: [{ $match: { createdAt: { $gte: periodStart } } }, { $count: 'val' }],
          prevNewBlogPosts: [{ $match: { createdAt: { $gte: prevStart, $lt: periodStart } } }, { $count: 'val' }],
        },
      },
    ]),

    // 4. Media Facet (Collapses total bytes, total count and period deltas into 1)
    Media.aggregate([
      {
        $facet: {
          totals: [{ $group: { _id: null, total: { $sum: '$size' }, count: { $sum: 1 } } }],
          newMedia: [{ $match: { createdAt: { $gte: periodStart } } }, { $count: 'val' }],
        },
      },
    ]),

    // 5. Individual small counts
    ProductVariant.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    Brand.countDocuments({ isActive: true }),
    Folder.countDocuments({}),
    Media.distinct('folderId'),
    Comment.countDocuments({}),
    Coupon.countDocuments({}),
    Coupon.countDocuments({
      isActive: true,
      $or: [{ endDate: { $gte: now } }, { endDate: null }, { endDate: { $exists: false } }],
    }),

    // 6. Category Distribution (Top 8)
    Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: { $ifNull: ['$cat.name', 'Khác'] }, count: 1 } },
    ]).catch(() => []),

    // 7. Top Products by views
    Product.find({ isActive: true, status: 'published' })
      .sort({ viewsCount: -1 })
      .limit(6)
      .select('name sku price salePrice thumbnail stock viewsCount brand')
      .populate('brand', 'name')
      .lean()
      .catch(() => []),

    // 8. Brand Distribution (Top 6)
    Product.aggregate([
      { $match: { isActive: true, brand: { $ne: null } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $lookup: { from: 'brands', localField: '_id', foreignField: '_id', as: 'b' } },
      { $unwind: { path: '$b', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: { $ifNull: ['$b.name', 'Khác'] }, logo: '$b.logo', count: 1 } },
    ]).catch(() => []),

    // 9. User Growth Trend (last 6 months)
    User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: sixMonthStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]).catch(() => []),

    // 10. Product Growth Trend (last 6 months)
    Product.aggregate([
      { $match: { isActive: true, createdAt: { $gte: sixMonthStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]).catch(() => []),

    // 11. Revenue Growth Trend (last 6 months)
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' }, createdAt: { $gte: sixMonthStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$pricing.totalAmount' },
          ordersCount: { $sum: 1 },
        },
      },
    ]).catch(() => []),

    // 12. Recent Orders (Top 6)
    Order.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .select('orderCode shippingAddress pricing orderStatus paymentStatus paymentMethod items createdAt')
      .lean()
      .catch(() => []),

    // 13. Recent Products (Top 5)
    Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name sku price salePrice thumbnail status stock brand viewsCount')
      .populate('brand', 'name')
      .lean()
      .catch(() => []),

    // 14. Recent Blog Posts (Top 5)
    BlogPost.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug status thumbnailUrl thumbnailMediaId viewsCount createdAt publishedAt')
      .populate('thumbnailMediaId', 'url')
      .lean()
      .catch(() => []),

    // 15. Recent Customers (Top 5)
    User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email phone avatar isActive createdAt authProvider zaloId tiktokId zaloName tiktokUsername')
      .lean()
      .catch(() => []),
  ]);

  // Extract from product facet
  const totalProducts = productFacetRes?.total?.[0]?.val || 0;
  const publishedProducts = productFacetRes?.published?.[0]?.val || 0;
  const lowStockProducts = productFacetRes?.lowStock?.[0]?.val || 0;
  const outOfStockProducts = productFacetRes?.outOfStock?.[0]?.val || 0;
  const newProducts = productFacetRes?.newProducts?.[0]?.val || 0;
  const prevNewProducts = productFacetRes?.prevNewProducts?.[0]?.val || 0;

  // Extract from user facet
  const totalCustomers = userFacetRes?.totalCustomers?.[0]?.val || 0;
  const activeCustomers = userFacetRes?.activeCustomers?.[0]?.val || 0;
  const newCustomers = userFacetRes?.newCustomers?.[0]?.val || 0;
  const prevNewCustomers = userFacetRes?.prevNewCustomers?.[0]?.val || 0;

  // Extract from blog facet
  const totalBlogPosts = blogFacetRes?.total?.[0]?.val || 0;
  const publishedBlogPosts = blogFacetRes?.published?.[0]?.val || 0;
  const draftBlogPosts = blogFacetRes?.draft?.[0]?.val || 0;
  const pendingBlogPosts = blogFacetRes?.pending?.[0]?.val || 0;
  const newBlogPosts = blogFacetRes?.newBlogPosts?.[0]?.val || 0;
  const prevNewBlogPosts = blogFacetRes?.prevNewBlogPosts?.[0]?.val || 0;

  // Extract from media facet
  const totalMedia = mediaStatsRes?.totals?.[0]?.count || 0;
  const totalMediaBytes = mediaStatsRes?.totals?.[0]?.total || 0;
  const newMedia = mediaStatsRes?.newMedia?.[0]?.val || 0;
  const formattedMediaSize = formatBytes(totalMediaBytes);
  const totalFolders = Math.max(rawFolderCount || 0, (distinctMediaFolders || []).filter(Boolean).length);

  // Format distributions
  const categoryDistribution = (categoryDistributionRaw || []).map((item) => ({
    _id: item._id,
    name: item.name,
    count: item.count,
    percent: totalProducts > 0 ? Math.round((item.count / totalProducts) * 100) : 0,
  }));

  const brandDistribution = (brandDistributionRaw || []).map((item) => ({
    _id: item._id,
    name: item.name,
    logo: item.logo,
    count: item.count,
    percent: totalProducts > 0 ? Math.round((item.count / totalProducts) * 100) : 0,
  }));

  // Format growth trends
  const uMap = {};
  (userGrowthAgg || []).forEach((u) => { uMap[`${u._id.year}-${u._id.month}`] = u.count; });
  const userGrowthTrend = sixMonthSlots.map((s) => ({
    month: s.label,
    kh_moi: uMap[`${s.year}-${s.month}`] || 0,
  }));

  const pMap = {};
  (productGrowthAgg || []).forEach((p) => { pMap[`${p._id.year}-${p._id.month}`] = p.count; });
  const productGrowthTrend = sixMonthSlots.map((s) => ({
    month: s.label,
    sp_moi: pMap[`${s.year}-${s.month}`] || 0,
  }));

  // Extract from order facet
  const totalOrders = orderFacetRes?.totalOrders?.[0]?.val || 0;
  const periodOrders = orderFacetRes?.periodOrders?.[0]?.val || 0;
  const prevPeriodOrders = orderFacetRes?.prevPeriodOrders?.[0]?.val || 0;
  const totalRevenue = orderFacetRes?.totalRevenue?.[0]?.total || 0;
  const periodRevenue = orderFacetRes?.periodRevenue?.[0]?.total || 0;
  const prevPeriodRevenue = orderFacetRes?.prevPeriodRevenue?.[0]?.total || 0;
  const pendingOrders = orderFacetRes?.pending?.[0]?.val || 0;
  const confirmedOrders = orderFacetRes?.confirmed?.[0]?.val || 0;
  const shippingOrders = orderFacetRes?.shipping?.[0]?.val || 0;
  const deliveredOrders = orderFacetRes?.delivered?.[0]?.val || 0;
  const cancelledOrders = orderFacetRes?.cancelled?.[0]?.val || 0;

  // Format revenue growth trend
  const rMap = {};
  (revenueGrowthAgg || []).forEach((r) => {
    rMap[`${r._id.year}-${r._id.month}`] = {
      revenue: r.revenue,
      orders: r.ordersCount,
    };
  });
  const revenueGrowthTrend = sixMonthSlots.map((s) => ({
    month: s.label,
    revenue: rMap[`${s.year}-${s.month}`]?.revenue || 0,
    orders: rMap[`${s.year}-${s.month}`]?.orders || 0,
  }));

  // Format blog posts thumbnails
  const recentBlogPosts = (rawRecentBlogPosts || []).map((post) => ({
    ...post,
    thumbnailUrl: post.thumbnailUrl || post.thumbnailMediaId?.url || '',
  }));

  const result = {
    stats: {
      // Financial & Order Core KPIs
      totalOrders,
      periodOrders,
      ordersGrowth: growthPct(periodOrders, prevPeriodOrders),
      totalRevenue,
      periodRevenue,
      revenueGrowth: growthPct(periodRevenue, prevPeriodRevenue),
      ordersByStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipping: shippingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      // Catalog & Stock
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
    revenueGrowthTrend,
    recentOrders: recentOrders || [],
    userGrowthTrend,
    productGrowthTrend,
    recentProducts,
    recentBlogPosts,
    recentCustomers,
    period,
  };

  // Cache result for 60 seconds
  dashboardCache.set(cacheKey, result, 60000);

  return result;
};

// ==========================================================================
// getInventoryDashboardStats — Parallel aggregation with TTL cache
// ==========================================================================
const getInventoryDashboardStats = async (range = '6months') => {
  const cacheKey = `inventory_${range}`;
  const cachedData = dashboardCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

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

  // Run stock movement aggregation and stock status facet in parallel
  const [movementAgg, [stockFacetRes]] = await Promise.all([
    StockMovement.aggregate([
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
    ]),
    Product.aggregate([
      {
        $facet: {
          published: [{ $match: { isActive: true, status: 'published' } }, { $count: 'c' }],
          lowStock: [{ $match: { isActive: true, status: 'published', stock: { $gt: 0, $lte: 10 } } }, { $count: 'c' }],
          outOfStock: [{ $match: { isActive: true, status: 'published', stock: { $lte: 0 } } }, { $count: 'c' }],
        },
      },
    ]),
  ]);

  const movMap = {};
  for (const m of (movementAgg || [])) {
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

  const published = stockFacetRes?.published?.[0]?.c || 0;
  const lowStock = stockFacetRes?.lowStock?.[0]?.c || 0;
  const outOfStock = stockFacetRes?.outOfStock?.[0]?.c || 0;

  const result = {
    monthlyData,
    range,
    stockStatus: { published, lowStock, outOfStock },
  };

  dashboardCache.set(cacheKey, result, 60000);
  return result;
};

// ==========================================================================
// searchGlobal
// ==========================================================================
const searchGlobal = async (q) => {
  if (!q?.trim()) return { products: [], categories: [], brands: [], blogPosts: [] };
  const trimmed = q.trim();
  const cacheKey = `search_${trimmed.toLowerCase()}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached) return cached;

  const regex = new RegExp(trimmed, 'i');

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

  const result = { products, categories, brands, blogPosts };
  dashboardCache.set(cacheKey, result, 30000); // 30s cache for fast repetitive lookups
  return result;
};

module.exports = {
  getOverviewStats,
  getInventoryDashboardStats,
  searchGlobal,
  invalidateDashboardCache,
};
