const productVariantService = require('../services/productVariant.service');
const { createVariantSchema, updateVariantSchema, bulkCreateVariantSchema } = require('../validators/productVariant.validator');

const getVariants = async (req, res, next) => {
  try {
    const variants = await productVariantService.getVariantsByProduct(req.params.productId);
    res.status(200).json({ status: 'success', data: variants });
  } catch (error) {
    next(error);
  }
};

const getVariantById = async (req, res, next) => {
  try {
    const variant = await productVariantService.getVariantById(req.params.id);
    res.status(200).json({ status: 'success', data: variant });
  } catch (error) {
    next(error);
  }
};

const createVariant = async (req, res, next) => {
  try {
    const validatedData = createVariantSchema.parse(req.body);
    const variant = await productVariantService.createVariant(req.params.productId, validatedData);
    res.status(201).json({ status: 'success', message: 'Tạo biến thể thành công', data: variant });
  } catch (error) {
    next(error);
  }
};

const bulkCreateVariants = async (req, res, next) => {
  try {
    const validatedData = bulkCreateVariantSchema.parse(req.body);
    const variants = await productVariantService.bulkCreateVariants(req.params.productId, validatedData.variants);
    res.status(201).json({ status: 'success', message: `Tạo ${variants.length} biến thể thành công`, data: variants });
  } catch (error) {
    next(error);
  }
};

const updateVariant = async (req, res, next) => {
  try {
    const validatedData = updateVariantSchema.parse(req.body);
    const variant = await productVariantService.updateVariant(req.params.id, validatedData);
    res.status(200).json({ status: 'success', message: 'Cập nhật biến thể thành công', data: variant });
  } catch (error) {
    next(error);
  }
};

const deleteVariant = async (req, res, next) => {
  try {
    const result = await productVariantService.deleteVariant(req.params.id);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

const deleteVariantsByProduct = async (req, res, next) => {
  try {
    const result = await productVariantService.deleteVariantsByProduct(req.params.productId);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVariants,
  getVariantById,
  createVariant,
  bulkCreateVariants,
  updateVariant,
  deleteVariant,
  deleteVariantsByProduct,
};
