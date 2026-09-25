const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const Media = require('../models/media.model');
const Promotion = require('../models/promotion.model');
const GiftProgram = require('../models/gift-program.model');
const Coupon = require('../models/coupon.model');
const FlashSale = require('../models/flashSale.model');
const { AppError } = require('../utils/AppError');
const { slugify } = require('../utils/slugify');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getActiveFlashSaleMap = async () => {
  const now = new Date();
  const activeSale = await FlashSale.findOne({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  if (!activeSale || !Array.isArray(activeSale.items)) return null;

  const itemMap = new Map();
  for (const item of activeSale.items) {
    const pId = item.productId?.toString();
    const vId = item.variantId?.toString();
    const key = vId ? `${pId}_${vId}` : `${pId}_default`;
    itemMap.set(key, {
      ...item,
      flashSaleId: activeSale._id,
      flashSaleName: activeSale.name,
      endDate: activeSale.endDate,
    });
  }

  return { activeSale, itemMap };
};

const resolveMedia = async (mediaId) => {
  if (!mediaId) return null;
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return { mediaId: media._id, url: media.url, publicId: media.publicId };
};

/**
 * Bulk-resolve media IDs — 1 query thay vì N queries sequential.
 * Trả về array theo đúng thứ tự input.
 */
const resolveMediaBulk = async (ids = []) => {
  if (!ids || ids.length === 0) return [];
  const list = await Media.find({ _id: { $in: ids } }).select('_id url publicId').lean();
  const map = {};
  list.forEach((m) => { map[m._id.toString()] = m; });
  return ids.map((id) => {
    const m = map[id.toString()];
    if (!m) throw new AppError(`Không tìm thấy ảnh ${id} trong Media Library`, 404);
    return { mediaId: m._id, url: m.url, publicId: m.publicId };
  });
};

/**
 * Sync cachedPrice / cachedSalePrice lên Product từ Default Variant.
 * Gọi sau mọi thao tác tạo/sửa variant để filter giá luôn chính xác.
 */
const syncCachedPrice = async (productId) => {
  const dv = await ProductVariant.findOne({ productId, isDefault: true })
    .select('price salePrice').lean();
  if (!dv) return;
  await Product.updateOne(
    { _id: productId },
    { $set: { cachedPrice: dv.price ?? null, cachedSalePrice: dv.salePrice ?? null } }
  );
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
 * Lưu ý: dùng generateVariantSkus (plural) cho batch thầy vì gọi cái này trong loop.
 */
const buildSkuBase = (productCode, attributes = []) => {
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
  return attrPart ? `${productCode}-${attrPart}` : productCode;
};

/**
 * Single-variant SKU generation (dùng cho createDefaultVariant).
 * Vẫn giữ while-loop nhưng chỉ gọi 1 lần khi tạo Default Variant.
 */
const generateVariantSku = async (productCode, attributes = []) => {
  const base = buildSkuBase(productCode, attributes);
  let sku    = base;
  let suffix = 1;
  while (await ProductVariant.findOne({ sku }).select('_id').lean()) {
    sku = `${base}-${suffix++}`;
  }
  return sku;
};

/**
 * Batch SKU generation — kiểm tra uniqueness 1 lần cho cả mảng variants.
 * Thay vì N sequential while-loop findOne → 1 $in query + resolve conflicts.
 *
 * @param {string}   productCode
 * @param {Array}    variantItems  — mảng variant data (có .sku hoặc .attributes)
 * @returns {string[]} — mảng SKU đã giải quyết conflict, cùng order với variantItems
 */
const generateVariantSkusBatch = async (productCode, variantItems) => {
  // Step 1: Tạo candidate SKUs (chưa kiểm tra unique)
  const candidates = variantItems.map((item) => {
    if (item.sku && item.sku.trim()) return item.sku.trim().toUpperCase();
    return buildSkuBase(productCode, item.attributes || []);
  });

  // Step 2: 1 query kiểm tra tất cả candidates có tồn tại không
  const existingDocs = await ProductVariant.find(
    { sku: { $in: candidates } },
    { sku: 1 }
  ).lean();
  const existingSkus = new Set(existingDocs.map((d) => d.sku));

  // Step 3: Resolve conflicts bằng suffix, track đã dùng trong batch này
  const usedInBatch = new Set();
  return candidates.map((base) => {
    if (!existingSkus.has(base) && !usedInBatch.has(base)) {
      usedInBatch.add(base);
      return base;
    }
    // Tìm suffix không conflict
    let suffix = 1;
    let sku    = `${base}-${suffix}`;
    while (existingSkus.has(sku) || usedInBatch.has(sku)) {
      sku = `${base}-${++suffix}`;
    }
    usedInBatch.add(sku);
    return sku;
  });
};

/**
 * Tạo Default Variant cho sản phẩm không có biến thể.
 */
const createDefaultVariant = async (productId, productCode, price, salePrice, stock, unit = 'Cái') => {
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
    unit: unit || 'Cái',
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
      price: dv?.price ?? p.price ?? null,
      salePrice: dv?.salePrice ?? p.salePrice ?? null,
      stock: dv?.stock ?? p.stock ?? null,
    };
  });
};

