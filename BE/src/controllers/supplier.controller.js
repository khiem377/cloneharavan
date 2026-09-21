const SupplierService = require('../services/supplier.service');

const getSuppliers = async (req, res, next) => {
  try {
    const result = await SupplierService.getAllSuppliers(req.query);
    res.json({ status: 'success', data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const data = await SupplierService.getSupplierById(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const data = await SupplierService.createSupplier(req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const data = await SupplierService.updateSupplier(req.params.id, req.body);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    await SupplierService.deleteSupplier(req.params.id);
    res.json({ status: 'success', message: 'Xóa nhà cung cấp thành công' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
