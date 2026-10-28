const jwt = require('jsonwebtoken');

/**
 * Generate Access Token (short-lived)
 * @param {string} id - User ID
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

/**
 * Generate Refresh Token (long-lived)
 * @param {string} id - User ID
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  });
};

/**
 * Verify Access Token (Khóa cứng thuật toán HS256 chống Algorithm Confusion Attack)
 */
const verifyAccessToken = (token) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
};

/**
 * Verify Refresh Token (Khóa cứng thuật toán HS256 chống Algorithm Confusion Attack)
 */
const verifyRefreshToken = (token) => {
  if (!process.env.REFRESH_TOKEN_SECRET) throw new Error('REFRESH_TOKEN_SECRET is missing');
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
