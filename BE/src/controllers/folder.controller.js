const {
  getFolderTree,
  getFolderContents,
  createFolder,
  renameFolder,
  reorderFolders,
  deleteFolder,
} = require('../services/folder.service');

const getTree = async (req, res, next) => {
  try {
    const tree = await getFolderTree();
    res.json({ status: 'success', statusCode: 200, message: 'Lấy danh sách folder thành công', data: { folders: tree } });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const folder = await createFolder(req.body);
    res.status(201).json({ status: 'success', statusCode: 201, message: 'Tạo folder thành công', data: { folder } });
  } catch (error) { next(error); }
};

const reorder = async (req, res, next) => {
  try {
    await reorderFolders(req.body);
    res.json({ status: 'success', statusCode: 200, message: 'Cập nhật vị trí thành công' });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await deleteFolder(req.params.id);
    res.json({ status: 'success', statusCode: 200, message: 'Xóa folder thành công' });
  } catch (error) { next(error); }
};

const rename = async (req, res, next) => {
  try {
    const folder = await renameFolder(req.params.id, req.body.name);
    res.json({ status: 'success', statusCode: 200, message: 'Đổi tên thành công', data: { folder } });
  } catch (error) { next(error); }
};

const getContents = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    const data = await getFolderContents(req.params.id, {
      q,
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json({ status: 'success', statusCode: 200, message: 'Lấy nội dung folder thành công', data });
  } catch (error) { next(error); }
};

module.exports = { getTree, getContents, create, rename, reorder, remove };
