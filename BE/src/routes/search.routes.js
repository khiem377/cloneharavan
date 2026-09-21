const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

// ── Public: Client Frontend ────────────────────────────────────────────────

// Full search: GET /api/search?q=iphone&domain=products&limit=20
router.get('/',         controller.globalSearch);

// Instant autocomplete: GET /api/search/suggest?q=ip
router.get('/suggest',  controller.getInstantSuggestions);

// Trending keywords: GET /api/search/trending?limit=10&type=rising
// type: 'all' (default) | 'rising' (đang tăng nhanh)
router.get('/trending', controller.getTrendingKeywords);

// Record search click (tăng CTR): POST /api/search/click { keyword: "iphone" }
// Gọi khi user click vào sản phẩm từ search results
router.post('/click',    controller.recordSearchClick);

// Record purchase signal (Shopee-style): POST /api/search/purchase { keywords: ["iphone 15"] }
// Gọi từ client sau khi checkout thành công để boost keyword dẫn đến mua
router.post('/purchase', controller.recordPurchaseKeyword);

// ── Admin Only ─────────────────────────────────────────────────────────────

// Toggle pin keyword: PATCH /api/search/trending { keyword: "iphone", isTrending: true }
router.patch('/trending', protect, controller.toggleKeywordTrending);

module.exports = router;
