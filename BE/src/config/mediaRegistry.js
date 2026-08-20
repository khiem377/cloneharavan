const Banner = require('../models/banner.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');

const mediaRegistry = [
  {
    model: Banner,
    displayName: 'Banner',
    mediaFields: ['mediaId'],
    getEntityName: (doc) => doc.title || 'Banner quảng cáo',
    getAdminUrl: (doc) => `/banners?highlight=${doc._id}`,
  },
  {
    model: Brand,
    displayName: 'Thương hiệu',
    mediaFields: ['logo.mediaId'],
    getEntityName: (doc) => doc.name,
    getAdminUrl: (doc) => `/brands?highlight=${doc._id}`,
  },
  {
    model: Category,
    displayName: 'Danh mục',
    mediaFields: ['image.mediaId', 'icon.mediaId'],
    getEntityName: (doc) => doc.name,
    getAdminUrl: (doc) => `/categories?highlight=${doc._id}`,
  },
  {
    model: Product,
    displayName: 'Sản phẩm',
    mediaFields: ['thumbnail.mediaId', 'images.mediaId'],
    getEntityName: (doc) => doc.name,
    getAdminUrl: (doc) => `/products/${doc._id}`,
  },
  {
    model: ProductVariant,
    displayName: 'Biến thể sản phẩm',
    mediaFields: ['thumbnail.mediaId', 'images.mediaId'],
    getEntityName: (doc) => doc.nameOverride || doc.sku || 'Biến thể',
    getAdminUrl: (doc) => `/products/${doc.productId}?tab=variants&highlight=${doc._id}`,
  },
];

module.exports = mediaRegistry;
