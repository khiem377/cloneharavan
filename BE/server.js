require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);

      // Pre-warm corpus tìm kiếm ở chế độ nền
      require('./src/utils/dynamicSearchCorpus')
        .getStoreCorpus()
        .catch(() => {});

      // Tự động seed nhóm khách hàng trong im lặng nếu database chưa có nhóm nào
      const CustomerGroup = require('./src/models/customerGroup.model');
      CustomerGroup.countDocuments()
        .then((count) => {
          if (count === 0) {
            const seedCustomerGroups = require('./scripts/seed-customer-groups-and-sync');
            seedCustomerGroups(false).catch(() => {});
          }
        });
    });

    const { initSocket } = require('./src/config/socket');
    initSocket(server);

    // Slowloris DDoS Mitigation: Đóng kết nối nếu client treo gửi headers hoặc body quá 60s
    server.headersTimeout = 65000;
    server.requestTimeout = 60000;
  })
  .catch((err) => {
    console.error('Failed to connect to DB and start server:', err);
  });
// reload nodemon 2026-10-28 08:13:00

