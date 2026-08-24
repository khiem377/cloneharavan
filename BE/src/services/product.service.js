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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveMedia = async (mediaId) => {
  if (!mediaId) return null;
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return { mediaId: media._id, url: media.url, publicId: media.publicId };
};

/**
 * Tự sinh productCode từ tên sản phẩm.
 * "Tủ lạnh Samsung Inverter 409 lít" → "TU-LANH-SAMSUNG-INVERTER-409"
 */
const generateProductCode = async (name) => {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 5)
    .join('-');

  const base = normalized || 'PROD';
  let code = base;
  let suffix = 1;
  while (await Product.findOne({ productCode: code })) {
    code = `${base}-${suffix++}`;
  }
  return code;
};

/**
 * Tự sinh SKU cho variant từ productCode + attributes.
 * productCode="SAMSUNG-409", attrs=[{value:"Đen"},{value:"M"}] → "SAMSUNG-409-DEN-M"
 */
const generateVariantSku = async (productCode, attributes = []) => {
  const attrPart = attributes
    .map((a) =>
      a.value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6)
    )
    .filter(Boolean)
    .join('-');

  const base = attrPart ? `${productCode}-${attrPart}` : productCode;
  let sku = base;
  let suffix = 1;
  while (await ProductVariant.findOne({ sku })) {
    sku = `${base}-${suffix++}`;
  }
  return sku;
};

/**
 * Tạo Default Variant cho sản phẩm không có biến thể.
 */
const createDefaultVariant = async (productId, productCode, price, salePrice, stock) => {
  const sku = await generateVariantSku(productCode, []);
  return ProductVariant.create({
    productId,
    isDefault: true,
    attributes: [],
    displayName: 'Mặc định',
    sku,
    price: price || 0,
    salePrice: salePrice || null,
    stock: stock ?? 0,
    position: 0,
    isActive: true,
  });
};

/**
 * Lấy default variant của sản phẩm.
 */
const getDefaultVariant = (productId) =>
  ProductVariant.findOne({ productId, isDefault: true });

/**
 * Inject thông tin giá/stock từ default variant vào product object.
 */
const injectDefaultVariantData = async (productObjects) => {
  const ids = productObjects.map((p) => p._id || p.id);
  const defaults = await ProductVariant.find({ productId: { $in: ids }, isDefault: true })
    .select('productId price salePrice stock sku');

  const map = {};
  defaults.forEach((v) => { map[v.productId.toString()] = v; });

  return productObjects.map((p) => {
    const pid = (p._id || p.id).toString();
    const dv = map[pid];
    return {
      ...p,
      defaultVariantId: dv?._id || null,
      price:     dv?.price     ?? p.price     ?? null,
      salePrice: dv?.salePrice ?? p.salePrice ?? null,
      stock:     dv?.stock     ?? p.stock     ?? null,
    };
  });
};

// ─── Category helper ──────────────────────────────────────────────────────────

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

// ─── CRUD ─────────────────────────────────────────────────────────────────────

const createProduct = async (data) => {
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  // SKU cũ (backward compat)
  let sku;
  if (data.sku && data.sku.trim()) {
    sku = data.sku.trim().toUpperCase();
    const existingSku = await Product.findOne({ sku });
    if (existingSku) throw new AppError('Mã SKU sản phẩm đã tồn tại', 400);
  }

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

  // Sinh productCode
  const productCode = await generateProductCode(data.name);

  const product = await Product.create({
    name: data.name,
    slug: generatedSlug,
    sku,
    productCode,
    categories: data.categories,
    brand: data.brand,
    thumbnail,
    images,
    description: data.description,
    specifications: data.specifications,
    options: data.options,
    isFeatured: data.isFeatured,
    isHot: data.isHot,
    status: data.status,
    isActive: data.isActive,
  });

  // Auto-tạo Default Variant
  await createDefaultVariant(
    product._id,
    productCode,
    data.price,
    data.salePrice,
    data.stock,
  );

  const result = await Product.findById(product._id)
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo');

  const [enriched] = await injectDefaultVariantData([result.toObject()]);
  return enriched;
};

