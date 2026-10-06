const ghnService = require('../services/ghn.service');

/**
 * GET /api/v1/shipping/provinces (Cấu trúc cũ - 63 tỉnh)
 */
const getProvinces = async (req, res, next) => {
  try {
    const provinces = await ghnService.getProvinces();
    res.json({
      success: true,
      data: { provinces },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/shipping/districts?province_id=...
 */
const getDistricts = async (req, res, next) => {
  try {
    const { province_id, provinceId } = req.query;
    const pid = province_id || provinceId;
    if (!pid) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tham số province_id',
      });
    }

    const districts = await ghnService.getDistricts(pid);
    res.json({
      success: true,
      data: { districts },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/shipping/wards?district_id=...
 */
const getWards = async (req, res, next) => {
  try {
    const { district_id, districtId } = req.query;
    const did = district_id || districtId;
    if (!did) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tham số district_id',
      });
    }

    const wards = await ghnService.getWards(did);
    res.json({
      success: true,
      data: { wards },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/shipping/new-provinces (GHN v3 - 34 tỉnh/thành mới)
 */
const getNewProvinces = async (req, res, next) => {
  try {
    const provinces = await ghnService.getNewProvinces();
    res.json({
      success: true,
      data: { provinces },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/shipping/new-wards?province_id=... (GHN v3 - Phường/xã mới)
 */
const getNewWards = async (req, res, next) => {
  try {
    const { province_id, provinceId } = req.query;
    const pid = province_id || provinceId;
    const wards = await ghnService.getNewWards(pid);
    res.json({
      success: true,
      data: { wards },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/shipping/post-merger-lookup?province=...&district=...&ward=...&detailAddress=...
 * Tra cứu và đối soát địa chỉ sau sáp nhập đồng bộ 100% chuẩn GHN
 */
const getPostMergerAddress = async (req, res, next) => {
  try {
    const {
      province,
      district,
      ward,
      detailAddress,
      wardCode,
      ward_code,
      districtId,
      district_id,
      provinceId,
      province_id,
    } = req.query;

    const result = await ghnService.lookupGhnPostMergerAddress({
      province: province || '',
      district: district || '',
      ward: ward || '',
      detailAddress: detailAddress || '',
      wardCode: wardCode || ward_code || '',
      districtId: districtId || district_id || '',
      provinceId: provinceId || province_id || '',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getNewProvinces,
  getNewWards,
  getPostMergerAddress,
};
