const Warehouse = require('../models/warehouse.model');
const ProductWarehouseStock = require('../models/productWarehouseStock.model');
const ProductVariant = require('../models/productVariant.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');
const { escapeRegex } = require('../middleware/sanitize.middleware');

class WarehouseService {
  /**
   * Lấy danh sách nhân viên đủ điều kiện gán quyền quản lý kho
   */
  static async getStaffCandidates() {
    const User = require('../models/user.model');
    return User.find({
      role: { $in: ['inventory_manager', 'staff', 'manager'] },
      isActive: true,
    }).select('_id fullName email phone role');
  }

  /**
   * Lấy danh sách kho hàng kèm thống kê tổng tồn kho và số mặt hàng
   */
  static async getWarehouses({ keyword = '', status = '', page = 1, limit = 50 }, user = null) {
    const filter = {};
    if (keyword) {
      const safeKw = escapeRegex(keyword);
      filter.$or = [
        { name: { $regex: safeKw, $options: 'i' } },
        { code: { $regex: safeKw, $options: 'i' } },
        { phone: { $regex: safeKw, $options: 'i' } },
        { 'address.detailAddress': { $regex: safeKw, $options: 'i' } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    // Nếu người dùng là nhân viên kho (không phải admin/administrator), chỉ xem kho được phân quyền
    if (user && !['administrator', 'admin'].includes(user.role)) {
      filter.assignedStaffIds = user._id;
    }

    const skip = (page - 1) * limit;
    const [warehouses, total] = await Promise.all([
      Warehouse.find(filter)
        .populate('assignedStaffIds', 'fullName name email phone role')
        .sort({ isDefault: -1, createdAt: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Warehouse.countDocuments(filter),
    ]);

    // Lấy thống kê tồn kho theo từng kho
    const warehouseIds = warehouses.map((w) => w._id);
    const stockStats = await ProductWarehouseStock.aggregate([
      { $match: { warehouseId: { $in: warehouseIds } } },
      {
        $group: {
          _id: '$warehouseId',
          totalStock: { $sum: '$stock' },
          totalAllocated: { $sum: '$allocated' },
          totalSKUs: { $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] } },
        },
      },
    ]);

    const statsMap = new Map(stockStats.map((s) => [s._id.toString(), s]));

    const enriched = warehouses.map((w) => {
      const stats = statsMap.get(w._id.toString()) || { totalStock: 0, totalAllocated: 0, totalSKUs: 0 };
      return {
        ...w.toObject(),
        totalStock: stats.totalStock,
        totalAllocated: stats.totalAllocated,
        availableStock: Math.max(0, stats.totalStock - stats.totalAllocated),
        totalSKUs: stats.totalSKUs,
      };
    });

    return {
      data: enriched,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Lấy chi tiết kho theo ID
   */
  static async getWarehouseById(id) {
    const warehouse = await Warehouse.findById(id).populate('assignedStaffIds', 'fullName name email phone role');
    if (!warehouse) throw new AppError('Kho hàng không tồn tại', 404);

    const [stats] = await ProductWarehouseStock.aggregate([
      { $match: { warehouseId: warehouse._id } },
      {
        $group: {
          _id: '$warehouseId',
          totalStock: { $sum: '$stock' },
          totalAllocated: { $sum: '$allocated' },
          totalSKUs: { $sum: 1 },
          inStockSKUs: { $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] } },
        },
      },
    ]);

    return {
      ...warehouse.toObject(),
      stats: stats || { totalStock: 0, totalAllocated: 0, totalSKUs: 0, inStockSKUs: 0 },
    };
  }

  /**
   * Tạo kho hàng mới
   */
  static async createWarehouse(payload) {
    const { name, code, phone, address, isDefault, status, binLocations, assignedStaffIds } = payload;

    const existingCode = await Warehouse.findOne({ code: code.toUpperCase().trim() });
    if (existingCode) {
      throw new AppError(`Mã kho "${code}" đã tồn tại trên hệ thống`, 400);
    }

    if (isDefault) {
      await Warehouse.updateMany({}, { $set: { isDefault: false } });
    }

    // Ghép fullAddress nếu chưa có
    let fullAddress = address?.fullAddress;
    if (!fullAddress && address) {
      fullAddress = [address.detailAddress, address.ward, address.district, address.province]
        .filter(Boolean)
        .join(', ');
    }

    const warehouse = await Warehouse.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      phone: phone || '',
      address: {
        ...address,
        fullAddress,
      },
      isDefault: Boolean(isDefault),
      status: status || 'active',
      binLocations: binLocations || [],
      assignedStaffIds: assignedStaffIds || [],
    });

    // Khởi tạo các bản ghi ProductWarehouseStock với stock = 0 cho các biến thể hiện có
    const variants = await ProductVariant.find({}, '_id productId').lean();
    if (variants.length > 0) {
      const stockDocs = variants.map((v) => ({
        warehouseId: warehouse._id,
        productId: v.productId,
        variantId: v._id,
        stock: 0,
        allocated: 0,
        binLocation: '',
      }));
      await ProductWarehouseStock.insertMany(stockDocs, { ordered: false }).catch(() => {});
    }

    return warehouse;
  }

  /**
   * Cập nhật kho hàng
   */
  static async updateWarehouse(id, payload) {
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) throw new AppError('Kho hàng không tồn tại', 404);

    const { name, code, phone, address, isDefault, status, binLocations, assignedStaffIds } = payload;

    if (code && code.toUpperCase().trim() !== warehouse.code) {
      const existing = await Warehouse.findOne({ code: code.toUpperCase().trim() });
      if (existing) throw new AppError(`Mã kho "${code}" đã tồn tại`, 400);
      warehouse.code = code.toUpperCase().trim();
    }

    if (name) warehouse.name = name.trim();
    if (phone !== undefined) warehouse.phone = phone;

    if (address) {
      let fullAddress = address.fullAddress;
      if (!fullAddress) {
        fullAddress = [address.detailAddress, address.ward, address.district, address.province]
          .filter(Boolean)
          .join(', ');
      }
      warehouse.address = {
        ...address,
        fullAddress,
      };
    }

    if (status) warehouse.status = status;
    if (binLocations) warehouse.binLocations = binLocations;
    if (assignedStaffIds) warehouse.assignedStaffIds = assignedStaffIds;

    if (isDefault !== undefined) {
      if (isDefault && !warehouse.isDefault) {
        await Warehouse.updateMany({ _id: { $ne: warehouse._id } }, { $set: { isDefault: false } });
        warehouse.isDefault = true;
      } else if (!isDefault && warehouse.isDefault) {
        // Không cho phép bỏ mặc định nếu đây là kho mặc định duy nhất
        const defaultCount = await Warehouse.countDocuments({ isDefault: true });
        if (defaultCount <= 1) {
          throw new AppError('Hệ thống phải có ít nhất 1 kho mặc định', 400);
        }
        warehouse.isDefault = false;
      }
    }

    await warehouse.save();
    return warehouse;
  }

