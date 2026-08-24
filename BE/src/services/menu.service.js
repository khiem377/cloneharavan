const Menu = require('../models/menu.model');
const { slugify } = require('../utils/slugify');

// ── Helpers ─────────────────────────────────────────────────────────────────
function toHandle(str) {
  return slugify(str);
}

// ── Service ──────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách tất cả menu (admin)
 */
const getAll = async () => {
  return Menu.find().sort({ createdAt: -1 }).lean();
};

/**
 * Lấy menu theo handle (public – cho Client dùng)
 */
const getByHandle = async (handle) => {
  const menu = await Menu.findOne({ handle, isActive: true }).lean();
  if (!menu) {
    const err = new Error('Không tìm thấy menu');
    err.statusCode = 404;
    throw err;
  }
  return menu;
};

/**
 * Lấy menu theo id (admin)
 */
const getById = async (id) => {
  const menu = await Menu.findById(id).lean();
  if (!menu) {
    const err = new Error('Không tìm thấy menu');
    err.statusCode = 404;
    throw err;
  }
  return menu;
};

/**
 * Tạo menu mới
 */
const create = async (data) => {
  const handle = data.handle ? toHandle(data.handle) : toHandle(data.name);

  const existing = await Menu.findOne({ handle });
  if (existing) {
    const err = new Error(`Handle "${handle}" đã tồn tại`);
    err.statusCode = 400;
    throw err;
  }

  const menu = await Menu.create({ ...data, handle });
  return menu;
};

/**
 * Cập nhật menu (bao gồm toàn bộ items sau DnD)
 */
const update = async (id, data) => {
  const menu = await Menu.findById(id);
  if (!menu) {
    const err = new Error('Không tìm thấy menu');
    err.statusCode = 404;
    throw err;
  }

  // Nếu đổi handle thì kiểm tra trùng
  if (data.handle) {
    const newHandle = toHandle(data.handle);
    if (newHandle !== menu.handle) {
      const existing = await Menu.findOne({ handle: newHandle });
      if (existing) {
        const err = new Error(`Handle "${newHandle}" đã tồn tại`);
        err.statusCode = 400;
        throw err;
      }
      data.handle = newHandle;
    }
  }

  Object.assign(menu, data);
  await menu.save();
  return menu;
};

/**
 * Xoá menu
 */
const remove = async (id) => {
  const menu = await Menu.findByIdAndDelete(id);
  if (!menu) {
    const err = new Error('Không tìm thấy menu');
    err.statusCode = 404;
    throw err;
  }
  return menu;
};

/**
 * Nhân bản menu
 */
const duplicate = async (id) => {
  const menu = await Menu.findById(id).lean();
  if (!menu) {
    const err = new Error('Không tìm thấy menu');
    err.statusCode = 404;
    throw err;
  }

  delete menu._id;
  delete menu.createdAt;
  delete menu.updatedAt;
  delete menu.__v;

  let newHandle = `${menu.handle}-copy`;
  let counter = 1;
  while (await Menu.findOne({ handle: newHandle })) {
    newHandle = `${menu.handle}-copy-${counter++}`;
  }

  const newMenu = await Menu.create({
    ...menu,
    name: `${menu.name} (Copy)`,
    handle: newHandle,
  });
  return newMenu;
};

module.exports = { getAll, getByHandle, getById, create, update, remove, duplicate };