// ─── Category helper ──────────────────────────────────────────────────────────

/**
 * getCategoryIds — $graphLookup thay vì 3 queries tuần tự.
 * Hỗ trợ bất kỳ độ sâu nào, chỉ 2 queries tổng.
 */
const getCategoryIds = async (categoryQuery) => {
  if (!categoryQuery) return null;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryQuery);
  const root = await Category.findOne(
    isObjectId ? { _id: categoryQuery } : { slug: categoryQuery }
  ).select('_id');
  if (!root) return [];

  const [res] = await Category.aggregate([
    { $match: { _id: root._id } },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
        maxDepth: 10,
      },
    },
    { $project: { descendants: '$descendants._id' } },
  ]);
  return [root._id, ...(res?.descendants || [])];
};

// ─── CRUD ─────────────────────────────────────────────────────────────────────

const createProduct = async (data) => {
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  let sku;
  if (data.sku && data.sku.trim()) sku = data.sku.trim().toUpperCase();

  if (!data.categories || data.categories.length === 0)
    throw new AppError('Sản phẩm phải có ít nhất 1 danh mục', 400);
  if (!data.thumbnailMediaId)
    throw new AppError('Ảnh đại diện sản phẩm là bắt buộc', 400);

  // Batch validate parallel — 4 queries cùng lúc thay vì sequential
  const [existingSlug, existingSku, foundCats, brandExists] = await Promise.all([
    Product.exists({ slug: generatedSlug }),
    sku ? Product.exists({ sku }) : Promise.resolve(null),
    Category.find({ _id: { $in: data.categories } }).select('_id').lean(),
    data.brand ? Brand.exists({ _id: data.brand }) : Promise.resolve(true),
  ]);

  if (existingSlug) throw new AppError('Tên sản phẩm hoặc slug đã tồn tại', 400);
  if (sku && existingSku) throw new AppError('Mã SKU sản phẩm đã tồn tại', 400);
  if (foundCats.length !== data.categories.length)
    throw new AppError('Một hoặc nhiều danh mục không tồn tại', 400);
  if (!brandExists) throw new AppError('Thương hiệu sản phẩm không tồn tại', 404);

  // Resolve tất cả media trong 1 batch query
  const allMediaIds = [data.thumbnailMediaId, ...(data.imageMediaIds || [])];
  const resolvedMedia = await resolveMediaBulk(allMediaIds);
  const thumbnail = resolvedMedia[0];
  const images = resolvedMedia.slice(1);

  const productCode = await generateProductCode(data.name);

  const product = await Product.create({
    name: data.name, slug: generatedSlug, sku, productCode,
    categories: data.categories, brand: data.brand, thumbnail, images,
    unit: data.unit || 'Cái', itemType: data.itemType || 'merchandise',
    description: data.description, specifications: data.specifications,
    options: data.options, isFeatured: data.isFeatured, isHot: data.isHot,
    status: data.status, isActive: data.isActive,
  });

  // Default Variant
  await createDefaultVariant(
    product._id, productCode, data.price, data.salePrice, data.stock, data.unit || 'Cái'
  );

  // Biến thể chi tiết — batch SKU generation (1 query) + insertMany (1 round trip)
  if (Array.isArray(data.variants) && data.variants.length > 0) {
    // Batch generate tất cả SKUs trong 1 DB call thay vì N sequential calls
    const skus = await generateVariantSkusBatch(productCode, data.variants);
    const variantDocs = data.variants.map((item, i) => {
      const attrs = item.attributes || [];
      return {
        productId: product._id, isDefault: false, attributes: attrs,
        displayName: item.displayName || attrs.map((a) => a.value).join(' / ') || `Biến thể ${i + 1}`,
        sku: skus[i], price: item.price ?? data.price ?? 0,
        salePrice: item.salePrice ?? data.salePrice ?? null,
        costPrice: item.costPrice ?? data.costPrice ?? null,
        stock: item.stock ?? 0, unit: item.unit || data.unit || 'Cái',
        position: i, isActive: true,
      };
    });
    await ProductVariant.insertMany(variantDocs);
  }

  // Sync cachedPrice và search tokens song song
  await Promise.all([
    syncCachedPrice(product._id),
    syncProductSmartTokens(product._id),
  ]);

  const result = await Product.findById(product._id)
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo')
    .lean();

  const dv = await ProductVariant.findOne({ productId: product._id, isDefault: true })
    .select('price salePrice stock sku').lean();

  return { ...result, defaultVariantId: dv?._id || null, price: dv?.price ?? null, salePrice: dv?.salePrice ?? null, stock: dv?.stock ?? null };
};

