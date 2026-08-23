const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const Media = require('../models/media.model');
const Promotion = require('../models/promotion.model');
const GiftProgram = require('../models/gift-program.model');
const Coupon = require('../models/coupon.model');
const { AppError } = require('../utils/AppError');
const { slugify } = require('../utils/slugify');

const resolveMedia = async (mediaId) => {
  if (!mediaId) return null;
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return { mediaId: media._id, url: media.url, publicId: media.publicId };
};

/**
 * Tự sinh productCode từ tên sản phẩm
 * Ví dụ: "Tivi Sony X90L" → "TIVI-SONY-X90L"
 */
const generateProductCode = (name) =>
  slugify(name).toUpperCase().replace(/[^A-Z0-9-]/g, '').replace(/-+/g, '-').slice(0, 50);

/**
 * Đảm bảo productCode là unique trong collection products
 */
const ensureUniqueProductCode = async (base, excludeId = null) => {
  let candidate = base;
  let count = 1;
  while (true) {
    const query = { productCode: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Product.findOne(query);
    if (!exists) break;
    candidate = `${base}-${count++}`;
  }
  return candidate;
};

const createProduct = async (data) => {
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  const existingSlug = await Product.findOne({ slug: generatedSlug });
  if (existingSlug) throw new AppError('Tên sản phẩm hoặc slug đã tồn tại', 400);

  if (!data.categories || data.categories.length === 0)
    throw new AppError('Sản phẩm phải có ít nhất 1 danh mục', 400);

  for (const catId of data.categories) {
    const exists = await Category.findById(catId);
    if (!exists) throw new AppError(`Danh mục ${catId} không tồn tại`, 404);
  }

  if (data.brand) {
    const brandExists = await Brand.findById(data.brand);
    if (!brandExists) throw new AppError('Thương hiệu sản phẩm không tồn tại', 404);
  }

  const thumbnail = await resolveMedia(data.thumbnailMediaId);
  if (!thumbnail) throw new AppError('Ảnh đại diện sản phẩm là bắt buộc', 400);

  const images = [];
  if (data.imageMediaIds && data.imageMediaIds.length > 0) {
    for (const mediaId of data.imageMediaIds) {
      const img = await resolveMedia(mediaId);
      if (img) images.push(img);
    }
  }

  // Tự sinh productCode nếu Admin không nhập
  const baseCode = (data.productCode && data.productCode.trim() !== '')
    ? data.productCode.toUpperCase().trim()
    : generateProductCode(data.name);

  const productCode = await ensureUniqueProductCode(baseCode);

  const product = await Product.create({
    name: data.name,
    slug: generatedSlug,
    productCode,
    categories: data.categories,
    brand: data.brand,
    thumbnail,
    images,
    description: data.description,
    specifications: data.specifications,
    isFeatured: data.isFeatured,
    isHot: data.isHot,
    status: data.status,
    isActive: data.isActive,
  });

  // Tự động tạo 1 Default Variant — SKU = productCode (sản phẩm đơn không biến thể)
  await ProductVariant.create({
    productId: product._id,
    attributes: [{ name: 'Phân loại', value: 'Mặc định' }],
    displayName: 'Mặc định',
    sku: product.productCode,
    isManualSku: false,
    price: data.price ?? 0,
    salePrice: data.salePrice ?? 0,
    stock: data.stock ?? 0,
    thumbnail: product.thumbnail,
    images: product.images,
    position: 0,
    isActive: product.isActive !== false,
    isDefault: true,
  });

  return Product.findById(product._id)
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo');
};

const getCategoryIds = async (categoryQuery) => {
  if (!categoryQuery) return null;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryQuery);
  const root = isObjectId
    ? await Category.findById(categoryQuery)
    : await Category.findOne({ slug: categoryQuery });
  if (!root) return [];
  const children = await Category.find({ parentId: root._id });
  const grandChildren = await Category.find({ parentId: { $in: children.map((c) => c._id) } });
  return [root._id, ...children.map((c) => c._id), ...grandChildren.map((c) => c._id)];
};

