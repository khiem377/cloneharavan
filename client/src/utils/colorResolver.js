/**
 * Semantic Color Resolver cho Tiếng Việt & Tiếng Anh
 * Tự động phân tích tên màu (Titan Sa Mạc, Xanh Mòng Két, Hồng Cánh Sen, Space Gray...)
 * ra mã HEX chuẩn xác hoặc tự sinh mã màu HSL hài hòa.
 */

const COLOR_MAP = {
  // Apple Titanium
  'titan sa mạc': '#C5A880',
  'titan sa mac': '#C5A880',
  'desert titanium': '#C5A880',
  'titan tự nhiên': '#9E9E9E',
  'titan tu nhien': '#9E9E9E',
  'natural titanium': '#9E9E9E',
  'titan đen': '#333333',
  'titan den': '#333333',
  'black titanium': '#333333',
  'titan trắng': '#F5F5F5',
  'titan trang': '#F5F5F5',
  'white titanium': '#F5F5F5',
  'titan xanh': '#414856',

  // iPhone 16 Base / Plus
  'xanh lưu ly': '#7182DD',
  'xanh luu ly': '#7182DD',
  'ultramarine': '#7182DD',
  'xanh mòng két': '#99DDD3',
  'xanh mong ket': '#99DDD3',
  'teal': '#99DDD3',
  'hồng': '#F4C2CE',
  'hong': '#F4C2CE',
  'pink': '#F4C2CE',
  'trắng': '#F5F5F7',
  'trang': '#F5F5F7',
  'white': '#F5F5F7',
  'đen': '#3B3B3D',
  'den': '#3B3B3D',
  'black': '#3B3B3D',

  // Flagships & Electronics
  'xám titan': '#787878',
  'vàng titan': '#E3D7B8',
  'tím titan': '#68607A',
  'xám không gian': '#4B4E54',
  'space gray': '#4B4E54',
  'bạc': '#E3E4E5',
  'silver': '#E3E4E5',
  'vàng gold': '#F7E7CE',
  'vàng đồng': '#D4AF37',
  'gold': '#F7E7CE',
  'vàng champagne': '#F7E7CE',
  'vàng': '#EAB308',
  'yellow': '#EAB308',
  'cam': '#EA580C',
  'orange': '#EA580C',
  'đỏ': '#DC2626',
  'red': '#DC2626',
  'đỏ đô': '#881337',
  'đỏ rượu': '#881337',
  'xanh dương': '#2563EB',
  'blue': '#2563EB',
  'xanh navy': '#1E3A8A',
  'navy': '#1E3A8A',
  'xanh coban': '#1D4ED8',
  'xanh lá': '#16A34A',
  'green': '#16A34A',
  'xanh rêu': '#3F6212',
  'xanh ngọc': '#0D9488',
  'xanh mint': '#A7F3D0',
  'xanh pastel': '#BAE6FD',
  'tím': '#9333EA',
  'purple': '#9333EA',
  'tím khói': '#A855F7',
  'tím than': '#581C87',
  'hồng phấn': '#FBCFE8',
  'hồng cánh sen': '#DB2777',
  'rose gold': '#B76E79',
  'nâu': '#78350F',
  'brown': '#78350F',
  'nâu be': '#D6C0B3',
  'kem': '#FFFDD0',
  'xám': '#6B7280',
  'gray': '#6B7280',
  'grey': '#6B7280',
};

/**
 * Chuyển HSL sang mã HEX
 */
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Trích xuất hoặc tự động sinh mã màu thông minh
 * @param {string} colorCode - Mã màu sẵn có (nếu có)
 * @param {string} colorName - Tên màu sắc (VD: "Titan Sa Mạc", "Xanh Mòng Két")
 * @returns {string} Mã màu HEX #RRGGBB
 */
export function resolveDisplayColor(colorCode, colorName) {
  if (colorCode && typeof colorCode === 'string' && colorCode.trim().startsWith('#')) {
    return colorCode.trim();
  }

  if (!colorName || typeof colorName !== 'string') {
    return '#CBD5E1';
  }

  const clean = colorName.trim().toLowerCase();

  // 1. Khớp chính xác từ điển
  if (COLOR_MAP[clean]) {
    return COLOR_MAP[clean];
  }

  // 2. Khớp chuỗi con trong từ điển
  for (const [name, hex] of Object.entries(COLOR_MAP)) {
    if (clean.includes(name) || name.includes(clean)) {
      return hex;
    }
  }

  // 3. Tự sinh màu HSL theo thuật toán băm (Deterministic Hue Generator)
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return hslToHex(hue, 65, 55);
}

export default resolveDisplayColor;
