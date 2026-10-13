
class AppError extends Error {
  constructor(arg1, arg2 = 500) {
    let message = arg1;
    let statusCode = arg2;


    if (typeof arg1 === 'number' && typeof arg2 === 'string') {
      statusCode = arg1;
      message = arg2;
    }

    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ApiError extends AppError {
  constructor(statusCode, message) {
    super(statusCode, message);
  }
}

module.exports = AppError;
module.exports.AppError = AppError;
module.exports.ApiError = ApiError;
module.exports.default = AppError;
