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

/**
 * Tokenizes search query into clean tokens and acronym candidates
 */
const parseSearchQuery = (query) => {
  if (!query || !query.trim()) {
    return { raw: '', normalized: '', tokens: [], acronyms: [] };
  }

  const raw = query.trim();
  const normalized = removeVietnameseTones(raw);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const acronyms = extractAcronyms(raw);

  return {
    raw,
    normalized,
    tokens,
    acronyms,
  };
};

/**
 * Calculates relevance score for a item based on title, acronyms, and content
 */
const calculateRelevanceScore = (item, parsedQuery) => {
  let score = 0;
  const { normalized: queryNorm, tokens, acronyms } = parsedQuery;
  
  const titleNorm = removeVietnameseTones(item.name || item.title || '');
  const descNorm = removeVietnameseTones(item.description || item.excerpt || item.content || '');
  const codeNorm = removeVietnameseTones(item.sku || item.productCode || item.code || '');
  const itemAcronyms = extractAcronyms(item.name || item.title || '');

  // 1. Exact match in title -> Highest score
  if (titleNorm === queryNorm) score += 100;
  else if (titleNorm.startsWith(queryNorm)) score += 80;
  else if (titleNorm.includes(queryNorm)) score += 60;

  // 2. Exact match in code / SKU
  if (codeNorm && codeNorm.includes(queryNorm)) score += 90;

  // 3. Acronym match (e.g., query "lvt" matches acronym "lvt" of "Loa vi tính")
  tokens.forEach(token => {
    if (itemAcronyms.includes(token)) {
      score += 75;
    }
  });

  // 4. Token prefix match
  tokens.forEach(token => {
    if (token.length > 1) {
      if (titleNorm.includes(token)) score += 30;
      else if (descNorm.includes(token)) score += 10;
    }
  });

  return score;
};

module.exports = {
  removeVietnameseTones,
  extractAcronyms,
  parseSearchQuery,
  calculateRelevanceScore,
};
