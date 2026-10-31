const productService = require('../services/product.service');
const productAiSpecsService = require('../services/productAiSpecs.service');
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

const getProductDeals = async (req, res, next) => {
  try {
    const result = await productService.getProductDeals(req.params.id);
    res.status(200).json({ status: 'success', data: result });
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

const bulkUpdateProductStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const result = await productService.bulkUpdateProductStatus(ids, status);
    res.status(200).json({
      status: 'success',
      message: `Đã cập nhật trạng thái ${result.updated} sản phẩm`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const searchInventoryProducts = async (req, res, next) => {
  try {
    const data = await productService.searchInventoryProducts(req.query.keyword);
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

const updateWholesaleTiers = async (req, res, next) => {
  try {
    const { tiers } = req.body;
    const product = await productService.updateWholesaleTiers(req.params.id, tiers);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật bảng giá bán sỉ thành công',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateCompositeBom = async (req, res, next) => {
  try {
    const { isComposite, bomItems } = req.body;
    const product = await productService.updateCompositeBom(req.params.id, { isComposite, bomItems });
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật cấu hình sản phẩm cấu thành (BOM) thành công',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateBatchExpiry = async (req, res, next) => {
  try {
    const { batchNumber, manufacturingDate, expiryDate } = req.body;
    const product = await productService.updateBatchExpiry(req.params.id, {
      batchNumber,
      manufacturingDate,
      expiryDate,
    });
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật thông tin lô hàng và hạn sử dụng thành công',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const aiExtractSpecs = async (req, res, next) => {
  try {
    const { productName, brand, modelCode, productUrl } = req.body;
    const data = await productAiSpecsService.extractProductSpecs({
      productName,
      brand,
      modelCode,
      productUrl,
    });
    res.status(200).json({
      status: 'success',
      message: 'Trích xuất thông số kỹ thuật thành công',
      data,
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
  getProductDeals,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  deleteBulkProducts,
  bulkUpdateProductStatus,
  searchInventoryProducts,
  updateWholesaleTiers,
  updateCompositeBom,
  updateBatchExpiry,
  aiExtractSpecs,
};
