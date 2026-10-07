const Product = require('../models/product.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');
const SearchLog = require('../models/searchLog.model');

// In-memory corpus cache
let cachedCorpus = null;
let lastCorpusBuildTime = 0;
const CORPUS_TTL_MS = 30 * 1000;

// Common Vietnamese E-Commerce Aliases & Synonyms Dictionary
const COMMON_SEARCH_ALIASES = {
  tv: 'tivi',
  'ti vi': 'tivi',
  tivi: 'tivi',
  boncau: 'bồn cầu',
  'bon cau': 'bồn cầu',
  ip: 'iphone',
  ss: 'samsung',
  dt: 'điện thoại',
  dienthoai: 'điện thoại',
  mb: 'macbook',
  mac: 'macbook',
  lap: 'laptop',
  tulanh: 'tủ lạnh',
  'tu lanh': 'tủ lạnh',
  maygiat: 'máy giặt',
  'may giat': 'máy giặt',
  noichien: 'nồi chiên không dầu',
  'noi chien': 'nồi chiên không dầu',
  tainghe: 'tai nghe',
  'tai nghe': 'tai nghe bluetooth',
  quat: 'quạt điện',
  'quat dien': 'quạt điện',
  dieuhoa: 'điều hòa',
  'dieu hoa': 'điều hòa',
  maylanh: 'máy lạnh',
  'may lanh': 'máy lạnh',
  senvoi: 'sen vòi',
  'sen voi': 'sen vòi',
  chaurua: 'chậu rửa',
  'chau rua': 'chậu rửa',
  tbvs: 'thiết bị vệ sinh',
};

// Universal E-Commerce Predictive Knowledge & Future Model Extrapolations (Google-grade)
const E_COMMERCE_PREDICTIVE_FOUNDATION = [
  // iPhone / Apple
  { text: 'iphone', type: 'brand', score: 490 },
  { text: 'iphone 16 pro max', type: 'model', score: 470 },
  { text: 'ipad', type: 'category', score: 465 },
  { text: 'iphone 15', type: 'model', score: 460 },
  { text: 'iphone 16', type: 'model', score: 455 },
  { text: 'iphone 15 pro max', type: 'model', score: 450 },

  // Samsung
  { text: 'Samsung', type: 'brand', score: 495 },
  { text: 'samsung galaxy', type: 'brand', score: 490 },
  { text: 'samsung galaxy s24 ultra', type: 'model', score: 470 },
  { text: 'samsung galaxy s23', type: 'model', score: 460 },

  // TV / Appliances / Sanitary
  { text: 'tivi', type: 'category', score: 490 },
  { text: 'smart tivi', type: 'category', score: 480 },
  { text: 'tivi 4k', type: 'category', score: 470 },
  { text: 'tivi sony 4k', type: 'model', score: 460 },
  { text: 'tivi toshiba', type: 'model', score: 455 },
  { text: 'bồn cầu', type: 'category', score: 490 },
  { text: 'bồn cầu 1 khối', type: 'category', score: 480 },
  { text: 'bồn cầu 2 khối', type: 'category', score: 475 },
  { text: 'bồn cầu âm tường', type: 'category', score: 470 },
  { text: 'sen tắm đứng', type: 'category', score: 450 },
  { text: 'chậu rửa lavabo', type: 'category', score: 450 },
  { text: 'tủ lạnh', type: 'category', score: 480 },
  { text: 'máy giặt inverter', type: 'category', score: 470 },
  { text: 'nồi chiên không dầu', type: 'category', score: 460 },
  { text: 'robot hút bụi', type: 'category', score: 450 },
];

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

const damerauLevenshteinDistance = (source, target) => {
  if (!source || !target) return (source || target || '').length;
  if (source === target) return 0;

  const srcLen = source.length;
  const tgtLen = target.length;
  const maxDist = srcLen + tgtLen;

  const da = {};
  for (let i = 0; i < srcLen; i++) da[source[i]] = 0;
  for (let j = 0; j < tgtLen; j++) da[target[j]] = 0;

  const d = Array(srcLen + 2)
    .fill(null)
    .map(() => Array(tgtLen + 2).fill(0));

  d[0][0] = maxDist;
  for (let i = 0; i <= srcLen; i++) {
    d[i + 1][0] = maxDist;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= tgtLen; j++) {
    d[0][j + 1] = maxDist;
    d[1][j + 1] = j;
  }

  for (let i = 1; i <= srcLen; i++) {
    let db = 0;
    for (let j = 1; j <= tgtLen; j++) {
      const i1 = da[target[j - 1]] || 0;
      const j1 = db;
      let cost = 1;
      if (source[i - 1] === target[j - 1]) {
        cost = 0;
        db = j;
      }

      d[i + 1][j + 1] = Math.min(
        d[i][j] + cost,
        d[i + 1][j + 1] + 1,
        d[i][j + 1] + 1,
        d[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1)
      );
    }
    da[source[i - 1]] = i;
  }

  return d[srcLen + 1][tgtLen + 1];
};

