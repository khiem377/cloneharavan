/**
 * TIỆN ÍCH ĐỊNH DẠNG ĐỊA CHỈ GHN (100% Giao Hàng Nhanh)
 * - Cấu trúc 3 cấp (Trước sáp nhập / truyền thống): [Số nhà], [Phường/Xã], [Quận/Huyện], [Tỉnh/Thành]
 * - Cấu trúc 2 cấp (Sau sáp nhập / GHN bưu chính): [Số nhà], [Phường/Xã], [Tỉnh/Thành]
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

  const cleanDetail = detailAddress ? detailAddress.trim() : '';

  const preMergerParts = [cleanDetail, ward, district, province].filter(Boolean);
  const preMergerFullAddress = preMergerParts.join(', ');

  const postMergerParts = [cleanDetail, ward, province].filter(Boolean);
  const postMergerFullAddress = postMergerParts.join(', ');

  return {
    isMerged: false,
    isNameChanged: false,
    oldWard: ward,
    newWard: ward,
    district,
    province,
    source: 'Giao Hàng Nhanh (GHN)',
    changeDescription: 'Định danh địa chỉ chuẩn hóa đồng bộ 100% Giao Hàng Nhanh (GHN)',
    preMergerFullAddress,
    postMergerFullAddress,
  };
};

export default getAdministrativeMergerInfo;
