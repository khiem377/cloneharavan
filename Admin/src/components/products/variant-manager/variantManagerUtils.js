export function cartesian(arrays) {
  if (!arrays.length) return [];
  return arrays.reduce((acc, arr) => acc.flatMap((a) => arr.map((b) => [...a, b])), [[]]);
}

export function fmtPrice(val) {
  if (val === '' || val === null || val === undefined) return '';
  const n = Number(String(val).replace(/\D/g, ''));
  return isNaN(n) || n === 0 ? '' : n.toLocaleString('vi-VN');
}

export function parsePrice(str) {
  if (!str && str !== 0) return null;
  const n = Number(String(str).replace(/\D/g, ''));
  return isNaN(n) ? null : n || null;
}

let _rid = 0;
export const rid = () => `r${++_rid}`;

export function serverToLocal(v) {
  return {
    _rowId: rid(),
    _serverId: v._id,
    _dirty: false,
    isDefault: v.isDefault ?? false,
    attributes: v.attributes || [],
    displayName: v.displayName || v.attributes?.map((a) => a.value).join(' / ') || '',
    sku: v.sku || '',
    price: v.price ?? null,
    salePrice: v.salePrice ?? null,
    stock: v.stock ?? 0,
    isActive: v.isActive ?? true,
    thumbnailMediaId: v.thumbnail?.mediaId || null,
    thumbnailUrl: (typeof v.thumbnail === 'string' ? v.thumbnail : v.thumbnail?.url) || '',
    imageMediaIds: (v.images || []).map((img) => img?.mediaId || img?._id).filter(Boolean),
    imageUrls: (v.images || []).map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean),
  };
}
