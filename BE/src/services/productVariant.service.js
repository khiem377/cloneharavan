const ProductVariant = require('../models/productVariant.model');
const Product = require('../models/product.model');
const Media = require('../models/media.model');
const { AppError } = require('../utils/AppError');

const resolveMedia = async (mediaId) => {
  if (!mediaId) return null;
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return { mediaId: media._id, url: media.url, publicId: media.publicId };
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

  const existingSku = await ProductVariant.findOne({ sku: data.sku.toUpperCase() });
  if (existingSku) throw new AppError(`Mã SKU "${data.sku}" đã được sử dụng bởi biến thể khác`, 400);

  const thumbnail = await resolveMedia(data.thumbnailMediaId);

  // Resolve gallery images
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
    sku: data.sku.toUpperCase(),
    price: data.price ?? null,
    salePrice: data.salePrice ?? null,
    stock: data.stock,
    thumbnail: thumbnail || undefined,
    images,
    position: data.position ?? 0,
    isActive: data.isActive ?? true,
  });

  if (thumbnail) {
    await Media.findByIdAndUpdate(thumbnail.mediaId, {
      $addToSet: { usedBy: { model: 'ProductVariant', refId: variant._id } },
    });
  }
  for (const img of images) {
    await Media.findByIdAndUpdate(img.mediaId, {
      $addToSet: { usedBy: { model: 'ProductVariant', refId: variant._id } },
    });
  }

  return variant;
};

const bulkCreateVariants = async (productId, variants) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  const skus = variants.map((v) => v.sku.toUpperCase());
  const uniqueSkus = new Set(skus);
  if (uniqueSkus.size !== skus.length) throw new AppError('Danh sách biến thể có mã SKU bị trùng nhau', 400);

  const existingSkus = await ProductVariant.find({ sku: { $in: skus } }).select('sku');
  if (existingSkus.length > 0) {
    const taken = existingSkus.map((v) => v.sku).join(', ');
    throw new AppError(`Các mã SKU sau đã tồn tại: ${taken}`, 400);
  }

  const docs = variants.map((v, idx) => ({
    productId,
    attributes: v.attributes,
    displayName: v.attributes.map((a) => a.value).join(' / '), // insertMany bypasses pre('save'), compute manually
    sku: v.sku.toUpperCase(),
    price: v.price ?? null,
    salePrice: v.salePrice ?? null,
    stock: v.stock,
    position: idx,
    isActive: v.isActive ?? true,
  }));

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

  // Handle thumbnail change
  if (data.thumbnailMediaId !== undefined) {
    if (variant.thumbnail?.mediaId) {
      await Media.findByIdAndUpdate(variant.thumbnail.mediaId, {
        $pull: { usedBy: { model: 'ProductVariant', refId: variant._id } },
      });
    }
    const thumbnail = await resolveMedia(data.thumbnailMediaId);
    variant.thumbnail = thumbnail || { mediaId: null, url: '', publicId: '' };
    if (thumbnail) {
      await Media.findByIdAndUpdate(thumbnail.mediaId, {
        $addToSet: { usedBy: { model: 'ProductVariant', refId: variant._id } },
      });
    }
  }

  // Handle gallery images change
  if (data.imageMediaIds !== undefined) {
    // Remove old usedBy references
    for (const img of variant.images || []) {
      if (img.mediaId) {
        await Media.findByIdAndUpdate(img.mediaId, {
          $pull: { usedBy: { model: 'ProductVariant', refId: variant._id } },
        });
      }
    }
    // Resolve new images
    const images = [];
    for (const mediaId of data.imageMediaIds) {
      const img = await resolveMedia(mediaId);
      if (img) {
        images.push(img);
        await Media.findByIdAndUpdate(img.mediaId, {
          $addToSet: { usedBy: { model: 'ProductVariant', refId: variant._id } },
        });
      }
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

  // Clean up all media references (thumbnail + images)
  const allMediaIds = [
    variant.thumbnail?.mediaId,
    ...(variant.images || []).map((img) => img.mediaId),
  ].filter(Boolean);

  for (const mediaId of allMediaIds) {
    await Media.findByIdAndUpdate(mediaId, {
      $pull: { usedBy: { model: 'ProductVariant', refId: variant._id } },
    });
  }

  await variant.deleteOne();
  return { message: 'Đã xóa biến thể thành công' };
};

const deleteVariantsByProduct = async (productId) => {
  const variants = await ProductVariant.find({ productId });
  for (const variant of variants) {
    const allMediaIds = [
      variant.thumbnail?.mediaId,
      ...(variant.images || []).map((img) => img.mediaId),
    ].filter(Boolean);
    for (const mediaId of allMediaIds) {
      await Media.findByIdAndUpdate(mediaId, {
        $pull: { usedBy: { model: 'ProductVariant', refId: variant._id } },
      });
    }
  }
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
