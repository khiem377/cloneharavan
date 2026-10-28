const crypto = require('crypto');

// Thuật toán mã hóa chuẩn bảo mật AES-256-GCM (Authenticated Encryption)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = process.env.SETTINGS_ENCRYPTION_SALT || 'dak_shop_settings_encryption_salt_2026';
const LEGACY_SALT = 'haravan_settings_encryption_salt_2026';

const HKDF_SALT = 'haravan_aead_hkdf_salt_2026';
const HKDF_INFO = 'haravan_settings_encryption_v1';

// Tạo key 32-bytes qua chuẩn HKDF (HMAC-based Key Derivation Function - RFC 5869)
const deriveKeyHkdf = (secret) => {
  return Buffer.from(crypto.hkdfSync('sha256', secret, HKDF_SALT, HKDF_INFO, 32));
};

// Tạo danh sách secret key 32 bytes từ biến môi trường (Hỗ trợ cả HKDF mới và scrypt cũ để tương thích ngược)
const getCandidateKeys = () => {
  const secrets = [
    process.env.SETTINGS_ENCRYPTION_KEY,
    process.env.ADMIN_SECRET_KEY,
    process.env.JWT_SECRET,
  ].filter(Boolean);

  const keys = [];

  for (const s of secrets) {
    // 1. Thử khóa chuẩn HKDF (chuẩn hiện đại)
    try {
      keys.push(deriveKeyHkdf(s));
    } catch {}

    // 2. Thử khóa scrypt cũ (để tương thích ngược với dữ liệu đã lưu trong DB)
    for (const salt of [SALT, LEGACY_SALT]) {
      try {
        keys.push(crypto.scryptSync(s, salt, 32));
      } catch {}
    }
  }
  return keys;
};

const getPrimaryEncryptionKey = () => {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.ADMIN_SECRET_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('[Security Exception] Không tìm thấy khóa bí mật mã hóa (SETTINGS_ENCRYPTION_KEY/ADMIN_SECRET_KEY). Vui lòng cấu hình trong file .env!');
  }
  return deriveKeyHkdf(secret);
};

/**
 * Mã hóa 2 chiều một chuỗi ký tự (Plaintext -> Ciphertext)
 * @param {string} text - Chuỗi cần mã hóa
 * @returns {string|null} - Chuỗi mã hóa dạng iv:authTag:encryptedHex
 */
const encrypt = (text) => {
  if (text === undefined || text === null || text === '') return null;
  const stringToEncrypt = typeof text !== 'string' ? String(text) : text;

  const key = getPrimaryEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(stringToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Giải mã 2 chiều chuỗi mã hóa (Ciphertext -> Plaintext)
 * Thử lần lượt các key candidates và legacy salts để không bị mất dữ liệu cũ
 * @param {string} cipherText - Chuỗi mã hóa dạng iv:authTag:encryptedHex
 * @returns {string|null} - Chuỗi gốc ban đầu
 */
const decrypt = (cipherText) => {
  if (!cipherText || typeof cipherText !== 'string') return null;

  const parts = cipherText.split(':');
  if (parts.length !== 3) return null;

  const [ivHex, authTagHex, encryptedHex] = parts;
  let iv, authTag;
  try {
    iv = Buffer.from(ivHex, 'hex');
    authTag = Buffer.from(authTagHex, 'hex');
  } catch {
    return null;
  }

  const candidateKeys = getCandidateKeys();
  for (const key of candidateKeys) {
    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      if (decrypted) return decrypted;
    } catch {
      // Tiếp tục thử key kế tiếp
    }
  }

  return null;
};

/**
 * Mã hóa một Object dữ liệu JSON
 */
const encryptObject = (obj) => {
  if (!obj || typeof obj !== 'object') return null;
  return encrypt(JSON.stringify(obj));
};


const decryptObject = (cipherText) => {
  const jsonStr = decrypt(cipherText);
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('[crypto.util] Lỗi parse JSON sau khi giải mã:', err.message);
    return null;
  }
};


const maskSecret = (secret, visibleChars = 4) => {
  if (!secret || typeof secret !== 'string') return '';
  if (secret.length <= visibleChars) return '••••';
  const maskedLength = Math.max(secret.length - visibleChars, 4);
  return '•'.repeat(Math.min(maskedLength, 8)) + secret.slice(-visibleChars);
};

module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  maskSecret,
};
