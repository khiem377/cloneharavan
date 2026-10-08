const express = require('express');
const router = express.Router();

const {
  getProvinces,
  getDistricts,
  getWards,
  getNewProvinces,
  getNewWards,
  getPostMergerAddress,
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

module.exports = router;
