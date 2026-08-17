const User         = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const {
  buildTokenResponse,
  registerUser,
  loginUser,
  rotateRefreshToken,
  changeUserPassword,
  logoutUser,
  COOKIE_OPTIONS,
} = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    const { accessToken, refreshToken } = await buildTokenResponse(user, res);

    res.status(201).json({
      status:     'success',
      statusCode: 201,
      message:    'Đăng ký thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          _id:      user._id,
          fullName: user.fullName,
          email:    user.email,
          phone:    user.phone,
          gender:   user.gender,
          role:     user.role,
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
      status:     'success',
      statusCode: 200,
      message:    'Đăng nhập thành công',
      data: {
        accessToken,
        refreshToken,
        user: {
          _id:      user._id,
          fullName: user.fullName,
          email:    user.email,
          phone:    user.phone,
          gender:   user.gender,
          role:     user.role,
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
      status:     'success',
      statusCode: 200,
      message:    'Làm mới token thành công',
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
      status:     'success',
      statusCode: 200,
      message:    'Lấy thông tin thành công',
      data:       { user },
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
      status:     'success',
      statusCode: 200,
      message:    'Đổi mật khẩu thành công',
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
      status:     'success',
      statusCode: 200,
      message:    'Đăng xuất thành công',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, getProfile, changePassword, logout };
