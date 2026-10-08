const express = require('express');
const router  = express.Router();
const { handleChat, handleStream, handleGetHistory, clearSession } = require('../controllers/chatbot.controller');

// ─── Inline Rate Limiter — 30 requests/phút/IP ─────────────────────────────
const _rlStore = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of _rlStore) {
    if (now - entry.resetAt > 60_000) _rlStore.delete(key);
  }
}, 5 * 60_000).unref();

const chatRateLimit = (max = 30) => (req, res, next) => {
  const ip  = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const key = `chat:${ip}`;
  const now = Date.now();

  let entry = _rlStore.get(key);
  if (!entry || now - entry.resetAt > 60_000) {
    entry = { count: 0, resetAt: now };
  }
  entry.count++;
  _rlStore.set(key, entry);

  if (entry.count > max) {
    return res.status(429).json({
      status: 'error',
      message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.',
    });
  }
  next();
};

// Public
router.get('/history',    chatRateLimit(60), handleGetHistory);
router.post('/',          chatRateLimit(30), handleChat);
router.post('/stream',    chatRateLimit(30), handleStream);
router.delete('/session', clearSession);

module.exports = router;
