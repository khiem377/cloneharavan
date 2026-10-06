const tinhThanhPhoService = require('./tinhThanhPho.service');

/**
 * Adapter gọi trực tiếp TinhThanhPho.com API (https://www.tinhthanhpho.com/api-docs)
 */
const lookupPostMergerAddress = async ({
  province = '',
  district = '',
  ward = '',
  detailAddress = '',
  provinceCode = '',
  districtCode = '',
  wardCode = '',
}) => {
  return await tinhThanhPhoService.convertAddress({
    province,
    district,
    ward,
    detailAddress,
    provinceCode,
    districtCode,
    wardCode,
  });
};

module.exports = {
  lookupPostMergerAddress,
};
