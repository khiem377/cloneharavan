const Banner = require('../models/banner.model');
const Media = require('../models/media.model');
const Folder = require('../models/folder.model');
const { AppError } = require('../utils/AppError');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { uploadMedia } = require('./media.service');

// ---------------------------------------------------------------------------
// Public: chỉ banner đang visible + đúng lịch
// ---------------------------------------------------------------------------
const getPublicBanners = (type = null) => {
  const now = new Date();
  const filter = {
    isVisible: true,
    $and: [
      { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
    ],
  };
  if (type) filter.type = type;
  return Banner.find(filter).sort({ position: 1, _id: 1 });
};

// ---------------------------------------------------------------------------
// Admin: tất cả banner, có filter + phân trang
// ---------------------------------------------------------------------------
const getAllBanners = async (query = {}) => {
  const filter = {};
  if (query.isVisible !== undefined) filter.isVisible = query.isVisible === 'true';
  if (query.type) filter.type = query.type;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Banner.find(filter).sort({ position: 1, _id: 1 }).skip(skip).limit(limit).populate('mediaId', 'url folderId size'),
    Banner.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
const createBanner = async (file, data) => {
  let media;

  if (file) {
    const bannerFolder = await Folder.findOne({ slug: 'banners', parentId: null });
    if (!bannerFolder) throw new AppError('Folder "banners" chưa được tạo, vui lòng chạy seed', 500);
    media = await uploadMedia(file, bannerFolder._id);
  } else if (data.mediaId) {
    media = await Media.findById(data.mediaId);
    if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
  } else {
    throw new AppError('Vui lòng upload ảnh hoặc chọn ảnh từ Media Library', 400);
  }

  const bannerType = data.type || 'hero';

  // Tự động tính position nếu chưa có: gán vào cuối danh sách của type đó
  let nextPosition = data.position;
  if (nextPosition === undefined || nextPosition === null) {
    const lastBanner = await Banner.findOne({ type: bannerType }).sort('-position').select('position');
    nextPosition = lastBanner && typeof lastBanner.position === 'number' ? lastBanner.position + 1 : 1;
  }

  const banner = await Banner.create({
    mediaId: media._id,
    imageUrl: media.url,
    publicId: media.publicId,
    title: data.title,
    altText: data.altText || media.altText || '',
    link: data.link,
    position: nextPosition,
    type: bannerType,
    isVisible: data.isVisible !== undefined ? data.isVisible : true,
    startAt: data.startAt || null,
    endAt: data.endAt || null,
  });

  await media.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });
  return { banner, media };
};

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------
const updateBanner = async (id, data) => {
  const updatePayload = { ...data };

  // Nếu có mediaId mới, cập nhật lại imageUrl và publicId từ Media Library
  if (data.mediaId) {
    const media = await Media.findById(data.mediaId);
    if (!media) throw new AppError('Không tìm thấy ảnh trong Media Library', 404);
    updatePayload.imageUrl = media.url;
    updatePayload.publicId = media.publicId;
    updatePayload.mediaId = media._id;
  }

  const banner = await Banner.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
  if (!banner) throw new AppError('Không tìm thấy banner', 404);
  return banner;
};

// ---------------------------------------------------------------------------
// Reorder
// ---------------------------------------------------------------------------
const reorderBanners = async (items) => {
  const bulkOps = items.map(({ id, position }) => ({
    updateOne: { filter: { _id: id }, update: { position } },
  }));
  await Banner.bulkWrite(bulkOps);
};

// ---------------------------------------------------------------------------
// Delete single — FIX: chỉ xóa Cloudinary nếu banner tự upload (không dùng mediaId)
// ---------------------------------------------------------------------------
const deleteBanner = async (id) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw new AppError('Không tìm thấy banner', 404);

  // Nếu banner dùng ảnh từ Media Library → giữ nguyên, không xóa Cloudinary
  // Nếu banner tự upload (không có mediaId) → xóa luôn trên Cloudinary
  if (!banner.mediaId) {
    await deleteFromCloudinary(banner.publicId).catch(() => { });
  }
};

// ---------------------------------------------------------------------------
// Bulk Delete — FIX: dùng Promise.allSettled, không lỗi nếu 1 ảnh Cloudinary fail
// ---------------------------------------------------------------------------
const deleteBulkBanners = async (ids) => {
  const banners = await Banner.find({ _id: { $in: ids } });
  await Banner.deleteMany({ _id: { $in: ids } });

  // Chỉ xóa Cloudinary cho banner không có mediaId (tự upload)
  const ownedPublicIds = banners
    .filter((b) => !b.mediaId)
    .map((b) => b.publicId);

  await Promise.allSettled(ownedPublicIds.map((pid) => deleteFromCloudinary(pid)));
  return { deleted: banners.length };
};

// ---------------------------------------------------------------------------
// Analytics: track view + click (dùng $inc để atomic)
// ---------------------------------------------------------------------------
const trackView = async (id) => {
  await Banner.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
};

const trackClick = async (id) => {
  await Banner.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
};

const locateBanner = async (id, limit = 10, type = null) => {
  const banner = await Banner.findById(id).select('_id position type');
  if (!banner) throw new AppError('Không tìm thấy banner', 404);

  const filter = {};
  if (type) filter.type = type;

  // Tính số lượng banner đứng trước: position nhỏ hơn HOẶC cùng position nhưng _id nhỏ hơn
  const positionBefore = await Banner.countDocuments({
    ...filter,
    $or: [
      { position: { $lt: banner.position } },
      { position: banner.position, _id: { $lt: banner._id } },
    ],
  });
  const page = Math.ceil((positionBefore + 1) / limit);
  return { page: Math.max(1, page), bannerId: id };
};

module.exports = {
  getPublicBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  reorderBanners,
  deleteBanner,
  deleteBulkBanners,
  trackView,
  trackClick,
  locateBanner,
};
