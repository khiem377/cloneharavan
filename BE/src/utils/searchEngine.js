/**
 * Smart Search Engine Utility
 * Advanced Vietnamese Unaccenting, Dynamic Acronym/Initials Generator, Tokenizer and Relevance Scoring
 */

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

/**
 * Extracts initials/acronyms from a phrase
 * Example: "Loa vi tính Bluetooth Enkor" -> ["lvt", "lvtb", "lvtbe"]
 */
const extractAcronyms = (str) => {
  if (!str) return [];
  const normalized = removeVietnameseTones(str);
  const words = normalized.split(/[^a-z0-9]+/i).filter(Boolean);
  
  if (words.length < 2) return [];

  const acronyms = [];
  
  // Full phrase acronym: "Loa vi tính Bluetooth" -> "lvtb"
  const fullAcronym = words.map(w => w[0]).join('');
  if (fullAcronym.length >= 2) acronyms.push(fullAcronym);

  // Sub-phrase acronyms (first 2, 3, 4 words)
  for (let len = 2; len < words.length; len++) {
    const subAcronym = words.slice(0, len).map(w => w[0]).join('');
    if (!acronyms.includes(subAcronym)) {
      acronyms.push(subAcronym);
    }
  }

  return acronyms;
};

const SYNONYM_MAP = {
  tv: ['tivi', 'ti vi', 'television', 'smart tv'],
  tivi: ['tv', 'television', 'smart tv'],
  dt: ['dien thoai', 'smartphone', 'iphone', 'samsung'],
  dienthoai: ['dt', 'dien thoai', 'smartphone'],
  mtb: ['may tinh bang', 'tablet', 'ipad'],
  ml: ['may lanh', 'dieu hoa'],
  maylanh: ['dieu hoa', 'ml'],
  dieuhoa: ['may lanh', 'ml'],
  tl: ['tu lanh'],
  tulanh: ['tl'],
  mg: ['may giat'],
  maygiat: ['mg'],
  quat: ['quat dien', 'quat dung', 'quat lung'],
  noicom: ['noi com dien'],
  tainghe: ['headphone', 'earphone', 'airpods'],
  laptop: ['may tinh xach tay', 'macbook'],
  macbook: ['laptop', 'apple macbook'],
};

// Generic modifiers, specs, and stop-tokens that should have lower scoring weight
const GENERIC_MODIFIERS = new Set([
  'pro', 'max', 'plus', 'ultra', 'mini', 'lite', 'slim', 'air', 'fe', 'se',
  'inch', '"', 'in', 'gb', 'tb', 'mb', 'ram', 'ssd', 'hdd', 'rom',
  '4k', '8k', '2k', 'fhd', 'hd', '5g', '4g', 'lte', 'wifi', 'bluetooth',
  'chinh', 'hang', 'new', 'gen', 'series', 'core', 'cpu', 'gpu',
  '11', '12', '13', '14', '15', '16', '17', '18', '24', '32', '40', '43', '50', '55', '65', '75', '85',
  '128gb', '256gb', '512gb', '1tb', '2tb', '8gb', '16gb', '18gb', '32gb', '64gb',
  'black', 'white', 'gray', 'grey', 'silver', 'gold', 'blue', 'pink', 'yellow', 'green', 'titan', 'titanium'
]);

const isGenericToken = (token) => {
  if (!token) return true;
  const clean = token.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean || clean.length <= 1) return true;
  if (/^\d+$/.test(clean)) return true; // standalone numbers like 14, 15, 512
  if (/^\d+(?:gb|tb|mb|inch|in|mhz|w|l|lit)$/i.test(clean)) return true; // 18gb, 512gb, 14inch
  return GENERIC_MODIFIERS.has(clean);
};

/**
 * Tokenizes search query into clean tokens, synonyms and acronym candidates
 */