const syncProductSmartTokens = async (productId) => {
  try {
    const { removeVietnameseTones, extractAcronyms } = require('../utils/searchEngine');
    const prod = await Product.findById(productId)
      .populate('categories', 'name').populate('brand', 'name').lean();
    if (!prod) return;

    const variants = await ProductVariant.find({ productId: prod._id }).lean();
    const nameNorm = removeVietnameseTones(prod.name || '');
    const acronyms = extractAcronyms(prod.name || '');
    const words = nameNorm.split(/\s+/).filter(Boolean);
    const brandName = prod.brand?.name ? removeVietnameseTones(prod.brand.name) : '';
    const catNames = (prod.categories || []).map((c) => removeVietnameseTones(c.name));
    const variantSkus = variants.map((v) => (v.sku || '').toLowerCase()).filter(Boolean);
    const variantNames = variants.map((v) => removeVietnameseTones(v.displayName || '')).filter(Boolean);
    const variantAcronyms = variants.flatMap((v) => extractAcronyms(v.displayName || ''));

    const tokenSet = new Set([
      nameNorm, ...acronyms, ...words,
      (prod.productCode || '').toLowerCase(), (prod.sku || '').toLowerCase(),
      brandName, ...catNames, ...variantSkus, ...variantNames, ...variantAcronyms,
    ]);

    // updateOne thay vì prod.save() — tránh trigger middleware không cần thiết
    await Product.updateOne(
      { _id: productId },
      { $set: { searchTokens: Array.from(tokenSet).filter(Boolean) } }
    );
  } catch {
    // Ignore indexing error
  }
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
    if (ids && ids.length > 0) {
      filter.categories = { $in: ids };
    } else {
      const brandDoc = await Brand.findOne({ slug: category }).select('_id');
      if (brandDoc) {
        filter.brand = brandDoc._id;
      } else if (ids !== null) {
        filter.categories = { $in: [] };
      }
    }
  }
  if (brand) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(brand);
    const brandDoc = await Brand.findOne(
      isObjectId ? { _id: brand } : { slug: brand }
    ).select('_id');
    if (brandDoc) {
      filter.brand = brandDoc._id;
    }
  }
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (isHot !== undefined) filter.isHot = isHot === 'true';

  // Filter giá TRƯỚC paginate — cachedPrice đã denormalize từ Default Variant
  if (minPrice) filter.cachedPrice = { $gte: Number(minPrice) };
  if (maxPrice) filter.cachedPrice = { ...(filter.cachedPrice || {}), $lte: Number(maxPrice) };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('categories', 'name slug parentId')
      .populate('brand', 'name slug logo')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  if (!products.length)
    return { products: [], pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };

  const productIds = products.map((p) => p._id);
  const allVariants = await ProductVariant.find({ productId: { $in: productIds } })
    .select('productId price salePrice stock sku attributes displayName isDefault images')
    .sort({ isDefault: -1, createdAt: 1 })
    .lean();
  const variantsMap = {};
  allVariants.forEach((v) => {
    const pid = v.productId.toString();
    if (!variantsMap[pid]) variantsMap[pid] = [];
    variantsMap[pid].push(v);
  });

  return {
    products: products.map((p) => {
      const pVars = variantsMap[p._id.toString()] || [];
      const dv = pVars.find((v) => v.isDefault) || pVars[0];
      return {
        ...p,
        category: p.categories?.[0] || null,
        defaultVariantId: dv?._id || null,
        price: dv?.price ?? p.cachedPrice ?? null,
        salePrice: dv?.salePrice ?? p.cachedSalePrice ?? null,
        stock: dv?.stock ?? null,
        variants: pVars,
      };
    }),
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
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  if (!products.length)
    return { products: [], pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: Math.ceil(total / limitNum) } };

  const productIds = products.map((p) => p._id);

  const [variantCounts, defaultVariants] = await Promise.all([
    ProductVariant.aggregate([
      { $match: { productId: { $in: productIds }, isDefault: false } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]),
    ProductVariant.find({ productId: { $in: productIds }, isDefault: true })
      .select('productId price salePrice stock sku').lean(),
  ]);

  const variantCountMap = {};
  variantCounts.forEach((v) => { variantCountMap[v._id.toString()] = v.count; });
  const defaultVariantMap = {};
  defaultVariants.forEach((v) => { defaultVariantMap[v.productId.toString()] = v; });

  const fsData = await getActiveFlashSaleMap();

  return {
    products: products.map((p) => {
      const pid = p._id.toString();
      const dv = defaultVariantMap[pid];
      let price = dv?.price ?? p.cachedPrice ?? null;
      let salePrice = dv?.salePrice ?? p.cachedSalePrice ?? null;
      let isFlashSale = false;

      if (fsData && fsData.itemMap) {
        const keyWithVariant = dv ? `${pid}_${dv._id}` : `${pid}_default`;
        const keyDefault = `${pid}_default`;
        const matched = fsData.itemMap.get(keyWithVariant) || fsData.itemMap.get(keyDefault);
        const fsPrice = matched ? (matched.flashSalePrice ?? matched.flashPrice) : null;
        const fsRemaining = matched ? Math.max(0, (matched.stockLimit || 0) - (matched.soldCount || 0)) : 0;
        if (matched && fsPrice !== null && fsRemaining > 0) {
          isFlashSale = true;
          salePrice = fsPrice;
        }
      }

      return {
        ...p,
        category: p.categories?.[0] || null,
        variantCount: variantCountMap[pid] ?? 0,
        defaultVariantId: dv?._id || null,
        price,
        salePrice,
        stock: dv?.stock ?? null,
        isFlashSale,
      };
    }),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
};

const getProductById = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const product = await Product.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug })
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo')
    .lean();
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  const dv = await ProductVariant.findOne({ productId: product._id, isDefault: true })
    .select('price salePrice stock sku').lean();

  let price = dv?.price ?? product.cachedPrice ?? null;
  let salePrice = dv?.salePrice ?? product.cachedSalePrice ?? null;
  let isFlashSale = false;
  let flashSaleData = null;

  const fsData = await getActiveFlashSaleMap();
  if (fsData && fsData.itemMap) {
    const keyWithVariant = dv ? `${product._id}_${dv._id}` : `${product._id}_default`;
    const keyDefault = `${product._id}_default`;
    const matched = fsData.itemMap.get(keyWithVariant) || fsData.itemMap.get(keyDefault);
    const fsPrice = matched ? (matched.flashSalePrice ?? matched.flashPrice) : null;
    const fsRemaining = matched ? Math.max(0, (matched.stockLimit || 0) - (matched.soldCount || 0)) : 0;
    if (matched && fsPrice !== null && fsRemaining > 0) {
      isFlashSale = true;
      salePrice = fsPrice;
      flashSaleData = {
        _id: matched.flashSaleId,
        name: matched.flashSaleName,
        flashSalePrice: fsPrice,
        originalPrice: price,
        remaining: fsRemaining,
        stockLimit: matched.stockLimit,
        soldCount: matched.soldCount,
        endDate: matched.endDate,
      };
    }
  }

  return {
    ...product,
    defaultVariantId: dv?._id || null,
    price,
    salePrice,
    stock: dv?.stock ?? null,
    isFlashSale,
    flashSale: flashSaleData,
  };
};

