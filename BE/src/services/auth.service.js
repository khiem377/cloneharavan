const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendAdminLoginOtpEmail,
} = require('./email.service');
const { parseDeviceInfo, lookupGeoLocation } = require('../utils/deviceParser');
const sseService = require('./sse.service');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const { isoBase64URL } = require('@simplewebauthn/server/helpers');

const COOKIE_OPTIONS_PERSISTENT = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày - persistent
};

// Không có maxAge = session cookie (xóa khi đóng browser)
const COOKIE_OPTIONS_SESSION = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
};

// Legacy alias giữ cho các chỗ khác import
const COOKIE_OPTIONS = COOKIE_OPTIONS_PERSISTENT;

const buildTokenResponse = async (user, res, rememberMe = false) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, { refreshToken });

  const cookieOpts = rememberMe ? COOKIE_OPTIONS_PERSISTENT : COOKIE_OPTIONS_SESSION;
  res.cookie('refreshToken', refreshToken, cookieOpts);

  return { accessToken, refreshToken };
};

const registerUser = async (data) => {
  const emailTaken = await User.findOne({ email: data.email });
  if (emailTaken) throw new AppError('Email đã được sử dụng', 400);

  const phoneTaken = await User.findOne({ phone: data.phone });
  if (phoneTaken) throw new AppError('Số điện thoại đã được sử dụng', 400);

  return User.create(data);
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  const isValid = user && (await user.matchPassword(password));

  if (!isValid) throw new AppError('Email hoặc mật khẩu không chính xác', 401);
  if (!user.isActive) throw new AppError('Tài khoản đã bị vô hiệu hóa', 403);

  return user;
};

const rotateRefreshToken = async (token) => {
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token không hợp lệ hoặc đã hết hạn', 401);
  }

  return user;
};

const normalizeIp = (rawIp) => {
  let ip = (rawIp || '127.0.0.1').replace('::ffff:', '').trim();
  if (ip === '::1' || ip === 'localhost') return '127.0.0.1';
  return ip;
};

/**
 * Ghi nhận hoặc cập nhật phiên đăng nhập (Device/Session) của user
 */
const recordUserSession = async (userId, req, explicitSessionId = null) => {
  try {
    const rawIp =
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.ip ||
      req?.socket?.remoteAddress ||
      '127.0.0.1';
    const clientIp = normalizeIp(rawIp);
    const clientUA = req?.headers?.['user-agent'] || 'Unknown';
    const sessionId =
      explicitSessionId ||
      req?.headers?.['x-session-id'] ||
      req?.cookies?.sessionId ||
      crypto.randomUUID();

    const deviceInfo = parseDeviceInfo(clientUA, clientIp);

    const user = await User.findById(userId);
    if (!user) return sessionId;

    if (!Array.isArray(user.sessions)) {
      user.sessions = [];
    }

    // Tìm xem session này đã tồn tại chưa
    const existingIndex = user.sessions.findIndex(
      (s) => s.sessionId === sessionId || (normalizeIp(s.ip) === deviceInfo.ip && s.userAgent === clientUA)
    );

    if (existingIndex > -1) {
      user.sessions[existingIndex].lastActiveAt = new Date();
      user.sessions[existingIndex].ip = deviceInfo.ip;
      user.sessions[existingIndex].deviceName = deviceInfo.deviceName;
      user.sessions[existingIndex].deviceType = deviceInfo.deviceType;
      user.sessions[existingIndex].browser = deviceInfo.browser;
      user.sessions[existingIndex].os = deviceInfo.os;
      user.sessions[existingIndex].sessionId = sessionId;
    } else {
      user.sessions.unshift({
        sessionId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip: deviceInfo.ip,
        userAgent: clientUA,
        lastActiveAt: new Date(),
        createdAt: new Date(),
      });
    }

    // Giữ tối đa 20 phiên gần nhất
    if (user.sessions.length > 20) {
      user.sessions = user.sessions.slice(0, 20);
    }

    await user.save({ validateBeforeSave: false });
    return sessionId;
  } catch (err) {
    console.error('Lỗi khi lưu phiên đăng nhập:', err);
    return explicitSessionId;
  }
};

/**
 * Lấy danh sách các phiên đăng nhập đang hoạt động của user
 */
const getUserSessions = async (userId, currentSessionId, clientIp, clientUA) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  const cleanIp = normalizeIp(clientIp);
  const dev = parseDeviceInfo(clientUA, cleanIp);
  const loc = await lookupGeoLocation(cleanIp);
  const activeSessionId = currentSessionId || crypto.randomUUID();

  let userSessions = user.sessions || [];
  let existingIndex = userSessions.findIndex(
    (s) =>
      (currentSessionId && s.sessionId === currentSessionId) ||
      (normalizeIp(s.ip) === cleanIp && s.userAgent === clientUA)
  );

  if (existingIndex >= 0) {
    userSessions[existingIndex].lastActiveAt = new Date();
    userSessions[existingIndex].location = loc || userSessions[existingIndex].location || 'Hồ Chí Minh, Việt Nam';
    userSessions[existingIndex].browser = dev.browser;
    userSessions[existingIndex].os = dev.os;
    userSessions[existingIndex].deviceName = dev.deviceName;
  } else {
    userSessions.push({
      sessionId: activeSessionId,
      deviceName: dev.deviceName,
      deviceType: dev.deviceType,
      browser: dev.browser,
      os: dev.os,
      ip: cleanIp,
      location: loc || 'Hồ Chí Minh, Việt Nam',
      userAgent: clientUA,
      lastActiveAt: new Date(),
      createdAt: new Date(),
    });
  }

  user.sessions = userSessions;
  await user.save({ validateBeforeSave: false });

  let sessions = user.sessions.map((s) => {
    const sObj = s.toObject ? s.toObject() : { ...s };
    const isMatched =
      (currentSessionId && sObj.sessionId === currentSessionId) ||
      (sObj.ip === cleanIp && sObj.userAgent === clientUA) ||
      sObj.sessionId === activeSessionId;
    return {
      ...sObj,
      isCurrent: !!isMatched,
    };
  });

  const hasCurrent = sessions.some((s) => s.isCurrent);
  if (!hasCurrent && sessions.length > 0) {
    sessions[0].isCurrent = true;
  }

  // Đưa session hiện tại lên đầu tiên
  sessions.sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0));

  return {
    sessions,
    totalSessions: sessions.length,
  };
};

/**
 * Đăng xuất khỏi một phiên / thiết bị cụ thể
 */
