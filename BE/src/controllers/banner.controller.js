const {
  getPublicBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  reorderBanners,
  deleteBanner,
  deleteBulkBanners,
  trackView,
  trackClick,
} = require('../services/banner.service');

const getPublic = async (req, res, next) => {
  try {
    // type filter: GET /banners?type=hero
    const banners = await getPublicBanners(req.query.type || null);
    res.json({ status: 'success', statusCode: 200, message: 'Lấy danh sách banner thành công', data: { banners } });
  } catch (error) { next(error); }
};

const getAll = async (req, res, next) => {
  try {
    const result = await getAllBanners(req.query);
    res.json({ status: 'success', statusCode: 200, message: 'Lấy danh sách banner thành công', data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { banner, media } = await createBanner(req.file, req.body);
    res.status(201).json({ status: 'success', statusCode: 201, message: 'Tạo banner thành công', data: { banner, media } });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const banner = await updateBanner(req.params.id, req.body);
    res.json({ status: 'success', statusCode: 200, message: 'Cập nhật banner thành công', data: { banner } });
  } catch (error) { next(error); }
};

const reorder = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    await reorderBanners(items);
    res.json({ status: 'success', statusCode: 200, message: 'Cập nhật vị trí thành công' });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await deleteBanner(req.params.id);
    res.json({ status: 'success', statusCode: 200, message: 'Xóa banner thành công' });
  } catch (error) { next(error); }
};

const removeBulk = async (req, res, next) => {
  try {
    const result = await deleteBulkBanners(req.body.ids);
    res.json({ status: 'success', statusCode: 200, message: `Xóa ${result.deleted} banner thành công`, data: result });
  } catch (error) { next(error); }
};

// POST /banners/:id/view  — FE gọi khi banner hiện ra viewport
const view = async (req, res, next) => {
  try {
    await trackView(req.params.id);
    res.json({ status: 'success', statusCode: 200 });
  } catch (error) { next(error); }
};

// POST /banners/:id/click — FE gọi khi user click vào banner
const click = async (req, res, next) => {
  try {
    await trackClick(req.params.id);
    res.json({ status: 'success', statusCode: 200 });
  } catch (error) { next(error); }
};

module.exports = { getPublic, getAll, create, update, reorder, remove, removeBulk, view, click };
