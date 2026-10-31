const { Server } = require('socket.io');
const { verifyAccessToken, verifyRefreshToken } = require('../utils/jwt');
const User = require('../models/user.model');

let io = null;

// Storefront & Admin allowed origins
const CLIENT_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];
const ADMIN_ORIGINS = [
  process.env.ADMIN_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const ALLOWED_ORIGINS = [...CLIENT_ORIGINS, ...ADMIN_ORIGINS].filter(Boolean);

/**
 * Xác thực danh tính người dùng Socket để cấp quyền vào phòng Admin
 */
const authenticateSocketAdmin = async (socket) => {
  try {
    const rawCookies = socket.handshake.headers?.cookie || '';
    const authHeader = socket.handshake.headers?.authorization || '';
    const tokenFromAuth = socket.handshake.auth?.token || (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    let token = tokenFromAuth;
    if (!token && rawCookies) {
      const matchAdmin = rawCookies.match(/adminRefreshToken=([^;]+)/);
      const matchAccess = rawCookies.match(/accessToken=([^;]+)/);
      const matchRefresh = rawCookies.match(/refreshToken=([^;]+)/);
      token = matchAdmin ? matchAdmin[1] : (matchAccess ? matchAccess[1] : (matchRefresh ? matchRefresh[1] : null));
    }

    if (!token) return null;

    let decoded = null;
    try {
      decoded = verifyAccessToken(token);
    } catch (_) {
      try {
        decoded = verifyRefreshToken(token);
      } catch (__) {
        return null;
      }
    }

    if (!decoded?.id) return null;
    const user = await User.findById(decoded.id).select('role isActive');
    if (!user || !user.isActive) return null;

    const r = (user.role || '').toLowerCase();
    const isAdminOrStaff = r === 'admin' || r === 'administrator' || r === 'staff' || r === 'manager' || r !== 'user';
    return isAdminOrStaff ? user : null;
  } catch (err) {
    return null;
  }
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Cho phép các domain đã cấu hình hoặc request nội bộ không có origin
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS Socket: origin "${origin}" không được phép`));
      },
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on('connection', async (socket) => {
    // Chỉ tự động join admin:orders nếu xác thực thành công là Admin/Staff
    const adminUser = await authenticateSocketAdmin(socket);
    if (adminUser) {
      socket.join('admin:orders');
      socket.data.user = adminUser;
      console.log(`⚡ [Socket.io] Quản trị viên/Nhân viên (${adminUser.role}) đã kết nối: ${socket.id}`);
    } else {
      console.log(`⚡ [Socket.io] Client đã kết nối (khách thông thường): ${socket.id}`);
    }

    socket.on('join:admin', async () => {
      const authUser = socket.data.user || await authenticateSocketAdmin(socket);
      if (authUser) {
        socket.join('admin:orders');
        socket.data.user = authUser;
        console.log(`⚡ [Socket.io] Cấp quyền vào phòng admin:orders cho ${socket.id}`);
      } else {
        console.warn(`⚠️ [Socket.io] Từ chối cấp quyền phòng Admin cho client chưa xác thực: ${socket.id}`);
      }
    });

    socket.on('leave:admin', () => {
      socket.leave('admin:orders');
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.io] Client ngắt kết nối: ${socket.id} (${reason})`);
    });
  });

  console.log('⚡ Socket.io Realtime Service Initialized (Authenticated)');
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
    // Chỉ phát riêng cho những ai đã xác thực trong phòng 'admin:orders'
    io.to('admin:orders').emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToAdmin,
};
