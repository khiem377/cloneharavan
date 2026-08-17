const {
  uploadMedia, uploadMediaFromUrl,
  browseMedia, searchMedia,
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

const remove = async (req, res, next) => {
  try {
    const { usedBy } = await deleteMedia(req.params.id);
    const usedNote = usedBy.length
      ? ` (file này đã được dùng bởi: ${[...new Set(usedBy.map(u => u.model))].join(', ')})`
      : '';
    res.json({ status: 'success', statusCode: 200, message: `Xóa file thành công${usedNote}`, data: { usedBy } });
  } catch (error) { next(error); }
};

const removeBulk = async (req, res, next) => {
  try {
    const result = await deleteMediaBulk(req.body.ids);
    const msg = `Đã xóa ${result.deleted} file${result.usedNote ? ' ' + result.usedNote : ''}`;
    res.json({ status: 'success', statusCode: 200, message: msg, data: result });
  } catch (error) { next(error); }
};

module.exports = { upload, uploadFromUrl, browse, search, remove, removeBulk };
