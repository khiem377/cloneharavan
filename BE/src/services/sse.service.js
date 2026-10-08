/**
 * SSE Service: Quản lý các kết nối Server-Sent Events cho từng user
 * Hỗ trợ: Realtime Force Logout, Thông báo hệ thống
 */

// Map<userId (string), Set<express.Response>>
const userConnections = new Map();

/**
 * Đăng ký kết nối SSE mới của user
 */
const addClient = (userId, res, req) => {
  const uid = userId.toString();
  if (!userConnections.has(uid)) {
    userConnections.set(uid, new Set());
  }

  const clientSet = userConnections.get(uid);
  clientSet.add(res);
  console.log(`[SSE] User connected: ${uid} (Active connections: ${clientSet.size})`);

  // Gửi gói tin chào mừng xác nhận kết nối thành công
  try {
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);
  } catch (_) {}

  const cleanup = () => {
    clientSet.delete(res);
    if (clientSet.size === 0) {
      userConnections.delete(uid);
    }
    console.log(`[SSE] User connection closed: ${uid} (Remaining: ${clientSet.size})`);
  };

  // Khi client ngắt kết nối (đóng tab, reload, chuyển trang)
  if (req) {
    req.on('close', cleanup);
  }
  res.on('close', cleanup);
  res.on('error', cleanup);
};

/**
 * Gửi dữ liệu tới tất cả các thiết bị/tab đang mở của một user
 */
const sendToUser = (userId, data) => {
  const uid = userId.toString();
  const clientSet = userConnections.get(uid);
  if (!clientSet || clientSet.size === 0) {
    console.log(`[SSE] sendToUser: user ${uid} has NO active SSE connections`);
    return false;
  }

  console.log(`[SSE] Sending '${data.type}' to user ${uid} across ${clientSet.size} client(s)`);
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clientSet) {
    try {
      res.write(payload);
      if (data.type === 'FORCE_LOGOUT') {
        // Đóng luôn kết nối sau khi gửi lệnh buộc đăng xuất
        setTimeout(() => {
          try { res.end(); } catch (_) {}
        }, 150);
      }
    } catch (err) {
      console.error(`[SSE] Lỗi gửi SSE tới user ${uid}:`, err.message);
    }
  }

  if (data.type === 'FORCE_LOGOUT') {
    userConnections.delete(uid);
  }
  return true;
};

// Định kỳ gửi heartbeat ping mỗi 25s để giữ kết nối không bị ngắt bởi proxy/nginx
setInterval(() => {
  for (const [uid, clientSet] of userConnections.entries()) {
    for (const res of clientSet) {
      try {
        res.write(': heartbeat\n\n');
      } catch (err) {
        clientSet.delete(res);
      }
    }
    if (clientSet.size === 0) {
      userConnections.delete(uid);
    }
  }
}, 25000);

module.exports = {
  addClient,
  sendToUser,
};