const getAllProducts = async (query = {}) => {
  const {
    keyword, category, brand, minPrice, maxPrice,
    status = 'published', isFeatured, isHot,
    sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20,
  } = query;

  const filter = { isActive: true, status };

  if (keyword) filter.$or = [
    { name: { $regex: keyword, $options: 'i' } },
    { sku: { $regex: keyword, $options: 'i' } },
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

  // Lọc theo giá (từ default variant)
  let enriched = await injectDefaultVariantData(products.map((p) => p.toObject()));

  if (minPrice || maxPrice) {
    enriched = enriched.filter((p) => {
      const pr = p.price ?? 0;
      if (minPrice && pr < Number(minPrice)) return false;
      if (maxPrice && pr > Number(maxPrice)) return false;
      return true;
    });
  }

  return {
    products: enriched,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
};

const getAllProductsAdmin = async (query = {}) => {
  const {
    keyword, category, brand, status, isActive,
    sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20,
  } = query;

  const filter = {};
  if (keyword) filter.$or = [
    { name: { $regex: keyword, $options: 'i' } },
    { sku: { $regex: keyword, $options: 'i' } },
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

  const productIds = products.map((p) => p._id);

  // Đếm biến thể (không tính default variant)
  const [variantCounts, defaultVariants] = await Promise.all([
    ProductVariant.aggregate([
      { $match: { productId: { $in: productIds }, isDefault: false } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]),
    ProductVariant.find({ productId: { $in: productIds }, isDefault: true })
      .select('productId price salePrice stock sku'),
  ]);

  const variantCountMap = {};
  variantCounts.forEach((v) => { variantCountMap[v._id.toString()] = v.count; });

  const defaultVariantMap = {};
  defaultVariants.forEach((v) => { defaultVariantMap[v.productId.toString()] = v; });

  const productsWithData = products.map((p) => {
    const pid = p._id.toString();
    const dv = defaultVariantMap[pid];
    return {
      ...p.toObject(),
      variantCount: variantCountMap[pid] ?? 0,
      defaultVariantId: dv?._id || null,
      price:     dv?.price     ?? p.price     ?? null,
      salePrice: dv?.salePrice ?? p.salePrice ?? null,
      stock:     dv?.stock     ?? p.stock     ?? null,
    };
  });

  return {
    products: productsWithData,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
};

const getProductById = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(filter)
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo');

  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  const [enriched] = await injectDefaultVariantData([product.toObject()]);
  return enriched;
};

const getProductsToCompare = async (productIds) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError('Danh sách sản phẩm so sánh không được để trống', 400);
  }
  const products = await Product.find({ _id: { $in: productIds }, isActive: true })
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo');
  return injectDefaultVariantData(products.map((p) => p.toObject()));
};

const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  if (data.sku && data.sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({ sku: data.sku.toUpperCase(), _id: { $ne: id } });
    if (existingSku) throw new AppError('Mã SKU sản phẩm đã bị trùng lặp', 400);
    data.sku = data.sku.toUpperCase();
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

  // Sync price/stock lên Default Variant
  const hasPriceOrStock = data.price !== undefined || data.stock !== undefined || data.salePrice !== undefined;
  if (hasPriceOrStock) {
    let dv = await getDefaultVariant(id);
    if (!dv) {
      // Không có default variant → tạo mới
      const productCode = product.productCode || await generateProductCode(product.name);
      dv = await createDefaultVariant(id, productCode, data.price, data.salePrice, data.stock);
    } else {
      if (data.price    !== undefined) dv.price    = data.price;
      if (data.salePrice !== undefined) dv.salePrice = data.salePrice;
      if (data.stock    !== undefined) dv.stock    = data.stock;
      await dv.save();
    }
  }

  const { thumbnailMediaId, imageMediaIds, price, salePrice, stock, ...rest } = data;
  Object.assign(product, rest);
  await product.save();

  const result = await Product.findById(product._id)
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo');

  const [enriched] = await injectDefaultVariantData([result.toObject()]);
  return enriched;
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
  await ProductVariant.deleteMany({ productId: id }); // xóa variants theo
  await product.deleteOne();
  return { message: 'Đã xóa sản phẩm thành công' };
};

const deleteBulkProducts = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Danh sách ID sản phẩm cần xóa không hợp lệ', 400);
  }
  await ProductVariant.deleteMany({ productId: { $in: ids } });
  const result = await Product.deleteMany({ _id: { $in: ids } });
  return { message: `Đã xóa thành công ${result.deletedCount} sản phẩm` };
};

const getProductDeals = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(filter).populate('categories', '_id');
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  // Lấy giá từ default variant
  const dv = await getDefaultVariant(product._id);
  const productPrice = dv?.price ?? product.price ?? 0;
  const productSalePrice = dv?.salePrice ?? product.salePrice ?? 0;

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

  let effectivePrice = productSalePrice > 0 ? productSalePrice : productPrice;
  let bestPromotion = null;

  for (const promo of promotions) {
    if (promo.type === 'percent_discount' && promo.discountValue > 0) {
      let discounted = productPrice * (1 - promo.discountValue / 100);
      if (promo.maxDiscountValue) discounted = Math.max(productPrice - promo.maxDiscountValue, discounted);
      discounted = Math.round(discounted);
      if (discounted < effectivePrice) { effectivePrice = discounted; bestPromotion = promo; }
    }
    if (promo.type === 'fixed_discount' && promo.discountValue > 0) {
      const discounted = Math.max(0, productPrice - promo.discountValue);
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
  // export helpers để dùng trong seeder/migration
  generateProductCode,
  generateVariantSku,
  createDefaultVariant,
};
