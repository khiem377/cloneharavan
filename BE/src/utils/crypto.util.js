const crypto = require('crypto');

// Thuật toán mã hóa chuẩn bảo mật AES-256-GCM (Authenticated Encryption)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = 'dak_shop_settings_encryption_salt_2026';
const LEGACY_SALT = 'haravan_settings_encryption_salt_2026';

// Tạo danh sách secret key cố định 32 bytes từ biến môi trường và legacy fallbacks
const getCandidateKeys = () => {
  const secrets = [
    process.env.SETTINGS_ENCRYPTION_KEY,
    process.env.ADMIN_SECRET_KEY,
    'admin_secret_key_haravan_2026',
    'haravan_default_secret_key_2026_xyz',
    'dak_shop_default_secret_key_2026_xyz',
  ].filter(Boolean);

  const salts = [SALT, LEGACY_SALT];
  const keys = [];

  for (const s of secrets) {
    for (const salt of salts) {
      try {
        keys.push(crypto.scryptSync(s, salt, 32));
      } catch {}
    }
  }
  return keys;
};

const getPrimaryEncryptionKey = () => {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.ADMIN_SECRET_KEY || 'dak_shop_default_secret_key_2026_xyz';
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
