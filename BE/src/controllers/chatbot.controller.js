const { chat, chatStream, resetSession, getHistoryFromDB } = require('../services/chatbot.service');
const crypto = require('crypto');

// POST /api/v1/chat
const handleChat = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
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
        products:  result.products || [],
        meta:      result.context,
      },
    });
  } catch (error) {
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

// GET /api/v1/chat/history?sessionId=...
const handleGetHistory = async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId || req.body?.sessionId;
    const userId = req.user?._id || null;

    if (!sessionId) {
      return res.json({ status: 'success', data: { messages: [], profile: {} } });
    }

    const sessionData = await getHistoryFromDB(sessionId, userId);
    res.json({
      status: 'success',
      statusCode: 200,
      data: sessionData,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/chat/session
const clearSession = async (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) await resetSession(sessionId);
  res.json({ status: 'success', message: 'Session đã được reset' });
};

// POST /api/v1/chat/stream  — SSE streaming
const handleStream = (req, res) => {
  const { message, sessionId } = req.body;
  const sid = sessionId || crypto.randomUUID();
  chatStream({ sessionId: sid, message, userId: req.user?._id || null }, res);
};

module.exports = { handleChat, handleStream, handleGetHistory, clearSession };
