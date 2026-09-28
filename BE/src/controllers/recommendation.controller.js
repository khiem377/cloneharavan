const recommendationService = require('../services/recommendation.service');

// ── POST /api/recommendations/interactions ─────────────────────────────────
const recordInteraction = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const {
      sessionId,
      productId,
      interactionType,
      dwellTime = 0,
      context   = {},
    } = req.body;

    const data = await recommendationService.recordUserInteraction({
      userId,
      sessionId,
      productId,
      interactionType,
      dwellTime,
      context,
    });

    res.json({ status: 'success', message: 'Đã ghi nhận tương tác người dùng', data });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/recommendations/personalized ─────────────────────────────────
// 7-layer hybrid engine: SVD + Content + ItemCF + Trending
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId    = req.user?._id || null;
    const sessionId =
      req.query.sessionId ||
      req.headers['x-session-id'] ||
      req.body?.sessionId ||
      '';
    const limit = req.query.limit || 10;

    const data = await recommendationService.getPersonalizedRecommendations({
      userId,
      sessionId,
      limit,
    });

    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/recommendations/session-based ────────────────────────────────
// Real-time session recommendations — không cần Python batch
const getSessionBasedRecommendations = async (req, res, next) => {
  try {
    const userId    = req.user?._id || null;
    const sessionId =
      req.query.sessionId ||
      req.headers['x-session-id'] ||
      '';
    const limit = req.query.limit || 8;

    const data = await recommendationService.getSessionBasedRecommendations({
      userId,
      sessionId,
      limit,
    });

    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/recommendations/trending ─────────────────────────────────────
// Sản phẩm trending dựa trên interaction weight 24h
const getTrendingRecommendations = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const data  = await recommendationService.getTrendingRecommendations(limit);
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/recommendations/similar/:productId ───────────────────────────
// Nâng cấp: Item-CF Jaccard + Content-based multi-factor scoring
const getSimilarProducts = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit         = req.query.limit || 8;
    const data          = await recommendationService.getSimilarProducts(productId, limit);
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/recommendations/compute-item-cf ─────────────────────────────
// Admin trigger: compute Item-to-Item similarity matrix
const computeItemCF = async (req, res, next) => {
  try {
    const count = await recommendationService.computeItemSimilarityMatrix();
    res.json({
      status: 'success',
      message: `Đã tính Item-CF similarity cho ${count} sản phẩm`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordInteraction,
  getPersonalizedRecommendations,
  getSessionBasedRecommendations,
  getTrendingRecommendations,
  getSimilarProducts,
  computeItemCF,
};