const getAllProducts = async (query = {}) => {
  const { keyword, category, brand, minPrice, maxPrice, status = 'published',
    isFeatured, isHot, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = query;

  const filter = { isActive: true, status };

  if (keyword) filter.$or = [
    { name: { $regex: keyword, $options: 'i' } },
    { productCode: { $regex: keyword, $options: 'i' } },
  ];
  if (category) {
    const ids = await getCategoryIds(category);
    if (ids && ids.length > 0) filter.categories = { $in: ids };
    else if (ids !== null) filter.categories = { $in: [] };
  }
  if (brand) filter.brand = brand;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (isHot !== undefined) filter.isHot = isHot === 'true';

  // Filter theo giá qua Variant (nếu có)
  let variantFilter = {};
  if (minPrice || maxPrice) {
    variantFilter = {};
    if (minPrice) variantFilter.$gte = Number(minPrice);
    if (maxPrice) variantFilter.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('categories', 'name slug parentId')
      .populate('brand', 'name slug logo')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  const productsWithVariants = await Promise.all(
    products.map(async (p) => {
      const defaultVariant = await ProductVariant.findOne({ productId: p._id, isDefault: true });
      const pObj = p.toObject();
      pObj.price = defaultVariant?.price ?? 0;
      pObj.salePrice = defaultVariant?.salePrice ?? 0;
      pObj.stock = defaultVariant?.stock ?? 0;
      pObj.sku = defaultVariant?.sku ?? p.productCode;
      return pObj;
    })
  );

  return { products: productsWithVariants, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
};

const getAllProductsAdmin = async (query = {}) => {
  const { keyword, category, brand, status, isActive,
    sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = query;

  const filter = {};
  if (keyword) filter.$or = [
    { name: { $regex: keyword, $options: 'i' } },
    { productCode: { $regex: keyword, $options: 'i' } },
  ];
  if (category) {
    const ids = await getCategoryIds(category);
    if (ids && ids.length > 0) filter.categories = { $in: ids };
  }
  if (brand) filter.brand = brand;
  if (status) filter.status = status;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('categories', 'name slug parentId')
      .populate('brand', 'name slug logo')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  const productsWithVariants = await Promise.all(
    products.map(async (p) => {
      const defaultVariant = await ProductVariant.findOne({ productId: p._id, isDefault: true });
      const pObj = p.toObject();
      pObj.price = defaultVariant?.price ?? 0;
      pObj.salePrice = defaultVariant?.salePrice ?? 0;
      pObj.stock = defaultVariant?.stock ?? 0;
      pObj.sku = defaultVariant?.sku ?? p.productCode;
      return pObj;
    })
  );

  return { products: productsWithVariants, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
};

const getProductById = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(filter)
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo');

  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  const defaultVariant = await ProductVariant.findOne({ productId: product._id, isDefault: true });
  const pObj = product.toObject();
  pObj.price = defaultVariant?.price ?? 0;
  pObj.salePrice = defaultVariant?.salePrice ?? 0;
  pObj.stock = defaultVariant?.stock ?? 0;
  pObj.sku = defaultVariant?.sku ?? product.productCode;

  return pObj;
};

const getProductsToCompare = async (productIds) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError('Danh sách sản phẩm so sánh không được để trống', 400);
  }
  return Product.find({ _id: { $in: productIds }, isActive: true })
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo');
};

const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  // Nếu Admin muốn đổi productCode thủ công
  if (data.productCode && data.productCode.toUpperCase() !== product.productCode) {
    const newCode = data.productCode.toUpperCase().trim();
    const existingCode = await Product.findOne({ productCode: newCode, _id: { $ne: id } });
    if (existingCode) throw new AppError('Mã sản phẩm (productCode) đã bị trùng lặp', 400);
    data.productCode = newCode;
  }

  if (data.name && data.name !== product.name) {
    const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existingSlug = await Product.findOne({ slug: generatedSlug, _id: { $ne: id } });
    if (existingSlug) throw new AppError('Tên sản phẩm hoặc slug đã bị trùng lặp', 400);
    data.slug = generatedSlug;
  }

  if (data.categories !== undefined) {
    if (!data.categories.length) throw new AppError('Sản phẩm phải có ít nhất 1 danh mục', 400);
    for (const catId of data.categories) {
      const exists = await Category.findById(catId);
      if (!exists) throw new AppError(`Danh mục ${catId} không tồn tại`, 404);
    }
  }

  if (data.brand) {
    const brandExists = await Brand.findById(data.brand);
    if (!brandExists) throw new AppError('Thương hiệu sản phẩm không tồn tại', 404);
  }

  if (data.thumbnailMediaId !== undefined) {
    const thumbnail = await resolveMedia(data.thumbnailMediaId);
    if (!thumbnail) throw new AppError('Ảnh đại diện sản phẩm là bắt buộc', 400);
    product.thumbnail = thumbnail;
  }

  if (data.imageMediaIds !== undefined) {
    const images = [];
    for (const mediaId of data.imageMediaIds) {
      const img = await resolveMedia(mediaId);
      if (img) images.push(img);
    }
    product.images = images;
  }

  const { thumbnailMediaId, imageMediaIds, ...rest } = data;
  Object.assign(product, rest);
  await product.save();

  return Product.findById(product._id)
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo');
};

const toggleProductStatus = async (id, isActive) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  product.isActive = isActive !== undefined ? isActive : !product.isActive;
  await product.save();
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);
  await product.deleteOne();
  return { message: 'Đã xóa sản phẩm thành công' };
};

