const User = require('../models/user.model');
const Permission = require('../models/permission.model');
const { AppError } = require('../utils/AppError');
const {
  buildTokenResponse,
  registerUser,
  registerAdmin: registerAdminService,
  loginUser,
  loginWithGoogle,
  getTikTokAuthUrl,
  loginWithTikTok,
  getZaloAuthUrl,
  loginWithZalo,
  linkGoogleAccount,
  linkZaloAccount,
  linkTikTokAccount,
  unlinkSocialAccount,
  getLinkedProviders,
  rotateRefreshToken,
  changeUserPassword,
  logoutUser,
  recordUserSession,
  getUserSessions,
  logoutUserSession,
  logoutOtherSessions,
  setUserPassword,
  forgotPassword: forgotPasswordService,
  resetPassword: resetPasswordService,
  sendEmailVerification,
  verifyEmail: verifyEmailService,
  sendPhoneOtp,
  verifyPhoneOtp,
  COOKIE_OPTIONS,
  requestAdminLoginOtp,
  verifyAdminLoginOtp,
  generatePasskeyLoginOptions,
  verifyPasskeyLogin,
  generatePasskeyRegisterOptions,
  verifyPasskeyRegister,
  deletePasskey,
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

const getTikTokAuthUrlController = async (req, res, next) => {
  try {
    const { state, redirectUri, codeChallenge } = req.query;
    const authData = getTikTokAuthUrl(state, redirectUri, codeChallenge);
    res.json({
      status: 'success',
      statusCode: 200,
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

const tiktokLogin = async (req, res, next) => {
  try {
    const { code, redirectUri, codeVerifier, sessionId, isAdminRequest } = req.body;
    const user = await loginWithTikTok(code, redirectUri, codeVerifier, !!isAdminRequest);
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
      message: 'Đăng nhập TikTok thành công',
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
          authProvider: populatedUser.authProvider || 'tiktok',
          permissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getZaloAuthUrlController = async (req, res, next) => {
  try {
    const { state, redirectUri, codeChallenge } = req.query;
    const authData = getZaloAuthUrl(state, redirectUri, codeChallenge);
    res.json({
      status: 'success',
      statusCode: 200,
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

const zaloLogin = async (req, res, next) => {
  try {
    const { code, redirectUri, codeVerifier, sessionId, isAdminRequest } = req.body;
    const user = await loginWithZalo(code, redirectUri, codeVerifier, !!isAdminRequest);
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
      message: 'Đăng nhập Zalo thành công',
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
          authProvider: populatedUser.authProvider || 'zalo',
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
      .select('+password')
      .populate({ path: 'roleId', populate: { path: 'permissions', select: 'code name module' } })
      .populate('customPermissions', 'code name module');

    if (!populatedUser) throw new AppError('Không tìm thấy người dùng', 404);

    const hasPassword = !!populatedUser.password;

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
    delete userObj.password;
    userObj.hasPassword = hasPassword;
    userObj.permissions = permissions;

    // Ghi nhận session nền không chặn
    recordUserSession(req.user._id, req).catch(() => {});

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

const getMyPermissions = async (req, res, next) => {
  try {
    const populatedUser = await User.findById(req.user._id)
      .populate({
        path: 'roleId',
        populate: {
          path: 'permissions',
          match: { isActive: true },
          select: 'code name module description',
        },
      })
      .populate({
        path: 'customPermissions',
        match: { isActive: true },
        select: 'code name module description',
      });

    if (!populatedUser) throw new AppError('Không tìm thấy người dùng', 404);

    const userRole = (populatedUser.role || '').toLowerCase();
    const roleDoc = populatedUser.roleId;
    const roleCode = (roleDoc?.code || '').toLowerCase();
    const roleName = (roleDoc?.name || '').toLowerCase();
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

    let permissionDocs = [];

    if (isSuperAdmin) {
      permissionDocs = await Permission.find({ isActive: true }).sort({ module: 1, name: 1 });
    } else {
      const rolePerms = Array.isArray(roleDoc?.permissions) ? roleDoc.permissions : [];
      const customPerms = Array.isArray(populatedUser.customPermissions) ? populatedUser.customPermissions : [];

      const permMap = new Map();
      [...rolePerms, ...customPerms].forEach((p) => {
        if (p && p.code) {
          permMap.set(p.code, {
            _id: p._id,
            name: p.name,
            code: p.code,
            module: p.module || 'Khác',
            description: p.description || '',
          });
        }
      });

      permissionDocs = Array.from(permMap.values()).sort((a, b) => {
        const modCompare = (a.module || '').localeCompare(b.module || '');
        if (modCompare !== 0) return modCompare;
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    // Gom nhóm permissions theo module
    const grouped = permissionDocs.reduce((acc, p) => {
      const mod = p.module || 'Khác';
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    }, {});

    res.json({
      status: 'success',
      statusCode: 200,
      data: {
        isSuperAdmin,
        role: {
          name: roleDoc?.name || (isSuperAdmin ? 'Quản trị viên tối cao' : 'Nhân viên'),
          code: roleDoc?.code || populatedUser.role || 'staff',
        },
        permissions: permissionDocs.map((p) => p.code),
        permissionDetails: permissionDocs,
        grouped,
        count: permissionDocs.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const setPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('Mật khẩu mới phải có tối thiểu 6 ký tự', 400);
    }

    const result = await setUserPassword(req.user._id, newPassword);

    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, logoutOtherDevices } = req.body;
    const result = await changeUserPassword(
      req.user._id,
      currentPassword,
      newPassword,
      !!logoutOtherDevices,
      req
    );

    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message || 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    next(error);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const currentSessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const clientUA = req.headers['user-agent'] || '';
    const result = await getUserSessions(req.user._id, currentSessionId, clientIp, clientUA);

    res.json({
      status: 'success',
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) throw new AppError('Mã phiên đăng nhập là bắt buộc', 400);

    const result = await logoutUserSession(req.user._id, sessionId);

    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const logoutOtherSessionsController = async (req, res, next) => {
  try {
    const currentSessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const clientUA = req.headers['user-agent'] || '';
    const result = await logoutOtherSessions(req.user._id, currentSessionId, clientIp, clientUA);

    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
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

const linkGoogle = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const result = await linkGoogleAccount(req.user._id, credential);
    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const linkZalo = async (req, res, next) => {
  try {
    const { code, redirectUri, codeVerifier } = req.body;
    const result = await linkZaloAccount(req.user._id, code, redirectUri, codeVerifier);
    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const linkTikTok = async (req, res, next) => {
  try {
    const { code, redirectUri, codeVerifier } = req.body;
    const result = await linkTikTokAccount(req.user._id, code, redirectUri, codeVerifier);
    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const unlinkSocial = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const result = await unlinkSocialAccount(req.user._id, provider);
    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getLinkedAccounts = async (req, res, next) => {
  try {
    const result = await getLinkedProviders(req.user._id);
    res.json({
      status: 'success',
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * ADMIN EXCLUSIVE CONTROLLERS: EMAIL OTP & PASSKEY
 * =========================================================
 */

const populateAdminAndBuildResponse = async (user, req, res, rememberMe, sessionId) => {
  const { accessToken, refreshToken } = await buildTokenResponse(user, res, !!rememberMe);

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
        ...(populatedUser.roleId?.permissions || []).map((p) => p.code),
        ...(populatedUser.customPermissions || []).map((p) => p.code),
      ])];

  return {
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
  };
};

const requestAdminOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await requestAdminLoginOtp(email);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Mã xác thực đã được gửi tới email của bạn!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyAdminOtp = async (req, res, next) => {
  try {
    const { email, otp, rememberMe, sessionId } = req.body;
    const user = await verifyAdminLoginOtp(email, otp);
    const authData = await populateAdminAndBuildResponse(user, req, res, rememberMe, sessionId);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Xác thực OTP thành công!',
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

const resendAdminOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await requestAdminLoginOtp(email);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đã gửi lại mã xác thực tới email của bạn!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPasskeyLoginOptions = async (req, res, next) => {
  try {
    const { email } = req.body;
    const options = await generatePasskeyLoginOptions(email, req);
    res.json({
      status: 'success',
      statusCode: 200,
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPasskeyLoginController = async (req, res, next) => {
  try {
    const { email, response, credentialId, clientDataJSON, authenticatorData, signature, rememberMe, sessionId } = req.body;
    const user = await verifyPasskeyLogin({
      email,
      response,
      credentialId,
      clientDataJSON,
      authenticatorData,
      signature,
      req,
    });
    const authData = await populateAdminAndBuildResponse(user, req, res, rememberMe, sessionId);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đăng nhập bằng Passkey thành công!',
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

const getPasskeyRegisterOptions = async (req, res, next) => {
  try {
    const options = await generatePasskeyRegisterOptions(req.user._id, req);
    res.json({
      status: 'success',
      statusCode: 200,
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPasskeyRegisterController = async (req, res, next) => {
  try {
    const { response, deviceName, credentialId, rawId, clientDataJSON, attestationObject } = req.body;
    const result = await verifyPasskeyRegister(req.user._id, {
      response,
      deviceName,
      credentialId,
      rawId,
      clientDataJSON,
      attestationObject,
      req,
    });
    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deletePasskeyController = async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    const result = await deletePasskey(req.user._id, credentialId || req.query.credentialId);
    res.json({
      status: 'success',
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerAdmin,
  login,
  googleLogin,
  getTikTokAuthUrl: getTikTokAuthUrlController,
  tiktokLogin,
  getZaloAuthUrl: getZaloAuthUrlController,
  zaloLogin,
  linkGoogle,
  linkZalo,
  linkTikTok,
  unlinkSocial,
  getLinkedAccounts,
  refreshToken,
  getProfile,
  getMyPermissions,
  changePassword,
  setPassword,
  getSessions,
  logoutSession,
  logoutOtherSessions: logoutOtherSessionsController,
  logout,
  forgotPassword,
  resetPassword,
  sendVerifyEmail,
  verifyEmail,
  sendVerifyPhone,
  verifyPhone,
  sessionStream,
  // Admin exclusive OTP & Passkey
  requestAdminOtp,
  verifyAdminOtp,
  resendAdminOtp,
  getPasskeyLoginOptions,
  verifyPasskeyLogin: verifyPasskeyLoginController,
  getPasskeyRegisterOptions,
  verifyPasskeyRegister: verifyPasskeyRegisterController,
  deletePasskey: deletePasskeyController,
};




