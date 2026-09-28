/**
 * Smart Keyword Filter — Lọc từ khóa tục tĩu, nói bậy & toxic tiếng Việt / tiếng Anh
 */

const BLOCKED_KEYWORDS = [
  // Tiếng Việt tục tĩu
  'đm', 'dm', 'đmm', 'dmm', 'dcm', 'đcm', 'đkm', 'dkm', 'cl', 'cmn', 'cmm',
  'vcl', 'vcll', 'vl', 'vkl', 'vcc', 'vc', 'đéo', 'deo', 'đếch', 'đệch',
  'lồn', 'lon', 'cặc', 'cac', 'buồi', 'buoi', 'dái', 'chim', 'bướm', 'cu',
  'chó chết', 'mẹ mày', 'me may', 'bố mày', 'bo may', 'óc chó', 'oc cho',
  'thằng chó', 'con chó', 'đĩ', 'di~', 'con đĩ', 'cave', 'phò', 'pho`',
  'lừa đảo', 'lua dao', 'scam', 'khốn nạn', 'đồ ngu', 'ngu vcl',

  // Tiếng Anh thô tục
  'fuck', 'fucking', 'fucker', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy',
];

// Chuẩn hóa chuỗi (bỏ dấu cách thừa, ký tự xen kẽ như đ.m, d-m)
const normalizeText = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[._\-*~@#$%^&+=]/g, '') // Bỏ các ký tự đặc biệt lách luật
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Kiểm tra xem văn bản có chứa từ cấm không
 * @param {string} text 
 * @returns {{ isProfane: boolean, matchedWord: string | null }}
 */
const checkProfanity = (text = '') => {
  if (!text || typeof text !== 'string') {
    return { isProfane: false, matchedWord: null };
  }

  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  for (const keyword of BLOCKED_KEYWORDS) {
    // 1. Kiểm tra từ đơn chính xác
    if (words.includes(keyword)) {
      return { isProfane: true, matchedWord: keyword };
    }

    // 2. Kiểm tra cụm từ
    if (keyword.includes(' ') && normalized.includes(keyword)) {
      return { isProfane: true, matchedWord: keyword };
    }

    // 3. Regex kiểm tra từ khóa độc lập
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalized)) {
      return { isProfane: true, matchedWord: keyword };
    }
  }

  return { isProfane: false, matchedWord: null };
};

/**
 * Che từ cấm bằng dấu sao (***) nếu cần hiển thị ẩn
 * @param {string} text 
 * @returns {string}
 */
const maskProfanity = (text = '') => {
  if (!text) return '';
  let result = text;
  for (const keyword of BLOCKED_KEYWORDS) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, '***');
  }
  return result;
};

module.exports = {
  checkProfanity,
  maskProfanity,
  BLOCKED_KEYWORDS,
};
