const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload }  = require('../middleware/upload.middleware');

// ── Public: Client Frontend ────────────────────────────────────────────────

// Image Visual Search: POST /api/v1/search/image
router.post('/image',   upload.single('image'), controller.searchByImage);

// Full search: GET /api/search?q=iphone&domain=products&limit=20
router.get('/',  controller.globalSearch);
router.get('',   controller.globalSearch);

// Instant autocomplete: GET /api/search/suggest?q=ip
router.get('/suggest',  controller.getInstantSuggestions);

// Trending keywords: GET /api/search/trending?limit=10&type=rising
// type: 'all' (default) | 'rising' (đang tăng nhanh)
router.get('/trending', controller.getTrendingKeywords);

// Export search data to CSV for Python analytics: GET /api/v1/search/export-csv
router.get('/export-csv', controller.exportSearchCSV);

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
