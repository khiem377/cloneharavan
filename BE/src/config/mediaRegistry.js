const Banner = require('../models/banner.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const BlogPost = require('../models/blogPost.model');
const BlogCategory = require('../models/blogCategory.model');
const FlashSale = require('../models/flashSale.model');
const StoreSetting = require('../models/storeSetting.model');
const Menu = require('../models/menu.model');

const mediaRegistry = [
  {
    model: Banner,
    displayName: 'Banner',
    mediaFields: ['mediaId'],
    urlFields: ['imageUrl'],
    getEntityName: (doc) => doc.title || 'Banner quảng cáo',
    getAdminUrl: (doc) => `/banners?highlight=${doc._id}`,
  },
  {
    model: Brand,
    displayName: 'Thương hiệu',
    mediaFields: ['logo.mediaId'],
    urlFields: ['logo.url'],
    getEntityName: (doc) => doc.name,
    getAdminUrl: (doc) => `/brands?highlight=${doc._id}`,
  },
  {
    model: Category,
    displayName: 'Danh mục',
    mediaFields: ['image.mediaId', 'icon.mediaId'],
    urlFields: ['image.url', 'icon.url'],
    getEntityName: (doc) => doc.name,
    getAdminUrl: (doc) => `/categories?highlight=${doc._id}`,
  },
  {
    model: Product,
    displayName: 'Sản phẩm',
    mediaFields: ['thumbnail.mediaId', 'images.mediaId'],
    urlFields: ['thumbnail.url', 'images.url'],
    getEntityName: (doc) => doc.name,
    getAdminUrl: (doc) => `/products/${doc._id}`,
  },
  {
    model: ProductVariant,
    displayName: 'Biến thể sản phẩm',
    mediaFields: ['thumbnail.mediaId', 'images.mediaId'],
    urlFields: ['thumbnail.url', 'images.url'],
    getEntityName: (doc) => doc.displayName || doc.nameOverride || doc.sku || 'Biến thể',
    getAdminUrl: (doc) => `/products/${doc.productId?.toString?.() || doc.productId}/variants`,
  },
  {
    model: BlogPost,
    displayName: 'Bài viết',
    mediaFields: ['thumbnailMediaId'],
    urlFields: ['thumbnailUrl'],
    getEntityName: (doc) => doc.title,
    getAdminUrl: (doc) => `/blog/posts/${doc._id}/edit`,
  },
  {
    model: BlogCategory,
    displayName: 'Danh mục Blog',
    mediaFields: ['thumbnailMediaId'],
    urlFields: ['thumbnailUrl'],
    getEntityName: (doc) => doc.name,
    getAdminUrl: (doc) => `/blog/categories?highlight=${doc._id}`,
  },
  {
    model: FlashSale,
    displayName: 'Flash Sale',
    mediaFields: ['banner.mediaId'],
    urlFields: ['banner.url'],
    getEntityName: (doc) => doc.name,
    getAdminUrl: (doc) => `/promotions/flash-sales?highlight=${doc._id}`,
  },
  {
    model: StoreSetting,
    displayName: 'Cấu hình cửa hàng',
    mediaFields: ['storeInfo.logoMediaId'],
    urlFields: ['storeInfo.logo', 'storeInfo.favicon'],
    getEntityName: (doc) => doc.storeInfo?.name || 'Logo cửa hàng',
    getAdminUrl: () => '/settings',
  },
  {
    model: Menu,
    displayName: 'Menu',
    mediaFields: ['items.icon.mediaId'],
    urlFields: ['items.icon.url'],
    getEntityName: (doc) => doc.name || 'Menu điều hướng',
    getAdminUrl: (doc) => `/menus?highlight=${doc._id}`,
  },
];

module.exports = mediaRegistry;