const calculateSimilarity = (s1, s2) => {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const dist = damerauLevenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
};

const extractDynamicAcronyms = (phrase) => {
  if (!phrase) return [];
  const normalized = removeVietnameseTones(phrase);
  const words = normalized.split(/[^a-z0-9]+/i).filter(Boolean);

  if (words.length < 1) return [];

  const acronyms = new Set();

  if (words.length >= 2) {
    const fullAcronym = words.map((w) => w[0]).join('');
    if (fullAcronym.length >= 2) {
      acronyms.add(fullAcronym);
    }
  }

  return Array.from(acronyms);
};

const extrapolateFutureVariations = (phrase) => {
  if (!phrase) return [];
  const norm = removeVietnameseTones(phrase);
  const variations = [];

  const iphoneMatch = norm.match(/\biphone\s*(\d{2})\b/i);
  if (iphoneMatch) {
    variations.push({ text: 'iphone', score: 480, type: 'brand' });
    variations.push({ text: 'iphone 16 pro max', score: 450, type: 'model' });
    variations.push({ text: 'iphone 15 pro max', score: 420, type: 'model' });
  }

  return variations;
};

const buildStoreCorpus = async () => {
  try {
    const [products, brands, categories, searchLogs] = await Promise.all([
      Product.find({ isActive: true, status: 'published' })
        .select('name slug sku productCode brand categories tags searchTokens')
        .populate('brand', 'name slug')
        .populate('categories', 'name slug')
        .limit(2000)
        .lean(),

      Brand.find({ isActive: true }).select('name slug logo').lean(),

      Category.find({ isActive: true }).select('name slug icon').lean(),

      SearchLog.find({ count: { $gte: 1 } })
        .select('keyword count trendingScore isTrending')
        .sort({ trendingScore: -1, count: -1 })
        .limit(300)
        .lean(),
    ]);

    const wordFreqMap = new Map();
    const wordOriginalMap = new Map();
    const acronymMap = new Map();
    const phraseCatalog = [];
    const seenPhrases = new Set();

    const addWord = (rawWord) => {
      if (!rawWord || rawWord.length < 2) return;
      const norm = removeVietnameseTones(rawWord);
      if (!norm || norm.length < 2) return;

      const currentFreq = wordFreqMap.get(norm) || 0;
      wordFreqMap.set(norm, currentFreq + 1);

      if (!wordOriginalMap.has(norm)) {
        wordOriginalMap.set(norm, rawWord);
      }
    };

    const addPhrase = (phraseText, type, entity = null, baseScore = 100) => {
      if (!phraseText || typeof phraseText !== 'string') return;
      const clean = phraseText.trim();
      const norm = removeVietnameseTones(clean);
      if (!norm || norm.length < 2 || seenPhrases.has(norm)) return;
      seenPhrases.add(norm);

      phraseCatalog.push({
        text: clean,
        norm,
        type,
        entity,
        score: baseScore,
      });

      // Index words from phrase
      const words = clean.split(/\s+/).filter(Boolean);
      words.forEach(addWord);

      // Index dynamic acronyms from phrase
      const acronyms = extractDynamicAcronyms(clean);
      acronyms.forEach((acr) => {
        const existing = acronymMap.get(acr) || [];
        existing.push({
          text: clean,
          norm,
          type,
          entity,
          score: baseScore,
        });
        acronymMap.set(acr, existing);
      });
    };

    // 1. Index Brands (pure brand names)
    brands.forEach((b) => {
      addPhrase(b.name, 'brand', b, 350);
    });

    // 2. Index Categories
    categories.forEach((c) => {
      addPhrase(c.name, 'category', c, 450);
    });

    // 3. Index Search Logs (Trending & User Searches & AI Seed Data)
    searchLogs.forEach((log) => {
      if (log.keyword && log.keyword.length >= 2) {
        const bonus = Math.min(log.count || 1, 100) + (log.trendingScore ? log.trendingScore * 0.5 : 0);
        addPhrase(log.keyword, 'trending', null, 300 + bonus);
      }
    });

    // 4. Index E-Commerce Predictive Knowledge
    E_COMMERCE_PREDICTIVE_FOUNDATION.forEach((item) => {
      addPhrase(item.text, item.type, null, item.score);
    });

    // 5. Index Products & Natural N-Grams
    products.forEach((p) => {
      addPhrase(p.name, 'product', p, 250);

      // Extract 2-3 word prefixes from product titles
      const words = (p.name || '').split(/\s+/).filter(Boolean);
      if (words.length >= 2) {
        addPhrase(words.slice(0, 2).join(' '), 'keyword', null, 220);
      }
      if (words.length >= 3) {
        addPhrase(words.slice(0, 3).join(' '), 'keyword', null, 200);
      }
      if (words.length >= 4) {
        addPhrase(words.slice(0, 4).join(' '), 'keyword', null, 180);
      }

      const futures = extrapolateFutureVariations(p.name);
      futures.forEach((f) => {
        addPhrase(f.text, f.type, null, f.score);
      });

      if (p.sku) addWord(p.sku);
      if (p.productCode) addWord(p.productCode);
    });

    // Sort acronym matches by score descending
    for (const [acr, list] of acronymMap.entries()) {
      list.sort((a, b) => b.score - a.score);
    }

    cachedCorpus = {
      version: 4,
      wordFreqMap,
      wordOriginalMap,
      acronymMap,
      phraseCatalog,
      brands,
      categories,
      productsCount: products.length,
      builtAt: Date.now(),
    };
    lastCorpusBuildTime = Date.now();

    return cachedCorpus;
  } catch (err) {
    console.error('[DynamicSearchCorpus] Error building corpus:', err.message);
    return cachedCorpus || {
      version: 4,
      wordFreqMap: new Map(),
      wordOriginalMap: new Map(),
      acronymMap: new Map(),
      phraseCatalog: [],
      brands: [],
      categories: [],
      productsCount: 0,
      builtAt: Date.now(),
    };
  }
};

/**
 * Get active corpus (auto-refreshes when cache expires)
 */
const getStoreCorpus = async (forceRefresh = false) => {
  const now = Date.now();
  if (!cachedCorpus || forceRefresh || cachedCorpus.version !== 4 || now - lastCorpusBuildTime > CORPUS_TTL_MS) {
    return await buildStoreCorpus();
  }
  return cachedCorpus;
};

/**
 * Dynamic Spell Corrector using Store Corpus
 */
const correctTokenUsingCorpus = (rawToken, corpus) => {
  if (!rawToken || rawToken.length <= 2) return rawToken;
  const norm = removeVietnameseTones(rawToken);

  if (corpus.wordFreqMap.has(norm)) {
    return corpus.wordOriginalMap.get(norm) || rawToken;
  }

  let bestCand = null;
  let bestScore = -1;

  for (const [vocabNorm, freq] of corpus.wordFreqMap.entries()) {
    if (Math.abs(vocabNorm.length - norm.length) > 2) continue;

    const dist = damerauLevenshteinDistance(norm, vocabNorm);
    const maxLen = Math.max(norm.length, vocabNorm.length);
    const sim = 1 - dist / maxLen;

    if (dist <= 2 && sim >= 0.75) {
      const freqWeight = Math.min(Math.log10(freq + 1) * 0.1, 0.3);
      const totalScore = sim + freqWeight;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestCand = vocabNorm;
      }
    }
  }

  if (bestCand && bestScore >= 0.80) {
    return corpus.wordOriginalMap.get(bestCand) || bestCand;
  }

  return rawToken;
};

/**
 * Dynamic Google-grade Prediction & Autocomplete Engine
 */
