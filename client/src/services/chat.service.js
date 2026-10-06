import { api } from '@/lib/axios';

const API_BASE = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const chatService = {
  /**
   * Lấy lịch sử chat bền vững từ DB
   * @param {string} sessionId 
   */
  async getHistory(sessionId) {
    if (!sessionId) return { messages: [], profile: {} };
    try {
      const res = await api.get(`/chat/history?sessionId=${encodeURIComponent(sessionId)}`);
      return res.data?.data || { messages: [], profile: {} };
    } catch (err) {
      console.warn('[Chat getHistory Error]', err?.message);
      return { messages: [], profile: {} };
    }
  },

  /**
   * SSE Stream chat với AI Shopping Assistant (dành cho AiChatWidget)
   * @param {Object} params
   * @param {string} params.message - Tin nhắn của người dùng
   * @param {string|null} params.sessionId - Session ID hiện tại (nếu có)
   * @param {Object} callbacks
   * @param {AbortSignal} [callbacks.signal] - Abort signal nếu muốn cancel
   * @param {Function} [callbacks.onSessionId] - Callback nhận sessionId mới
   * @param {Function} [callbacks.onChunk] - Callback nhận từng đoạn text stream
   * @param {Function} [callbacks.onProducts] - Callback nhận danh sách sản phẩm gợi ý
   * @param {Function} [callbacks.onEnd] - Callback khi stream hoàn tất
   * @param {Function} [callbacks.onError] - Callback khi có lỗi
   */
  async sendMessageStream(
    { message, sessionId },
    { signal, onSessionId, onChunk, onProducts, onEnd, onError } = {}
  ) {
    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let isCompleted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'session' && data.sessionId) {
              if (onSessionId) onSessionId(data.sessionId);
            } else if (data.type === 'products') {
              if (onProducts) onProducts(data.products || []);
            } else if (data.type === 'text' && data.text) {
              if (onChunk) onChunk(data.text);
            } else if (data.type === 'done') {
              isCompleted = true;
              if (onEnd) onEnd();
            } else if (data.type === 'error') {
              if (onError) onError(data.message || 'Lỗi xử lý tin nhắn');
            }
          } catch (e) {
            console.warn('[SSE Parse Error]', e);
          }
        }
      }

      if (!isCompleted && onEnd) {
        onEnd();
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('[Chat Service Error]', error);
      if (onError) {
        onError(error?.message || 'Lỗi kết nối đến máy chủ tư vấn.');
      } else {
        throw error;
      }
    }
  },

  /**
   * SSE Stream chat (tương thích ngược với định dạng cũ onEvent)
   * @param {Object} params
   * @param {string} params.message
   * @param {string|null} params.sessionId
   * @param {Function} onEvent
   * @param {AbortSignal} [signal]
   */
  async streamChat({ message, sessionId }, onEvent, signal) {
    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (onEvent) onEvent(data);
          } catch (e) {
            console.warn('[SSE Parse Error]', e);
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('[Chat Service Error]', error);
      if (onEvent) {
        onEvent({
          type: 'error',
          message: 'Lỗi kết nối đến máy chủ tư vấn. Bạn vui lòng thử lại sau giây lát!',
        });
      }
    }
  },

  /**
   * Reset session chat
   * @param {string} sessionId
   */
  async resetSession(sessionId) {
    if (!sessionId) return;
    try {
      await api.delete('/chat/session', { data: { sessionId } });
    } catch (err) {
      console.warn('Reset session error:', err?.message);
    }
  },
};

export default chatService;
