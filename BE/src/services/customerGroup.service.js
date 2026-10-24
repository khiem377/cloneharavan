const CustomerGroup = require('../models/customerGroup.model');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const AppError = require('../utils/AppError');

/**
 * Đánh giá một người dùng có khớp với một điều kiện hay không
 */
function evaluateCondition(actualValue, operator, targetValue) {
  switch (operator) {
    case 'gte':
      return actualValue >= targetValue;
    case 'lte':
      return actualValue <= targetValue;
    case 'eq':
      return actualValue === targetValue;
    default:
      return false;
  }
}

class CustomerGroupService {
  /**
   * Lấy danh sách nhóm khách hàng có phân trang và tìm kiếm
   */
  static async getGroups(query = {}) {
    const { page = 1, limit = 20, search, type, isActive } = query;
    const filter = {};

    const existingCount = await CustomerGroup.countDocuments();
    if (existingCount === 0) {
      try {
        const seedCustomerGroups = require('../../scripts/seed-customer-groups-and-sync');
        await seedCustomerGroups(false);
      } catch (seedErr) {
        console.warn('[CustomerGroupService] Auto-seed failed:', seedErr.message);
      }
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { code: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (isActive !== undefined && isActive !== 'all') {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

    const [groups, total] = await Promise.all([
      CustomerGroup.find(filter)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      CustomerGroup.countDocuments(filter),
    ]);

    return {
      groups,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * Danh sách options gọn nhẹ cho dropdown select
   */
  static async getOptions() {
    return CustomerGroup.find({ isActive: true })
      .select('_id name code color type memberCount')
      .sort({ name: 1 })
      .lean();
  }

  /**
   * Chi tiết nhóm khách hàng
   */
  static async getGroupById(id) {
    const group = await CustomerGroup.findById(id).populate('createdBy', 'fullName email').lean();
    if (!group) {
      throw new AppError('Không tìm thấy nhóm khách hàng', 404);
    }
    return group;
  }

  /**
   * Tạo nhóm khách hàng mới
   */
  static async createGroup(data, user) {
    const { name, code, description, type, conditions, conditionLogic, color, isActive } = data;

    const existingCode = await CustomerGroup.findOne({ code: code.toUpperCase().trim() });
    if (existingCode) {
      throw new AppError(`Mã nhóm '${code.toUpperCase()}' đã tồn tại`, 400);
    }

    const group = await CustomerGroup.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description || '',
      type: type || 'manual',
      conditions: Array.isArray(conditions) ? conditions : [],
      conditionLogic: conditionLogic || 'AND',
      color: color || 'blue',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: user?._id || null,
    });

    // Nếu là nhóm tự động, quét thành viên ban đầu
    if (group.type === 'automatic' && group.conditions.length > 0) {
      await this.syncGroupMembers(group._id);
    }

    return CustomerGroup.findById(group._id).lean();
  }

  /**
   * Cập nhật nhóm khách hàng
   */
  static async updateGroup(id, data) {
    const group = await CustomerGroup.findById(id);
    if (!group) {
      throw new AppError('Không tìm thấy nhóm khách hàng', 404);
    }

    if (data.code && data.code.toUpperCase().trim() !== group.code) {
      const existing = await CustomerGroup.findOne({
        code: data.code.toUpperCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError(`Mã nhóm '${data.code.toUpperCase()}' đã tồn tại`, 400);
      }
      group.code = data.code.toUpperCase().trim();
    }

    if (data.name !== undefined) group.name = data.name.trim();
    if (data.description !== undefined) group.description = data.description;
    if (data.type !== undefined) group.type = data.type;
    if (data.conditions !== undefined) group.conditions = data.conditions;
    if (data.conditionLogic !== undefined) group.conditionLogic = data.conditionLogic;
    if (data.color !== undefined) group.color = data.color;
    if (data.isActive !== undefined) group.isActive = data.isActive;

    await group.save();

    if (group.type === 'automatic') {
      await this.syncGroupMembers(group._id);
    }

    return CustomerGroup.findById(group._id).lean();
  }

  /**
   * Xóa nhóm khách hàng
   */
  static async deleteGroup(id) {
    const group = await CustomerGroup.findById(id);
    if (!group) {
      throw new AppError('Không tìm thấy nhóm khách hàng', 404);
    }

    // Gỡ nhóm khỏi các khách hàng đang thuộc nhóm
    await User.updateMany({ customerGroupId: id }, { $set: { customerGroupId: null } });
    await CustomerGroup.findByIdAndDelete(id);

    return { message: 'Đã xóa nhóm khách hàng thành công' };
  }

  /**
   * Quét và đồng bộ thành viên vào nhóm (cho nhóm tự động)
   */
  static async syncGroupMembers(groupId) {
    const group = await CustomerGroup.findById(groupId);
    if (!group) {
      throw new AppError('Không tìm thấy nhóm khách hàng', 404);
    }

    if (group.type === 'manual') {
      const count = await User.countDocuments({ customerGroupId: groupId });
      group.memberCount = count;
      await group.save();
      return { memberCount: count, message: 'Đã cập nhật số lượng thành viên nhóm thủ công' };
    }

    // Nhóm tự động: Lấy toàn bộ khách hàng và tính toán chỉ số đơn hàng
    const users = await User.find({ role: 'user' }).select('_id createdAt customerGroupId').lean();
    if (users.length === 0) {
      group.memberCount = 0;
      await group.save();
      return { memberCount: 0, message: 'Chưa có khách hàng nào trong hệ thống' };
    }

    // Aggregate đơn hàng để tính totalSpent & orderCount
    const orderStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: { $ifNull: ['$pricing.totalAmount', 0] } },
        },
      },
    ]);

