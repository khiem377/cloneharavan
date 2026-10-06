const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const {
  buildTokenResponse,
  registerUser,
  registerAdmin: registerAdminService,
  loginUser,
  loginWithGoogle,
  rotateRefreshToken,
  changeUserPassword,
  logoutUser,
  forgotPassword: forgotPasswordService,
  resetPassword: resetPasswordService,
  sendEmailVerification,
  verifyEmail: verifyEmailService,
  sendPhoneOtp,
  verifyPhoneOtp,
  COOKIE_OPTIONS,
} = require('../services/auth.service');
const { mergeSessionInteractions } = require('../services/recommendation.service');

const register = async (req, res, next) => {
  try {
    const { sessionId, ...registerData } = req.body;
    const user = await registerUser(registerData);
    const { accessToken, refreshToken } = await buildTokenResponse(user, res);

    // Merge guest session interactions vào userId mới tạo (fire-and-forget)
    if (sessionId) mergeSessionInteractions(sessionId, user._id);

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Đăng ký thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          role: user.role,
          authProvider: user.authProvider || 'local',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, sessionId, rememberMe } = req.body;
    const user = await loginUser(email, password);
    const { accessToken, refreshToken } = await buildTokenResponse(user, res, !!rememberMe);

    // Merge guest session interactions vào userId (fire-and-forget)
    if (sessionId) mergeSessionInteractions(sessionId, user._id);

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress;
    const clientUserAgent = req.headers['user-agent'] || 'Unknown';

    const populatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
        lastLoginUserAgent: clientUserAgent,
      },
      { returnDocument: 'after' }
    )
      .populate({ path: 'roleId', populate: { path: 'permissions', select: 'code name module' } })
      .populate('customPermissions', 'code name module');

    const userRole = (populatedUser.role || '').toLowerCase();
    const roleCode = (populatedUser.roleId?.code || '').toLowerCase();
    const roleName = (populatedUser.roleId?.name || '').toLowerCase();
    const userEmail = (populatedUser.email || '').toLowerCase();

    const isSuperAdmin =
      userRole === 'administrator' ||
      userRole === 'admin' ||
      userRole.includes('admin') ||
      roleCode === 'administrator' ||
      roleCode === 'admin' ||
      roleName.includes('administrator') ||
      roleName.includes('quản trị') ||
      userEmail.startsWith('admin');

    const permissions = isSuperAdmin 
      ? ['*']
      : [...new Set([
          ...(populatedUser.roleId?.permissions || []).map(p => p.code),
          ...(populatedUser.customPermissions || []).map(p => p.code)
        ])];

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: populatedUser._id,
          fullName: populatedUser.fullName,
          email: populatedUser.email,
          phone: populatedUser.phone,
          avatar: populatedUser.avatar,
          gender: populatedUser.gender,
          role: populatedUser.role,
          roleId: populatedUser.roleId,
          authProvider: populatedUser.authProvider || 'local',
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { credential, sessionId, isAdminRequest } = req.body;
    const user = await loginWithGoogle(credential, !!isAdminRequest);
    const { accessToken, refreshToken } = await buildTokenResponse(user, res, true);

    // Merge guest session interactions vào userId (fire-and-forget)
    if (sessionId) mergeSessionInteractions(sessionId, user._id);

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress;
    const clientUserAgent = req.headers['user-agent'] || 'Unknown';

    const populatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
        lastLoginUserAgent: clientUserAgent,
      },
      { returnDocument: 'after' }
    )
      .populate({ path: 'roleId', populate: { path: 'permissions', select: 'code name module' } })
      .populate('customPermissions', 'code name module');

    const userRole = (populatedUser.role || '').toLowerCase();
    const roleCode = (populatedUser.roleId?.code || '').toLowerCase();
    const roleName = (populatedUser.roleId?.name || '').toLowerCase();
    const userEmail = (populatedUser.email || '').toLowerCase();

    const isSuperAdmin =
      userRole === 'administrator' ||
      userRole === 'admin' ||
      userRole.includes('admin') ||
      roleCode === 'administrator' ||
      roleCode === 'admin' ||
      roleName.includes('administrator') ||
      roleName.includes('quản trị') ||
      userEmail.startsWith('admin');

    const permissions = isSuperAdmin 
      ? ['*']
      : [...new Set([
          ...(populatedUser.roleId?.permissions || []).map(p => p.code),
          ...(populatedUser.customPermissions || []).map(p => p.code)
        ])];

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đăng nhập Google thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: populatedUser._id,
          fullName: populatedUser.fullName,
          email: populatedUser.email,
          phone: populatedUser.phone,
          avatar: populatedUser.avatar,
          gender: populatedUser.gender,
          role: populatedUser.role,
          roleId: populatedUser.roleId,
          authProvider: populatedUser.authProvider || 'google',
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};



