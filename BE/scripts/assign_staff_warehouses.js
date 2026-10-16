const Warehouse = require('../src/models/warehouse.model');
const User = require('../src/models/user.model');

const assignStaffWarehouses = async () => {
  try {
    let defaultWarehouse = await Warehouse.findOne({ isDefault: true });
    if (!defaultWarehouse) {
      defaultWarehouse = await Warehouse.findOne({ status: 'active' });
    }

    if (!defaultWarehouse) {
      defaultWarehouse = await Warehouse.create({
        name: 'Kho Tổng Hà Nội & TP.HCM',
        code: 'KHO-TONG',
        phone: '1900.636.099',
        isDefault: true,
        status: 'active',
        address: {
          province: 'Hồ Chí Minh',
          provinceId: 202,
          district: 'Quận 1',
          districtId: 1442,
          ward: 'Bến Nghé',
          wardCode: '20101',
          detailAddress: 'Số 1 Nguyễn Huệ',
          fullAddress: 'Số 1 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        },
      });
      console.log('[WarehouseInit] Đã khởi tạo kho mặc định:', defaultWarehouse.name);
    }

    // Gán kho mặc định cho nhân sự chưa có kho
    const staffMembers = await User.find({
      role: { $in: ['staff', 'manager', 'administrator', 'warehouse_staff'] },
      $or: [{ assignedWarehouseId: null }, { assignedWarehouseId: { $exists: false } }],
    });

    if (staffMembers.length > 0) {
      const staffIds = staffMembers.map((s) => s._id);
      await User.updateMany(
        { _id: { $in: staffIds } },
        { $set: { assignedWarehouseId: defaultWarehouse._id } }
      );
      await Warehouse.findByIdAndUpdate(defaultWarehouse._id, {
        $addToSet: { assignedStaffIds: { $each: staffIds } },
      });
      console.log(`[WarehouseInit] Đã gán kho "${defaultWarehouse.name}" cho ${staffMembers.length} nhân viên`);
    }
  } catch (err) {
    console.warn('[WarehouseInit] assignStaffWarehouses warning:', err.message);
  }
};

module.exports = assignStaffWarehouses;
