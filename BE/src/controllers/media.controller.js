const {
  uploadMedia, uploadMediaFromUrl,
  browseMedia, searchMedia,
  checkMediaUsages,
  deleteMedia, deleteMediaBulk,
} = require('../services/media.service');

const upload = async (req, res, next) => {
  try {
    const { folderId } = req.body;
    const media = await uploadMedia(req.file, folderId);
    res.status(201).json({ status: 'success', statusCode: 201, message: 'Upload file thành công', data: { media } });
  } catch (error) { next(error); }
};

const uploadFromUrl = async (req, res, next) => {
  try {
    const { url, folderId } = req.body;
    const media = await uploadMediaFromUrl(url, folderId);
    res.status(201).json({ status: 'success', statusCode: 201, message: 'Upload từ URL thành công', data: { media } });
  } catch (error) { next(error); }
};

const browse = async (req, res, next) => {
  try {
    const { folderId, page, limit, sortBy, sortDir } = req.query;
    const data = await browseMedia({
      folderId,
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 20,
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
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 20,
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

const remove = async (req, res, next) => {
  try {
    await deleteMedia(req.params.id);
    res.json({ status: 'success', statusCode: 200, message: 'Xóa file thành công' });
  } catch (error) { next(error); }
};

const removeBulk = async (req, res, next) => {
  try {
    const result = await deleteMediaBulk(req.body.ids);
    res.json({ status: 'success', statusCode: 200, message: `Đã xóa ${result.deleted} file`, data: result });
  } catch (error) { next(error); }
};

module.exports = { upload, uploadFromUrl, browse, search, checkUsages, remove, removeBulk };
