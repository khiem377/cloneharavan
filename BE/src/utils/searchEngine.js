/**
 * Smart Search Engine Utility
 * Advanced Vietnamese Unaccenting, Dynamic Acronym/Initials Generator, and Tokenizer
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
  laptop: ['may tinh xach tay'],
};

/**
 * Tokenizes search query into clean tokens, synonyms and acronym candidates
 */
const parseSearchQuery = (query) => {
  if (!query || !query.trim()) {
    return { raw: '', normalized: '', tokens: [], acronyms: [], synonyms: [] };
  }

  const raw = query.trim();
  const normalized = removeVietnameseTones(raw);
  const rawTokens = normalized.split(/\s+/).filter(Boolean);
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

  return {
    raw,
    normalized,
    tokens: rawTokens,
    acronyms,
    synonyms: uniqueSynonyms,
  };
};

/**
 * Calculates relevance score for a item based on title, acronyms, and content
 */
const calculateRelevanceScore = (item, parsedQuery) => {
  let score = 0;
  const { normalized: queryNorm, tokens = [], acronyms = [], synonyms = [] } = parsedQuery;
  
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
  const itemAcronyms = extractAcronyms(item.name || item.title || '');

  // 1. Cross-category negative penalty
  const isTvQuery = /\b(?:tivi|ti vi|tv|smart tv|television|man hinh)\b/i.test(queryNorm);
  const isFridgeProduct = /^(?:tu lanh|tu dong|may giat|may say|may lanh|dieu hoa)\b/i.test(titleNorm) ||
    /tu lanh|tu dong|may giat|may lanh/i.test(catNames);

  if (isTvQuery && isFridgeProduct) {
    return -1000;
  }

  const isFridgeQuery = /\b(?:tu lanh|tu dong)\b/i.test(queryNorm);
  const isTvProduct = /\b(?:tivi|ti vi|tv|smart tv)\b/i.test(titleNorm) || /tivi|man hinh/i.test(catNames);

  if (isFridgeQuery && isTvProduct) {
    return -1000;
  }

  // 2. Exact match in title -> Highest score
  if (titleNorm === queryNorm) score += 200;
  else if (titleNorm.startsWith(queryNorm)) score += 150;
  else if (titleNorm.includes(queryNorm)) score += 100;

  // 3. Exact match in code / SKU
  if (codeNorm && codeNorm.includes(queryNorm)) score += 120;

  // 4. Acronym match (e.g., query "lvt" matches acronym "lvt" of "Loa vi tính")
  tokens.forEach((token) => {
    if (itemAcronyms.includes(token)) {
      score += 75;
    }
  });

  // 5. Token matching across title, brand & categories
  let matchedTokenCount = 0;
  tokens.forEach((token) => {
    if (token.length > 1) {
      const tokenSynonyms = [token, ...synonyms.filter((s) => s.includes(token) || token.includes(s))];
      const hasMatchInTitle = tokenSynonyms.some((s) => titleNorm.includes(s));
      const hasMatchInBrand = tokenSynonyms.some((s) => brandNorm.includes(s));
      const hasMatchInCat = tokenSynonyms.some((s) => catNames.includes(s));

      if (hasMatchInTitle) {
        score += 50;
        matchedTokenCount++;
      } else if (hasMatchInBrand) {
        score += 45;
        matchedTokenCount++;
      } else if (hasMatchInCat) {
        score += 30;
        matchedTokenCount++;
      } else if (codeNorm.includes(token)) {
        score += 30;
        matchedTokenCount++;
      } else if (descNorm.includes(token)) {
        score += 5;
      }
    }
  });

  // Multi-word full match bonus (e.g. "tivi samsung" matches BOTH tivi and samsung)
  if (tokens.length > 1 && matchedTokenCount >= tokens.length) {
    score += 200;
  }

  return score;
};

module.exports = {
  removeVietnameseTones,
  extractAcronyms,
  parseSearchQuery,
  calculateRelevanceScore,
};