const getProductsToCompare = async (productIds) => {
  if (!Array.isArray(productIds) || productIds.length === 0)
    throw new AppError('Danh sách sản phẩm so sánh không được để trống', 400);

  const products = await Product.find({ _id: { $in: productIds }, isActive: true })
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo')
    .lean();

  const ids = products.map((p) => p._id);
  const variants = await ProductVariant.find({ productId: { $in: ids }, isActive: true })
    .select('productId displayName attributes price salePrice stock sku isDefault unit')
    .lean();

  const variantsMap = {};
  const dvMap = {};
  variants.forEach((v) => {
    const pid = v.productId.toString();
    if (!variantsMap[pid]) variantsMap[pid] = [];
    variantsMap[pid].push(v);
    if (v.isDefault) dvMap[pid] = v;
  });

  return products.map((p) => {
    const pid = p._id.toString();
    const pVariants = variantsMap[pid] || [];
    const dv = dvMap[pid] || pVariants[0];
    return {
      ...p,
      variants: pVariants,
      defaultVariantId: dv?._id || null,
      price: dv?.price ?? p.price ?? null,
      salePrice: dv?.salePrice ?? p.salePrice ?? null,
      stock: dv?.stock ?? p.stock ?? null,
    };
  });
};

const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  // Batch validate parallel
  const checks = [];

  if (data.sku && data.sku.toUpperCase() !== product.sku) {
    data.sku = data.sku.toUpperCase();
    checks.push(
      Product.exists({ sku: data.sku, _id: { $ne: id } })
        .then((e) => { if (e) throw new AppError('Mã SKU sản phẩm đã bị trùng lặp', 400); })
    );
  }
  if (data.name && data.name !== product.name) {
    const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);
    data.slug = generatedSlug;
    checks.push(
      Product.exists({ slug: generatedSlug, _id: { $ne: id } })
        .then((e) => { if (e) throw new AppError('Tên sản phẩm hoặc slug đã bị trùng lặp', 400); })
    );
  }
  if (data.categories !== undefined) {
    if (!data.categories.length) throw new AppError('Sản phẩm phải có ít nhất 1 danh mục', 400);
    checks.push(
      Category.find({ _id: { $in: data.categories } }).select('_id').lean()
        .then((found) => { if (found.length !== data.categories.length) throw new AppError('Một hoặc nhiều danh mục không tồn tại', 400); })
    );
  }
  if (data.brand) {
    checks.push(
      Brand.exists({ _id: data.brand })
        .then((e) => { if (!e) throw new AppError('Thương hiệu sản phẩm không tồn tại', 404); })
    );
  }
  await Promise.all(checks);

  // Resolve media — bulk
  if (data.thumbnailMediaId !== undefined) {
    const [thumbnail] = await resolveMediaBulk([data.thumbnailMediaId]);
    product.thumbnail = thumbnail;
  }
  if (data.imageMediaIds !== undefined) {
    product.images = await resolveMediaBulk(data.imageMediaIds);
  }

  // Sync price/stock lên Default Variant
  const hasPriceOrStock = data.price !== undefined || data.stock !== undefined || data.salePrice !== undefined;
  if (hasPriceOrStock) {
    let dv = await getDefaultVariant(id);
    if (!dv) {
      const productCode = product.productCode || await generateProductCode(product.name);
      await createDefaultVariant(id, productCode, data.price, data.salePrice, data.stock);
    } else {
      if (data.price !== undefined) dv.price = data.price;
      if (data.salePrice !== undefined) dv.salePrice = data.salePrice;
      if (data.stock !== undefined) dv.stock = data.stock;
      await dv.save();
    }
    await syncCachedPrice(id);
  }

  const { thumbnailMediaId, imageMediaIds, price, salePrice, stock, ...rest } = data;
  Object.assign(product, rest);
  await product.save();

  await syncProductSmartTokens(product._id);

  const result = await Product.findById(product._id)
    .populate('categories', 'name slug parentId')
    .populate('brand', 'name slug logo')
    .lean();

  const dv2 = await ProductVariant.findOne({ productId: product._id, isDefault: true })
    .select('price salePrice stock sku').lean();

  return { ...result, defaultVariantId: dv2?._id || null, price: dv2?.price ?? null, salePrice: dv2?.salePrice ?? null, stock: dv2?.stock ?? null };
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
  // Parallel delete
  await Promise.all([
    ProductVariant.deleteMany({ productId: id }),
    product.deleteOne(),
  ]);
  return { message: 'Đã xóa sản phẩm thành công' };
};