const logoutUserSession = async (userId, targetSessionId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  user.sessions = (user.sessions || []).filter((s) => s.sessionId !== targetSessionId);
  await user.save({ validateBeforeSave: false });

  return { message: 'Đã đăng xuất khỏi thiết bị thành công' };
};

/**
 * Đăng xuất khỏi tất cả các thiết bị khác (chỉ giữ lại phiên hiện tại)
 */
const logoutOtherSessions = async (userId, currentSessionId, clientIp, clientUA) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  const cleanIp = (clientIp || '').replace('::ffff:', '');

  const currentSession = (user.sessions || []).find(
    (s) =>
      (currentSessionId && s.sessionId === currentSessionId) ||
      (s.ip === cleanIp && s.userAgent === clientUA)
  );

  if (currentSession) {
    user.sessions = [currentSession];
  } else {
    const dev = parseDeviceInfo(clientUA, clientIp);
    user.sessions = [
      {
        sessionId: currentSessionId || crypto.randomUUID(),
        deviceName: dev.deviceName,
        deviceType: dev.deviceType,
        browser: dev.browser,
        os: dev.os,
        ip: dev.ip,
        userAgent: clientUA,
        lastActiveAt: new Date(),
        createdAt: new Date(),
      },
    ];
  }

  await user.save({ validateBeforeSave: false });

  // Gửi thông báo SSE tới các thiết bị khác để reload/logout
  try {
    sseService.sendToUser(userId, {
      type: 'OTHER_SESSIONS_LOGGED_OUT',
      message: 'Bạn đã đăng xuất khỏi các thiết bị khác.',
      timestamp: Date.now(),
    });
  } catch (_) {}

  return { message: 'Đã đăng xuất khỏi tất cả các thiết bị khác thành công' };
};

/**
 * Thiết lập mật khẩu lần đầu (cho tài khoản mạng xã hội chưa có mật khẩu)
 */
const setUserPassword = async (userId, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  if (user.password) {
    throw new AppError(
      'Tài khoản đã được thiết lập mật khẩu. Vui lòng sử dụng tính năng Đổi mật khẩu',
      400
    );
  }

  user.password = newPassword;
  await user.save();

  return {
    message: 'Tạo mật khẩu thành công! Bạn có thể sử dụng mật khẩu này để đăng nhập trực tiếp.',
  };
};

/**
 * Đổi mật khẩu tài khoản
 */
const changeUserPassword = async (userId, currentPassword, newPassword, logoutOthers = false, req = null) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  if (!user.password) {
    throw new AppError(
      'Tài khoản chưa được thiết lập mật khẩu. Vui lòng sử dụng tính năng Tạo mật khẩu mới',
      400
    );
  }

  const isValid = await user.matchPassword(currentPassword);
  if (!isValid) throw new AppError('Mật khẩu hiện tại không chính xác', 401);

  user.password = newPassword;
  await user.save();

  if (logoutOthers && req) {
    const currentSessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const clientUA = req.headers['user-agent'] || '';
    await logoutOtherSessions(userId, currentSessionId, clientIp, clientUA);
  }

  return { message: 'Đổi mật khẩu thành công!' };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

/**
 * Quên mật khẩu - Tạo reset token và gửi email
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Không tìm thấy tài khoản với email này', 404);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendResetPasswordEmail(user.email, resetToken);
    return {
      message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Gặp lỗi khi gửi email đặt lại mật khẩu. Vui lòng thử lại sau', 500);
  }
};

/**
 * Đặt lại mật khẩu mới qua token
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return user;
};

/**
 * Gửi email xác minh tài khoản
 */
const sendEmailVerification = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);
  if (user.isEmailVerified) throw new AppError('Email đã được xác minh trước đó', 400);

  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user.email, verifyToken);
    return {
      message: 'Email xác minh đã được gửi',
      verifyToken: process.env.NODE_ENV === 'development' ? verifyToken : undefined,
    };
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Gặp lỗi khi gửi email xác minh', 500);
  }
};

/**
 * Xác minh tài khoản email qua token
 */
const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token xác minh không hợp lệ hoặc đã hết hạn', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Gửi mã OTP xác minh số điện thoại
 */
const sendPhoneOtp = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);
  if (user.isPhoneVerified) throw new AppError('Số điện thoại đã được xác minh trước đó', 400);

  const otp = user.createPhoneOtp();
  await user.save({ validateBeforeSave: false });

  console.log(`\n================== [SMS OTP SERVICE] ==================`);
  console.log(`Gửi mã OTP [${otp}] tới số điện thoại: ${user.phone}`);
  console.log(`Hiệu lực: 5 phút`);
  console.log('========================================================\n');

  return {
    message: `Đã gửi mã OTP tới số điện thoại ${user.phone}`,
    otp: process.env.NODE_ENV === 'development' ? otp : undefined,
  };
};

/**
 * Xác minh mã OTP số điện thoại
 */
