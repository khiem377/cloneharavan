const brandService = require('../services/brand.service');
const { createBrandSchema, updateBrandSchema } = require('../validators/brand.validator');

const createBrand = async (req, res, next) => {
  try {
    const validatedData = createBrandSchema.parse(req.body);
    const brand = await brandService.createBrand(validatedData);
    res.status(201).json({
      status: 'success',
      message: 'Tạo thương hiệu thành công',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const brands = await brandService.getAllBrands(req.query);
    res.status(200).json({
      status: 'success',
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

const getBrandsAdmin = async (req, res, next) => {
  try {
    const brands = await brandService.getAllBrandsAdmin(req.query);
    res.status(200).json({
      status: 'success',
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

const getBrandById = async (req, res, next) => {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const validatedData = updateBrandSchema.parse(req.body);
    const brand = await brandService.updateBrand(req.params.id, validatedData);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật thương hiệu thành công',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

const toggleBrandStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const brand = await brandService.toggleBrandStatus(req.params.id, isActive);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái thương hiệu thành công',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const result = await brandService.deleteBrand(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBulkBrands = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await brandService.deleteBulkBrands(ids);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrandsAdmin,
  getBrandById,
  updateBrand,
  toggleBrandStatus,
  deleteBrand,
  deleteBulkBrands,
};
