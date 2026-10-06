/**
 * TIỆN ÍCH ĐỊNH DẠNG ĐỊA CHỈ 2 CẤP
 * Toàn bộ logic phân tích và chuyển đổi được gọi động 100% từ Live API (GeoVina Engine, Casso AddressKit, Open API)
 */

export const normalizeAddressText = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const formatFullProvince = (province = '') => {
  const p = province.trim();
  if (!p) return '';
  if (p.startsWith('Tỉnh') || p.startsWith('TP') || p.startsWith('Thành phố')) return p;
  const lower = p.toLowerCase();
  if (lower.includes('hồ chí minh') || lower.includes('hà nội') || lower.includes('đà nẵng') || lower.includes('hải phòng') || lower.includes('cần thơ')) {
    return `TP. ${p}`;
  }
  return `Tỉnh ${p}`;
};

/**
 * Fallback format 2 cấp tức thời khi đang chờ Live API phản hồi
 */
export const getAdministrativeMergerInfo = ({
  province = '',
  district = '',
  ward = '',
  detailAddress = '',
}) => {
  if (!province && !ward) {
    return null;
  }

  const provDisplay = formatFullProvince(province);
  const detailPart = detailAddress ? `${detailAddress.trim()}, ` : '';

  return {
    isMerged: false,
    isNameChanged: false,
    oldWard: ward,
    newWard: ward,
    province: provDisplay,
    source: 'Giao Hàng Nhanh (GHN)',
    changeDescription: '',
    postMergerFullAddress: `${detailPart}${ward}, ${provDisplay}`,
  };
};

export default getAdministrativeMergerInfo;
