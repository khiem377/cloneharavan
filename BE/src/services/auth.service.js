const User         = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

const buildTokenResponse = async (user, res) => {
  const accessToken  = generateAccessToken(user._id);
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
  const user    = await User.findOne({ email }).select('+password');
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

module.exports = {
  COOKIE_OPTIONS,
  buildTokenResponse,
  registerUser,
  loginUser,
  rotateRefreshToken,
  changeUserPassword,
  logoutUser,
};
