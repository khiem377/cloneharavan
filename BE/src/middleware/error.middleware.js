const { AppError } = require('../utils/AppError');
const { ZodError } = require('zod');

const notFound = (req, res, next) => {
  next(new AppError('Trang không tồn tại hoặc đã bị xóa', 404));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Đã có lỗi xảy ra, vui lòng thử lại sau';

  if (process.env.NODE_ENV === 'development') {
    console.error(`\n❌ [${req.method}] ${req.originalUrl}`);
    console.error(`   Status: ${statusCode}`);
    console.error(`   Message: ${err.message}`);
    console.error(`   Stack: ${err.stack}\n`);
  }

  if (err instanceof ZodError) {
    statusCode = 400;
    const msgs = err.errors.map((e) => e.message).filter(Boolean);
    message = msgs.length ? msgs[0] : 'Dữ liệu không hợp lệ';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    const field = err.path || 'trường dữ liệu';
    message    = `Giá trị của "${field}" không đúng định dạng`;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const fieldMap = {
      slug:  'Đường dẫn (slug)',
      email: 'Email',
      phone: 'Số điện thoại',
      name:  'Tên',
      sku:   'Mã SKU',
      code:  'Mã',
    };
    const label = fieldMap[field] || field || 'Dữ liệu';
    statusCode  = 400;
    message     = `${label} này đã được sử dụng, vui lòng chọn giá trị khác`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
  }

  res.status(statusCode).json({
    status:     'error',
    statusCode,
    message,
    ...(err.inUsePosts  && { inUsePosts:  err.inUsePosts  }),
    ...(err.inUseMap    && { inUseMap:    err.inUseMap    }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
