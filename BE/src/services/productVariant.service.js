const ProductVariant = require('../models/productVariant.model');
const Product = require('../models/product.model');
const Media = require('../models/media.model');
const { AppError } = require('../utils/AppError');
const { generateVariantSku } = require('./product.service');

const resolveMedia = async (mediaId) => {
  if (!mediaId) return null;
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return { mediaId: media._id, url: media.url, publicId: media.publicId };
};

const getVariantsByProduct = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);
  return ProductVariant.find({ productId }).sort({ isDefault: -1, position: 1, createdAt: 1 });
};

const getVariantById = async (id) => {
  const variant = await ProductVariant.findById(id);
  if (!variant) throw new AppError('Không tìm thấy biến thể sản phẩm', 404);
  return variant;
};

const createVariant = async (productId, data) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  // Tự sinh SKU nếu không truyền
  let sku;
  if (data.sku && data.sku.trim()) {
    sku = data.sku.trim().toUpperCase();
    const existingSku = await ProductVariant.findOne({ sku });
    if (existingSku) throw new AppError(`Mã SKU "${data.sku}" đã được sử dụng bởi biến thể khác`, 400);
  } else {
    const productCode = product.productCode;
    if (!productCode) throw new AppError('Sản phẩm chưa có productCode, không thể tự sinh SKU', 500);
    sku = await generateVariantSku(productCode, data.attributes || []);
  }

  // Khi thêm variant thực (có attributes) → xóa isDefault của Default Variant
  const hasRealAttrs = data.attributes && data.attributes.length > 0;
  if (hasRealAttrs && !data.isDefault) {
    // Không cần xóa isDefault variant, nó vẫn tồn tại nhưng ẩn khỏi UI
    // (Policy: Default Variant vẫn giữ để backward compat)
  }

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
    isDefault: data.isDefault ?? false,
    attributes: data.attributes || [],
    sku,
    price: data.price,
    salePrice: data.salePrice ?? null,
    stock: data.stock ?? 0,
    thumbnail: thumbnail || undefined,
    images,
    position: data.position ?? 0,
    isActive: data.isActive ?? true,
    nameOverride: data.nameOverride ?? null,
    descriptionOverride: data.descriptionOverride ?? null,
    specifications: data.specifications ?? [],
  });

  return variant;
};

const bulkCreateVariants = async (productId, variants) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  const productCode = product.productCode;

  // Tự sinh SKU cho từng variant nếu thiếu
  const docs = [];
  for (let idx = 0; idx < variants.length; idx++) {
    const v = variants[idx];
    let sku;
    if (v.sku && v.sku.trim()) {
      sku = v.sku.trim().toUpperCase();
    } else {
      if (!productCode) throw new AppError('Sản phẩm chưa có productCode', 500);
      sku = await generateVariantSku(productCode, v.attributes || []);
    }
    docs.push({
      productId,
      isDefault: false,
      attributes: v.attributes || [],
      displayName: (v.attributes || []).map((a) => a.value).join(' / '),
      sku,
      price: v.price,
      salePrice: v.salePrice ?? null,
      stock: v.stock ?? 0,
      position: idx,
      isActive: v.isActive ?? true,
    });
  }

  // Kiểm tra trùng SKU trong batch
  const skus = docs.map((d) => d.sku);
  const uniqueSkus = new Set(skus);
  if (uniqueSkus.size !== skus.length) throw new AppError('Danh sách biến thể có mã SKU bị trùng nhau', 400);

  const existingSkus = await ProductVariant.find({ sku: { $in: skus } }).select('sku');
  if (existingSkus.length > 0) {
    const taken = existingSkus.map((v) => v.sku).join(', ');
    throw new AppError(`Các mã SKU sau đã tồn tại: ${taken}`, 400);
  }

  return ProductVariant.insertMany(docs);
};

const updateVariant = async (id, data) => {
  const variant = await ProductVariant.findById(id);
  if (!variant) throw new AppError('Không tìm thấy biến thể sản phẩm', 404);

  if (data.sku && data.sku.toUpperCase() !== variant.sku) {
    const existing = await ProductVariant.findOne({ sku: data.sku.toUpperCase(), _id: { $ne: id } });
    if (existing) throw new AppError(`Mã SKU "${data.sku}" đã được sử dụng bởi biến thể khác`, 400);
    data.sku = data.sku.toUpperCase();
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

  const { thumbnailMediaId, imageMediaIds, ...rest } = data;
  Object.assign(variant, rest);
  await variant.save();
  return variant;
};

const deleteVariant = async (id) => {
  const variant = await ProductVariant.findById(id);
  if (!variant) throw new AppError('Không tìm thấy biến thể sản phẩm', 404);
  if (variant.isDefault) throw new AppError('Không thể xóa Default Variant của sản phẩm', 400);
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
