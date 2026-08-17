/**
 * Chuyển string thành slug
 * Ví dụ: "Sản Phẩm Nổi Bật" → "san-pham-noi-bat"
 */
const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')                    // tách dấu ra
    .replace(/[\u0300-\u036f]/g, '')     // bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')        // chỉ giữ chữ, số, khoảng trắng, gạch
    .trim()
    .replace(/\s+/g, '-')               // khoảng trắng → gạch ngang
    .replace(/-+/g, '-');               // nhiều gạch → 1 gạch

module.exports = { slugify };