const deleteBulkProducts = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Danh sách ID sản phẩm cần xóa không hợp lệ', 400);
  }
  const result = await Product.deleteMany({ _id: { $in: ids } });
  return { message: `Đã xóa thành công ${result.deletedCount} sản phẩm` };
};

const getProductDeals = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(filter).populate('categories', '_id');
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  // Lấy giá thấp nhất từ Variant
  const defaultVariant = await ProductVariant.findOne({ productId: product._id, isDefault: true });
  const basePrice = defaultVariant?.price ?? 0;
  const baseSalePrice = defaultVariant?.salePrice ?? 0;

  const now = new Date();
  const categoryIds = (product.categories || []).map((c) => c._id || c);

  const activeFilter = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { 'scope.type': 'all' },
      { 'scope.type': 'products', 'scope.productIds': product._id },
      { 'scope.type': 'categories', 'scope.categoryIds': { $in: categoryIds } },
    ],
  };

  const [promotions, giftPrograms, coupons] = await Promise.all([
    Promotion.find(activeFilter).sort({ createdAt: -1 }),
    GiftProgram.find(activeFilter).sort({ createdAt: -1 }),
    Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    }).sort({ createdAt: -1 }).limit(10),
  ]);

  let effectivePrice = baseSalePrice > 0 ? baseSalePrice : basePrice;
  let bestPromotion = null;

  for (const promo of promotions) {
    if (promo.type === 'percent_discount' && promo.discountValue > 0) {
      let discounted = basePrice * (1 - promo.discountValue / 100);
      if (promo.maxDiscountValue) discounted = Math.max(basePrice - promo.maxDiscountValue, discounted);
      discounted = Math.round(discounted);
      if (discounted < effectivePrice) { effectivePrice = discounted; bestPromotion = promo; }
    }
    if (promo.type === 'fixed_discount' && promo.discountValue > 0) {
      const discounted = Math.max(0, basePrice - promo.discountValue);
      if (discounted < effectivePrice) { effectivePrice = discounted; bestPromotion = promo; }
    }
  }

  return { promotions, giftPrograms, coupons, effectivePrice, bestPromotion };
};

module.exports = {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  getProductsToCompare,
  getProductDeals,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  deleteBulkProducts,
};
