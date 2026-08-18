const Brand = require('../models/brand.model');
const Media = require('../models/media.model');
const { AppError } = require('../utils/AppError');
const { slugify } = require('../utils/slugify');

const resolveLogo = async (logoMediaId) => {
  if (!logoMediaId) return null;
  const media = await Media.findById(logoMediaId);
  if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  return {
    mediaId: media._id,
    url: media.url,
    publicId: media.publicId,
  };
};

const createBrand = async (data) => {
  const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  const existing = await Brand.findOne({
    $or: [{ name: data.name }, { slug: generatedSlug }],
  });
  if (existing) throw new AppError('Tên thương hiệu hoặc slug đã tồn tại', 400);

  const logo = await resolveLogo(data.logoMediaId);

  const brand = await Brand.create({
    name: data.name,
    slug: generatedSlug,
    description: data.description,
    website: data.website,
    order: data.order,
    isActive: data.isActive,
    logo: logo || undefined,
  });

  if (logo) {
    await Media.findByIdAndUpdate(logo.mediaId, {
      $addToSet: { usedBy: { model: 'Brand', refId: brand._id } },
    });
  }

  return brand;
};

const getAllBrands = async (query = {}) => {
  const filter = { isActive: true };
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };
  return Brand.find(filter).sort({ order: 1, createdAt: -1 });
};

const getAllBrandsAdmin = async (query = {}) => {
  const filter = {};
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Brand.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
    Brand.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getBrandById = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const filter = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const brand = await Brand.findOne(filter);
  if (!brand) throw new AppError('Không tìm thấy thương hiệu', 404);
  return brand;
};

const updateBrand = async (id, data) => {
  const brand = await Brand.findById(id);
  if (!brand) throw new AppError('Không tìm thấy thương hiệu', 404);

  if (data.name && data.name !== brand.name) {
    const generatedSlug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existing = await Brand.findOne({ slug: generatedSlug, _id: { $ne: id } });
    if (existing) throw new AppError('Tên thương hiệu hoặc slug đã bị trùng lặp', 400);
    data.slug = generatedSlug;
  }

  if (data.logoMediaId !== undefined) {
    const oldMediaId = brand.logo?.mediaId;
    if (oldMediaId) {
      await Media.findByIdAndUpdate(oldMediaId, {
        $pull: { usedBy: { model: 'Brand', refId: brand._id } },
      });
    }
    const logo = await resolveLogo(data.logoMediaId);
    brand.logo = logo || { mediaId: null, url: '', publicId: '' };
    if (logo) {
      await Media.findByIdAndUpdate(logo.mediaId, {
        $addToSet: { usedBy: { model: 'Brand', refId: brand._id } },
      });
    }
  }

  const { logoMediaId, ...rest } = data;
  Object.assign(brand, rest);
  await brand.save();

  return brand;
};

const toggleBrandStatus = async (id, isActive) => {
  const brand = await Brand.findById(id);
  if (!brand) throw new AppError('Không tìm thấy thương hiệu', 404);

  brand.isActive = isActive !== undefined ? isActive : !brand.isActive;
  await brand.save();
  return brand;
};

const deleteBrand = async (id) => {
  const brand = await Brand.findById(id);
  if (!brand) throw new AppError('Không tìm thấy thương hiệu', 404);

  if (brand.logo?.mediaId) {
    await Media.findByIdAndUpdate(brand.logo.mediaId, {
      $pull: { usedBy: { model: 'Brand', refId: brand._id } },
    });
  }

  await brand.deleteOne();
  return { message: 'Đã xóa thương hiệu thành công' };
};

const deleteBulkBrands = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Danh sách ID thương hiệu không hợp lệ', 400);
  }

  const brands = await Brand.find({ _id: { $in: ids } });
  for (const brand of brands) {
    if (brand.logo?.mediaId) {
      await Media.findByIdAndUpdate(brand.logo.mediaId, {
        $pull: { usedBy: { model: 'Brand', refId: brand._id } },
      });
    }
  }

  const result = await Brand.deleteMany({ _id: { $in: ids } });
  return { message: `Đã xóa thành công ${result.deletedCount} thương hiệu` };
};

module.exports = {
  createBrand,
  getAllBrands,
  getAllBrandsAdmin,
  getBrandById,
  updateBrand,
  toggleBrandStatus,
  deleteBrand,
  deleteBulkBrands,
};
