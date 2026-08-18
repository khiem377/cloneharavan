const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const Media = require('../models/media.model');
const { AppError } = require('../utils/AppError');
const { slugify } = require('../utils/slugify');

const resolveMedia = async (mediaId, modelName, refId) => {
  if (!mediaId) return null;
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return { mediaId: media._id, url: media.url, publicId: media.publicId };
};

const createProduct = async (data) => {
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  const existingSku = await Product.findOne({ sku: data.sku.toUpperCase() });
  if (existingSku) throw new AppError('Mã SKU sản phẩm đã tồn tại', 400);

  const existingSlug = await Product.findOne({ slug: generatedSlug });
  if (existingSlug) throw new AppError('Tên sản phẩm hoặc slug đã tồn tại', 400);

  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) throw new AppError('Danh mục sản phẩm không tồn tại', 404);

  const brandExists = await Brand.findById(data.brand);
  if (!brandExists) throw new AppError('Thương hiệu sản phẩm không tồn tại', 404);

  const thumbnail = await resolveMedia(data.thumbnailMediaId);
  if (!thumbnail) throw new AppError('Ảnh đại diện sản phẩm là bắt buộc', 400);

  const images = [];
  if (data.imageMediaIds && data.imageMediaIds.length > 0) {
    for (const mediaId of data.imageMediaIds) {
      const img = await resolveMedia(mediaId);
      if (img) images.push(img);
    }
  }

  const product = await Product.create({
    name: data.name,
    slug: generatedSlug,
    sku: data.sku.toUpperCase(),
    category: data.category,
    brand: data.brand,
    price: data.price,
    salePrice: data.salePrice,
    stock: data.stock,
    thumbnail,
    images,
    description: data.description,
    specifications: data.specifications,
    isFeatured: data.isFeatured,
    isHot: data.isHot,
    status: data.status,
    isActive: data.isActive,
  });

  await Media.findByIdAndUpdate(thumbnail.mediaId, {
    $addToSet: { usedBy: { model: 'Product', refId: product._id } },
  });

  for (const img of images) {
    await Media.findByIdAndUpdate(img.mediaId, {
      $addToSet: { usedBy: { model: 'Product', refId: product._id } },
    });
  }

  return Product.findById(product._id)
    .populate('category', 'name slug parentId icon brandId')
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
    { sku: { $regex: keyword, $options: 'i' } },
  ];
  if (category) {
    const ids = await getCategoryIds(category);
    if (ids && ids.length > 0) filter.category = { $in: ids };
    else if (ids !== null) filter.category = null;
  }
  if (brand) filter.brand = brand;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (isHot !== undefined) filter.isHot = isHot === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug parentId icon brandId')
      .populate('brand', 'name slug logo')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return { products, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
};

const getAllProductsAdmin = async (query = {}) => {
  const { keyword, category, brand, status, isActive,
    sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = query;

  const filter = {};
  if (keyword) filter.$or = [
    { name: { $regex: keyword, $options: 'i' } },
    { sku: { $regex: keyword, $options: 'i' } },
  ];
  if (category) {
    const ids = await getCategoryIds(category);
    if (ids && ids.length > 0) filter.category = { $in: ids };
  }
  if (brand) filter.brand = brand;
  if (status) filter.status = status;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug parentId icon brandId')
      .populate('brand', 'name slug logo')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return { products, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
};

const getProductById = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(filter)
    .populate('category', 'name slug parentId icon brandId')
    .populate('brand', 'name slug logo');

  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);
  return product;
};

const getProductsToCompare = async (productIds) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError('Danh sách sản phẩm so sánh không được để trống', 400);
  }
  return Product.find({ _id: { $in: productIds }, isActive: true })
    .populate('category', 'name slug parentId icon brandId')
    .populate('brand', 'name slug logo');
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

  if (data.category) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) throw new AppError('Danh mục sản phẩm không tồn tại', 404);
  }

  if (data.brand) {
    const brandExists = await Brand.findById(data.brand);
    if (!brandExists) throw new AppError('Thương hiệu sản phẩm không tồn tại', 404);
  }

  if (data.thumbnailMediaId !== undefined) {
    if (product.thumbnail?.mediaId) {
      await Media.findByIdAndUpdate(product.thumbnail.mediaId, {
        $pull: { usedBy: { model: 'Product', refId: product._id } },
      });
    }
    const thumbnail = await resolveMedia(data.thumbnailMediaId);
    if (!thumbnail) throw new AppError('Ảnh đại diện sản phẩm là bắt buộc', 400);
    product.thumbnail = thumbnail;
    await Media.findByIdAndUpdate(thumbnail.mediaId, {
      $addToSet: { usedBy: { model: 'Product', refId: product._id } },
    });
  }

  if (data.imageMediaIds !== undefined) {
    for (const img of product.images) {
      if (img.mediaId) {
        await Media.findByIdAndUpdate(img.mediaId, {
          $pull: { usedBy: { model: 'Product', refId: product._id } },
        });
      }
    }
    const images = [];
    for (const mediaId of data.imageMediaIds) {
      const img = await resolveMedia(mediaId);
      if (img) {
        images.push(img);
        await Media.findByIdAndUpdate(img.mediaId, {
          $addToSet: { usedBy: { model: 'Product', refId: product._id } },
        });
      }
    }
    product.images = images;
  }

  const { thumbnailMediaId, imageMediaIds, ...rest } = data;
  Object.assign(product, rest);
  await product.save();

  return Product.findById(product._id)
    .populate('category', 'name slug parentId icon brandId')
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

  const allMediaIds = [
    product.thumbnail?.mediaId,
    ...product.images.map((img) => img.mediaId),
  ].filter(Boolean);

  for (const mediaId of allMediaIds) {
    await Media.findByIdAndUpdate(mediaId, {
      $pull: { usedBy: { model: 'Product', refId: product._id } },
    });
  }

  await product.deleteOne();
  return { message: 'Đã xóa sản phẩm thành công' };
};

const deleteBulkProducts = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Danh sách ID sản phẩm cần xóa không hợp lệ', 400);
  }
  const products = await Product.find({ _id: { $in: ids } });
  for (const product of products) {
    const allMediaIds = [
      product.thumbnail?.mediaId,
      ...product.images.map((img) => img.mediaId),
    ].filter(Boolean);
    for (const mediaId of allMediaIds) {
      await Media.findByIdAndUpdate(mediaId, {
        $pull: { usedBy: { model: 'Product', refId: product._id } },
      });
    }
  }
  const result = await Product.deleteMany({ _id: { $in: ids } });
  return { message: `Đã xóa thành công ${result.deletedCount} sản phẩm` };
};

module.exports = {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  getProductsToCompare,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  deleteBulkProducts,
};