const deleteBulkProducts = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new AppError('Danh sách ID sản phẩm cần xóa không hợp lệ', 400);
  const [, result] = await Promise.all([
    ProductVariant.deleteMany({ productId: { $in: ids } }),
    Product.deleteMany({ _id: { $in: ids } }),
  ]);
  return { message: `Đã xóa thành công ${result.deletedCount} sản phẩm` };
};

const getProductDeals = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const product = await Product.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug })
    .populate('categories', '_id').lean();
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  const dv = await ProductVariant.findOne({ productId: product._id, isDefault: true })
    .select('price salePrice').lean();
  const productPrice     = dv?.price     ?? product.cachedPrice     ?? 0;
  const productSalePrice = dv?.salePrice ?? product.cachedSalePrice ?? 0;

  const now = new Date();
  const categoryIds = (product.categories || []).map((c) => c._id || c);

  // 1. Kiểm tra xem sản phẩm có trong Flash Sale đang chạy không
  const fsData = await getActiveFlashSaleMap();
  let matchedFsItem = null;
  if (fsData && fsData.itemMap) {
    const keyWithVariant = dv ? `${product._id}_${dv._id}` : `${product._id}_default`;
    const keyDefault = `${product._id}_default`;
    matchedFsItem = fsData.itemMap.get(keyWithVariant) || fsData.itemMap.get(keyDefault);
  }

  const fsPrice = matchedFsItem ? (matchedFsItem.flashSalePrice ?? matchedFsItem.flashPrice) : null;
  const fsRemaining = matchedFsItem ? Math.max(0, (matchedFsItem.stockLimit || 0) - (matchedFsItem.soldCount || 0)) : 0;
  const isFlashSaleActive = matchedFsItem && fsPrice !== null && fsPrice < productPrice && fsRemaining > 0;

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
    // Chuẩn doanh nghiệp: Khi đang hưởng giá Flash Sale sốc, không áp dụng thêm Gift Program
    isFlashSaleActive ? [] : GiftProgram.find(activeFilter).sort({ createdAt: -1 }),
    Coupon.find({
      isActive: true, startDate: { $lte: now }, endDate: { $gte: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    }).sort({ createdAt: -1 }).limit(10),
  ]);

  let effectivePrice = productSalePrice > 0 ? productSalePrice : productPrice;
  let bestPromotion = null;
  let flashSaleDeal = null;

  if (isFlashSaleActive) {
    effectivePrice = fsPrice;
    flashSaleDeal = {
      _id: matchedFsItem.flashSaleId,
      name: matchedFsItem.flashSaleName,
      price: fsPrice,
      originalPrice: productPrice,
      remaining: fsRemaining,
      stockLimit: matchedFsItem.stockLimit,
      soldCount: matchedFsItem.soldCount,
      discountPercent: Math.round(((productPrice - fsPrice) / productPrice) * 100),
      endDate: matchedFsItem.endDate,
    };
  } else {
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
  }

  return {
    promotions: isFlashSaleActive ? [] : promotions,
    giftPrograms,
    coupons,
    effectivePrice,
    bestPromotion,
    flashSale: flashSaleDeal,
    isFlashSale: isFlashSaleActive,
    dealNotice: isFlashSaleActive
      ? 'Sản phẩm đang trong Flash Sale — Giá sốc độc quyền, không áp dụng cộng dồn với khuyến mãi hoặc quà tặng kèm.'
      : null,
  };
};

