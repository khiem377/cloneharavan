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

/**
 * optionalAuth — Đọc JWT nếu có, nhưng KHÔNG throw 401 nếu không có token.
 * Dùng cho các route cho phép cả Guest lẫn User (Cart, Wishlist...).
 * req.user sẽ được set nếu token hợp lệ, ngược lại req.user = null.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user    = await User.findById(decoded.id);

    req.user = (user && user.isActive) ? user : null;
    next();
  } catch {
    // Token lỗi/hết hạn → treat as guest
    req.user = null;
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };
