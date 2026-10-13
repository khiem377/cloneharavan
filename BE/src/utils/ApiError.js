const { ApiError, AppError } = require('./AppError');

module.exports = ApiError;
module.exports.ApiError = ApiError;
module.exports.AppError = AppError;
module.exports.default = ApiError;
