const Banner = require('../models/banner.model');
const Media = require('../models/media.model');
const Folder = require('../models/folder.model');
const { AppError } = require('../utils/AppError');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { uploadMedia } = require('./media.service');

const getPublicBanners = () =>
  Banner.find({ isVisible: true }).sort('position');

const getAllBanners = () =>
  Banner.find().sort('position').populate('mediaId', 'url folderId size');


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

  const banner = await Banner.create({
    mediaId: media._id,
    imageUrl: media.url,
    publicId: media.publicId,
    title: data.title,
    link: data.link,
    isVisible: data.isVisible,
  });


  await Media.findByIdAndUpdate(media._id, {
    $addToSet: { usedBy: { model: 'Banner', refId: banner._id } },
  });


  await media.populate({ path: 'folderId', populate: { path: 'parentId', select: 'name slug _id' } });

  return { banner, media };
};

const updateBanner = async (id, data) => {
  const banner = await Banner.findByIdAndUpdate(id, data, {
    new: true,
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

  if (banner.mediaId) {
    await Media.findByIdAndUpdate(banner.mediaId, {
      $pull: { usedBy: { model: 'Banner', refId: banner._id } },
    });
  }
};

const deleteBulkBanners = async (ids) => {
  const banners = await Banner.find({ _id: { $in: ids } });
  await Banner.deleteMany({ _id: { $in: ids } });
  await Promise.all(
    banners.map(async (b) => {
      await deleteFromCloudinary(b.publicId);
      if (b.mediaId) {
        await Media.findByIdAndUpdate(b.mediaId, {
          $pull: { usedBy: { model: 'Banner', refId: b._id } },
        });
      }
    })
  );
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
