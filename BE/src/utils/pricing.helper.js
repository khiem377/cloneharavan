/**
 * Pricing Helper: Chuẩn hóa tính toán giá bán và phòng vệ dữ liệu cho toàn bộ Backend
 */

/**
 * Lấy giá bán thực tế (sellingPrice):
 * - Nếu salePrice hợp lệ (không null/undefined, >= 0 và < price) -> trả về salePrice
 * - Ngược lại -> trả về price (giá niêm yết)
 *
 * @param {Object} variant - ProductVariant object hoặc Product object
 * @returns {number}
 */
const getSellingPrice = (variant) => {
  if (!variant) return 0;

  const price = Number(variant.price) || 0;
  const salePrice = variant.salePrice;

  if (
    salePrice !== null &&
    salePrice !== undefined &&
    salePrice !== '' &&
    !isNaN(Number(salePrice)) &&
    Number(salePrice) >= 0 &&
    Number(salePrice) < price
  ) {
    return Number(salePrice);
  }

  return price;
};

/**
 * Normalize salePrice:
 * - Nếu salePrice không hợp lệ (null, âm hoặc >= price) -> đưa về null
 * - Trả về số hoặc null
 *
 * @param {number} price
 * @param {number|null} salePrice
 * @returns {number|null}
 */
const normalizeSalePrice = (price, salePrice) => {
  if (salePrice === null || salePrice === undefined || salePrice === '') {
    return null;
  }

  const p = Number(price);
  const sp = Number(salePrice);

  if (isNaN(sp) || sp < 0 || sp >= p) {
    return null;
  }

  return sp;
};

module.exports = {
  getSellingPrice,
  normalizeSalePrice,
};