const searchInventoryProducts = async (keyword) => {
  if (!keyword || !keyword.trim()) return [];
  const regex = new RegExp(keyword.trim(), 'i');

  const matchingProducts = await Product.find({
    $or: [{ name: regex }, { sku: regex }, { code: regex }, { productCode: regex }],
    isActive: true,
  }).select('_id').lean();

  const productIds = matchingProducts.map((p) => p._id);

  const matchingVariants = await ProductVariant.find({
    $or: [{ productId: { $in: productIds } }, { sku: regex }, { displayName: regex }],
  })
    .populate('productId', 'name code productCode price costPrice thumbnail')
    .lean();

  const results = [];
  const seenVariantIds = new Set();

  for (const v of matchingVariants) {
    if (!v.productId || seenVariantIds.has(v._id.toString())) continue;
    seenVariantIds.add(v._id.toString());
    const prod = v.productId;
    results.push({
      _id: prod._id,
      variantId: v._id,
      name: !v.isDefault ? `${prod.name} (${v.displayName || v.sku || 'Biến thể'})` : prod.name,
      sku: v.sku || prod.productCode || prod.code || '',
      unit: 'Cái',
      price: v.price || prod.price || 0,
      costPrice: v.costPrice || prod.costPrice || 0,
      stock: v.stock || 0,
    });
  }

  return results;
};

const bulkUpdateProductStatus = async (ids, status) => {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new AppError('Danh sách ID không hợp lệ', 400);
  const validStatuses = ['published', 'draft', 'out_of_stock'];
  if (!validStatuses.includes(status))
    throw new AppError('Trạng thái không hợp lệ', 400);
  const result = await Product.updateMany({ _id: { $in: ids } }, { $set: { status } });
  return { updated: result.modifiedCount };
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
  bulkUpdateProductStatus,
  searchInventoryProducts,
  syncCachedPrice,
  generateProductCode,
  generateVariantSku,
  createDefaultVariant,
  locateProduct: async (id, limit = 20) => {
    const product = await Product.findById(id).select('_id createdAt');
    if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);
    const positionBefore = await Product.countDocuments({ createdAt: { $gt: product.createdAt } });
    const page = Math.ceil((positionBefore + 1) / limit);
    return { page: Math.max(1, page), productId: id };
  },
};



