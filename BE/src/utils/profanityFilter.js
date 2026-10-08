/**
 * ============================================================
 * Smart Content Filter v2
 * - Profanity: Tiếng Việt (có dấu + teencode + viết tắt) & Tiếng Anh
 * - Anti-Spam: lặp ký tự, ALL CAPS, link spam, copy-paste spam
 * - Nguồn tham khảo: vn-badwords, vietnam-sensitive-words,
 *   LDNOOBW, blue-eyes-vn/vietnamese-offensive-words
 * ============================================================
 */

// ─────────────────────────────────────────────
// 1. DANH SÁCH TỪ CẤM
// ─────────────────────────────────────────────

// Tiếng Việt — từ đầy đủ (có dấu)
const VN_WORDS_FULL = [
  // Bộ phận sinh dục / hành vi tục
  'địt', 'đụ', 'đéo', 'đếch', 'đệch', 'chịch', 'hiếp',
  'lồn', 'cặc', 'buồi', 'dái', 'bướm', 'hĩm', 'lác', 'cứt', 'đái', 'ỉa',
  'thủ dâm', 'quan hệ tình dục', 'giao cấu',

  // Chửi thề / xúc phạm
  'đồ chó', 'mẹ mày', 'bố mày', 'thằng chó', 'con chó', 'con điếm',
  'mả mẹ', 'mả cha', 'cút xéo', 'đồ ngu', 'thằng ngu', 'con ngu',
  'óc chó', 'ngu như chó', 'chó chết', 'đồ khốn', 'khốn nạn', 'đồ điên',
  'thằng điên', 'con điên', 'đm', 'dm', 'đmm', 'dmm', 'đkm', 'dkm',
  'dcm', 'đcm', 'vcl', 'vl', 'vkl', 'cl', 'cmn', 'cmm', 'cmnr',
  'wtf', 'omg stfu',

  // Nghề nghiệp xúc phạm
  'đĩ', 'cave', 'phò', 'gái điếm', 'gái gọi', 'mại dâm', 'tú bà',
  'gái bán hoa',

  // Xúc phạm tôn giáo / chính trị (ngữ cảnh Việt Nam)
  'lừa đảo', 'scam', 'phản quốc',
];

// Tiếng Việt — teencode / lách luật phổ biến (không dấu / viết tắt)
const VN_WORDS_TEENCODE = [
  // Cặp từ thay thế phổ biến
  'dit', 'dit me', 'ditme', 'dit ba', 'ditba', 'du me', 'dume', 'du ba',
  'deo', 'dech', 'chich',
  'lon', 'cac', 'buoi', 'bim', 'him', 'cut', 'dai', 'ia',

  // Viết tắt tục
  'dm', 'dmm', 'dkm', 'dcm', 'vcl', 'vl', 'vkl', 'cl', 'cmn', 'cmm',
  'ngu vcl', 'ngu vl', 'cc',

  // Teencode cách điệu
  'd1t', 'd!t', 'đ1t', 'l0n', '|on', 'c@c', 'bu0i',
  'f*ck', 'sh1t',
];

// Tiếng Anh
const EN_WORDS = [
  'fuck', 'fucking', 'fucker', 'fucked', 'fck', 'f*ck', 'f**k',
  'shit', 'sh!t', 'shitty', 'bullshit',
  'bitch', 'b*tch', 'bastard', 'asshole', 'ass',
  'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut',
  'motherfucker', 'mf', 'wtf', 'stfu', 'gtfo',
  'damn', 'crap', 'piss', 'retard', 'idiot',
  'kill yourself', 'kys', 'go die',
  'nigger', 'nigga', 'faggot', 'fag',
];

// Tổng hợp tất cả
const ALL_BLOCKED = [...VN_WORDS_FULL, ...VN_WORDS_TEENCODE, ...EN_WORDS];

// Pre-compile regex cho hiệu năng
const COMPILED_PATTERNS = ALL_BLOCKED.map((word) => {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Với tiếng Việt có dấu, không dùng \b (không hoạt động với Unicode)
  // Dùng lookahead/lookbehind khoảng trắng hoặc start/end
  return {
    word,
    regex: new RegExp(`(^|[\\s,\\.!?;:"'()])${escaped}([\\s,\\.!?;:"'()]|$)`, 'iu'),
    simple: new RegExp(escaped, 'iu'), // fallback substring match cho từ ngắn < 4 ký tự
  };
});

// ─────────────────────────────────────────────
// 2. NORMALIZE TEXT
// ─────────────────────────────────────────────

/**
 * Chuẩn hóa text để lọc:
 * - lowercase
 * - Bỏ ký tự đặc biệt dùng để lách luật (d.i.t → dit, đ-m → đm)
 * - Bỏ số thay thế chữ cái (3 → e, 0 → o, 1 → i, @ → a)
 * - Bỏ khoảng trắng thừa
 */
