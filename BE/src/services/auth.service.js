const crypto = require('crypto');
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
} = require('./email.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const buildTokenResponse = async (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, { refreshToken });
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

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

const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('Không tìm thấy người dùng', 404);

  const isValid = await user.matchPassword(currentPassword);
  if (!isValid) throw new AppError('Mật khẩu hiện tại không chính xác', 401);

  user.password = newPassword;
  await user.save();
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

module.exports = {
  COOKIE_OPTIONS,
  buildTokenResponse,
  registerUser,
  loginUser,
  rotateRefreshToken,
  changeUserPassword,
  logoutUser,
  forgotPassword,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
};