    const statsMap = new Map();
    orderStats.forEach((st) => {
      if (st._id) {
        statsMap.set(st._id.toString(), {
          orderCount: st.orderCount || 0,
          totalSpent: st.totalSpent || 0,
        });
      }
    });

    const now = Date.now();
    const matchedUserIds = [];
    const unmatchedUserIds = [];

    users.forEach((u) => {
      const uId = u._id.toString();
      const stats = statsMap.get(uId) || { orderCount: 0, totalSpent: 0 };
      const createdAtDays = Math.floor((now - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24));

      const evaluationResults = group.conditions.map((cond) => {
        let actualVal = 0;
        if (cond.field === 'totalSpent') actualVal = stats.totalSpent;
        else if (cond.field === 'orderCount') actualVal = stats.orderCount;
        else if (cond.field === 'createdAtDays') actualVal = createdAtDays;

        return evaluateCondition(actualVal, cond.operator, cond.value);
      });

      let isMatch = false;
      if (group.conditions.length === 0) {
        isMatch = false;
      } else if (group.conditionLogic === 'OR') {
        isMatch = evaluationResults.some(Boolean);
      } else {
        // AND
        isMatch = evaluationResults.every(Boolean);
      }

      if (isMatch) {
        matchedUserIds.push(u._id);
      } else if (u.customerGroupId && u.customerGroupId.toString() === groupId.toString()) {
        unmatchedUserIds.push(u._id);
      }
    });

    // Cập nhật người dùng khớp
    if (matchedUserIds.length > 0) {
      await User.updateMany({ _id: { $in: matchedUserIds } }, { $set: { customerGroupId: group._id } });
    }

    // Gỡ người dùng không còn khớp
    if (unmatchedUserIds.length > 0) {
      await User.updateMany({ _id: { $in: unmatchedUserIds } }, { $set: { customerGroupId: null } });
    }

    group.memberCount = matchedUserIds.length;
    await group.save();

    return {
      memberCount: matchedUserIds.length,
      matchedCount: matchedUserIds.length,
      removedCount: unmatchedUserIds.length,
      message: `Đã quét và đồng bộ thành công ${matchedUserIds.length} khách hàng vào nhóm`,
    };
  }
}

module.exports = CustomerGroupService;
