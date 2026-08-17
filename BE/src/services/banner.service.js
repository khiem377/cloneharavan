const Banner                               = require('../models/banner.model');
const { AppError }                         = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const getPublicBanners = () =>
  Banner.find({ isVisible: true }).sort('position');

const getAllBanners = () =>
  Banner.find().sort('position');

const createBanner = async (file, data) => {
  if (!file) throw new AppError('Vui lòng chọn ảnh banner', 400);

  const uploaded = await uploadToCloudinary(file.buffer, 'banners');

  return Banner.create({
    ...data,
    imageUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
  });
};

const updateBanner = async (id, data) => {
  const banner = await Banner.findByIdAndUpdate(id, data, {
    new:          true,
    runValidators: true,
  });
  if (!banner) throw new AppError('Không tìm thấy banner', 404);
  return banner;
};

const reorderBanners = async (items) => {
  const bulkOps = items.map(({ id, position }) => ({
    updateOne: {
      filter: { _id: id },
      update: { position },
    },
  }));
  await Banner.bulkWrite(bulkOps);
};

const deleteBanner = async (id) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw new AppError('Không tìm thấy banner', 404);
  await deleteFromCloudinary(banner.publicId);
};

const deleteBulkBanners = async (ids) => {
  const banners = await Banner.find({ _id: { $in: ids } });
  await Banner.deleteMany({ _id: { $in: ids } });
  await Promise.all(banners.map((b) => deleteFromCloudinary(b.publicId)));
};

module.exports = {
  getPublicBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  reorderBanners,
  deleteBanner,
  deleteBulkBanners,
};
