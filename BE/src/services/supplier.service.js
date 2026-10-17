const Supplier = require('../models/supplier.model');
const SupplierDebt = require('../models/supplierDebt.model');
const AppError = require('../utils/AppError');

class SupplierService {
  static async getAllSuppliers({ page = 1, limit = 20, keyword = '', isActive, status, supplierType }) {
    const query = {};
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { code: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Status filter: 'active' | 'inactive'
    if (status === 'active' || isActive === 'true' || isActive === true) {
      query.isActive = true;
    } else if (status === 'inactive' || isActive === 'false' || isActive === false) {
      query.isActive = false;
    }

    if (supplierType && supplierType !== 'all') {
      query.supplierType = supplierType;
    }

    const skip = (page - 1) * limit;
    const [data, total, allCount, activeCount, inactiveCount, debtAgg] = await Promise.all([
      Supplier.find(query).populate('assignedStaffId', 'fullName email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Supplier.countDocuments(query),
      Supplier.countDocuments(),
      Supplier.countDocuments({ isActive: true }),
      Supplier.countDocuments({ isActive: false }),
      Supplier.aggregate([
        { $group: { _id: null, totalDebt: { $sum: '$debt' } } }
      ]),
    ]);

    const supplierIds = data.map((s) => s._id);
    const debts = await SupplierDebt.find({
      supplierId: { $in: supplierIds },
      status: { $in: ['pending', 'partially_paid'] },
    })
      .select('supplierId debtNumber referenceCode referenceType totalAmount paidAmount remainingAmount dueDate createdAt name')
      .sort({ createdAt: -1 })
      .lean();

    const dataWithDebts = data.map((sup) => {
      const sObj = sup.toObject();
      sObj.unpaidDebts = debts.filter((d) => d.supplierId.toString() === sup._id.toString());
      return sObj;
    });

    const totalDebt = debtAgg[0]?.totalDebt || 0;

    return {
      data: dataWithDebts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: {
        all: allCount,
        active: activeCount,
        inactive: inactiveCount,
      },
      totalDebt,
    };
  }

  static async getSupplierById(id) {
    const supplier = await Supplier.findById(id).populate('assignedStaffId', 'fullName email');
    if (!supplier) throw new AppError('Nhà cung cấp không tồn tại', 404);
    return supplier;
  }

  static formatFullAddress(payload) {
    if (payload.address && !payload.detailAddress && !payload.province) {
      return payload.address;
    }
    const parts = [
      payload.detailAddress,
      payload.ward,
      payload.district,
      payload.province,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : (payload.address || '');
  }

  static async createSupplier(payload) {
    const code = (payload.code || `NCC-${Date.now().toString().slice(-6)}`).toUpperCase().trim();
    const existing = await Supplier.findOne({ code });
    if (existing) throw new AppError('Mã nhà cung cấp đã tồn tại', 400);

    const isActive = payload.status ? payload.status === 'active' : (payload.isActive !== false);
    const status = isActive ? 'active' : 'inactive';
    const address = this.formatFullAddress(payload);

    const supplier = await Supplier.create({
      ...payload,
      code,
      isActive,
      status,
      address,
    });
    return supplier;
  }

  static async updateSupplier(id, payload) {
    const updateData = { ...payload };

    // Chuẩn hóa: chuỗi rỗng -> null (bỏ phụ trách); tags được trim, bỏ trùng
    if (updateData.assignedStaffId !== undefined && !updateData.assignedStaffId) {
      updateData.assignedStaffId = null;
    }
    if (Array.isArray(updateData.tags)) {
      updateData.tags = [...new Set(updateData.tags.map((t) => String(t).trim()).filter(Boolean))];
    }

    if (updateData.code) {
      const code = updateData.code.toUpperCase().trim();
      const existing = await Supplier.findOne({ code, _id: { $ne: id } });
      if (existing) throw new AppError('Mã nhà cung cấp đã tồn tại', 400);
      updateData.code = code;
    }

    if (updateData.status !== undefined) {
      updateData.isActive = updateData.status === 'active';
    } else if (updateData.isActive !== undefined) {
      updateData.status = updateData.isActive ? 'active' : 'inactive';
    }

    if (updateData.detailAddress || updateData.province || updateData.ward) {
      updateData.address = this.formatFullAddress(updateData);
    }

    const supplier = await Supplier.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('assignedStaffId', 'fullName email');
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
