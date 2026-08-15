const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

// ─── Cookie config ─────────────────────────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,                          // Không cho JS phía client đọc
  secure: process.env.NODE_ENV === 'production', // Chỉ HTTPS ở production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 ngày (ms)
};

// ─── Helper ────────────────────────────────────────────────────────────────────
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Lưu refresh token vào DB để có thể invalidate sau này
  await User.findByIdAndUpdate(user._id, { refreshToken });

  // Set refresh token vào HTTP-only cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken, // Cũng trả về body để client mobile/non-browser dùng
    data: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
};

// ─── Register ──────────────────────────────────────────────────────────────────
/**
 * @desc  Register new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Please provide name, email and password', 400);
    }

    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already in use', 400);

    const user = await User.create({ name, email, password });

    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────
/**
 * @desc  Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Token ─────────────────────────────────────────────────────────────
/**
 * @desc  Issue new access token using refresh token
 * @route POST /api/v1/auth/refresh-token
 * @access Public
 */
const refreshToken = async (req, res, next) => {
  try {
    // Nhận từ cookie hoặc body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) throw new AppError('No refresh token provided', 401);

    // Verify chữ ký
    const decoded = verifyRefreshToken(token);

    // Kiểm tra token có khớp trong DB không (chống replay attack)
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Tạo access token mới
    const newAccessToken  = generateAccessToken(user._id);
    // Rotate refresh token
    const newRefreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Profile ───────────────────────────────────────────────────────────────
/**
 * @desc  Get current logged-in user profile
 * @route GET /api/v1/auth/me
 * @access Private (Bearer token or cookie)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ────────────────────────────────────────────────────────────────────
/**
 * @desc  Logout - clear cookie & invalidate refresh token in DB
 * @route POST /api/v1/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    // Xóa refresh token trong DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, getProfile, logout };
