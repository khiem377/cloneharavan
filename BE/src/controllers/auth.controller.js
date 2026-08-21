const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const {
  buildTokenResponse,
  registerUser,
  registerAdmin: registerAdminService,
  loginUser,
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

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    const { accessToken, refreshToken } = await buildTokenResponse(user, res);

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
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    const { accessToken, refreshToken } = await buildTokenResponse(user, res);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Đăng nhập thành công',
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
    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy thông tin thành công',
      data: { user },
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

module.exports = {
  register,
  registerAdmin,
  login,
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
};

