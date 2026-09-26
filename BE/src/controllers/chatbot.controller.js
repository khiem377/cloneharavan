const { chat, chatStream, resetSession } = require('../services/chatbot.service');
const crypto = require('crypto');

// POST /api/v1/chat
const handleChat = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    // Nếu không có sessionId → tạo mới
    const sid = sessionId || crypto.randomUUID();

    const result = await chat({
      sessionId: sid,
      message,
      userId: req.user?._id || null,
    });

    res.json({
      status:    'success',
      statusCode: 200,
      data: {
        reply:     result.reply,
        sessionId: result.sessionId,
        meta:      result.context,
      },
    });
  } catch (error) {
    // Gemini API error — trả về thân thiện hơn
    if (error.message?.includes('API_KEY') || error.message?.includes('GEMINI')) {
      return res.status(503).json({
        status:    'error',
        statusCode: 503,
        message:   'Chatbot tạm thời không khả dụng. Vui lòng thử lại sau.',
      });
    }
    next(error);
  }
};

// DELETE /api/v1/chat/session
const clearSession = (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) resetSession(sessionId);
  res.json({ status: 'success', message: 'Session đã được reset' });
};

// POST /api/v1/chat/stream  — SSE streaming (recommended)
const handleStream = (req, res) => {
  const { message, sessionId } = req.body;
  const sid = sessionId || crypto.randomUUID();
  chatStream({ sessionId: sid, message }, res);
};

module.exports = { handleChat, handleStream, clearSession };
