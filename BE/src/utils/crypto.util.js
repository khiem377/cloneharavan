const crypto = require('crypto');

// Thuật toán mã hóa chuẩn bảo mật AES-256-GCM (Authenticated Encryption)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = 'haravan_settings_encryption_salt_2026';

// Tạo secret key cố định 32 bytes từ biến môi trường
const getEncryptionKey = () => {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.ADMIN_SECRET_KEY || 'haravan_clone_default_secret_key_2026_xyz';
  return crypto.scryptSync(secret, SALT, 32);
};

/**
 * Mã hóa 2 chiều một chuỗi ký tự (Plaintext -> Ciphertext)
 * @param {string} text - Chuỗi cần mã hóa
 * @returns {string|null} - Chuỗi mã hóa dạng iv:authTag:encryptedHex
 */
const encrypt = (text) => {
  if (text === undefined || text === null || text === '') return null;
  const stringToEncrypt = typeof text !== 'string' ? String(text) : text;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(stringToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Giải mã 2 chiều chuỗi mã hóa (Ciphertext -> Plaintext)
 * @param {string} cipherText - Chuỗi mã hóa dạng iv:authTag:encryptedHex
 * @returns {string|null} - Chuỗi gốc ban đầu
 */
const decrypt = (cipherText) => {
  if (!cipherText || typeof cipherText !== 'string') return null;

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[crypto.util] Lỗi giải mã dữ liệu:', error.message);
    return null;
  }
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
