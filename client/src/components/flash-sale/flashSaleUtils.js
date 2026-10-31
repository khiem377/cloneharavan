export const formatDateDisplay = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ngày ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  const d1 = new Date(start);
  const d2 = new Date(end);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d1.getHours())}:${pad(d1.getMinutes())} ${pad(d1.getDate())}/${pad(d1.getMonth() + 1)} — ${pad(d2.getHours())}:${pad(d2.getMinutes())} ${pad(d2.getDate())}/${pad(d2.getMonth() + 1)}/${d2.getFullYear()}`;
};

export const groupItemsByProductId = (items = []) => {
  if (!Array.isArray(items)) return [];
  const map = new Map();
  items.forEach((it) => {
    const pId = (typeof it.productId === 'object' ? it.productId._id : it.productId) || it._id;
    if (!map.has(pId)) {
      map.set(pId, { ...it, variantsList: [it] });
    } else {
      map.get(pId).variantsList.push(it);
    }
  });
  return Array.from(map.values());
};
