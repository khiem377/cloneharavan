/**
 * Custom Application Error class
 * Allows attaching an HTTP status code to errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

  }
}

module.exports = { AppError };
