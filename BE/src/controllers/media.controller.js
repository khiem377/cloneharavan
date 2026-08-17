const {
  uploadMedia,
  browseMedia,
  searchMedia,
  deleteMedia,
  deleteMediaBulk,
} = require('../services/media.service');

const upload = async (req, res, next) => {
  try {
    const { folderId } = req.body;
    const media = await uploadMedia(req.file, folderId);
    res.status(201).json({
      status: 'success', statusCode: 201,
      message: 'Upload file thành công',
      data: { media },
    });
  } catch (error) { next(error); }
};

const browse = async (req, res, next) => {
  try {
    const { folderId, page, limit } = req.query;
    const data = await browseMedia({
      folderId,
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json({ status: 'success', statusCode: 200, message: 'Lấy danh sách media thành công', data });
  } catch (error) { next(error); }
};

const search = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    const data = await searchMedia({
      q,
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json({ status: 'success', statusCode: 200, message: 'Tìm kiếm thành công', data });
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
    res.json({
      status: 'success', statusCode: 200,
      message: `Đã xóa ${result.deleted} file${result.skipped ? `, bỏ qua ${result.skipped} file đang sử dụng` : ''}`,
      data: result,
    });
  } catch (error) { next(error); }
};

module.exports = { upload, browse, search, remove, removeBulk };
