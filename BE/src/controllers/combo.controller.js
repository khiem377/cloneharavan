const ComboService = require('../services/combo.service');

const createCombo = async (req, res, next) => {
  try {
    const combo = await ComboService.createCombo(req.body, req.user?._id);
    res.status(201).json({
      success: true,
      message: 'Tạo combo sản phẩm thành công',
      data: combo,
    });
  } catch (err) {
    next(err);
  }
};

const getCombos = async (req, res, next) => {
  try {
    const result = await ComboService.getCombos(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getComboById = async (req, res, next) => {
  try {
    const combo = await ComboService.getComboById(req.params.id);
    res.status(200).json({
      success: true,
      data: combo,
    });
  } catch (err) {
    next(err);
  }
};

const updateCombo = async (req, res, next) => {
  try {
    const combo = await ComboService.updateCombo(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật combo thành công',
      data: combo,
    });
  } catch (err) {
    next(err);
  }
};

const deleteCombo = async (req, res, next) => {
  try {
    await ComboService.deleteCombo(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Đã xóa combo thành công',
    });
  } catch (err) {
    next(err);
  }
};

const toggleComboStatus = async (req, res, next) => {
  try {
    const combo = await ComboService.toggleStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: `Đã ${combo.isActive ? 'kích hoạt' : 'tạm dừng'} combo`,
      data: combo,
    });
  } catch (err) {
    next(err);
  }
};

const aiSuggestPricing = async (req, res, next) => {
  try {
    const suggestions = await ComboService.aiSuggestPricing(req.body);
    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (err) {
    next(err);
  }
};

const aiSuggestBundles = async (req, res, next) => {
  try {
    const bundles = await ComboService.aiSuggestBundles();
    res.status(200).json({
      success: true,
      data: bundles,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCombo,
  getCombos,
  getComboById,
  updateCombo,
  deleteCombo,
  toggleComboStatus,
  aiSuggestPricing,
  aiSuggestBundles,
};
