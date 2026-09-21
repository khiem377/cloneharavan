const searchService = require('../services/search.service');

// GET /api/search?q=keyword&domain=all&page=1&limit=20
const globalSearch = async (req, res, next) => {
  try {
    // Truyền cả req để service lấy sessionId (x-session-id) và clientIp
    const data = await searchService.globalSearch(req.query, req);
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// GET /api/search/suggest?q=keyword
const getInstantSuggestions = async (req, res, next) => {
  try {
    const data = await searchService.getInstantSuggestions(req.query.q || req.query.query || '');
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// GET /api/search/trending?limit=10&type=all|rising
const getTrendingKeywords = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const type  = req.query.type  || 'all'; // 'all' | 'rising'
    const data  = await searchService.getTrendingKeywords(limit, type);
    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/search/trending — Admin toggle pin keyword
const toggleKeywordTrending = async (req, res, next) => {
  try {
    const { keyword, isTrending } = req.body;
    const data = await searchService.setKeywordTrending(keyword, isTrending);
    res.json({ status: 'success', message: 'Đã cập nhật trạng thái từ khóa hot', data });
  } catch (error) {
    next(error);
  }
};

// POST /api/search/click — Ghi nhận user click vào kết quả search (tăng CTR)
// Gọi từ client khi user click sản phẩm từ search results
const recordSearchClick = async (req, res, next) => {
  try {
    const { keyword } = req.body;
    await searchService.recordSearchClick(keyword);
    res.json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

// POST /api/search/purchase — Ghi nhận keyword dẫn đến purchase (Shopee-style signal)
// Gọi từ client sau khi checkout thành công
// Body: { keywords: ["iphone 15", "samsung"] }
const recordPurchaseKeyword = async (req, res, next) => {
  try {
    const { keywords } = req.body;
    await searchService.recordPurchaseKeyword(keywords);
    res.json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch,
  getInstantSuggestions,
  getTrendingKeywords,
  toggleKeywordTrending,
  recordSearchClick,
  recordPurchaseKeyword,
};
