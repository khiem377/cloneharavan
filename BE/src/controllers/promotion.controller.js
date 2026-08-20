const promotionService = require('../services/promotion.service');
const { createPromotionSchema, updatePromotionSchema } = require('../validators/promotion.validator');
const { AppError } = require('../utils/AppError');

const getAll = async (req, res, next) => {
  try {
    const result = await promotionService.getAllPromotions(req.query);
    res.json({ status: 'success', data: result.data, pagination: result.pagination });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);
    res.json({ status: 'success', data: promotion });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = createPromotionSchema.parse(req.body);
    const promotion = await promotionService.createPromotion(data);
    res.status(201).json({ status: 'success', message: 'Tạo chương trình khuyến mãi thành công', data: promotion });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = updatePromotionSchema.parse(req.body);
    const promotion = await promotionService.updatePromotion(req.params.id, data);
    res.json({ status: 'success', message: 'Cập nhật chương trình khuyến mãi thành công', data: promotion });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await promotionService.deletePromotion(req.params.id);
    res.json({ status: 'success', message: 'Đã xóa chương trình khuyến mãi' });
  } catch (err) { next(err); }
};

const toggleStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const promotion = await promotionService.togglePromotionStatus(req.params.id, isActive);
    res.json({ status: 'success', message: 'Cập nhật trạng thái thành công', data: promotion });
  } catch (err) { next(err); }
};

const removeBulk = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length)
      return next(new AppError('Vui lòng cung cấp danh sách id', 400));
    const result = await promotionService.deleteBulkPromotions(ids);
    res.json({ status: 'success', message: `Đã xóa ${result.deleted} chương trình khuyến mãi` });
  } catch (err) { next(err); }
};

const apply = async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    if (!Array.isArray(cartItems) || !cartItems.length)
      return next(new AppError('Giỏ hàng không hợp lệ', 400));
    const result = await promotionService.applyPromotions(cartItems);
    res.json({ status: 'success', data: result });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, removeBulk, toggleStatus, apply };
