const multer    = require('multer');
const { AppError } = require('../utils/AppError');

const path = require('path');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_SIZE_MB = 10;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();

  // Kiểm tra kép cả MIME-type và file extension
  if (!ALLOWED_TYPES.includes(file.mimetype) || !ALLOWED_EXTS.includes(ext)) {
    return cb(new AppError('Chỉ chấp nhận file ảnh có định dạng JPEG, PNG hoặc WebP', 400), false);
  }

  // Chặn double extension nguy hiểm (như shell.php.png, exploit.svg.jpg)
  const baseName = path.basename(file.originalname || '', ext);
  if (/\.(php|phtml|sh|bash|exe|dll|jsp|asp|aspx|svg|html|htm|js|py)$/i.test(baseName)) {
    return cb(new AppError('Tên file không hợp lệ hoặc chứa phần mở rộng nguy hiểm', 400), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = { upload };