const normalizeText = (text = '') => {
  return text
    .toLowerCase()
    // Bỏ ký tự đặc biệt lách luật xen giữa chữ
    .replace(/[._\-*~@#$%^&+=|\\/<>]/g, ' ')
    // Số thay chữ cái phổ biến
    .replace(/3/g, 'e')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/!/g, 'i')
    // Khoảng trắng thừa
    .replace(/\s+/g, ' ')
    .trim();
};

// ─────────────────────────────────────────────
// 3. PROFANITY CHECK
// ─────────────────────────────────────────────

/**
 * Kiểm tra xem text có chứa từ cấm không
 * @param {string} text
 * @returns {{ isProfane: boolean, matchedWord: string | null }}
 */
const checkProfanity = (text = '') => {
  if (!text || typeof text !== 'string') {
    return { isProfane: false, matchedWord: null };
  }

  const normalized = normalizeText(text);

  for (const { word, regex, simple } of COMPILED_PATTERNS) {
    // Kiểm tra với boundary-aware regex
    if (regex.test(` ${normalized} `)) {
      return { isProfane: true, matchedWord: word };
    }
    // Fallback: từ ngắn dưới 4 ký tự → substring match (ví dụ: 'dm', 'cl', 'vl')
    if (word.length <= 4 && simple.test(normalized)) {
      // Tránh false positive: chỉ match nếu là standalone word
      const parts = normalized.split(/\s+/);
      if (parts.some(p => simple.test(p) && p.length <= word.length + 2)) {
        return { isProfane: true, matchedWord: word };
      }
    }
  }

  return { isProfane: false, matchedWord: null };
};

// ─────────────────────────────────────────────
// 4. ANTI-SPAM CHECK
// ─────────────────────────────────────────────

/**
 * Các loại spam được phát hiện:
 * - Lặp ký tự quá nhiều: "aaaaaaa", "hahahahaha" 5+ lần liên tiếp
 * - ALL CAPS liên tục (> 80% uppercase, > 10 ký tự)
 * - Chứa URL / link spam
 * - Comment quá ngắn (< 5 ký tự, không phải reply)
 * - Comment quá dài (> 2000 ký tự)
 * - Lặp nội dung toàn bộ (giống hệt)
 *
 * @param {string} text
 * @param {{ isReply?: boolean, previousContent?: string }} options
 * @returns {{ isSpam: boolean, reason: string | null }}
 */
const checkSpam = (text = '', options = {}) => {
  const { isReply = false, previousContent = null } = options;

  if (!text || typeof text !== 'string') {
    return { isSpam: false, reason: null };
  }

  const trimmed = text.trim();

  // 1. Độ dài tối thiểu
  if (!isReply && trimmed.length < 5) {
    return { isSpam: true, reason: 'Nội dung quá ngắn (tối thiểu 5 ký tự).' };
  }

  // 2. Độ dài tối đa
  if (trimmed.length > 2000) {
    return { isSpam: true, reason: 'Nội dung quá dài (tối đa 2000 ký tự).' };
  }

  // 3. Lặp ký tự quá mức (e.g. "aaaaaaa", "!!!!!!!")
  if (/(.)\1{6,}/u.test(trimmed)) {
    return { isSpam: true, reason: 'Nội dung chứa ký tự lặp lại bất thường.' };
  }

  // 4. ALL CAPS spam (>80% uppercase, tối thiểu 15 ký tự)
  if (trimmed.length >= 15) {
    const letters = trimmed.replace(/[^a-zA-ZÀ-ỹ]/gu, '');
    const upperCount = (letters.match(/[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ]/gu) || []).length;
    if (letters.length > 0 && upperCount / letters.length > 0.8) {
      return { isSpam: true, reason: 'Không được viết toàn chữ hoa.' };
    }
  }

  // 5. Chứa URL / link spam
  const urlPattern = /(https?:\/\/|www\.)[^\s]{5,}/i;
  if (urlPattern.test(trimmed)) {
    return { isSpam: true, reason: 'Không được chèn đường link vào bình luận.' };
  }

  // 6. Trùng nội dung với comment trước (copy-paste spam)
  if (previousContent && trimmed.toLowerCase() === previousContent.trim().toLowerCase()) {
    return { isSpam: true, reason: 'Bình luận trùng lặp với nội dung trước đó.' };
  }

  // 7. Nội dung toàn ký tự đặc biệt vô nghĩa
  const meaninglessPattern = /^[!@#$%^&*()\-_=+\[\]{}|;':",.<>?/\\`~\s]+$/;
  if (meaninglessPattern.test(trimmed)) {
    return { isSpam: true, reason: 'Nội dung không có ý nghĩa.' };
  }

  return { isSpam: false, reason: null };
};

// ─────────────────────────────────────────────
// 5. MASK (che từ cấm bằng ***)
// ─────────────────────────────────────────────

/**
 * Thay thế từ cấm trong text bằng *** (dùng khi muốn hiển thị ẩn thay vì chặn)
 * @param {string} text
 * @returns {string}
 */
const maskProfanity = (text = '') => {
  if (!text) return '';
  let result = text;
  for (const { word, simple } of COMPILED_PATTERNS) {
    const stars = '*'.repeat(word.length);
    result = result.replace(simple, stars);
  }
  return result;
};

// ─────────────────────────────────────────────
// 6. COMBINED VALIDATOR (dùng trong comment.service)
// ─────────────────────────────────────────────

/**
 * Kiểm tra tổng hợp profanity + spam
 * @param {string} content
 * @param {{ isReply?: boolean, previousContent?: string }} options
 * @returns {{ blocked: boolean, reason: string | null }}
 */
const validateCommentContent = (content = '', options = {}) => {
  // Spam check trước
  const spamResult = checkSpam(content, options);
  if (spamResult.isSpam) {
    return { blocked: true, reason: spamResult.reason };
  }

  // Profanity check sau
  const profanityResult = checkProfanity(content);
  if (profanityResult.isProfane) {
    return {
      blocked: true,
      reason: 'Bình luận chứa từ ngữ không phù hợp với chuẩn mực cộng đồng. Vui lòng chỉnh sửa lại.',
    };
  }

  return { blocked: false, reason: null };
};

module.exports = {
  checkProfanity,
  checkSpam,
  maskProfanity,
  validateCommentContent,
  BLOCKED_KEYWORDS: ALL_BLOCKED, // backward compat
};
