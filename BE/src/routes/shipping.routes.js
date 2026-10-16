const express = require('express');
const router = express.Router();

const {
  getProvinces,
  getDistricts,
  getWards,
  getNewProvinces,
  getNewWards,
  getPostMergerAddress,
  getGhtkProvinces,
  getGhtkWards,
  getGhtkLevel4Address,
  calculateFee,
} = require('../controllers/shipping.controller');

// ==========================================
// MASTER DATA LOCATIONS FROM GHN (V2 & V3)
// ==========================================
// 1. Cấu trúc cũ (3 cấp: Tỉnh -> Quận -> Phường)
router.get('/provinces', getProvinces);
router.get('/districts', getDistricts);
router.get('/wards', getWards);

// 2. Cấu trúc mới GHN v3 (2 cấp: Tỉnh mới -> Phường mới)
router.get('/new-provinces', getNewProvinces);
router.get('/new-wards', getNewWards);

// 3. Đối soát sáp nhập địa chỉ đồng bộ chuẩn GHN
router.get('/post-merger-lookup', getPostMergerAddress);

// ==========================================
// GHTK (Giao Hàng Tiết Kiệm) OPEN API 2.0 & GATEWAY
// ==========================================
// 4. Tra cứu Tỉnh/Thành phố GHTK (kèm old_provinces: Bà Rịa, Bình Dương...)
router.get('/ghtk/provinces', getGhtkProvinces);

// 5. Tra cứu Phường/Xã GHTK (kèm old_wards: Phường 14, Phường 5...)
router.get('/ghtk/wards', getGhtkWards);

// 6. Tra cứu địa chỉ đặc biệt cấp 4 (Tòa nhà, hẻm, đường, chung cư...)
router.get('/ghtk/level4', getGhtkLevel4Address);

// ==========================================
// TÍNH PHÍ VẬN CHUYỂN GHN (SHIPPING FEE)
// ==========================================
// Hỗ trợ cả POST (chuẩn RESTful) và GET (tra cứu nhanh)
router.post('/fee', calculateFee);
router.get('/fee', calculateFee);

module.exports = router;
