const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const User = require('../models/user.model');
const FlashSale = require('../models/flashSale.model');
const Coupon = require('../models/coupon.model');
const Promotion = require('../models/promotion.model');
const GiftProgram = require('../models/gift-program.model');
const BlogPost = require('../models/blogPost.model');
const BlogCategory = require('../models/blogCategory.model');
const Tag = require('../models/tag.model');
const Media = require('../models/media.model');
const Folder = require('../models/folder.model');
const Banner = require('../models/banner.model');

// Helper to format bytes to human-readable string (KB, MB, GB)
const formatBytes = (bytes = 0) => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getOverviewStats = async () => {
  const now = new Date();

  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    outOfStockProducts,
    lowStockProducts,
    totalVariants,
    totalCategories,
    totalBrands,
    totalUsers,
    totalCustomers,
    totalStaff,
    totalBlogPosts,
    publishedBlogPosts,
    draftBlogPosts,
    pendingBlogPosts,
    totalBlogCategories,
    totalTags,
    totalMedia,
    rawFolderCount,
    distinctMediaFolders,
    totalBanners,
    totalCoupons,
    activeCoupons,
    totalFlashSales,
    activeFlashSales,
    totalPromotions,
    activePromotions,
    totalGiftPrograms,
    activeGiftPrograms,
    mediaSizeAgg,
    recentProducts,
    recentBlogPosts,
    lowStockItemsRaw,
  ] = await Promise.all([
    Product.countDocuments({}),
    Product.countDocuments({ status: 'published' }),
    Product.countDocuments({ status: 'draft' }),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    ProductVariant.countDocuments({}),
    Category.countDocuments({}),
    Brand.countDocuments({}),
    User.countDocuments({}),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: { $in: ['admin', 'staff'] } }),
    BlogPost.countDocuments({}),
    BlogPost.countDocuments({ status: 'published' }),
    BlogPost.countDocuments({ status: 'draft' }),
    BlogPost.countDocuments({ status: 'pending_review' }),
    BlogCategory.countDocuments({}),
    Tag.countDocuments({}),
    Media.countDocuments({}),
    Folder.countDocuments({}),
    Media.distinct('folderId'),
    Banner.countDocuments({}),
    Coupon.countDocuments({}),
    Coupon.countDocuments({ isActive: true, endDate: { $gte: now } }),
    FlashSale.countDocuments({}),
    FlashSale.countDocuments({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } }),
    Promotion.countDocuments({}),
    Promotion.countDocuments({ isActive: true, endDate: { $gte: now } }),
    GiftProgram.countDocuments({}),
    GiftProgram.countDocuments({ isActive: true, endDate: { $gte: now } }),
    Media.aggregate([{ $group: { _id: null, totalSize: { $sum: '$size' } } }]),
    Product.find({})
      .select('name price salePrice stock thumbnail categories brand status createdAt')
      .populate('categories', 'name')
      .populate('brand', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    BlogPost.find({})
      .select('title slug status viewsCount thumbnailUrl publishedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    Product.find({ stock: { $lte: 5 } })
      .select('name price salePrice stock thumbnail categories')
      .populate('categories', 'name')
      .limit(8),
  ]);

  const totalMediaBytes = mediaSizeAgg?.[0]?.totalSize || 0;
  const formattedMediaSize = formatBytes(totalMediaBytes);
  const totalFolders = Math.max(rawFolderCount || 0, (distinctMediaFolders || []).filter(Boolean).length);

  // Aggregate Category Product Share
  let categoryDistribution = [];
  try {
    const categoryAgg = await Product.aggregate([
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    for (const item of categoryAgg) {
      if (item._id) {
        const cat = await Category.findById(item._id).select('name');
        if (cat) {
          const percent = totalProducts > 0 ? Math.round((item.count / totalProducts) * 100) : 0;
          categoryDistribution.push({
            name: cat.name,
            count: item.count,
            percent,
          });
        }
      }
    }
  } catch (err) {
    console.error('Category aggregation error:', err);
  }

  if (categoryDistribution.length === 0) {
    const allCats = await Category.find({}).select('name').limit(5);
    categoryDistribution = allCats.map((c) => ({
      name: c.name,
      count: 0,
      percent: 0,
    }));
  }

  // Format low stock alert items
  const lowStockItems = lowStockItemsRaw.map((prod) => ({
    _id: prod._id,
    name: prod.name,
    stock: prod.stock,
    price: prod.salePrice || prod.price || 0,
    thumbnail: prod.thumbnail?.url || '',
    categoryName: prod.categories?.[0]?.name || 'Chưa phân loại',
  }));

  // Format recent products
  const formattedRecentProducts = recentProducts.map((p) => ({
    _id: p._id,
    name: p.name,
    price: p.salePrice || p.price || 0,
    stock: p.stock,
    status: p.status,
    thumbnail: p.thumbnail?.url || '',
    categoryName: p.categories?.[0]?.name || 'Chưa phân loại',
    brandName: p.brand?.name || '',
    createdAt: p.createdAt,
  }));

  // Format recent blog posts
  const formattedRecentBlogPosts = recentBlogPosts.map((post) => ({
    _id: post._id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    viewsCount: post.viewsCount || 0,
    thumbnailUrl: post.thumbnailUrl || '',
    createdAt: post.createdAt,
  }));

  return {
    stats: {
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalVariants,

      totalCategories,
      totalBrands,

      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      pendingBlogPosts,
      totalBlogCategories,
      totalTags,

      totalMedia,
      totalFolders,
      totalMediaBytes,
      formattedMediaSize,
      totalBanners,

      totalCoupons,
      activeCoupons,
      totalFlashSales,
      activeFlashSales,
      totalPromotions,
      activePromotions,
      totalGiftPrograms,
      activeGiftPrograms,

      totalUsers,
      totalCustomers,
      totalStaff,
    },
    distributions: {
      categoryDistribution,
      productStatus: [
        { label: 'Đã xuất bản', count: publishedProducts, key: 'published' },
        { label: 'Bản nháp', count: draftProducts, key: 'draft' },
        { label: 'Hết hàng', count: outOfStockProducts, key: 'out_of_stock' },
      ],
      blogStatus: [
        { label: 'Đã xuất bản', count: publishedBlogPosts, key: 'published' },
        { label: 'Bản nháp', count: draftBlogPosts, key: 'draft' },
        { label: 'Chờ duyệt', count: pendingBlogPosts, key: 'pending_review' },
      ],
    },
    recentProducts: formattedRecentProducts,
    recentBlogPosts: formattedRecentBlogPosts,
    lowStockItems,
  };
};

const searchGlobal = async (query) => {
  if (!query || !query.trim()) {
    return { products: [], categories: [], brands: [], coupons: [], blogPosts: [], users: [] };
  }

  const regex = new RegExp(query.trim(), 'i');

  const [products, categories, brands, coupons, blogPosts, users] = await Promise.all([
    Product.find({ name: regex })
      .select('name price salePrice thumbnail stock status')
      .limit(5),
    Category.find({ name: regex })
      .select('name slug')
      .limit(5),
    Brand.find({ name: regex })
      .select('name logo')
      .limit(5),
    Coupon.find({ $or: [{ code: regex }, { name: regex }] })
      .select('code name type value')
      .limit(5),
    BlogPost.find({ title: regex })
      .select('title slug thumbnailUrl viewsCount status')
      .limit(5),
    User.find({ $or: [{ fullName: regex }, { email: regex }] })
      .select('fullName email role')
      .limit(5),
  ]);

  return {
    products,
    categories,
    brands,
    coupons,
    blogPosts,
    users,
  };
};

module.exports = {
  getOverviewStats,
  searchGlobal,
};
