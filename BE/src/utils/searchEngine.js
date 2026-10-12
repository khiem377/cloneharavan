/**
 * Universal Dynamic Search Engine Utility (Shopee & Tiki QUS Standard)
 * 
 * Implements:
 * 1. Vietnamese Compound Word Segmentation (Tách từ ghép)
 * 2. Anchor Entity Extraction & Category Guard (Bảo vệ danh mục cốt lõi)
 * 3. Differentiated Attribute & Modifier Weighting
 * 4. Multi-factor Token Coverage & Learning-to-Rank Scoring
 */

const {
  removeVietnameseTones,
  damerauLevenshteinDistance,
  calculateSimilarity,
  extractDynamicAcronyms,
  predictFromCorpus,
} = require('./dynamicSearchCorpus');

const extractAcronyms = extractDynamicAcronyms;

// ── Common E-Commerce Acronyms & Aliases Map ────────────────────────────────
const COMMON_SEARCH_ALIASES = {
  tv: 'tivi',
  'ti vi': 'tivi',
  tivi: 'tivi',
  boncau: 'bồn cầu',
  'bon cau': 'bồn cầu',
  ip: 'iphone',
  prm: 'pro max',
  ss: 'samsung',
  samsug: 'samsung',
  snoy: 'sony',
  pana: 'panasonic',
  panaosnic: 'panasonic',
  elec: 'electrolux',
  dt: 'điện thoại',
  dienthoai: 'điện thoại',
  mb: 'macbook',
  mac: 'macbook',
  lap: 'laptop',
  tl: 'tủ lạnh',
  tulanh: 'tủ lạnh',
  'tu lanh': 'tủ lạnh',
  mg: 'máy giặt',
  maygiat: 'máy giặt',
  'may giat': 'máy giặt',
  ml: 'máy lạnh',
  maylanh: 'máy lạnh',
  'may lanh': 'máy lạnh',
  noichien: 'nồi chiên không dầu',
  'noi chien': 'nồi chiên không dầu',
  ko: 'không',
  k: 'không',
  bp: 'bàn phím',
  banphim: 'bàn phím',
  'ban phim': 'bàn phím',
  tn: 'tai nghe',
  tainghe: 'tai nghe',
  'tai nghe': 'tai nghe bluetooth',
  quat: 'quạt điện',
  'quat dien': 'quạt điện',
  dieuhoa: 'điều hòa',
  'dieu hoa': 'điều hòa',
  senvoi: 'sen vòi',
  'sen voi': 'sen vòi',
  chaurua: 'chậu rửa',
  'chau rua': 'chậu rửa',
  tbvs: 'thiết bị vệ sinh',
};

// ── Vietnamese Anchor Categories (Danh từ cốt lõi định danh sản phẩm) ─────────────
const VIETNAMESE_ANCHOR_CATEGORIES = [
  { key: 'chuot', aliases: ['chuot', 'mouse', 'chuot khong day', 'chuot co day', 'chuot gaming'] },
  { key: 'ban phim', aliases: ['ban phim', 'bp', 'keyboard', 'ban phim co', 'ban phim khong day'] },
  { key: 'tai nghe', aliases: ['tai nghe', 'tn', 'headphone', 'earphone', 'airpod', 'earbuds', 'headset'] },
  { key: 'loa', aliases: ['loa', 'speaker', 'soundbar', 'loa bluetooth', 'loa keo', 'dan karaoke'] },
  { key: 'tivi', aliases: ['tivi', 'ti vi', 'tv', 'smart tivi', 'smart tv', 'television'] },
  { key: 'tu lanh', aliases: ['tu lanh', 'tl', 'refrigerator', 'fridge', 'tu lanh 2 canh', 'tu lanh 4 canh', 'side by side'] },
  { key: 'tu dong', aliases: ['tu dong', 'freezer'] },
  { key: 'tu mat', aliases: ['tu mat'] },
  { key: 'may giat', aliases: ['may giat', 'mg', 'washing machine', 'may giat say', 'may say quan ao'] },
  { key: 'may say', aliases: ['may say', 'dryer'] },
  { key: 'dieu hoa', aliases: ['dieu hoa', 'may lanh', 'ml', 'air conditioner', 'ac'] },
  { key: 'may loc khong khi', aliases: ['may loc khong khi', 'air purifier', 'loc khong khi'] },
  { key: 'may loc nuoc', aliases: ['may loc nuoc', 'water purifier', 'loc nuoc'] },
  { key: 'may hut bui', aliases: ['may hut bui', 'vacuum', 'robot hut bui'] },
  { key: 'noi chien khong dau', aliases: ['noi chien khong dau', 'noi chien', 'air fryer'] },
  { key: 'noi com dien', aliases: ['noi com dien', 'noi com'] },
  { key: 'dien thoai', aliases: ['dien thoai', 'dt', 'dtdd', 'smartphone', 'phone', 'iphone', 'galaxy'] },
  { key: 'laptop', aliases: ['laptop', 'mb', 'macbook', 'may tinh xach tay', 'notebook'] },
  { key: 'tablet', aliases: ['tablet', 'tb', 'ipad', 'may tinh bang'] },
  { key: 'dong ho', aliases: ['dong ho', 'smartwatch', 'apple watch'] },
  { key: 'quat dien', aliases: ['quat dien', 'quat', 'quat dung', 'quat lung'] },
  { key: 'may triet long', aliases: ['may triet long'] },
  { key: 'may rua chen', aliases: ['may rua chen', 'may rua bat', 'dishwasher'] },
  { key: 'bep tu', aliases: ['bep tu', 'bep dien tu', 'bep hong ngoai', 'bep gas'] },
  { key: 'bon cau', aliases: ['bon cau', 'toilet', 'bancau'] },
  { key: 'sen voi', aliases: ['sen voi', 'sen tam', 'voi sen'] },
  { key: 'chau rua', aliases: ['chau rua', 'lavabo'] },
];

