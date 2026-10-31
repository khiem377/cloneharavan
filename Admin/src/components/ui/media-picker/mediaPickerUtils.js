export function formatSize(b) {
  if (!b) return '';
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

export function buildFolderMap(folders) {
  const map = {};
  const walk = (items) => items.forEach((f) => {
    map[f._id] = f;
    if (f.children) walk(f.children);
  });
  walk(folders);
  return map;
}

export function buildBreadcrumb(map, id) {
  const crumbs = [];
  let cur = map[id];
  while (cur) {
    crumbs.unshift(cur);
    cur = cur.parentId ? map[cur.parentId] : null;
  }
  return crumbs;
}

export function getDepth(map, id) {
  let depth = 0;
  let cur = map[id];
  while (cur?.parentId) {
    depth++;
    cur = map[cur.parentId];
  }
  return depth;
}
