/**
 * TIỆN ÍCH ĐỊNH DẠNG ĐỊA CHỈ GHN & CHUẨN HÓA SÁP NHẬP HÀNH CHÍNH (NQ 202/2025/QH15)
 * - Cấu trúc 3 cấp (Trước sáp nhập / truyền thống): [Số nhà], [Phường/Xã], [Quận/Huyện], [Tỉnh/Thành]
 * - Cấu trúc 2 cấp (Sau sáp nhập / GHN bưu chính): [Số nhà], [Phường/Xã], [Tỉnh/Thành]
 */

const DIRECT_CITIES = [
  'hồ chí minh',
  'ha noi',
  'hà nội',
  'ho chi minh',
  'đà nẵng',
  'da nang',
  'hải phòng',
  'hai phong',
  'cần thơ',
  'can tho',
  'huế',
  'hue',
];

export const formatProvinceName = (prov = '') => {
  if (!prov) return '';
  const trimmed = prov.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('tỉnh ') ||
    lower.startsWith('tp.') ||
    lower.startsWith('tp ') ||
    lower.startsWith('thành phố ')
  ) {
    return trimmed;
  }
  const isCity = DIRECT_CITIES.some((c) => lower.includes(c));
  return isCity ? `TP. ${trimmed}` : `Tỉnh ${trimmed}`;
};

export const getAdministrativeMergerInfo = ({
  province = '',
  district = '',
  ward = '',
  detailAddress = '',
}) => {
  if (!province && !ward) {
    return null;
  }

  const cleanDetail = detailAddress ? detailAddress.trim() : '';
  const formattedProv = formatProvinceName(province);

  // 1. Cấu trúc 3 cấp trước sáp nhập
  const preMergerParts = [cleanDetail, ward, district, formattedProv || province].filter(Boolean);
  const preMergerFullAddress = preMergerParts.join(', ');

  // 2. Cấu trúc 2 cấp sau sáp nhập
  const postMergerParts = [cleanDetail, ward, formattedProv || province].filter(Boolean);
  const postMergerFullAddress = postMergerParts.join(', ');

  return {
    isMerged: true,
    isNameChanged: false,
    oldWard: ward,
    newWard: ward,
    district,
    province: formattedProv || province,
    source: 'Giao Hàng Nhanh (GHN)',
    changeDescription: 'Định danh địa chỉ chuẩn hóa đồng bộ 100% Giao Hàng Nhanh (GHN)',
    preMergerFullAddress,
    postMergerFullAddress,
  };
};

export default getAdministrativeMergerInfo;
