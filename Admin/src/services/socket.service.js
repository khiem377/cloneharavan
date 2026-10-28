import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/v1\/?$/, '');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Admin Socket] Đã kết nối tới máy chủ:', socket.id);
      socket.emit('join:admin');
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [Admin Socket] Lỗi kết nối socket:', err.message);
    });

    if (socket.io) {
      socket.io.on('reconnect', () => {
        console.log('⚡ [Admin Socket] Đã kết nối lại thành công');
        socket.emit('join:admin');
      });
    }
  }

  if (socket && socket.connected) {
    socket.emit('join:admin');
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.emit('leave:admin');
    socket.disconnect();
    socket = null;
  }
};

export default {
  getSocket,
  disconnectSocket,
};
