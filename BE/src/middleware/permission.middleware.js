const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const { AppError } = require('../utils/AppError');

/**
 * Middleware kiểm tra quyền truy cập (Permission Guard)
 * @param {string|string[]} requiredPermissions - Mã quyền (ví dụ: 'product.edit' hoặc ['product.create', 'product.edit'])
 */
const requirePermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Yêu cầu xác thực tài khoản', 401);
      }

      console.log('>>> [PERMISSION CHECK]', {
        userId: req.user?._id,
        email: req.user?.email,
        role: req.user?.role,
        requiredPermissions
      });

      // 1. Administrator / Super Admin -> Auto Full Access tuyệt đối (*)
      const r = (req.user?.role || '').toLowerCase();
      const email = (req.user?.email || '').toLowerCase();
      if (
        r === 'administrator' ||
        r === 'admin' ||
        r.includes('admin') ||
        email.startsWith('admin')
      ) {
        return next();
      }

      // 2. Lấy chi tiết User kèm Role & Permissions
      const user = await User.findById(req.user._id)
        .populate({
          path: 'roleId',
          populate: { path: 'permissions', select: 'code' },
        })
        .populate('customPermissions', 'code');

      if (!user) {
        throw new AppError('Tài khoản không tồn tại', 401);
      }

      const userRole = (user.role || '').toLowerCase();
      const roleDocCode = (user.roleId?.code || '').toLowerCase();
      const roleDocName = (user.roleId?.name || '').toLowerCase();

      // Kiểm tra lại role code của roleDoc hoặc user role
      if (
        userRole === 'administrator' ||
        userRole === 'admin' ||
        userRole.includes('admin') ||
        roleDocCode === 'administrator' ||
        roleDocCode === 'admin' ||
        roleDocName.includes('administrator') ||
        roleDocName.includes('quản trị')
      ) {
        return next();
      }

      // Nếu user.roleId bị null nhưng user thuộc nhóm nhân sự quản trị, tìm Role theo code
      let roleDoc = user.roleId;
      if (!roleDoc && user.role && user.role !== 'user') {
        roleDoc = await Role.findOne({ code: user.role }).populate('permissions', 'code');
      }

      // 3. Gom tất cả permission codes mà user có
      const roleCodes = (roleDoc?.permissions || []).map((p) => p.code);
      const customCodes = (user.customPermissions || []).map((p) => p.code);
      const userCodes = new Set([...roleCodes, ...customCodes]);

      // 4. Kiểm tra mã quyền yêu cầu
      const neededCodes = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasAccess = neededCodes.some((code) => userCodes.has(code));

      if (!hasAccess) {
        throw new AppError(
          `Bạn không có quyền thực hiện thao tác này (Cần quyền: ${neededCodes.join(', ')})`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { requirePermission };
