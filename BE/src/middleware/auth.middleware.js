const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');


const protect = async (req, res, next) => {
  try {
    let token;


    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Not authorized, no token provided', 401);
    }


    const decoded = verifyAccessToken(token);


    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User belonging to this token no longer exists', 401);
    if (!user.isActive) throw new AppError('Account has been deactivated', 403);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    // Nếu kiểm tra 'admin' hoặc 'administrator', cho phép tất cả tài khoản thuộc nhóm quản trị/nhân viên (role khác 'user')
    const checkingAdmin = roles.includes('admin') || roles.includes('administrator');
    const isStaffOrAdmin = req.user && req.user.role !== 'user';

    if (checkingAdmin && isStaffOrAdmin) {
      return next();
    }

    if (!roles.includes(req.user?.role)) {
      return next(
        new AppError(
          `Tài khoản vai trò '${req.user?.role}' không có quyền truy cập API này`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