const predictFromCorpus = (rawQuery, corpus) => {
  if (!rawQuery || !rawQuery.trim() || !corpus) {
    return {
      prediction: '',
      didYouMean: '',
      isTypo: false,
      isAlias: false,
      suggestedKeywords: [],
      synonyms: [],
    };
  }

  const raw = rawQuery.trim();
  const norm = removeVietnameseTones(raw);
  const normNoSpaces = norm.replace(/\s+/g, '');
  const tokens = norm.split(/\s+/).filter(Boolean);

  let prediction = '';
  let didYouMean = '';
  let isTypo = false;
  let isAlias = false;
  const suggestedKeywords = [];
  const synonyms = [];
  const candidateMap = new Map(); // textNorm -> { text, score }

  const addCandidate = (text, score = 100) => {
    if (!text || typeof text !== 'string') return;
    const clean = text.trim();
    const cleanNorm = removeVietnameseTones(clean);
    if (!cleanNorm || candidateMap.has(cleanNorm)) return;

    candidateMap.set(cleanNorm, {
      text: clean,
      norm: cleanNorm,
      score,
    });
  };

  // 1. Check Known Aliases first (e.g. 'tv' -> 'tivi', 'bon cau' -> 'bồn cầu')
  if (COMMON_SEARCH_ALIASES[norm] || COMMON_SEARCH_ALIASES[normNoSpaces]) {
    const aliasResolved = COMMON_SEARCH_ALIASES[norm] || COMMON_SEARCH_ALIASES[normNoSpaces];
    isAlias = true;
    prediction = aliasResolved;
    addCandidate(aliasResolved, 1500);
    synonyms.push(removeVietnameseTones(aliasResolved));
  }

  // 2. Check Acronym Map
  const acronymCandidates =
    corpus.acronymMap.get(norm) ||
    corpus.acronymMap.get(normNoSpaces) ||
    [];

  if (acronymCandidates.length > 0) {
    isAlias = true;
    acronymCandidates.forEach((item, index) => {
      addCandidate(item.text, item.score + 300 - index * 5);
      synonyms.push(item.norm);
    });
  }

  // 3. Dynamic Spell / Typo Correction
  const correctedTokens = tokens.map((t) => {
    const corrected = correctTokenUsingCorpus(t, corpus);
    return removeVietnameseTones(corrected);
  });
  const correctedNorm = correctedTokens.join(' ');
  if (correctedNorm !== norm) {
    isTypo = true;
    const origDisplayTokens = tokens.map((t) => correctTokenUsingCorpus(t, corpus));
    didYouMean = origDisplayTokens.join(' ');
    synonyms.push(correctedNorm);
  }

  // 4. Prefix & Fuzzy Match against Phrase Catalog
  const searchTargets = [
    norm,
    normNoSpaces,
    prediction ? removeVietnameseTones(prediction) : null,
    correctedNorm !== norm ? correctedNorm : null,
  ].filter(Boolean);

  for (const item of corpus.phraseCatalog) {
    for (const target of searchTargets) {
      if (item.norm === target) {
        addCandidate(item.text, item.score + 1000);
      } else if (item.norm.startsWith(target)) {
        // Starts with target prefix (e.g. "bồn cầu 1 khối" starts with "bon cau")
        addCandidate(item.text, item.score + 700);
      } else if (item.norm.split(/\s+/).some((w) => w.startsWith(target))) {
        // Word boundary starts with target
        addCandidate(item.text, item.score + 400);
      } else if (item.norm.includes(target) && target.length >= 4) {
        addCandidate(item.text, item.score + 150);
      } else if (target.length >= 4) {
        const sim = calculateSimilarity(target, item.norm);
        if (sim >= 0.75) {
          addCandidate(item.text, item.score + sim * 200);
        }
      }
    }
  }

  // Sort candidates by score
  const sortedCandidates = Array.from(candidateMap.values()).sort((a, b) => b.score - a.score);

  if (sortedCandidates.length > 0) {
    if (!prediction) {
      prediction = sortedCandidates[0].text;
    }
    sortedCandidates.slice(0, 8).forEach((cand) => {
      suggestedKeywords.push({
        text: cand.text,
      });
      synonyms.push(cand.norm);
    });
  }

  // Determine if typo/prediction should trigger "Có thể bạn muốn tìm: X (Thay vì Y)"
  const finalPrediction = prediction || didYouMean || raw;
  const isDifferentFromRaw =
    Boolean(finalPrediction) &&
    finalPrediction.trim().toLowerCase() !== raw.trim().toLowerCase();

  return {
    prediction: finalPrediction,
    didYouMean: didYouMean || (isDifferentFromRaw ? finalPrediction : ''),
    isTypo: isTypo || isDifferentFromRaw,
    isAlias,
    suggestedKeywords,
    synonyms: [...new Set(synonyms)],
  };
};

module.exports = {
  removeVietnameseTones,
  damerauLevenshteinDistance,
  calculateSimilarity,
  extractDynamicAcronyms,
  extrapolateFutureVariations,
  buildStoreCorpus,
  getStoreCorpus,
  correctTokenUsingCorpus,
  predictFromCorpus,
};
