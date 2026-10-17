const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Cho phép localhost và các origin phát triển
        callback(null, true);
      },
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    // Admin kết nối và tham gia phòng admin:orders
    socket.on('join:admin', () => {
      socket.join('admin:orders');
    });

    socket.on('leave:admin', () => {
      socket.leave('admin:orders');
    });

    socket.on('disconnect', () => {
      // Tự động dọn dẹp khi ngắt kết nối
    });
  });

  console.log('⚡ Socket.io Realtime Service Initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.io] Instance chưa được khởi tạo!');
  }
  return io;
};

// Gửi thông báo tới toàn bộ nhân viên/quản trị viên trong phòng admin:orders
const emitToAdmin = (event, data) => {
  if (io) {
    io.to('admin:orders').emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToAdmin,
};