const verifyPhoneOtp = async (userId, otp) => {
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findById(userId).select('+phoneOtp +phoneOtpExpires');
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  if (
    !user.phoneOtp ||
    user.phoneOtp !== hashedOtp ||
    !user.phoneOtpExpires ||
    user.phoneOtpExpires < Date.now()
  ) {
    throw new AppError('Mã OTP không chính xác hoặc đã hết hạn', 400);
  }

  user.isPhoneVerified = true;
  user.phoneOtp = undefined;
  user.phoneOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Đăng ký tài khoản Admin (qua secret key hoặc khi chưa có admin nào trong DB)
 */
const registerAdmin = async (data) => {
  const configuredSecret = process.env.ADMIN_SECRET_KEY || 'admin_secret_key_haravan_2026';

  const existingAdminCount = await User.countDocuments({ role: 'admin' });
  if (existingAdminCount > 0) {
    if (!data.adminSecretKey || data.adminSecretKey !== configuredSecret) {
      throw new AppError('Mã bí mật tạo Admin (adminSecretKey) không chính xác hoặc bị thiếu', 403);
    }
  }

  const emailTaken = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (emailTaken) throw new AppError('Email đã được sử dụng', 400);

  const phoneTaken = await User.findOne({ phone: data.phone.trim() });
  if (phoneTaken) throw new AppError('Số điện thoại đã được sử dụng', 400);

  const newAdmin = await User.create({
    fullName: data.fullName.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
    phone: data.phone.trim(),
    gender: data.gender,
    dateOfBirth: data.dateOfBirth || null,
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  return newAdmin;
};

/**
 * Xác thực và Đăng nhập / Đăng ký bằng Google OAuth ID Token (Credential)
 */
const loginWithGoogle = async (credential, isAdminRequest = false) => {
  if (!credential) {
    throw new AppError('Google credential (id_token) là bắt buộc', 400);
  }

  let googlePayload;
  try {
    const googleRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { timeout: 8000 }
    );
    googlePayload = googleRes.data;
  } catch (err) {
    throw new AppError(
      'Mã xác thực Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại!',
      401
    );
  }

  const { sub: googleId, email, name, picture, email_verified } = googlePayload;
  if (!email) {
    throw new AppError('Không thể lấy thông tin email từ tài khoản Google', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Tìm user theo googleId hoặc email
  let user = await User.findOne({
    $or: [{ googleId }, { email: normalizedEmail }],
  });

  if (user) {
    if (!user.isActive) {
      throw new AppError('Tài khoản đã bị vô hiệu hóa bởi Quản trị viên', 403);
    }

    // Cập nhật googleId nếu chưa có
    let hasChanges = false;
    if (!user.googleId) {
      user.googleId = googleId;
      hasChanges = true;
    }
    // Chỉ gán avatar từ Google nếu tài khoản chưa từng có avatar
    if (picture && !user.avatar?.url) {
      user.avatar = { url: picture };
      hasChanges = true;
    }
    if (!user.isEmailVerified && (email_verified === 'true' || email_verified === true)) {
      user.isEmailVerified = true;
      user.isAccountActivated = true;
      hasChanges = true;
    }

    if (hasChanges) {
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // Nếu là Admin request mà tài khoản chưa từng được tạo trước đó thì chặn
    if (isAdminRequest) {
      throw new AppError(
        'Tài khoản Google này chưa được cấp quyền quản trị trên hệ thống. Vui lòng liên hệ Super Admin!',
        403
      );
    }

    // Tạo tài khoản mới cho Khách hàng Client
    user = await User.create({
      fullName: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      googleId,
      authProvider: 'google',
      avatar: picture ? { url: picture } : undefined,
      isEmailVerified: email_verified === 'true' || email_verified === true,
      isAccountActivated: true,
      gender: 'other',
      role: 'user',
      isActive: true,
    });
  }

  // Kiểm tra quyền nếu là Admin request
  if (isAdminRequest && user.role === 'user') {
    throw new AppError('Tài khoản của bạn không có quyền truy cập trang quản trị', 403);
  }

  return user;
};

/**
 * Helper sinh mã PKCE Code Verifier & Challenge chuẩn RFC 7636 (43 ký tự [A-Za-z0-9])
 * Tương thích 100% với yêu cầu bảo mật của Zalo (-5010) và TikTok OAuth
 */
const generatePkcePair = (length = 43) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let verifier = '';
  for (let i = 0; i < length; i++) {
    verifier += chars[bytes[i] % chars.length];
  }
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
};

/**
 * Lấy URL Đăng nhập / Xác thực OAuth 2.0 TikTok (Kèm PKCE code_challenge)
 */
const getTikTokAuthUrl = (state = 'tiktok_auth', redirectUri = null, clientCodeChallenge = null) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    throw new AppError('TIKTOK_CLIENT_KEY chưa được cấu hình trên server', 500);
  }

  const targetRedirect =
    redirectUri ||
    process.env.TIKTOK_REDIRECT_URI ||
    'http://localhost:3000/auth/tiktok/callback';

  // Sinh PKCE Code Verifier & Challenge nếu chưa có
  let codeVerifier = null;
  let codeChallenge = clientCodeChallenge;

  if (!codeChallenge) {
    const pkce = generatePkcePair(43);
    codeVerifier = pkce.verifier;
    codeChallenge = pkce.challenge;
  }

  const scope = 'user.info.basic,user.info.profile';
  const encodedRedirect = encodeURIComponent(targetRedirect);
  const encodedScope = encodeURIComponent(scope);
  const encodedState = encodeURIComponent(state);

  const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${encodedScope}&response_type=code&redirect_uri=${encodedRedirect}&state=${encodedState}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  return {
    url,
    codeVerifier,
    codeChallenge,
    state,
  };
};

/**
 * Xác thực mã Code từ TikTok OAuth 2.0 và Đăng nhập / Tạo tài khoản
 */
const loginWithTikTok = async (code, redirectUri = null, codeVerifier = null, isAdminRequest = false) => {
  if (!code) {
    throw new AppError('Mã xác thực (code) từ TikTok là bắt buộc', 400);
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const targetRedirectUri =
    redirectUri ||
    process.env.TIKTOK_REDIRECT_URI ||
    'http://localhost:3000/auth/tiktok/callback';

  if (!clientKey || !clientSecret) {
    throw new AppError('Cấu hình TikTok OAuth (Client Key/Secret) chưa đầy đủ trên server', 500);
  }

  // 1. Đổi Code lấy Access Token từ TikTok API (kèm PKCE code_verifier)
  const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
  const params = new URLSearchParams();
  params.append('client_key', clientKey);
  params.append('client_secret', clientSecret);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', targetRedirectUri);
  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  let tokenRes;
  try {
    tokenRes = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000,
    });
  } catch (err) {
    console.error('TikTok OAuth Token Error:', err.response?.data || err.message);
    const errorMsg =
      err.response?.data?.error_description ||
      err.response?.data?.error?.message ||
      'Không thể xác thực mã ủy quyền với TikTok. Vui lòng thử lại!';
    throw new AppError(errorMsg, 400);
  }

  const tokenData = tokenRes.data?.data || tokenRes.data;
  const accessToken = tokenData?.access_token;
  const openId = tokenData?.open_id;

  if (!accessToken || !openId) {
    const errorMsg =
      tokenRes.data?.error?.message ||
      tokenRes.data?.message ||
      'Không thể nhận access token từ TikTok';
    throw new AppError(errorMsg, 400);
  }

  // 2. Lấy thông tin người dùng từ TikTok User Info API
  let userInfo = {};
  try {
    const userRes = await axios.get(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,avatar_url_100,avatar_large_url,display_name,bio_description,profile_deep_link,is_verified,username',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );
    userInfo = userRes.data?.data?.user || userRes.data?.data || {};
  } catch (err) {
    console.warn('Lỗi khi lấy thông tin chi tiết TikTok User:', err.message);
  }

  const tiktokOpenId = openId || userInfo?.open_id;
  const displayName = userInfo?.display_name || userInfo?.username || 'TikTok User';
  const avatarUrl = userInfo?.avatar_large_url || userInfo?.avatar_url || userInfo?.avatar_url_100 || null;
  const syntheticEmail = `tiktok_${tiktokOpenId.toLowerCase()}@tiktok.user`;

  // 3. Tìm User theo tiktokId hoặc syntheticEmail
  let user = await User.findOne({
    $or: [{ tiktokId: tiktokOpenId }, { email: syntheticEmail }],
  });

  if (user) {
    if (!user.isActive) {
      throw new AppError('Tài khoản đã bị vô hiệu hóa bởi Quản trị viên', 403);
    }

    let hasChanges = false;
    if (!user.tiktokId) {
      user.tiktokId = tiktokOpenId;
      hasChanges = true;
    }
    if (userInfo?.username && user.tiktokUsername !== userInfo.username) {
      user.tiktokUsername = userInfo.username;
      hasChanges = true;
    }
    // Chỉ gán avatar từ TikTok nếu tài khoản chưa có avatar
    if (avatarUrl && !user.avatar?.url) {
      user.avatar = { url: avatarUrl };
      hasChanges = true;
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.isAccountActivated = true;
      hasChanges = true;
    }

    if (hasChanges) {
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // Nếu là Admin request mà tài khoản chưa từng được tạo trước đó thì chặn
    if (isAdminRequest) {
      throw new AppError(
        'Tài khoản TikTok này chưa được cấp quyền quản trị trên hệ thống. Vui lòng liên hệ Super Admin!',
        403
      );
    }

    // Tạo tài khoản mới cho Khách hàng Client
    user = await User.create({
      fullName: displayName,
      email: syntheticEmail,
      tiktokId: tiktokOpenId,
      tiktokUsername: userInfo?.username || null,
      authProvider: 'tiktok',
      avatar: avatarUrl ? { url: avatarUrl } : undefined,
      isEmailVerified: true,
      isAccountActivated: true,
      gender: 'other',
      role: 'user',
      isActive: true,
    });
  }

  // Kiểm tra quyền nếu là Admin request
  if (isAdminRequest && user.role === 'user') {
    throw new AppError('Tài khoản của bạn không có quyền truy cập trang quản trị', 403);
  }

  return user;
};

/**
 * Lấy URL Đăng nhập / Xác thực OAuth 2.0 Zalo (Kèm PKCE code_challenge)
 */
const getZaloAuthUrl = (state = 'zalo_auth', redirectUri = null, clientCodeChallenge = null) => {
  const appId = process.env.ZALO_APP_ID;
  if (!appId) {
    throw new AppError('ZALO_APP_ID chưa được cấu hình trên server. Vui lòng cấu hình file .env!', 500);
  }

  const targetRedirect =
    redirectUri ||
    process.env.ZALO_REDIRECT_URI ||
    'http://localhost:3000/auth/zalo/callback';

  // Sinh PKCE Code Verifier & Challenge nếu chưa có
  let codeVerifier = null;
  let codeChallenge = clientCodeChallenge;

  if (!codeChallenge) {
    const pkce = generatePkcePair(43);
    codeVerifier = pkce.verifier;
    codeChallenge = pkce.challenge;
  }

  const encodedRedirect = encodeURIComponent(targetRedirect);
  const encodedState = encodeURIComponent(state);
  const encodedChallenge = encodeURIComponent(codeChallenge);

  // URL phân quyền OAuth v4 Zalo
  const url = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodedRedirect}&code_challenge=${encodedChallenge}&state=${encodedState}`;

  return {
    url,
    codeVerifier,
    codeChallenge,
    state,
  };
};

/**
 * Xác thực mã Code từ Zalo OAuth 2.0 PKCE và Đăng nhập / Tạo tài khoản
 * Phân chia rõ ràng giữa Khách hàng (Client: role user) và Nhân viên shop (Admin: role admin, staff, etc.)
 */
const loginWithZalo = async (code, redirectUri = null, codeVerifier = null, isAdminRequest = false) => {
  if (!code) {
    throw new AppError('Mã xác thực (code) từ Zalo là bắt buộc', 400);
  }

  const appId = process.env.ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;
  const targetRedirectUri =
    redirectUri ||
    process.env.ZALO_REDIRECT_URI ||
    'http://localhost:3000/auth/zalo/callback';

  if (!appId || !appSecret) {
    throw new AppError('Cấu hình Zalo OAuth (App ID / App Secret) chưa đầy đủ trên server', 500);
  }

  // 1. Đổi authorization code lấy Access Token từ Zalo OAuth v4 API
  const tokenUrl = 'https://oauth.zaloapp.com/v4/access_token';
  const params = new URLSearchParams();
  params.append('app_id', appId);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  let tokenRes;
  try {
    tokenRes = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: appSecret,
      },
      timeout: 10000,
    });
  } catch (err) {
    console.error('Zalo OAuth Token Request Error:', err.response?.data || err.message);
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error_description ||
      'Không thể kết nối đến máy chủ Zalo OAuth. Vui lòng thử lại!';
    throw new AppError(errorMsg, 400);
  }

  const tokenData = tokenRes.data || {};
  if (tokenData.error && tokenData.error !== 0) {
    const errorMsg = tokenData.message || tokenData.error_name || `Lỗi Zalo OAuth: ${tokenData.error}`;
    throw new AppError(errorMsg, 400);
  }

  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new AppError('Không thể nhận access token từ Zalo. Mã xác thực có thể đã hết hạn.', 400);
  }

  // 2. Lấy thông tin người dùng từ Zalo Open API (Graph API v2.0)
  let userInfo = {};
  try {
    const userRes = await axios.get('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
      headers: {
        access_token: accessToken,
      },
      timeout: 10000,
    });
    userInfo = userRes.data || {};
  } catch (err) {
    console.error('Lỗi khi lấy thông tin chi tiết Zalo User:', err.response?.data || err.message);
    throw new AppError('Không thể truy xuất hồ sơ người dùng Zalo. Vui lòng thử lại!', 400);
  }

  if (userInfo.error && userInfo.error !== 0) {
    throw new AppError(userInfo.message || 'Lỗi truy xuất thông tin người dùng Zalo', 400);
  }

  const zaloId = userInfo.id;
  if (!zaloId) {
    throw new AppError('Không thể xác định Zalo User ID', 400);
  }

  const displayName = userInfo.name || 'Zalo User';
  const avatarUrl = userInfo.picture?.data?.url || userInfo.picture?.url || null;
  const syntheticEmail = `zalo_${zaloId.toLowerCase()}@zalo.user`;

  // 3. Phân biệt rõ ràng giữa Khách hàng và Nhân viên/Quản trị viên
  let user = await User.findOne({
    $or: [{ zaloId }, { email: syntheticEmail }],
  });

  if (user) {
    if (!user.isActive) {
      throw new AppError('Tài khoản đã bị vô hiệu hóa bởi Quản trị viên', 403);
    }

    let hasChanges = false;
    if (!user.zaloId) {
      user.zaloId = zaloId;
      hasChanges = true;
    }
    if (displayName && user.zaloName !== displayName) {
      user.zaloName = displayName;
      hasChanges = true;
    }
    // Chỉ gán avatar từ Zalo nếu tài khoản chưa có avatar
    if (avatarUrl && !user.avatar?.url) {
      user.avatar = { url: avatarUrl };
      hasChanges = true;
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.isAccountActivated = true;
      hasChanges = true;
    }

    if (hasChanges) {
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // 🛑 NẾU LÀ ADMIN / STAFF REQUEST: Không cho phép tài khoản Zalo vãng lai tự đăng ký thành Quản trị viên
    if (isAdminRequest) {
      throw new AppError(
        'Tài khoản Zalo này chưa được cấp quyền nhân viên / quản trị viên trên hệ thống. Vui lòng liên hệ Super Admin!',
        403
      );
    }

    // ✅ NẾU LÀ CLIENT KHÁCH HÀNG: Tự động khởi tạo tài khoản Khách hàng mua sắm (role: user)
    user = await User.create({
      fullName: displayName,
      email: syntheticEmail,
      zaloId,
      zaloName: displayName,
      authProvider: 'zalo',
      avatar: avatarUrl ? { url: avatarUrl } : undefined,
      isEmailVerified: true,
      isAccountActivated: true,
      gender: 'other',
      role: 'user',
      isActive: true,
    });
  }

  // 🛑 KIỂM TRA PHÂN QUYỀN CHẶT CHẼ: Khách hàng thường (role === 'user') không được đăng nhập vào hệ thống Admin
  if (isAdminRequest && user.role === 'user') {
    throw new AppError('Tài khoản của bạn là tài khoản Khách hàng, không có quyền truy cập trang quản trị shop!', 403);
  }

  return user;
};

/**
 * Liên kết tài khoản Google cho người dùng hiện tại đang đăng nhập
 */
const linkGoogleAccount = async (userId, credential) => {
  if (!credential) {
    throw new AppError('Google credential (id_token) là bắt buộc', 400);
  }

  let googlePayload;
  try {
    const googleRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { timeout: 8000 }
    );
    googlePayload = googleRes.data;
  } catch (err) {
    throw new AppError('Mã xác thực Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại!', 401);
  }

  const { sub: googleId, email, name, picture } = googlePayload;
  if (!googleId) {
    throw new AppError('Không thể xác thực Google ID', 400);
  }

  // Kiểm tra xem googleId này đã thuộc về tài khoản khác chưa
  const existingUser = await User.findOne({ googleId, _id: { $ne: userId } });
  if (existingUser) {
    throw new AppError('Tài khoản Google này đã được liên kết với một tài khoản khác trong hệ thống', 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  user.googleId = googleId;
  if (picture && !user.avatar?.url) {
    user.avatar = { url: picture };
  }
  await user.save({ validateBeforeSave: false });

  return {
    message: 'Liên kết tài khoản Google thành công',
    googleId,
    email,
    name,
  };
};

/**
 * Liên kết tài khoản Zalo cho người dùng hiện tại đang đăng nhập
 */
const linkZaloAccount = async (userId, code, redirectUri = null, codeVerifier = null) => {
  if (!code) {
    throw new AppError('Mã xác thực (code) từ Zalo là bắt buộc', 400);
  }

  const appId = process.env.ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;
  const targetRedirectUri =
    redirectUri ||
    process.env.ZALO_REDIRECT_URI ||
    'http://localhost:3000/auth/zalo/callback';

  if (!appId || !appSecret) {
    throw new AppError('Cấu hình Zalo OAuth (App ID / App Secret) chưa đầy đủ trên server', 500);
  }

  // 1. Đổi authorization code lấy Access Token từ Zalo OAuth v4 API
  const tokenUrl = 'https://oauth.zaloapp.com/v4/access_token';
  const params = new URLSearchParams();
  params.append('app_id', appId);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  let tokenRes;
  try {
    tokenRes = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: appSecret,
      },
      timeout: 10000,
    });
  } catch (err) {
    console.error('Zalo Link Token Error:', err.response?.data || err.message);
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error_description ||
      'Không thể kết nối đến máy chủ Zalo OAuth. Vui lòng thử lại!';
    throw new AppError(errorMsg, 400);
  }

  const tokenData = tokenRes.data || {};
  if (tokenData.error && tokenData.error !== 0) {
    const errorMsg = tokenData.message || tokenData.error_name || `Lỗi Zalo OAuth: ${tokenData.error}`;
    throw new AppError(errorMsg, 400);
  }

  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new AppError('Không thể nhận access token từ Zalo. Mã xác thực có thể đã hết hạn.', 400);
  }

  // 2. Lấy thông tin người dùng từ Zalo Open API
  let userInfo = {};
  try {
    const userRes = await axios.get('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
      headers: {
        access_token: accessToken,
      },
      timeout: 10000,
    });
    userInfo = userRes.data || {};
  } catch (err) {
    console.error('Lỗi khi lấy thông tin chi tiết Zalo User:', err.response?.data || err.message);
    throw new AppError('Không thể truy xuất hồ sơ người dùng Zalo. Vui lòng thử lại!', 400);
  }

  const zaloId = userInfo.id;
  if (!zaloId) {
    throw new AppError('Không thể xác định Zalo User ID', 400);
  }

  const displayName = userInfo.name || 'Zalo User';
  const avatarUrl = userInfo.picture?.data?.url || userInfo.picture?.url || null;

  // 3. Kiểm tra xem Zalo ID này đã gắn với tài khoản khác chưa
  const existingUser = await User.findOne({ zaloId, _id: { $ne: userId } });
  if (existingUser) {
    throw new AppError('Tài khoản Zalo này đã được liên kết với một tài khoản khác trong hệ thống', 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  user.zaloId = zaloId;
  if (displayName) user.zaloName = displayName;
  if (avatarUrl && !user.avatar?.url) {
    user.avatar = { url: avatarUrl };
  }
  await user.save({ validateBeforeSave: false });

  return {
    message: 'Liên kết tài khoản Zalo thành công',
    zaloId,
    displayName,
    avatarUrl,
  };
};

/**
 * Liên kết tài khoản TikTok cho người dùng hiện tại đang đăng nhập
 */
const linkTikTokAccount = async (userId, code, redirectUri = null, codeVerifier = null) => {
  if (!code) {
    throw new AppError('Mã xác thực (code) từ TikTok là bắt buộc', 400);
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const targetRedirectUri =
    redirectUri ||
    process.env.TIKTOK_REDIRECT_URI ||
    'http://localhost:3000/auth/tiktok/callback';

  if (!clientKey || !clientSecret) {
    throw new AppError('Cấu hình TikTok OAuth (Client Key/Secret) chưa đầy đủ trên server', 500);
  }

  // 1. Đổi Code lấy Access Token từ TikTok API
  const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
  const params = new URLSearchParams();
  params.append('client_key', clientKey);
  params.append('client_secret', clientSecret);
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', targetRedirectUri);
  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  let tokenRes;
  try {
    tokenRes = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000,
    });
  } catch (err) {
    console.error('TikTok Link Token Error:', err.response?.data || err.message);
    const errorMsg =
      err.response?.data?.error_description ||
      err.response?.data?.error?.message ||
      'Không thể xác thực mã ủy quyền với TikTok. Vui lòng thử lại!';
    throw new AppError(errorMsg, 400);
  }

  const tokenData = tokenRes.data?.data || tokenRes.data;
  const accessToken = tokenData?.access_token;
  const openId = tokenData?.open_id;

  if (!accessToken || !openId) {
    const errorMsg =
      tokenRes.data?.error?.message ||
      tokenRes.data?.message ||
      'Không thể nhận access token từ TikTok';
    throw new AppError(errorMsg, 400);
  }

  // 2. Lấy thông tin người dùng từ TikTok User Info API
  let userInfo = {};
  try {
    const userRes = await axios.get(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,avatar_url_100,avatar_large_url,display_name,username',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );
    userInfo = userRes.data?.data?.user || userRes.data?.data || {};
  } catch (err) {
    console.warn('Lỗi khi lấy thông tin chi tiết TikTok User:', err.message);
  }

  const tiktokOpenId = openId || userInfo?.open_id;
  const displayName = userInfo?.display_name || userInfo?.username || 'TikTok User';
  const avatarUrl = userInfo?.avatar_large_url || userInfo?.avatar_url || userInfo?.avatar_url_100 || null;

  // 3. Kiểm tra xem TikTok ID này đã gắn với tài khoản khác chưa
  const existingUser = await User.findOne({ tiktokId: tiktokOpenId, _id: { $ne: userId } });
  if (existingUser) {
    throw new AppError('Tài khoản TikTok này đã được liên kết với một tài khoản khác trong hệ thống', 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  user.tiktokId = tiktokOpenId;
  if (userInfo?.username) {
    user.tiktokUsername = userInfo.username;
  }
  if (avatarUrl && !user.avatar?.url) {
    user.avatar = { url: avatarUrl };
  }
  await user.save({ validateBeforeSave: false });

  return {
    message: 'Liên kết tài khoản TikTok thành công',
    tiktokId: tiktokOpenId,
    username: userInfo?.username || null,
    displayName,
    avatarUrl,
  };
};

/**
 * Hủy liên kết tài khoản mạng xã hội (zalo, tiktok, google)
 */
const unlinkSocialAccount = async (userId, provider) => {
  const normalizedProvider = (provider || '').toLowerCase().trim();
  const validProviders = ['zalo', 'tiktok', 'google'];
  if (!validProviders.includes(normalizedProvider)) {
    throw new AppError('Nhà cung cấp không hợp lệ. Chỉ chấp nhận zalo, tiktok hoặc google', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  // Đếm số phương thức đăng nhập còn lại
  const hasPassword = Boolean(user.password);
  const hasGoogle = Boolean(user.googleId);
  const hasZalo = Boolean(user.zaloId);
  const hasTikTok = Boolean(user.tiktokId);

  const totalMethods = (hasPassword ? 1 : 0) + (hasGoogle ? 1 : 0) + (hasZalo ? 1 : 0) + (hasTikTok ? 1 : 0);

  if (normalizedProvider === 'zalo') {
    if (!user.zaloId) throw new AppError('Tài khoản hiện tại chưa liên kết Zalo', 400);
    if (totalMethods <= 1) {
      throw new AppError('Bạn cần thiết lập mật khẩu trước khi hủy liên kết phương thức đăng nhập duy nhất này', 400);
    }
  } else if (normalizedProvider === 'tiktok') {
    if (!user.tiktokId) throw new AppError('Tài khoản hiện tại chưa liên kết TikTok', 400);
    if (totalMethods <= 1) {
      throw new AppError('Bạn cần thiết lập mật khẩu trước khi hủy liên kết phương thức đăng nhập duy nhất này', 400);
    }
  } else if (normalizedProvider === 'google') {
    if (!user.googleId) throw new AppError('Tài khoản hiện tại chưa liên kết Google', 400);
    if (totalMethods <= 1) {
      throw new AppError('Bạn cần thiết lập mật khẩu trước khi hủy liên kết phương thức đăng nhập duy nhất này', 400);
    }
  }

  // Dùng $unset để xóa triệt để trường khỏi BSON document cho MongoDB sparse index
  const unsetField = {};
  if (normalizedProvider === 'zalo') {
    unsetField.zaloId = 1;
    unsetField.zaloName = 1;
  }
  if (normalizedProvider === 'tiktok') {
    unsetField.tiktokId = 1;
    unsetField.tiktokUsername = 1;
  }
  if (normalizedProvider === 'google') {
    unsetField.googleId = 1;
  }

  await User.findByIdAndUpdate(userId, { $unset: unsetField });

  return {
    message: `Đã hủy liên kết tài khoản ${normalizedProvider.toUpperCase()} thành công`,
    provider: normalizedProvider,
  };
};

/**
 * Lấy danh sách các tài khoản mạng xã hội đã liên kết của người dùng
 */
const getLinkedProviders = async (userId) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  const isGoogle = Boolean(user.googleId || user.authProvider === 'google');
  const isZalo = Boolean(user.zaloId || user.authProvider === 'zalo');
  const isTikTok = Boolean(user.tiktokId || user.authProvider === 'tiktok');

  return {
    hasPassword: Boolean(user.password),
    google: {
      isLinked: isGoogle,
      id: user.googleId || null,
      email: user.email || null,
    },
    zalo: {
      isLinked: isZalo,
      id: user.zaloId || null,
      name: user.zaloName || (isZalo ? user.fullName : null),
    },
    tiktok: {
      isLinked: isTikTok,
      id: user.tiktokId || null,
      username: user.tiktokUsername || null,
      displayName: isTikTok ? user.fullName : null,
    },
  };
};

/**
 * =========================================================
 * ADMIN AUTH EXCLUSIVE: EMAIL OTP & PASSKEY (WEBAUTHN)
 * =========================================================
 */

const checkIsAdminUser = (user) => {
  if (!user || !user.isActive) return false;
  const userRole = (user.role || '').toLowerCase();
  const roleCode = (user.roleId?.code || '').toLowerCase();
  const roleName = (user.roleId?.name || '').toLowerCase();
  const userEmail = (user.email || '').toLowerCase();

  // If role is strictly 'user' and no roleId assigned
  if (userRole === 'user' && !user.roleId) return false;

  return (
    userRole !== 'user' ||
    userRole === 'admin' ||
    userRole === 'administrator' ||
    userRole === 'staff' ||
    userRole === 'manager' ||
    userRole === 'inventory_manager' ||
    userRole === 'content_editor' ||
    userRole === 'customer_care' ||
    roleCode === 'admin' ||
    roleCode === 'administrator' ||
    roleCode === 'staff' ||
    roleCode === 'manager' ||
    roleName.includes('quản trị') ||
    roleName.includes('admin') ||
    userEmail.startsWith('admin')
  );
};

/**
 * Admin: Kiểm tra email và gửi OTP
 */
const requestAdminLoginOtp = async (email) => {
  if (!email || !email.trim()) {
    throw new AppError('Vui lòng nhập địa chỉ email quản trị!', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).populate('roleId');

  if (!user) {
    throw new AppError('Email không tồn tại hoặc tài khoản không có quyền truy cập trang quản trị!', 403);
  }

  if (!user.isActive) {
    throw new AppError('Tài khoản quản trị này đã bị khóa hoặc vô hiệu hóa!', 403);
  }

  if (!checkIsAdminUser(user)) {
    throw new AppError('Tài khoản của bạn không được cấp quyền truy cập hệ thống quản trị!', 403);
  }

  const otp = user.createAdminLoginOtp();
  await user.save({ validateBeforeSave: false });

  // Log in console for fast dev testing
  console.log(`\n================== [ADMIN LOGIN OTP] ==================`);
  console.log(`Email: ${user.email}`);
  console.log(`OTP Code: [${otp}]`);
  console.log(`========================================================\n`);

  // Gửi Email OTP
  try {
    await sendAdminLoginOtpEmail(user.email, otp);
  } catch (err) {
    console.error('Lỗi khi gửi email OTP:', err);
  }

  const hasPasskey = Array.isArray(user.passkeys) && user.passkeys.length > 0;

  return {
    email: user.email,
    hasPasskey,
    otp: process.env.NODE_ENV === 'development' ? otp : undefined,
  };
};

/**
 * Admin: Xác thực mã OTP
 */
const verifyAdminLoginOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new AppError('Vui lòng nhập đầy đủ email và mã OTP!', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');

  const user = await User.findOne({ email: normalizedEmail })
    .select('+adminLoginOtp +adminLoginOtpExpires')
    .populate({ path: 'roleId', populate: { path: 'permissions', select: 'code name module' } })
    .populate('customPermissions', 'code name module');

  if (!user) {
    throw new AppError('Không tìm thấy tài khoản quản trị!', 404);
  }

  if (!user.isActive) {
    throw new AppError('Tài khoản đã bị vô hiệu hóa!', 403);
  }

  if (
    !user.adminLoginOtp ||
    user.adminLoginOtp !== hashedOtp ||
    !user.adminLoginOtpExpires ||
    user.adminLoginOtpExpires < Date.now()
  ) {
    throw new AppError('Mã OTP không chính xác hoặc đã hết hạn. Vui lòng lấy mã mới!', 400);
  }

  // Clear OTP sau khi sử dụng
  user.adminLoginOtp = undefined;
  user.adminLoginOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Helper: Trích xuất RP ID và Allowed Origins chuẩn FIDO2
 */
const getWebAuthnRpConfig = (req) => {
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'localhost';
  const rawHostname = host.split(':')[0];
  const rpID = process.env.RP_ID || (rawHostname === '127.0.0.1' ? '127.0.0.1' : rawHostname === 'localhost' ? 'localhost' : rawHostname);

  const originHeader = req?.headers?.origin || req?.headers?.referer;
  let parsedOrigin = '';
  if (originHeader) {
    try {
      const u = new URL(originHeader);
      parsedOrigin = u.origin;
    } catch (_) {}
  }

  const allowedOrigins = [
    process.env.ADMIN_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  if (parsedOrigin && !allowedOrigins.includes(parsedOrigin)) {
    allowedOrigins.push(parsedOrigin);
  }

  return { rpID, allowedOrigins, rpName: 'Haravan OMS' };
};

/**
 * Admin: Tạo Challenge cho Passkey Login chuẩn FIDO2
 */
const generatePasskeyLoginOptions = async (email, req) => {
  if (!email || !email.trim()) {
    throw new AppError('Vui lòng cung cấp email quản trị!', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).populate('roleId');

  if (!user) {
    throw new AppError('Không tìm thấy tài khoản quản trị!', 404);
  }

  if (!user.isActive || !checkIsAdminUser(user)) {
    throw new AppError('Tài khoản không có quyền truy cập trang quản trị!', 403);
  }

  // Lọc các khóa hợp lệ chuẩn FIDO2 (loại bỏ dữ liệu mô phỏng cũ)
  const validPasskeys = (user.passkeys || []).filter((pk) => pk.publicKey && pk.publicKey !== pk.credentialId && pk.publicKey.length >= 30);
  if (validPasskeys.length === 0) {
    throw new AppError('Tài khoản chưa có khóa Passkey chuẩn FIDO2 nào. Vui lòng đăng nhập bằng Mật khẩu hoặc OTP để thiết lập Passkey trong Cài đặt Hồ sơ!', 400);
  }

  const { rpID } = getWebAuthnRpConfig(req);

  const allowCredentials = validPasskeys.map((pk) => ({
    id: pk.credentialId,
    type: 'public-key',
    transports: pk.transports && pk.transports.length > 0 ? pk.transports : ['internal', 'hybrid', 'usb', 'nfc', 'ble'],
  }));

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: 'preferred',
    timeout: 60000,
  });

  user.passkeyChallenge = options.challenge;
  user.passkeyChallengeExpires = new Date(Date.now() + 2 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  return options;
};

/**
 * Admin: Xác thực Passkey Login chuẩn FIDO2 Cryptographic Verification
 */
const verifyPasskeyLogin = async ({ email, response, credentialId, clientDataJSON, authenticatorData, signature, req }) => {
  if (!email) {
    throw new AppError('Email không hợp lệ!', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail })
    .select('+passkeyChallenge +passkeyChallengeExpires')
    .populate({ path: 'roleId', populate: { path: 'permissions', select: 'code name module' } })
    .populate('customPermissions', 'code name module');

  if (!user) {
    throw new AppError('Không tìm thấy tài khoản!', 404);
  }

  if (!user.passkeyChallenge || !user.passkeyChallengeExpires || user.passkeyChallengeExpires < Date.now()) {
    throw new AppError('Yêu cầu xác thực Passkey đã hết hạn. Vui lòng thử lại!', 400);
  }

  // Chuẩn hóa client response payload
  const clientResponse = response || {
    id: credentialId,
    rawId: credentialId,
    response: {
      clientDataJSON,
      authenticatorData,
      signature,
    },
    type: 'public-key',
  };

  const matchedPasskey = (user.passkeys || []).find((pk) => pk.credentialId === clientResponse.id);
  if (!matchedPasskey) {
    throw new AppError('Khóa bảo mật Passkey không khớp với tài khoản này!', 400);
  }

  if (!matchedPasskey.publicKey || matchedPasskey.publicKey === matchedPasskey.credentialId || matchedPasskey.publicKey.length < 30) {
    throw new AppError('Khóa Passkey này thuộc phiên bản thử nghiệm cũ. Vui lòng đăng nhập bằng Mật khẩu hoặc OTP và đăng ký lại Passkey mới trong Cài đặt Hồ sơ!', 400);
  }

  const { rpID, allowedOrigins } = getWebAuthnRpConfig(req);

  let verification;
  try {
    let publicKeyBuffer;
    try {
      publicKeyBuffer = isoBase64URL.toBuffer(matchedPasskey.publicKey);
    } catch {
      publicKeyBuffer = Buffer.from(matchedPasskey.publicKey, 'base64url');
    }

    verification = await verifyAuthenticationResponse({
      response: clientResponse,
      expectedChallenge: user.passkeyChallenge,
      expectedOrigin: allowedOrigins,
      expectedRPID: rpID,
      credential: {
        id: matchedPasskey.credentialId,
        publicKey: publicKeyBuffer,
        counter: matchedPasskey.counter || 0,
        transports: matchedPasskey.transports && matchedPasskey.transports.length > 0 ? matchedPasskey.transports : undefined,
      },
      requireUserVerification: false,
    });
  } catch (err) {
    console.error('[WebAuthn Login Error]', err);
    throw new AppError(err.message || 'Xác thực chữ ký Passkey thất bại!', 400);
  }

  if (!verification || !verification.verified) {
    throw new AppError('Xác thực chữ ký Passkey không thành công!', 400);
  }

  // Cập nhật Counter chống Replay / Cloned Authenticator
  if (verification.authenticationInfo?.newCounter !== undefined) {
    matchedPasskey.counter = verification.authenticationInfo.newCounter;
  }

  user.passkeyChallenge = undefined;
  user.passkeyChallengeExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

/**
 * Admin: Tạo Challenge để đăng ký Passkey mới chuẩn FIDO2
 */
const generatePasskeyRegisterOptions = async (userId, req) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  const { rpID, rpName } = getWebAuthnRpConfig(req);

  const excludeCredentials = (user.passkeys || []).map((pk) => ({
    id: pk.credentialId,
    type: 'public-key',
    transports: pk.transports && pk.transports.length > 0 ? pk.transports : undefined,
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new Uint8Array(Buffer.from(user._id.toString())),
    userName: user.email,
    userDisplayName: user.fullName || user.email,
    attestationType: 'none',
    excludeCredentials,
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
    timeout: 60000,
  });

  user.passkeyChallenge = options.challenge;
  user.passkeyChallengeExpires = new Date(Date.now() + 5 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  return options;
};

/**
 * Admin: Xác thực lưu Passkey mới chuẩn FIDO2 Cryptographic Verification
 */
const verifyPasskeyRegister = async (userId, { response, deviceName, credentialId, rawId, clientDataJSON, attestationObject, req }) => {
  const user = await User.findById(userId).select('+passkeyChallenge +passkeyChallengeExpires');
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  if (!user.passkeyChallenge || !user.passkeyChallengeExpires || user.passkeyChallengeExpires < Date.now()) {
    throw new AppError('Yêu cầu đăng ký Passkey đã hết hạn. Vui lòng thử lại!', 400);
  }

  const clientResponse = response || {
    id: credentialId,
    rawId: rawId || credentialId,
    response: {
      clientDataJSON,
      attestationObject,
    },
    type: 'public-key',
  };

  const { rpID, allowedOrigins } = getWebAuthnRpConfig(req);

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: clientResponse,
      expectedChallenge: user.passkeyChallenge,
      expectedOrigin: allowedOrigins,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
  } catch (err) {
    console.error('[WebAuthn Registration Error]', err);
    throw new AppError(err.message || 'Xác thực đăng ký Passkey thất bại!', 400);
  }

  if (!verification || !verification.verified || !verification.registrationInfo) {
    throw new AppError('Xác thực đăng ký Passkey không thành công!', 400);
  }

  const { credential } = verification.registrationInfo;

  user.passkeys = user.passkeys || [];
  const existing = user.passkeys.find((pk) => pk.credentialId === credential.id);
  if (existing) {
    throw new AppError('Thiết bị Passkey này đã được đăng ký!', 400);
  }

  user.passkeys.push({
    credentialId: credential.id,
    publicKey: isoBase64URL.fromBuffer(credential.publicKey),
    counter: credential.counter || 0,
    transports: credential.transports || [],
    deviceName: deviceName || 'Thiết bị Quản trị viên (Passkey)',
    createdAt: new Date(),
  });

  user.passkeyChallenge = undefined;
  user.passkeyChallengeExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return { message: 'Đăng ký Passkey thành công!', passkeys: user.passkeys };
};

/**
 * Admin: Xóa 1 Passkey hoặc xóa toàn bộ Passkeys của user
 */
const deletePasskey = async (userId, credentialId = null) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  if (credentialId) {
    user.passkeys = (user.passkeys || []).filter((pk) => pk.credentialId !== credentialId);
  } else {
    user.passkeys = [];
  }

  user.passkeyChallenge = undefined;
  user.passkeyChallengeExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return { message: 'Đã xóa khóa Passkey thành công!', passkeys: user.passkeys };
};



module.exports = {
  COOKIE_OPTIONS,
  buildTokenResponse,
  registerUser,
  registerAdmin,
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
  forgotPassword,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
  // Sessions & Password
  recordUserSession,
  getUserSessions,
  logoutUserSession,
  logoutOtherSessions,
  setUserPassword,
  // Admin exclusive OTP & Passkey
  requestAdminLoginOtp,
  verifyAdminLoginOtp,
  generatePasskeyLoginOptions,
  verifyPasskeyLogin,
  generatePasskeyRegisterOptions,
  verifyPasskeyRegister,
  deletePasskey,
};






