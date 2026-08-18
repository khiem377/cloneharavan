const categoryService = require('../services/category.service');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validator');

const createCategory = async (req, res, next) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(validatedData);
    res.status(201).json({
      status: 'success',
      message: 'Tạo danh mục thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(req.query);
    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategoriesAdmin(req.query);
    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const validatedData = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(req.params.id, validatedData);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật danh mục thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const toggleCategoryStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const category = await categoryService.toggleCategoryStatus(req.params.id, isActive);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái danh mục thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBulkCategories = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await categoryService.deleteBulkCategories(ids);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoriesAdmin,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  deleteBulkCategories,
};
