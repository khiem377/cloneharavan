import api from '@/lib/axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const chatbotService = {

  async streamMessage({ message, sessionId }, signal = null) {
    return fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
      signal,
    });
  },


  deleteSession(sessionId) {
    return api.delete('/chat/session', { data: { sessionId } });
  },
};

export default chatbotService;