const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw new AppError('Không tìm thấy refresh token', 401);

    const user = await rotateRefreshToken(token);
    const { accessToken, refreshToken: newRefreshToken } = await buildTokenResponse(user, res);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Làm mới token thành công',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const populatedUser = await User.findById(req.user._id)
      .populate({ path: 'roleId', populate: { path: 'permissions', select: 'code name module' } })
      .populate('customPermissions', 'code name module');

    if (!populatedUser) throw new AppError('Không tìm thấy người dùng', 404);

    const userRole = (populatedUser.role || '').toLowerCase();
    const roleCode = (populatedUser.roleId?.code || '').toLowerCase();
    const roleName = (populatedUser.roleId?.name || '').toLowerCase();
    const userEmail = (populatedUser.email || '').toLowerCase();

    const isSuperAdmin =
      userRole === 'administrator' ||
      userRole === 'admin' ||
      userRole.includes('admin') ||
      roleCode === 'administrator' ||
      roleCode === 'admin' ||
      roleName.includes('administrator') ||
      roleName.includes('quản trị') ||
      userEmail.startsWith('admin');

    const permissions = isSuperAdmin 
      ? ['*']
      : [...new Set([
          ...(populatedUser.roleId?.permissions || []).map(p => p.code),
          ...(populatedUser.customPermissions || []).map(p => p.code)
        ])];

    const userObj = populatedUser.toObject();
    userObj.permissions = permissions;

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy thông tin thành công',
      data: { user: userObj },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await changeUserPassword(req.user._id, currentPassword, newPassword);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await logoutUser(req.user._id);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);

    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      ...(result.resetToken && { data: { resetToken: result.resetToken } }),
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    if (!token) throw new AppError('Token đặt lại mật khẩu là bắt buộc', 400);

    const { password } = req.body;
    await resetPasswordService(token, password);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới',
    });
  } catch (error) {
    next(error);
  }
};

const sendVerifyEmail = async (req, res, next) => {
  try {
    const result = await sendEmailVerification(req.user._id);

    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      ...(result.verifyToken && { data: { verifyToken: result.verifyToken } }),
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    if (!token) throw new AppError('Token xác minh email là bắt buộc', 400);

    await verifyEmailService(token);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Xác minh email thành công',
    });
  } catch (error) {
    next(error);
  }
};

const sendVerifyPhone = async (req, res, next) => {
  try {
    const result = await sendPhoneOtp(req.user._id);

    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      ...(result.otp && { data: { otp: result.otp } }),
    });
  } catch (error) {
    next(error);
  }
};

const verifyPhone = async (req, res, next) => {
  try {
    const { otp } = req.body;
    await verifyPhoneOtp(req.user._id, otp);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Xác minh số điện thoại thành công',
    });
  } catch (error) {
    next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const user = await registerAdminService(req.body);
    const { accessToken, refreshToken } = await buildTokenResponse(user, res);

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Tạo tài khoản admin thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const sseService = require('../services/sse.service');
const { verifyAccessToken, verifyRefreshToken } = require('../utils/jwt');

const sessionStream = async (req, res, next) => {
  try {
    let token = req.query.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    const refreshToken = req.query.refreshToken || req.cookies?.refreshToken;

    let userId = null;
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        userId = decoded.id;
      } catch (err) {
        // Access token expired, attempt fallback with refreshToken if available
        if (refreshToken) {
          try {
            const decodedRefresh = verifyRefreshToken(refreshToken);
            userId = decodedRefresh.id;
          } catch (_) {}
        }
      }
    } else if (refreshToken) {
      try {
        const decodedRefresh = verifyRefreshToken(refreshToken);
        userId = decodedRefresh.id;
      } catch (_) {}
    }

    if (!userId) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'close');
      res.write(`data: ${JSON.stringify({ type: 'UNAUTHORIZED' })}\n\n`);
      return res.end();
    }

    const user = await User.findById(userId);

    // Chuẩn bị headers SSE
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    // Nếu tài khoản không tồn tại hoặc đã bị vô hiệu hóa: STREAM NGAY lệnh FORCE_LOGOUT!
    if (!user || !user.isActive) {
      res.write(
        `data: ${JSON.stringify({
          type: 'FORCE_LOGOUT',
          reason: 'Tài khoản của bạn đã bị vô hiệu hóa bởi Quản trị viên.',
          timestamp: Date.now(),
        })}\n\n`
      );
      return res.end();
    }

    sseService.addClient(user._id, res, req);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerAdmin,
  login,
  googleLogin,
  refreshToken,
  getProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  sendVerifyEmail,
  verifyEmail,
  sendVerifyPhone,
  verifyPhone,
  sessionStream,
};

