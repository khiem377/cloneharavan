/**
 * Universal Dynamic Search Engine Utility
 * 
 * Works 100% dynamically for any store catalog (Fashion, Tech, Food, Cosmetics, etc.)
 * Adapts to dynamic store corpus with automatic typo-correction, acronym expansion, and relevance scoring.
 */

const {
  removeVietnameseTones,
  damerauLevenshteinDistance,
  calculateSimilarity,
  extractDynamicAcronyms,
  predictFromCorpus,
} = require('./dynamicSearchCorpus');

const extractAcronyms = extractDynamicAcronyms;

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
  if (/^\d+$/.test(clean)) return true; // standalone numbers
  if (/^\d+(?:gb|tb|mb|inch|in|mhz|w|l|lit|ml|kg|g)$/i.test(clean)) return true;
  return GENERIC_MODIFIERS.has(clean);
};

/**
 * Tokenizes search query into clean tokens, dynamic predictions, synonyms and core tokens
 * 
 * @param {string} query - Raw search query
 * @param {object} corpus - Dynamic store corpus built from MongoDB
 */
const parseSearchQuery = (query, corpus = null) => {
  if (!query || !query.trim()) {
    return {
      raw: '',
      normalized: '',
      tokens: [],
      coreTokens: [],
      modifierTokens: [],
      acronyms: [],
      synonyms: [],
      predictedQuery: '',
      didYouMean: '',
      suggestedKeywords: [],
      isTypo: false,
    };
  }

  const raw = query.trim();
  const normalized = removeVietnameseTones(raw);

  const cleanTokensString = normalized.replace(/[()[\]{}:;,.!?+=\-_/\\*~"']/g, ' ');
  const rawTokens = cleanTokensString.split(/\s+/).filter(Boolean);
  const acronyms = extractDynamicAcronyms(raw);

  let predictedQuery = raw;
  let didYouMean = '';
  let isTypo = false;
  let suggestedKeywords = [];
  const synonyms = [];

  // Dynamic Corpus prediction (if corpus provided)
  if (corpus) {
    const predictionResult = predictFromCorpus(raw, corpus);
    predictedQuery = predictionResult.prediction || raw;
    didYouMean = predictionResult.didYouMean || '';
    isTypo = !!predictionResult.isTypo;
    suggestedKeywords = predictionResult.suggestedKeywords || [];
    if (predictionResult.synonyms) {
      synonyms.push(...predictionResult.synonyms);
    }
  }

  const uniqueSynonyms = [...new Set(synonyms)];
  const nonTrivialTokens = rawTokens.filter((t) => t.length >= 2);
  const coreTokens = nonTrivialTokens.filter((t) => !isGenericToken(t));
  const modifierTokens = nonTrivialTokens.filter((t) => isGenericToken(t));

  // Add synonym tokens to coreTokens
  uniqueSynonyms.forEach((syn) => {
    const synTokens = syn.split(/\s+/).filter((w) => w.length >= 2 && !isGenericToken(w));
    synTokens.forEach((st) => {
      if (!coreTokens.includes(st)) {
        coreTokens.push(st);
      }
    });
  });

  return {
    raw,
    normalized,
    tokens: rawTokens,
    coreTokens,
    modifierTokens,
    acronyms,
    synonyms: uniqueSynonyms,
    predictedQuery: predictedQuery || raw,
    didYouMean,
    isTypo,
    suggestedKeywords,
  };
};

/**
 * Calculates relevance score for an item dynamically based on title, brand, category, and query tokens
 */
const calculateRelevanceScore = (item, parsedQuery) => {
  const {
    normalized: queryNorm,
    tokens = [],
    coreTokens = [],
    modifierTokens = [],
    acronyms = [],
    synonyms = [],
    didYouMean = '',
  } = parsedQuery;

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

  let score = 0;

  // 1. Exact phrase match in title
  if (titleNorm === queryNorm) {
    score += 500;
  } else if (titleNorm.startsWith(queryNorm)) {
    score += 350;
  } else if (titleNorm.includes(queryNorm)) {
    score += 250;
  }

  // 2. Exact match in brand / category / didYouMean
  if (didYouMean) {
    const didYouMeanNorm = removeVietnameseTones(didYouMean);
    if (brandNorm.includes(didYouMeanNorm)) score += 300;
    if (catNames.includes(didYouMeanNorm)) score += 250;
    if (titleNorm.includes(didYouMeanNorm)) score += 250;
  }

  // 3. Exact match in code / SKU
  if (codeNorm && codeNorm.includes(queryNorm)) {
    score += 300;
  }

  // 4. Token matching with differentiated weights
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
      score += 100;
      matchedCoreCount++;
    } else if (matchInCat) {
      score += 70;
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
      score += 20;
      matchedModifierCount++;
    } else if (matchInCode) {
      score += 15;
      matchedModifierCount++;
    }
  });

  // 5. Token Coverage bonus
  const totalNonTrivialTokens = coreTokens.length + modifierTokens.length;
  const totalMatched = matchedCoreCount + matchedModifierCount;

  if (totalNonTrivialTokens > 0) {
    const coverageRatio = totalMatched / totalNonTrivialTokens;
    if (coverageRatio >= 1.0) {
      score += 250;
    } else if (coverageRatio >= 0.75) {
      score += 150;
    } else if (coverageRatio >= 0.5) {
      score += 50;
    }
  }

  // 6. Dynamic Acronym match
  tokens.forEach((token) => {
    const itemAcronyms = extractDynamicAcronyms(item.name || item.title || '');
    if (itemAcronyms.includes(token)) {
      score += 100;
    }
  });

  return score;
};

module.exports = {
  removeVietnameseTones,
  extractAcronyms,
  extractDynamicAcronyms,
  damerauLevenshteinDistance,
  calculateSimilarity,
  isGenericToken,
  parseSearchQuery,
  calculateRelevanceScore,
};
