/**
 * Email Service Facade
 * Đã bóc tách module hóa toàn bộ sang thư mục ./email/ (config, layout, templates, sender)
 * Đảm bảo 100% tương thích ngược cho toàn bộ các controller, service và router hiện có.
 */
module.exports = require('./email');
