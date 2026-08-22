const menuService = require('../services/menu.service');

// GET /api/menus — Admin: lấy tất cả menu
exports.getAll = async (req, res, next) => {
  try {
    const menus = await menuService.getAll();
    res.json({ success: true, data: menus });
  } catch (err) {
    next(err);
  }
};

// GET /api/menus/handle/:handle — Public: lấy menu theo handle (cho Client)
exports.getByHandle = async (req, res, next) => {
  try {
    const menu = await menuService.getByHandle(req.params.handle);
    res.json({ success: true, data: menu });
  } catch (err) {
    next(err);
  }
};

// GET /api/menus/:id — Admin: lấy menu theo id
exports.getById = async (req, res, next) => {
  try {
    const menu = await menuService.getById(req.params.id);
    res.json({ success: true, data: menu });
  } catch (err) {
    next(err);
  }
};

// POST /api/menus — Admin: tạo menu mới
exports.create = async (req, res, next) => {
  try {
    const menu = await menuService.create(req.body);
    res.status(201).json({ success: true, data: menu });
  } catch (err) {
    next(err);
  }
};

// PUT /api/menus/:id — Admin: cập nhật menu
exports.update = async (req, res, next) => {
  try {
    const menu = await menuService.update(req.params.id, req.body);
    res.json({ success: true, data: menu });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/menus/:id — Admin: xoá menu
exports.remove = async (req, res, next) => {
  try {
    await menuService.remove(req.params.id);
    res.json({ success: true, message: 'Đã xoá menu' });
  } catch (err) {
    next(err);
  }
};

// POST /api/menus/:id/duplicate — Admin: nhân bản menu
exports.duplicate = async (req, res, next) => {
  try {
    const menu = await menuService.duplicate(req.params.id);
    res.status(201).json({ success: true, data: menu });
  } catch (err) {
    next(err);
  }
};
