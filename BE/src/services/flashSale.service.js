const FlashSale = require('../models/flashSale.model');
const Media = require('../models/media.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const { AppError } = require('../utils/AppError');

const resolveBanner = async (bannerMediaId) => {
  if (bannerMediaId === null) return { mediaId: null, url: '' };
  if (!bannerMediaId) return undefined;

  const media = await Media.findById(bannerMediaId);
  if (!media) throw new AppError('Ảnh banner không tồn tại', 400);
  return { mediaId: media._id, url: media.url };
};

const checkItemOverlap = async (startDate, endDate, items, excludeId = null) => {
  const productIds = items.map(i => i.productId);
  const filter = {
    isActive: true,
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
    'items.productId': { $in: productIds },
  };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const overlapping = await FlashSale.find(filter);
  if (overlapping.length > 0) {
    throw new AppError('Có sản phẩm trùng với khung giờ của chương trình Flash Sale khác đang hoạt động', 400);
  }
};

const createFlashSale = async (data) => {
  const { bannerMediaId, ...rest } = data;

  if (rest.isActive !== false) {
    await checkItemOverlap(rest.startDate, rest.endDate, rest.items);
  }

  const banner = await resolveBanner(bannerMediaId);
  const flashSale = await FlashSale.create({
    ...rest,
    banner: banner || { mediaId: null, url: '' },
  });

  return flashSale;
};

const getAllFlashSales = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const now = new Date();
  if (status === 'active') {
    filter.isActive = true;
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  } else if (status === 'upcoming') {
    filter.isActive = true;
    filter.startDate = { $gt: now };
  } else if (status === 'ended') {
    filter.isActive = true;
    filter.endDate = { $lt: now };
  } else if (status === 'disabled') {
    filter.isActive = false;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [flashSales, total] = await Promise.all([
    FlashSale.find(filter)
      .populate({
        path: 'items.productId',
        select: 'name slug thumbnail price salePrice stock images',
      })
      .populate({
        path: 'items.variantId',
        select: 'nameOverride sku thumbnail price salePrice stock',
      })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    FlashSale.countDocuments(filter),
  ]);

  return {
    data: flashSales,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};

const getFlashSaleById = async (id) => {
  const flashSale = await FlashSale.findById(id)
    .populate({
      path: 'items.productId',
      select: 'name slug thumbnail price salePrice stock images',
    })
    .populate({
      path: 'items.variantId',
      select: 'nameOverride sku thumbnail price salePrice stock',
    });

  if (!flashSale) throw new AppError('Không tìm thấy chương trình Flash Sale', 404);
  return flashSale;
};

const getActiveFlashSale = async () => {
  const now = new Date();
  const activeSale = await FlashSale.findOne({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate({
      path: 'items.productId',
      select: 'name slug thumbnail price salePrice stock images brand category',
      populate: [
        { path: 'brand', select: 'name logo' },
        { path: 'category', select: 'name slug' },
      ],
    })
    .populate({
      path: 'items.variantId',
      select: 'nameOverride sku thumbnail price salePrice stock attributes',
    })
    .sort({ startDate: 1 });

  return activeSale;
};

const updateFlashSale = async (id, data) => {
  const flashSale = await FlashSale.findById(id);
  if (!flashSale) throw new AppError('Không tìm thấy chương trình Flash Sale', 404);

  const { bannerMediaId, ...rest } = data;

  const startDate = rest.startDate ? new Date(rest.startDate) : flashSale.startDate;
  const endDate = rest.endDate ? new Date(rest.endDate) : flashSale.endDate;
  const items = rest.items || flashSale.items;
  const isActive = rest.isActive !== undefined ? rest.isActive : flashSale.isActive;

  if (isActive) {
    await checkItemOverlap(startDate, endDate, items, id);
  }

  if (bannerMediaId !== undefined) {
    const banner = await resolveBanner(bannerMediaId);
    flashSale.banner = banner || { mediaId: null, url: '' };
  }

  Object.assign(flashSale, rest);
  await flashSale.save();

  return flashSale;
};

const deleteFlashSale = async (id) => {
  const flashSale = await FlashSale.findById(id);
  if (!flashSale) throw new AppError('Không tìm thấy chương trình Flash Sale', 404);
  await flashSale.deleteOne();
  return true;
};

const toggleFlashSaleStatus = async (id, isActive) => {
  const flashSale = await FlashSale.findById(id);
  if (!flashSale) throw new AppError('Không tìm thấy chương trình Flash Sale', 404);

  if (isActive) {
    await checkItemOverlap(flashSale.startDate, flashSale.endDate, flashSale.items, id);
  }

  flashSale.isActive = isActive;
  await flashSale.save();
  return flashSale;
};

module.exports = {
  createFlashSale,
  getAllFlashSales,
  getFlashSaleById,
  getActiveFlashSale,
  updateFlashSale,
  deleteFlashSale,
  toggleFlashSaleStatus,
};
