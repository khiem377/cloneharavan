const { AppError } = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Không tìm thấy route: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Lỗi máy chủ nội bộ';

  if (process.env.NODE_ENV === 'development') {
    console.error(`\n❌ [${req.method}] ${req.originalUrl}`);
    console.error(`   Status: ${statusCode}`);
    console.error(`   Message: ${err.message}`);
    console.error(`   Stack: ${err.stack}\n`);
  }


  if (err.name === 'CastError') {
    statusCode = 404;
    message    = 'Không tìm thấy tài nguyên';
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode  = 400;
    message     = `Giá trị đã tồn tại cho trường: ${field}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Token không hợp lệ';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token đã hết hạn';
  }

  res.status(statusCode).json({
    status:     'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
