const giftProgramService = require('../services/gift-program.service');
const { createGiftProgramSchema, updateGiftProgramSchema } = require('../validators/gift-program.validator');
const { AppError } = require('../utils/AppError');

const getAll = async (req, res, next) => {
  try {
    const result = await giftProgramService.getAllGiftPrograms(req.query);
    res.json({ status: 'success', data: result.data, pagination: result.pagination });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const program = await giftProgramService.getGiftProgramById(req.params.id);
    res.json({ status: 'success', data: program });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = createGiftProgramSchema.parse(req.body);
    const program = await giftProgramService.createGiftProgram(data);
    res.status(201).json({ status: 'success', message: 'Tạo chương trình tặng kèm thành công', data: program });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = updateGiftProgramSchema.parse(req.body);
    const program = await giftProgramService.updateGiftProgram(req.params.id, data);
    res.json({ status: 'success', message: 'Cập nhật chương trình tặng kèm thành công', data: program });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await giftProgramService.deleteGiftProgram(req.params.id);
    res.json({ status: 'success', message: 'Đã xóa chương trình tặng kèm' });
  } catch (err) { next(err); }
};

const toggleStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const program = await giftProgramService.toggleGiftProgramStatus(req.params.id, isActive);
    res.json({ status: 'success', message: 'Cập nhật trạng thái thành công', data: program });
  } catch (err) { next(err); }
};

const removeBulk = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length)
      return next(new AppError('Vui lòng cung cấp danh sách id', 400));
    const result = await giftProgramService.deleteBulkGiftPrograms(ids);
    res.json({ status: 'success', message: `Đã xóa ${result.deleted} chương trình tặng kèm` });
  } catch (err) { next(err); }
};

const apply = async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    if (!Array.isArray(cartItems) || !cartItems.length)
      return next(new AppError('Giỏ hàng không hợp lệ', 400));
    const result = await giftProgramService.applyGiftPrograms(cartItems);
    res.json({ status: 'success', data: result });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, removeBulk, toggleStatus, apply };
