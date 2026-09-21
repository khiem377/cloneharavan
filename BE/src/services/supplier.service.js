const Supplier = require('../models/supplier.model');
const AppError = require('../utils/AppError');

class SupplierService {
  static async getAllSuppliers({ page = 1, limit = 20, keyword = '', isActive }) {
    const query = {};
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { code: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Supplier.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Supplier.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getSupplierById(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) throw new AppError('Nhà cung cấp không tồn tại', 404);
    return supplier;
  }

  static async createSupplier(payload) {
    const existing = await Supplier.findOne({ code: payload.code.toUpperCase() });
    if (existing) throw new AppError('Mã nhà cung cấp đã tồn tại', 400);

    const supplier = await Supplier.create({
      ...payload,
      code: payload.code.toUpperCase(),
    });
    return supplier;
  }

  static async updateSupplier(id, payload) {
    if (payload.code) {
      const existing = await Supplier.findOne({ code: payload.code.toUpperCase(), _id: { $ne: id } });
      if (existing) throw new AppError('Mã nhà cung cấp đã tồn tại', 400);
      payload.code = payload.code.toUpperCase();
    }

    const supplier = await Supplier.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!supplier) throw new AppError('Nhà cung cấp không tồn tại', 404);
    return supplier;
  }

  static async deleteSupplier(id) {
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) throw new AppError('Nhà cung cấp không tồn tại', 404);
    return supplier;
  }
}

module.exports = SupplierService;