const parseSearchQuery = (query) => {
  if (!query || !query.trim()) {
    return { raw: '', normalized: '', tokens: [], coreTokens: [], modifierTokens: [], acronyms: [], synonyms: [] };
  }

  const raw = query.trim();
  const normalized = removeVietnameseTones(raw);
  
  // Clean punctuation from tokens but preserve clean alphanumeric tokens
  const cleanTokensString = normalized.replace(/[()[\]{}:;,.!?+=\-_/\\*~"']/g, ' ');
  const rawTokens = cleanTokensString.split(/\s+/).filter(Boolean);
  const acronyms = extractAcronyms(raw);

  const synonyms = [];
  const normalizedNoSpaces = normalized.replace(/\s+/g, '');
  
  if (SYNONYM_MAP[normalizedNoSpaces]) {
    synonyms.push(...SYNONYM_MAP[normalizedNoSpaces]);
  }
  
  rawTokens.forEach((t) => {
    if (SYNONYM_MAP[t]) {
      synonyms.push(...SYNONYM_MAP[t]);
    }
  });

  const uniqueSynonyms = [...new Set(synonyms)];
  const nonTrivialTokens = rawTokens.filter((t) => t.length >= 2);
  const coreTokens = nonTrivialTokens.filter((t) => !isGenericToken(t));
  const modifierTokens = nonTrivialTokens.filter((t) => isGenericToken(t));

  return {
    raw,
    normalized,
    tokens: rawTokens,
    coreTokens,
    modifierTokens,
    acronyms,
    synonyms: uniqueSynonyms,
  };
};

/**
 * Calculates relevance score for a item based on title, acronyms, and content
 */
const calculateRelevanceScore = (item, parsedQuery) => {
  const { normalized: queryNorm, tokens = [], coreTokens = [], modifierTokens = [], acronyms = [], synonyms = [] } = parsedQuery;
  
  const titleNorm = removeVietnameseTones(item.name || item.title || '');
  const brandNorm = removeVietnameseTones(item.brand?.name || '');
  const catNames = Array.isArray(item.categories)
    ? item.categories
        .filter(Boolean)
        .map((c) => removeVietnameseTones(c?.name || (typeof c === 'string' ? c : '')))
        .join(' ')
    : '';
  const descNorm = removeVietnameseTones(item.description || item.excerpt || item.content || '');
  const codeNorm = removeVietnameseTones(item.sku || item.productCode || item.code || '');
  const searchTokensNorm = (item.searchTokens || []).map((t) => removeVietnameseTones(t));

  const fullItemText = `${titleNorm} ${brandNorm} ${catNames} ${codeNorm} ${searchTokensNorm.join(' ')}`;

  // 1. Cross-category intent protection
  const isTvQuery = /\b(?:tivi|ti vi|tv|smart tv|television)\b/i.test(queryNorm);
  const isFridgeQuery = /\b(?:tu lanh|tu dong)\b/i.test(queryNorm);
  const isLaptopQuery = /\b(?:macbook|laptop|zenbook|thinkpad|vivobook|legion|nitro|xps)\b/i.test(queryNorm);
  const isPhoneQuery = /\b(?:iphone|dien thoai|galaxy s|galaxy z|redmi|xiaomi 14|smartphone)\b/i.test(queryNorm);
  const isTabletQuery = /\b(?:ipad|galaxy tab|pad 6|may tinh bang|tablet)\b/i.test(queryNorm);

  const isTvProduct = /\b(?:tivi|ti vi|tv|smart tv)\b/i.test(titleNorm) || /tivi|man hinh/i.test(catNames);
  const isFridgeProduct = /^(?:tu lanh|tu dong)\b/i.test(titleNorm) || /tu lanh|tu dong/i.test(catNames);
  const isLaptopProduct = /\b(?:macbook|laptop|may tinh xach tay)\b/i.test(titleNorm) || /laptop|macbook/i.test(catNames);

  if (isTvQuery && isFridgeProduct) return -1000;
  if (isFridgeQuery && isTvProduct) return -1000;
  if (isLaptopQuery && (isTvProduct || isFridgeProduct || /\b(?:may loc khong khi|loa keo|noi com)\b/i.test(titleNorm))) {
    return -1000;
  }

  // 2. Core Entity Token Gate:
  // If user searched for specific core entities (e.g., "macbook", "iphone"), product MUST match at least one core token
  if (coreTokens.length > 0) {
    const matchesAnyCore = coreTokens.some((ct) => {
      const syns = [ct, ...synonyms.filter((s) => s.includes(ct) || ct.includes(s))];
      return syns.some((s) => fullItemText.includes(s));
    });
    if (!matchesAnyCore) {
      return -500; // Complete mismatch
    }
  }

  let score = 0;

  // 3. Exact phrase match in title
  if (titleNorm === queryNorm) {
    score += 500;
  } else if (titleNorm.startsWith(queryNorm)) {
    score += 350;
  } else if (titleNorm.includes(queryNorm)) {
    score += 250;
  }

  // 4. Exact match in code / SKU
  if (codeNorm && codeNorm.includes(queryNorm)) {
    score += 300;
  }

  // 5. Token matching with differentiated weights
  let matchedCoreCount = 0;
  let matchedModifierCount = 0;

  coreTokens.forEach((token) => {
    const syns = [token, ...synonyms.filter((s) => s.includes(token) || token.includes(s))];
    const matchInTitle = syns.some((s) => titleNorm.includes(s));
    const matchInBrand = syns.some((s) => brandNorm.includes(s));
    const matchInCat = syns.some((s) => catNames.includes(s));
    const matchInCode = syns.some((s) => codeNorm.includes(s));

    if (matchInTitle) {
      score += 120;
      matchedCoreCount++;
    } else if (matchInBrand) {
      score += 90;
      matchedCoreCount++;
    } else if (matchInCat) {
      score += 60;
      matchedCoreCount++;
    } else if (matchInCode) {
      score += 50;
      matchedCoreCount++;
    } else if (descNorm.includes(token)) {
      score += 10;
    }
  });

  modifierTokens.forEach((token) => {
    const syns = [token, ...synonyms.filter((s) => s.includes(token) || token.includes(s))];
    const matchInTitle = syns.some((s) => titleNorm.includes(s));
    const matchInCode = syns.some((s) => codeNorm.includes(s));

    if (matchInTitle) {
      score += 20; // Lower weight for generic tokens like "pro", "14", "inch"
      matchedModifierCount++;
    } else if (matchInCode) {
      score += 15;
      matchedModifierCount++;
    }
  });

  // 6. Token Coverage bonus
  const totalNonTrivialTokens = coreTokens.length + modifierTokens.length;
  const totalMatched = matchedCoreCount + matchedModifierCount;

  if (totalNonTrivialTokens > 0) {
    const coverageRatio = totalMatched / totalNonTrivialTokens;
    if (coverageRatio >= 1.0) {
      score += 250; // Matched 100% of tokens in the query
    } else if (coverageRatio >= 0.75) {
      score += 150;
    } else if (coverageRatio >= 0.5) {
      score += 50;
    }
  }

  // 7. Multi-word core token full match bonus
  if (coreTokens.length > 1 && matchedCoreCount >= coreTokens.length) {
    score += 150;
  }

  // 8. Acronym match (e.g. "lvt" for "Loa vi tính")
  tokens.forEach((token) => {
    const itemAcronyms = extractAcronyms(item.name || item.title || '');
    if (itemAcronyms.includes(token)) {
      score += 75;
    }
  });

  return score;
};

module.exports = {
  removeVietnameseTones,
  extractAcronyms,
  isGenericToken,
  parseSearchQuery,
  calculateRelevanceScore,
};
