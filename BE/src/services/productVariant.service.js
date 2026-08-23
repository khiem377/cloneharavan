const ProductVariant = require('../models/productVariant.model');
const Product = require('../models/product.model');
const Media = require('../models/media.model');
const { AppError } = require('../utils/AppError');
const { slugify } = require('../utils/slugify');

const resolveMedia = async (mediaId) => {
  if (!mediaId) return null;
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return { mediaId: media._id, url: media.url, publicId: media.publicId };
};

const generateVariantSku = (productCode, attributes) => {
  const parts = [productCode ? productCode.toUpperCase() : 'SKU'];
  if (Array.isArray(attributes) && attributes.length > 0) {
    for (const attr of attributes) {
      if (attr.value) {
        const clean = slugify(String(attr.value)).toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (clean) parts.push(clean);
      }
    }
  }
  return parts.join('-');
};

const ensureUniqueSku = async (baseSku, excludeVariantId = null) => {
  let sku = baseSku.toUpperCase().trim();
  let candidate = sku;
  let count = 1;
  while (true) {
    const query = { sku: candidate };
    if (excludeVariantId) query._id = { $ne: excludeVariantId };
    const exists = await ProductVariant.findOne(query);
    if (!exists) break;
    candidate = `${sku}-${count++}`;
  }
  return candidate;
};

const getVariantsByProduct = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);
  return ProductVariant.find({ productId }).sort({ position: 1, createdAt: 1 });
};

const getVariantById = async (id) => {
  const variant = await ProductVariant.findById(id);
  if (!variant) throw new AppError('Không tìm thấy biến thể sản phẩm', 404);
  return variant;
};

const createVariant = async (productId, data) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  let finalSku = '';
  let isManualSku = false;

  if (data.sku && data.sku.trim() !== '') {
    const manualSku = data.sku.toUpperCase().trim();
    const existingSku = await ProductVariant.findOne({ sku: manualSku });
    if (existingSku) throw new AppError(`Mã SKU "${manualSku}" đã được sử dụng bởi biến thể khác`, 400);
    finalSku = manualSku;
    isManualSku = true;
  } else {
    const baseSku = generateVariantSku(product.productCode, data.attributes);
    finalSku = await ensureUniqueSku(baseSku);
    isManualSku = false;
  }

  const displayName = data.displayName || (data.attributes && data.attributes.length > 0
    ? data.attributes.map((a) => a.value).join(' / ')
    : 'Mặc định');

  const thumbnail = await resolveMedia(data.thumbnailMediaId);

  const images = [];
  if (data.imageMediaIds && data.imageMediaIds.length > 0) {
    for (const mediaId of data.imageMediaIds) {
      const img = await resolveMedia(mediaId);
      if (img) images.push(img);
    }
  }

  const variant = await ProductVariant.create({
    productId,
    attributes: data.attributes,
    displayName,
    sku: finalSku,
    isManualSku,
    price: data.price ?? null,
    salePrice: data.salePrice ?? null,
    stock: data.stock,
    thumbnail: thumbnail || undefined,
    images,
    position: data.position ?? 0,
    isActive: data.isActive ?? true,
    isDefault: false,
  });

  return variant;
};

const bulkCreateVariants = async (productId, variants) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  const processedDocs = [];

  for (let idx = 0; idx < variants.length; idx++) {
    const v = variants[idx];
    let finalSku = '';
    let isManualSku = false;

    if (v.sku && v.sku.trim() !== '') {
      finalSku = v.sku.toUpperCase().trim();
      isManualSku = true;
    } else {
      const baseSku = generateVariantSku(product.productCode, v.attributes);
      finalSku = await ensureUniqueSku(baseSku);
      isManualSku = false;
    }

    const displayName = v.displayName || (v.attributes && v.attributes.length > 0
      ? v.attributes.map((a) => a.value).join(' / ')
      : 'Mặc định');

    processedDocs.push({
      productId,
      attributes: v.attributes,
      displayName,
      sku: finalSku,
      isManualSku,
      price: v.price ?? null,
      salePrice: v.salePrice ?? null,
      stock: v.stock,
      position: v.position ?? idx,
      isActive: v.isActive ?? true,
      isDefault: false,
    });
  }

  // Validate duplicate skus in batch
  const skus = processedDocs.map((d) => d.sku);
  const uniqueSkus = new Set(skus);
  if (uniqueSkus.size !== skus.length) {
    throw new AppError('Danh sách biến thể tạo hàng loạt có mã SKU bị trùng lặp', 400);
  }

  const existingSkus = await ProductVariant.find({ sku: { $in: skus } }).select('sku');
  if (existingSkus.length > 0) {
    const taken = existingSkus.map((v) => v.sku).join(', ');
    throw new AppError(`Các mã SKU sau đã tồn tại trong hệ thống: ${taken}`, 400);
  }

  return ProductVariant.insertMany(processedDocs);
};

const updateVariant = async (id, data) => {
  const variant = await ProductVariant.findById(id);
  if (!variant) throw new AppError('Không tìm thấy biến thể sản phẩm', 404);

  // 1. Nếu admin truyền SKU mới
  if (data.sku !== undefined && data.sku.trim() !== '') {
    const newSku = data.sku.toUpperCase().trim();
    // Nếu SKU trùng với chính variant này (cùng id) -> cho phép qua; chỉ kiểm tra khi khác id
    if (newSku !== variant.sku) {
      const existing = await ProductVariant.findOne({ sku: newSku, _id: { $ne: id } });
      if (existing) throw new AppError(`Mã SKU "${newSku}" đã được sử dụng bởi biến thể khác`, 400);
      variant.sku = newSku;
    }
    variant.isManualSku = true; // Đánh dấu SKU thủ công
  } else if (data.attributes && !variant.isManualSku) {
    // 2. Nếu đổi thuộc tính và variant đang dùng SKU tự sinh -> tự cập nhật SKU mới
    const product = await Product.findById(variant.productId);
    if (product) {
      const baseSku = generateVariantSku(product.productCode, data.attributes);
      variant.sku = await ensureUniqueSku(baseSku, id);
    }
  }

  // Tự cập nhật displayName nếu có attributes mới mà không truyền displayName
  if (data.attributes && !data.displayName) {
    variant.displayName = data.attributes.map((a) => a.value).join(' / ');
  }

  if (data.thumbnailMediaId !== undefined) {
    const thumbnail = await resolveMedia(data.thumbnailMediaId);
    variant.thumbnail = thumbnail || { mediaId: null, url: '', publicId: '' };
  }

  if (data.imageMediaIds !== undefined) {
    const images = [];
    for (const mediaId of data.imageMediaIds) {
      const img = await resolveMedia(mediaId);
      if (img) images.push(img);
    }
    variant.images = images;
  }

  const { thumbnailMediaId, imageMediaIds, sku, ...rest } = data;
  Object.assign(variant, rest);
  await variant.save();
  return variant;
};

const deleteVariant = async (id) => {
  const variant = await ProductVariant.findById(id);
  if (!variant) throw new AppError('Không tìm thấy biến thể sản phẩm', 404);
  await variant.deleteOne();
  return { message: 'Đã xóa biến thể thành công' };
};

const deleteVariantsByProduct = async (productId) => {
  const result = await ProductVariant.deleteMany({ productId });
  return { message: `Đã xóa ${result.deletedCount} biến thể của sản phẩm` };
};

module.exports = {
  getVariantsByProduct,
  getVariantById,
  createVariant,
  bulkCreateVariants,
  updateVariant,
  deleteVariant,
  deleteVariantsByProduct,
};
