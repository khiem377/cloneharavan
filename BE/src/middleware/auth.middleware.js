const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');

/**
 * Protect routes — đọc token từ Bearer header HOẶC HTTP-only cookie
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Ưu tiên Bearer header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback về cookie (nếu client là browser)
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Not authorized, no token provided', 401);
    }

    // Verify access token
    const decoded = verifyAccessToken(token);

    // Gắn user vào request
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User belonging to this token no longer exists', 401);
    if (!user.isActive) throw new AppError('Account has been deactivated', 403);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize specific roles
 * @param  {...string} roles - Danh sách role được phép
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
