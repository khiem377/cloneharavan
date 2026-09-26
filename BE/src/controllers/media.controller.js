const {
  uploadMedia, uploadMediaFromUrl,
  browseMedia, searchMedia,
  checkMediaUsages,
  getSingleMediaUsage,
  getMediaByIds,
  getUnusedMedia,
  renameMedia, updateMediaMeta,
  moveMediaBulk,
  deleteMedia, deleteMediaBulk,
  getMediaStats,
} = require('../services/media.service');

const upload = async (req, res, next) => {
  try {
    const { folderId } = req.body;
    const media = await uploadMedia(req.file, folderId, req.user?._id || null);
    res.status(201).json({ status: 'success', statusCode: 201, message: 'Upload file thành công', data: { media } });
  } catch (error) {
    // 409 = duplicate — trả về file đã tồn tại để FE hiện cảnh báo
    if (error.statusCode === 409 && error.existingMedia) {
      return res.status(409).json({
        status: 'duplicate',
        statusCode: 409,
        message: error.message,
        data: { existingMedia: error.existingMedia },
      });
    }
    next(error);
  }
};

const uploadFromUrl = async (req, res, next) => {
  try {
    const { url, folderId } = req.body;
    const media = await uploadMediaFromUrl(url, folderId, req.user?._id || null);
    res.status(201).json({ status: 'success', statusCode: 201, message: 'Upload từ URL thành công', data: { media } });
  } catch (error) { next(error); }
};

const browse = async (req, res, next) => {
  try {
    const { folderId, page, limit, sortBy, sortDir } = req.query;
    const data = await browseMedia({
      folderId,
      page:    page  ? Number(page)  : 1,
      limit:   limit ? Number(limit) : 20,
      sortBy:  sortBy  || 'createdAt',
      sortDir: sortDir || 'desc',
    });
    res.json({ status: 'success', statusCode: 200, message: 'Lấy danh sách media thành công', data });
  } catch (error) { next(error); }
};

const search = async (req, res, next) => {
  try {
    const { q, page, limit, sortBy, sortDir } = req.query;
    const data = await searchMedia({
      q,
      page:    page  ? Number(page)  : 1,
      limit:   limit ? Number(limit) : 20,
      sortBy:  sortBy  || 'createdAt',
      sortDir: sortDir || 'desc',
    });
    res.json({ status: 'success', statusCode: 200, message: 'Tìm kiếm thành công', data });
  } catch (error) { next(error); }
};

const checkUsages = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ status: 'success', statusCode: 200, data: { usages: {} } });
    }
    const usages = await checkMediaUsages(ids);
    res.json({ status: 'success', statusCode: 200, data: { usages } });
  } catch (error) { next(error); }
};

// PATCH /media/:id/rename  { filename }
const rename = async (req, res, next) => {
  try {
    const media = await renameMedia(req.params.id, req.body.filename);
    res.json({ status: 'success', statusCode: 200, message: 'Đổi tên file thành công', data: { media } });
  } catch (error) { next(error); }
};

// PATCH /media/:id/meta  { altText?, caption? }
const updateMeta = async (req, res, next) => {
  try {
    const { altText, caption } = req.body;
    const media = await updateMediaMeta(req.params.id, { altText, caption });
    res.json({ status: 'success', statusCode: 200, message: 'Cập nhật thông tin file thành công', data: { media } });
  } catch (error) { next(error); }
};

// PATCH /media/bulk-move  { ids, targetFolderId }
const bulkMove = async (req, res, next) => {
  try {
    const { ids, targetFolderId } = req.body;
    const result = await moveMediaBulk(ids, targetFolderId);
    res.json({ status: 'success', statusCode: 200, message: `Đã chuyển ${result.moved} file`, data: result });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const force = req.query.force === 'true';
    await deleteMedia(req.params.id, force);
    res.json({ status: 'success', statusCode: 200, message: 'Xóa file thành công' });
  } catch (error) { next(error); }
};


// DELETE /media/bulk  { ids, force? }
const removeBulk = async (req, res, next) => {
  try {
    const { ids, force = false } = req.body;
    const result = await deleteMediaBulk(ids, force);
    res.json({ status: 'success', statusCode: 200, message: `Đã xóa ${result.deleted} file`, data: result });
  } catch (error) { next(error); }
};

// GET /media/stats
const stats = async (req, res, next) => {
  try {
    const data = await getMediaStats();
    res.json({ status: 'success', statusCode: 200, data });
  } catch (error) { next(error); }
};

// GET /media/unused?page=1&limit=30
const unused = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await getUnusedMedia({
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 30,
    });
    res.json({ status: 'success', statusCode: 200, data });
  } catch (error) { next(error); }
};

// GET /media/:id/usages
const getUsage = async (req, res, next) => {
  try {
    const usages = await getSingleMediaUsage(req.params.id);
    res.json({ status: 'success', statusCode: 200, data: { usages } });
  } catch (error) { next(error); }
};

// GET /media/by-ids?ids=id1,id2,id3
const getByIds = async (req, res, next) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.json({ status: 'success', statusCode: 200, data: { media: [] } });
    const media = await getMediaByIds(ids);
    res.json({ status: 'success', statusCode: 200, data: { media } });
  } catch (error) { next(error); }
};

module.exports = {
  upload, uploadFromUrl,
  browse, search,
  checkUsages,
  getUsage,
  getByIds,
  unused,
  rename, updateMeta,
  bulkMove,
  remove, removeBulk,
  stats,
};