  /**
   * Đặt làm kho mặc định
   */
  static async setDefault(id) {
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) throw new AppError('Kho hàng không tồn tại', 404);

    await Warehouse.updateMany({ _id: { $ne: warehouse._id } }, { $set: { isDefault: false } });
    warehouse.isDefault = true;
    await warehouse.save();
    return warehouse;
  }

  /**
   * Xoá kho hàng (chỉ cho xoá nếu tổng tồn kho = 0 và không phải kho mặc định)
   */
  static async deleteWarehouse(id) {
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) throw new AppError('Kho hàng không tồn tại', 404);

    if (warehouse.isDefault) {
      throw new AppError('Không thể xóa kho hàng đang được thiết lập là Mặc định', 400);
    }

    const hasStock = await ProductWarehouseStock.exists({
      warehouseId: warehouse._id,
      stock: { $gt: 0 },
    });
    if (hasStock) {
      throw new AppError('Không thể xóa kho hàng đang còn sản phẩm tồn kho. Vui lòng chuyển kho hoặc xuất hết hàng trước.', 400);
    }

    await ProductWarehouseStock.deleteMany({ warehouseId: warehouse._id });
    await warehouse.deleteOne();
    return { success: true, message: 'Đã xóa kho hàng thành công' };
  }

  /**
   * Lấy danh sách tồn kho của một kho cụ thể (Phục vụ kiểm kê & hiển thị bảng tồn kho)
   */
  static async getWarehouseInventory(warehouseId, { keyword = '', page = 1, limit = 50 }) {
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) throw new AppError('Kho hàng không tồn tại', 404);

    const filter = { warehouseId: warehouse._id };

    if (keyword && keyword.trim()) {
      const kw = escapeRegex(keyword.trim());
      const [matchedProducts, matchedVariants] = await Promise.all([
        Product.find({ name: { $regex: kw, $options: 'i' } }).select('_id'),
        ProductVariant.find({
          $or: [
            { sku: { $regex: kw, $options: 'i' } },
            { displayName: { $regex: kw, $options: 'i' } },
          ],
        }).select('_id'),
      ]);

      const pIds = matchedProducts.map((p) => p._id);
      const vIds = matchedVariants.map((v) => v._id);

      filter.$or = [
        { productId: { $in: pIds } },
        { variantId: { $in: vIds } },
        { binLocation: { $regex: kw, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total, stats] = await Promise.all([
      ProductWarehouseStock.find(filter)
        .populate({
          path: 'productId',
          select: 'name thumbnail slug brand categories costPrice price',
          populate: { path: 'brand', select: 'name' },
        })
        .populate({
          path: 'variantId',
          select: 'sku price costPrice attributes displayName stock allocated isDefault',
        })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ProductWarehouseStock.countDocuments(filter),
      ProductWarehouseStock.aggregate([
        { $match: { warehouseId: warehouse._id } },
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$stock' },
            totalAllocated: { $sum: '$allocated' },
            totalSKUs: { $sum: 1 },
            inStockSKUs: { $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const aggregateStats = stats[0] || {
      totalStock: 0,
      totalAllocated: 0,
      totalSKUs: total,
      inStockSKUs: 0,
    };

    return {
      warehouse: {
        _id: warehouse._id,
        name: warehouse.name,
        code: warehouse.code,
        isDefault: warehouse.isDefault,
        stats: aggregateStats,
      },
      data: items,
      summary: aggregateStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

module.exports = WarehouseService;
