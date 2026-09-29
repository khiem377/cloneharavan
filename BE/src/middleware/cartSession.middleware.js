const crypto = require('crypto');
const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware định danh chủ sở hữu giỏ hàng:
 * Hỗ trợ cả 2 trường hợp:
 * 1. Khách hàng đã đăng nhập (User): Nhận diện qua Bearer Token / Cookie accessToken
 * 2. Khách hàng vãng lai (Guest): Nhận diện qua header x-session-id hoặc cookie cart_session
 */
const cartSession = (req, res, next) => {
  try {
    let userId = null;
    let sessionId = null;

    // 1. Kiểm tra JWT token nếu có
    let token = null;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        if (decoded?.id) {
          userId = decoded.id;
        }
      } catch {
        // Token không hợp lệ hoặc hết hạn -> Tiếp tục dùng sessionId cho khách vãng lai
      }
    }

    // 2. Kiểm tra Session ID
    const headerSessionId = req.headers['x-session-id'];
    const cookieSessionId = req.cookies?.cart_session;

    if (headerSessionId && typeof headerSessionId === 'string' && headerSessionId.trim()) {
      sessionId = headerSessionId.trim();
    } else if (cookieSessionId && typeof cookieSessionId === 'string' && cookieSessionId.trim()) {
      sessionId = cookieSessionId.trim();
    }

    // 3. Nếu chưa đăng nhập và chưa có sessionId -> Tự phát sinh sessionId mới
    if (!userId && !sessionId) {
      sessionId = `guest_${crypto.randomUUID()}`;
    }

    // Thiết lập cookie và header trả về để client lưu lại
    if (sessionId) {
      res.cookie('cart_session', sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      res.setHeader('x-session-id', sessionId);
    }

    req.cartOwner = {
      userId,
      sessionId,
      isAuthenticated: Boolean(userId),
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { cartSession };
