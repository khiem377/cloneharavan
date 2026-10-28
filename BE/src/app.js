const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const routes = require('./routes');
require('./services/excelTemplate.service');
const { startCronJobs } = require('./utils/cronJobs');

const app = express();

// Ẩn thông tin framework máy chủ (chống bot scanner)
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Native HTTP Security Headers (HSTS, Anti-Clickjacking, Anti-Sniffing)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// AI Predictive Search Engine v2 loaded

// Storefront client origins
const CLIENT_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.STOREFRONT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];

// Admin dashboard origins
const ADMIN_ORIGINS = [
  process.env.ADMIN_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const ALLOWED_ORIGINS = [...CLIENT_ORIGINS, ...ADMIN_ORIGINS].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" không được phép`));
  },
  credentials: true,
}));
const { sanitizeInput } = require('./middleware/sanitize.middleware');

// Anti-DDoS payload limits (tránh JSON bombs gây tràn heap memory)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use('/uploads', express.static('public/uploads', { maxAge: '30d' }));


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use('/api/v1', routes);


app.use(notFound);
app.use(errorHandler);


startCronJobs();



module.exports = app;
