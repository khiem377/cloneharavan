const mongoose = require('mongoose');
const FlashSale = require('../models/flashSale.model');
const Media = require('../models/media.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
require('../models/brand.model');
require('../models/category.model');
const { AppError } = require('../utils/AppError');

const resolveBanner = async (bannerMediaId) => {
  if (bannerMediaId === null) return { mediaId: null, url: '' };
  if (!bannerMediaId) return undefined;

  const media = await Media.findById(bannerMediaId);
  if (!media) throw new AppError('Ảnh banner không tồn tại', 400);
  return { mediaId: media._id, url: media.url };
};

const checkItemOverlap = async (startDate, endDate, items, excludeId = null) => {
  const itemOrConditions = items.map((i) => {
    if (i.variantId) {
      return {
        $or: [
          { productId: i.productId, variantId: i.variantId },
          { productId: i.productId, variantId: null },
        ],
      };
    }
    return { productId: i.productId };
  });

  const filter = {
    isActive: true,
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
    $or: itemOrConditions.map((cond) => ({ items: { $elemMatch: cond } })),
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const overlapping = await FlashSale.find(filter);
  if (overlapping.length > 0) {
    throw new AppError('Có sản phẩm hoặc biến thể trùng với khung giờ của chương trình Flash Sale khác đang hoạt động', 400);
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
        select: 'name slug thumbnail price salePrice stock sold images',
      })
      .populate({
        path: 'items.variantId',
        select: 'nameOverride sku thumbnail price salePrice stock sold attributes',
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

const getFlashSaleById = async (idOrSlug) => {
  const query = mongoose.Types.ObjectId.isValid(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    : { slug: idOrSlug };

  const flashSale = await FlashSale.findOne(query)
    .populate({
      path: 'items.productId',
      select: 'name slug thumbnail price salePrice stock sold images brand categories',
      populate: [
        { path: 'brand', select: 'name logo' },
        { path: 'categories', select: 'name slug' },
      ],
    })
    .populate({
      path: 'items.variantId',
      select: 'nameOverride sku thumbnail price salePrice stock sold attributes',
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
      select: 'name slug thumbnail price salePrice stock sold images brand categories',
      populate: [
        { path: 'brand', select: 'name logo' },
        { path: 'categories', select: 'name slug' },
      ],
    })
    .populate({
      path: 'items.variantId',
      select: 'nameOverride sku thumbnail price salePrice stock sold attributes',
    })
    .sort({ startDate: 1 });

  return activeSale;
};

const getAvailableFlashSales = async () => {
  const now = new Date();
  const sales = await FlashSale.find({
    isActive: true,
    endDate: { $gt: now },
  })
    .select('name slug description banner startDate endDate isActive items')
    .sort({ startDate: 1 })
    .lean();

  // Lọc bỏ chiến dịch nếu toàn bộ sản phẩm đã bán hết quota
  const validSales = sales.filter((sale) => {
    if (!sale.items || sale.items.length === 0) return true;
    const hasRemainingStock = sale.items.some((item) => {
      const remaining = (item.stockLimit || 0) - (item.soldCount || 0);
      return remaining > 0;
    });
    return hasRemainingStock;
  });

  return validSales.map(({ items, ...rest }) => rest);
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

const locateFlashSale = async (id, limit = 10) => {
  const sale = await FlashSale.findById(id).select('_id createdAt');
  if (!sale) throw new AppError('Không tìm thấy flash sale', 404);
  const positionBefore = await FlashSale.countDocuments({ createdAt: { $gt: sale.createdAt } });
  const page = Math.ceil((positionBefore + 1) / limit);
  return { page: Math.max(1, page), flashSaleId: id };
};

module.exports = {
  createFlashSale,
  getAllFlashSales,
  getFlashSaleById,
  getActiveFlashSale,
  getAvailableFlashSales,
  updateFlashSale,
  deleteFlashSale,
  toggleFlashSaleStatus,
  locateFlashSale,
};
