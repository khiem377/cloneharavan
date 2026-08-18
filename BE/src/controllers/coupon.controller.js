const couponService = require('../services/coupon.service');
const { createCouponSchema, updateCouponSchema } = require('../validators/coupon.validator');
const { AppError } = require('../utils/AppError');

const getAll = async (req, res, next) => {
  try {
    const result = await couponService.getAllCoupons(req.query);
    res.json({ status: 'success', data: result.data, pagination: result.pagination });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    res.json({ status: 'success', data: coupon });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = createCouponSchema.parse(req.body);
    const coupon = await couponService.createCoupon(data);
    res.status(201).json({ status: 'success', message: 'Tạo mã giảm giá thành công', data: coupon });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = updateCouponSchema.parse(req.body);
    const coupon = await couponService.updateCoupon(req.params.id, data);
    res.json({ status: 'success', message: 'Cập nhật mã giảm giá thành công', data: coupon });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const result = await couponService.deleteCoupon(req.params.id);
    res.json({ status: 'success', message: result.message });
  } catch (err) { next(err); }
};

const toggleStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const coupon = await couponService.toggleCouponStatus(req.params.id, isActive);
    res.json({ status: 'success', message: 'Cập nhật trạng thái thành công', data: coupon });
  } catch (err) { next(err); }
};

// POST /coupons/validate — dùng ở checkout FE (storefront)
const validate = async (req, res, next) => {
  try {
    const { code, orderTotal, userId } = req.body;
    if (!code) return next(new (require('../utils/AppError').AppError)('Vui lòng nhập mã giảm giá', 400));
    if (!orderTotal || orderTotal <= 0) return next(new (require('../utils/AppError').AppError)('Tổng đơn hàng không hợp lệ', 400));
    const result = await couponService.validateCoupon(code, Number(orderTotal), userId);
    res.json({ status: 'success', data: result });
  } catch (err) { next(err); }
};

const removeBulk = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return next(new AppError('Vui lòng cung cấp danh sách id', 400));
    const result = await couponService.deleteBulkCoupons(ids);
    res.json({ status: 'success', message: `Đã xóa ${result.deleted} mã giảm giá` });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, removeBulk, toggleStatus, validate };
