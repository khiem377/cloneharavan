const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const routes = require('./routes');
require('./services/excelTemplate.service');
const { startCronJobs } = require('./utils/cronJobs');

const app = express();


const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.STOREFRONT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {

    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" không được phép`));
  },
  credentials: true,
}));
const { sanitizeInput } = require('./middleware/sanitize.middleware');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use('/uploads', express.static('public/uploads', { maxAge: '30d' }));


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use('/api/v1', routes);


app.use(notFound);
app.use(errorHandler);

// Start background cron jobs (Item-CF every 6h, Python SVD every 4h)
startCronJobs();

module.exports = app;
