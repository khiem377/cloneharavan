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
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Real-time Interaction Pipeline Active`);

      // Pre-warm corpus tim kiem de request dau tien khong phai cho build (~1.6s)
      require('./src/utils/dynamicSearchCorpus')
        .getStoreCorpus()
        .catch((err) => console.warn('[SearchCorpus] Pre-warm failed:', err.message));
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
// reload nodemon

