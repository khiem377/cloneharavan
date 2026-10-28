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
    // Mặc định tự động cho socket kết nối tham gia phòng admin:orders
    socket.join('admin:orders');
    console.log(`⚡ [Socket.io] Client đã kết nối: ${socket.id}`);

    socket.on('join:admin', () => {
      socket.join('admin:orders');
    });

    socket.on('leave:admin', () => {
      socket.leave('admin:orders');
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.io] Client ngắt kết nối: ${socket.id} (${reason})`);
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
    console.log(`📢 [Socket.io] Phát tín hiệu "${event}" tới Admin:`, data?.title || data?.type || '');
    io.to('admin:orders').emit(event, data);
    io.emit(event, data); // Phát dự phòng đảm bảo mọi kết nối Admin đều nhận được
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToAdmin,
};