// ── Vietnamese Compound Modifiers (Thuộc tính & đặc điểm ghép) ───────────────
const VIETNAMESE_COMPOUND_MODIFIERS = [
  'khong day',
  'co day',
  'cong thai hoc',
  'chong on',
  'khong dau',
  'khong khi',
  'nong lanh',
  'tiet kiem dien',
  'inverter',
  'side by side',
  'multi door',
  'cua truoc',
  'cua tren',
  'cam tay',
  'thong minh',
  'bluetooth',
  'gaming',
  'chinh hang',
  'gia re',
];

// Generic modifiers, specs, and stop-tokens that should have lower scoring weight
const GENERIC_MODIFIERS = new Set([
  'pro', 'max', 'plus', 'ultra', 'mini', 'lite', 'slim', 'air', 'fe', 'se',
  'inch', '"', 'in', 'gb', 'tb', 'mb', 'ram', 'ssd', 'hdd', 'rom',
  '4k', '8k', '2k', 'fhd', 'hd', '5g', '4g', 'lte', 'wifi', 'bluetooth',
  'chinh', 'hang', 'new', 'gen', 'series', 'core', 'cpu', 'gpu',
  '11', '12', '13', '14', '15', '16', '17', '18', '24', '32', '40', '43', '50', '55', '65', '75', '85',
  '128gb', '256gb', '512gb', '1tb', '2tb', '8gb', '16gb', '18gb', '32gb', '64gb',
  'black', 'white', 'gray', 'grey', 'silver', 'gold', 'blue', 'pink', 'yellow', 'green', 'titan', 'titanium',
  'gia', 're', 'tot', 'cao', 'cap', 'loai', 'mau'
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
 * Enhanced Query Understanding Parser (Shopee/Tiki Standard)
 * Tokenizes search query into clean compound tokens, anchors, modifiers and synonyms
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
      compoundTokens: [],
      anchorCategories: [],
      primaryAnchor: null,
      acronyms: [],
      synonyms: [],
      synonymMap: {},
      predictedQuery: '',
      didYouMean: '',
      suggestedKeywords: [],
      isTypo: false,
    };
  }

  const raw = query.trim();
  const normalized = removeVietnameseTones(raw);

  // 1. Extract Compound Modifiers & Compounds from normalized string
  const detectedCompounds = [];
  VIETNAMESE_COMPOUND_MODIFIERS.forEach((mod) => {
    if (normalized.includes(mod)) {
      detectedCompounds.push(mod);
    }
  });

  // 2. Identify Anchor Categories (Danh từ chỉ định)
  const detectedAnchors = [];
  const synonymMap = {};
  const synonyms = [];

  VIETNAMESE_ANCHOR_CATEGORIES.forEach((cat) => {
    const isMatched = cat.aliases.some((alias) => {
      const aliasNorm = removeVietnameseTones(alias);
      const regex = new RegExp(`(?:^|\\s|[-_])${aliasNorm}(?:$|\\s|[-_])`, 'i');
      return regex.test(normalized);
    });
    if (isMatched) {
      detectedAnchors.push(cat.key);
      synonyms.push(cat.key);
      cat.aliases.forEach((a) => {
        const aNorm = removeVietnameseTones(a);
        synonyms.push(aNorm);
        synonymMap[aNorm] = cat.key;
      });
    }
  });

  // Check common aliases (e.g. tl, snoy, pana)
  const cleanTokensString = normalized.replace(/[()[\]{}:;,.!?+=\-_/\\*~"']/g, ' ');
  const rawTokens = cleanTokensString.split(/\s+/).filter(Boolean);

  rawTokens.forEach((t) => {
    if (COMMON_SEARCH_ALIASES[t]) {
      const expanded = removeVietnameseTones(COMMON_SEARCH_ALIASES[t]);
      synonyms.push(expanded);
      synonymMap[t] = expanded;
    }
  });

  // 3. Fallback prefix token detection for Vietnamese partial queries (e.g. "cong" -> "cong thai hoc")
  if (normalized.includes('cong') && !detectedCompounds.includes('cong thai hoc')) {
    if (detectedAnchors.includes('chuot') || detectedAnchors.includes('ban phim')) {
      detectedCompounds.push('cong thai hoc');
    }
  }

  const acronyms = extractDynamicAcronyms(raw);

  let predictedQuery = raw;
  let didYouMean = '';
  let isTypo = false;
  let suggestedKeywords = [];

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

  const uniqueSynonyms = [...new Set(synonyms.filter(Boolean))];
  const nonTrivialTokens = rawTokens.filter((t) => t.length >= 2);
  const coreTokens = nonTrivialTokens.filter((t) => !isGenericToken(t));
  const modifierTokens = nonTrivialTokens.filter((t) => isGenericToken(t));

  return {
    raw,
    normalized,
    tokens: rawTokens,
    coreTokens,
    modifierTokens,
    compoundTokens: detectedCompounds,
    anchorCategories: [...new Set(detectedAnchors)],
    primaryAnchor: detectedAnchors[0] || null,
    acronyms,
    synonyms: uniqueSynonyms,
    synonymMap,
    predictedQuery: predictedQuery || raw,
    didYouMean,
    isTypo,
    suggestedKeywords,
  };
};

/**
 * Calculates relevance score for an item dynamically based on title, brand, category, anchor guard and query tokens
 * Adheres strictly to Shopee/Tiki relevance & category guard model.
 */
const calculateRelevanceScore = (item, parsedQuery) => {
  const {
    normalized: queryNorm,
    tokens = [],
    coreTokens = [],
    modifierTokens = [],
    compoundTokens = [],
    anchorCategories = [],
    primaryAnchor,
    acronyms = [],
    synonyms = [],
    didYouMean = '',
  } = parsedQuery;

  const titleNorm = removeVietnameseTones(item.name || item.title || '');
  const brandNorm = removeVietnameseTones(item.brand?.name || '');
  const slugNorm = removeVietnameseTones(item.slug || '');
  const catNames = Array.isArray(item.categories)
    ? item.categories
        .filter(Boolean)
        .map((c) => removeVietnameseTones(c?.name || (typeof c === 'string' ? c : '')))
        .join(' ')
    : '';
  const descNorm = removeVietnameseTones(item.description || item.excerpt || item.content || '');
  const codeNorm = removeVietnameseTones(item.sku || item.productCode || item.code || '');
  const searchTokensNorm = (item.searchTokens || []).map((t) => removeVietnameseTones(t));

  // ── 1. HARD ANCHOR GUARD (Shopee / Google Rule) ───────────────────────────
  // If query contains an explicit Anchor Category (e.g. "chuot", "tivi", "tu lanh", "may loc khong khi"),
  // the candidate product MUST belong to that category or contain that anchor noun in title/slug/category!
  if (anchorCategories.length > 0) {
    const hasAnchorMatch = anchorCategories.some((anchor) => {
      const flexiblePattern = anchor
        .split(/\s+/)
        .map((w) => removeVietnameseTones(w))
        .join('[-_\\s]+');
      const anchorRegex = new RegExp(`(?:^|[\\s-_])${flexiblePattern}(?:$|[\\s-_])`, 'i');
      return (
        anchorRegex.test(titleNorm) ||
        anchorRegex.test(slugNorm) ||
        anchorRegex.test(catNames) ||
        searchTokensNorm.some((st) => anchorRegex.test(st))
      );
    });

    // Hard drop: If searching for "chuột" but candidate is "Máy lọc không khí" -> Score = 0 immediately!
    if (!hasAnchorMatch) {
      return 0;
    }
  }

  let score = 0;

  // ── 2. Exact phrase & prefix match in title / slug ───────────────────────
  if (titleNorm === queryNorm || slugNorm.includes(queryNorm.replace(/\s+/g, '-'))) {
    score += 600;
  } else if (titleNorm.startsWith(queryNorm)) {
    score += 450;
  } else if (titleNorm.includes(queryNorm)) {
    score += 350;
  }

  // ── 3. Exact match in brand / category / didYouMean ──────────────────────
  if (didYouMean) {
    const didYouMeanNorm = removeVietnameseTones(didYouMean);
    if (brandNorm.includes(didYouMeanNorm)) score += 300;
    if (catNames.includes(didYouMeanNorm)) score += 250;
    if (titleNorm.includes(didYouMeanNorm)) score += 250;
  }

  // ── 4. Exact match in code / SKU ─────────────────────────────────────────
  if (codeNorm && codeNorm.includes(queryNorm)) {
    score += 400;
  }

  // ── 5. Anchor Category Match Boost ────────────────────────────────────────
  if (primaryAnchor) {
    const primaryPattern = primaryAnchor.split(/\s+/).join('[-_\\s]+');
    const primaryRegex = new RegExp(primaryPattern, 'i');
    if (primaryRegex.test(titleNorm) || primaryRegex.test(slugNorm)) {
      score += 250;
    }
    if (primaryRegex.test(catNames)) {
      score += 150;
    }
  }

  // ── 6. Compound Modifiers Match Boost (e.g. "khong day", "cong thai hoc") ─
  compoundTokens.forEach((comp) => {
    const compPattern = comp.split(/\s+/).join('[-_\\s]+');
    const compRegex = new RegExp(compPattern, 'i');
    if (compRegex.test(titleNorm) || compRegex.test(slugNorm) || compRegex.test(catNames) || compRegex.test(descNorm)) {
      score += 180;
    }
  });

  // ── 7. Token matching with differentiated weights ────────────────────────
  let matchedCoreCount = 0;
  let matchedModifierCount = 0;

  coreTokens.forEach((token) => {
    const tokenAliases = [token];
    if (parsedQuery.synonymMap && parsedQuery.synonymMap[token]) {
      tokenAliases.push(parsedQuery.synonymMap[token]);
    }
    const syns = [
      ...tokenAliases,
      ...synonyms.filter((s) => s.includes(token) || token.includes(s)),
    ];

    const matchInTitle = syns.some((s) => {
      const p = s.split(/\s+/).join('[-_\\s]+');
      return new RegExp(p, 'i').test(titleNorm) || new RegExp(p, 'i').test(slugNorm);
    });
    const matchInBrand = syns.some((s) => brandNorm.includes(s));
    const matchInCat = syns.some((s) => catNames.includes(s));
    const matchInCode = syns.some((s) => codeNorm.includes(s));

    if (matchInTitle) {
      score += 90;
      matchedCoreCount++;
    } else if (matchInBrand) {
      score += 80;
      matchedCoreCount++;
    } else if (matchInCat) {
      score += 60;
      matchedCoreCount++;
    } else if (matchInCode) {
      score += 40;
      matchedCoreCount++;
    } else if (descNorm.includes(token)) {
      score += 10;
    }
  });

  modifierTokens.forEach((token) => {
    const syns = [token, ...synonyms.filter((s) => s.includes(token) || token.includes(s))];
    const matchInTitle = syns.some((s) => titleNorm.includes(s) || slugNorm.includes(s));
    const matchInCode = syns.some((s) => codeNorm.includes(s));

    if (matchInTitle) {
      score += 25;
      matchedModifierCount++;
    } else if (matchInCode) {
      score += 15;
      matchedModifierCount++;
    }
  });

  // ── 8. Token Coverage bonus & Penalty (Tỷ lệ bao phủ từ khóa) ────────────
  const totalTokensToMatch = coreTokens.length + modifierTokens.length;
  const totalMatched = matchedCoreCount + matchedModifierCount;

  if (totalTokensToMatch > 0) {
    const coverageRatio = totalMatched / totalTokensToMatch;
    if (coverageRatio >= 1.0) {
      score += 300;
    } else if (coverageRatio >= 0.75) {
      score += 180;
    } else if (coverageRatio >= 0.5) {
      score += 60;
    } else if (coverageRatio < 0.4 && totalTokensToMatch >= 3) {
      // Harsh penalty if query is long but candidate only matches 1 random token
      score -= 200;
    }
  }

  // ── 9. Dynamic Acronym match ─────────────────────────────────────────────
  tokens.forEach((token) => {
    const itemAcronyms = extractDynamicAcronyms(item.name || item.title || '');
    if (itemAcronyms.includes(token)) {
      score += 100;
    }
  });

  return Math.max(0, score);
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
  COMMON_SEARCH_ALIASES,
  VIETNAMESE_ANCHOR_CATEGORIES,
};
