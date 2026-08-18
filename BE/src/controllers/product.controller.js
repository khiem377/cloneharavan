const productService = require('../services/product.service');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');

const createProduct = async (req, res, next) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const product = await productService.createProduct(validatedData);
    res.status(201).json({
      status: 'success',
      message: 'Tạo sản phẩm thành công',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.status(200).json({
      status: 'success',
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getProductsAdmin = async (req, res, next) => {
  try {
    const result = await productService.getAllProductsAdmin(req.query);
    res.status(200).json({
      status: 'success',
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getProductsToCompare = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const products = await productService.getProductsToCompare(ids);
    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const validatedData = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id, validatedData);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật sản phẩm thành công',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const toggleProductStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const product = await productService.toggleProductStatus(req.params.id, isActive);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái sản phẩm thành công',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBulkProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await productService.deleteBulkProducts(ids);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductsAdmin,
  getProductById,
  getProductsToCompare,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  deleteBulkProducts,
};
