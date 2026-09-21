/**
 * treeUtils.js — Shared tree/hierarchy utilities.
 * Dùng ở: MenuEditorPage, ProductFormPage (CategoryTreeMultiPicker),
 *          MediaPickerModal, MediaPage (FolderTree/breadcrumb).
 */

// ─── Flatten tree → flat array với depth & parentId ──────────────────────────
export function flattenTree(items, depth = 0, parentId = null) {
  return (items || []).flatMap((item) => [
    { ...item, depth, parentId, children: item.children || [] },
    ...flattenTree(item.children || [], depth + 1, item._id),
  ]);
}

// ─── Rebuild tree từ flat array ───────────────────────────────────────────────
export function buildTree(flat) {
  const map = {};
  (flat || []).forEach((item) => {
    map[item._id] = { ...item, children: [] };
  });
  const roots = [];
  (flat || []).forEach((item) => {
    const pid = item.parentId?._id || item.parentId;
    if (pid && map[pid]) map[pid].children.push(map[item._id]);
    else roots.push(map[item._id]);
  });
  return roots;
}

// ─── Build folder/category map (id → node) ───────────────────────────────────
export function buildNodeMap(items) {
  const map = {};
  const walk = (nodes) =>
    (nodes || []).forEach((n) => {
      map[n._id] = n;
      if (n.children) walk(n.children);
    });
  walk(items);
  return map;
}

// ─── Breadcrumb path: targetId → array of ancestors ──────────────────────────
export function buildBreadcrumb(nodeMap, targetId) {
  const crumbs = [];
  let cur = nodeMap[targetId];
  while (cur) {
    crumbs.unshift(cur);
    cur = cur.parentId ? nodeMap[cur.parentId] : null;
  }
  return crumbs;
}

// ─── Get all ancestor IDs of a node ──────────────────────────────────────────
export function getAncestors(parentMap, id) {
  const result = [];
  let cur = parentMap[id];
  while (cur) {
    result.push(cur);
    cur = parentMap[cur];
  }
  return result;
}

// ─── Get all descendant IDs of a node ────────────────────────────────────────
export function getDescendants(childrenMap, id) {
  const kids = childrenMap[id] || [];
  return [...kids, ...kids.flatMap((kid) => getDescendants(childrenMap, kid))];
}

// ─── Build parentMap & childrenMap from flat category list ───────────────────
export function buildRelationMaps(flatList) {
  const parentMap = Object.fromEntries(
    (flatList || []).map((c) => [c._id, c.parentId?._id || c.parentId || null])
  );
  const childrenMap = {};
  (flatList || []).forEach((c) => {
    const pid = c.parentId?._id || c.parentId;
    if (pid) {
      if (!childrenMap[pid]) childrenMap[pid] = [];
      childrenMap[pid].push(c._id);
    }
  });
  return { parentMap, childrenMap };
}

// ─── Get node depth in tree ──────────────────────────────────────────────────
export function getDepth(nodeMap, id) {
  let depth = 0;
  let cur = nodeMap[id];
  while (cur?.parentId) {
    depth++;
    cur = nodeMap[cur.parentId];
  }
  return depth;
}

// ─── Flatten folder tree → flat list with level ──────────────────────────────
export function flattenFolders(folders, level = 0) {
  const result = [];
  for (const f of folders || []) {
    result.push({ _id: f._id, name: f.name, level });
    if (f.children?.length) result.push(...flattenFolders(f.children, level + 1));
  }
  return result;
}
