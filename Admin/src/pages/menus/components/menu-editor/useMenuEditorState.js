import { useState, useEffect, useCallback } from 'react';
import {
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from '@/providers/ToastProvider';
import { flattenTree, buildTree } from '@/utils/treeUtils';
import { nanoid, makeItem } from './menuEditorConstants';

export function useMenuEditorState({ menu, id, updateMut, categoryTree, categories }) {
  const [flatItems, setFlatItems] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [menuName, setMenuName] = useState('');

  useEffect(() => {
    if (!menu) return;
    setMenuName(menu.name || '');
    const flat = flattenTree(menu.items || []);
    setFlatItems(flat);
    setExpandedIds(new Set(flat.filter((i) => i.depth === 0 || i.children?.length > 0 || flat.some((f) => f.parentId === i._id)).map((i) => i._id)));
  }, [menu]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const visibleItems = flatItems.filter((item) => {
    if (item.depth === 0) return true;
    let flat = flatItems;
    const checkAncestors = (pid) => {
      const parent = flat.find((f) => f._id === pid);
      if (!parent) return true;
      if (!expandedIds.has(parent._id)) return false;
      if (parent.parentId) return checkAncestors(parent.parentId);
      return true;
    };
    return checkAncestors(item.parentId);
  });

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setFlatItems((prev) => {
      const oldIndex = prev.findIndex((i) => i._id === active.id);
      const newIndex = prev.findIndex((i) => i._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const moved = { ...prev[oldIndex], parentId: prev[newIndex].parentId, depth: prev[newIndex].depth };
      const next = arrayMove(prev, oldIndex, newIndex);
      next[newIndex] = moved;
      return next;
    });
  }, []);

  const handleAddRoot = () => {
    const item = makeItem({ parentId: null, depth: 0 });
    setFlatItems((prev) => [...prev, item]);
    setSelectedItem(item);
    setExpandedIds((s) => new Set([...s]));
  };

  const handleAddChild = (parentId) => {
    const parent = flatItems.find((i) => i._id === parentId);
    if (!parent) return;
    const isCategoryContainer =
      parent.label?.toLowerCase().includes('danh mục') ||
      parent.megaMenu ||
      parent.linkType === 'none';
    const item = makeItem({
      parentId,
      depth: parent.depth + 1,
      linkType: isCategoryContainer ? 'category' : 'url',
    });
    setFlatItems((prev) => {
      const parentIdx = prev.findIndex((i) => i._id === parentId);
      let end = parentIdx + 1;
      while (end < prev.length && prev[end].depth > parent.depth) end++;
      const next = [...prev];
      next.splice(end, 0, item);
      return next;
    });
    setExpandedIds((s) => new Set([...s, parentId]));
    setSelectedItem(item);
  };

  const handleDelete = (itemId) => setDeleteTargetId(itemId);

  const confirmDelete = () => {
    setFlatItems((prev) => {
      const idx = prev.findIndex((i) => i._id === deleteTargetId);
      if (idx === -1) return prev;
      const depth = prev[idx].depth;
      let end = idx + 1;
      while (end < prev.length && prev[end].depth > depth) end++;
      return prev.filter((_, i) => i < idx || i >= end);
    });
    if (selectedItem?._id === deleteTargetId) setSelectedItem(null);
    setDeleteTargetId(null);
  };

  const handleToggleActive = (itemId) => {
    setFlatItems((prev) =>
      prev.map((i) => {
        if (i._id === itemId) {
          return { ...i, isActive: i.isActive === false ? true : false };
        }
        return i;
      })
    );
    setSelectedItem((curr) => {
      if (curr?._id === itemId) {
        return { ...curr, isActive: curr.isActive === false ? true : false };
      }
      return curr;
    });
  };

  const handleUpdateItem = (updated) => {
    setFlatItems((prev) => prev.map((i) => i._id === updated._id ? { ...i, ...updated } : i));
    setSelectedItem(updated);
  };

  const handleToggleExpand = (itemId) => {
    setExpandedIds((s) => {
      const next = new Set(s);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleSyncCategories = () => {
    const treeToUse =
      categoryTree.length > 0 && categoryTree[0].children !== undefined
        ? categoryTree
        : buildTree(categories);

    if (!treeToUse || treeToUse.length === 0) {
      toast.error('Không tìm thấy danh mục nào trong hệ thống để đồng bộ');
      return;
    }

    let dmcItem = flatItems.find(
      (i) => (i.label?.toLowerCase().includes('danh mục') || i.label?.toLowerCase().includes('sản phẩm')) && i.depth === 0
    );

    let nextFlat = [...flatItems];

    if (!dmcItem) {
      dmcItem = makeItem({
        label: 'Danh mục sản phẩm',
        linkType: 'none',
        megaMenu: true,
        depth: 0,
        parentId: null,
      });
      const homeIdx = nextFlat.findIndex((i) => i.label?.toLowerCase().includes('trang chủ'));
      if (homeIdx !== -1) {
        nextFlat.splice(homeIdx + 1, 0, dmcItem);
      } else {
        nextFlat.unshift(dmcItem);
      }
    }

    const mapCategoryNode = (cat, depth, parentId) => {
      const childId = nanoid();
      const childItems = (cat.children || []).map((ch) =>
        mapCategoryNode(ch, depth + 1, childId)
      );
      return {
        _id: childId,
        label: cat.name,
        linkType: 'category',
        linkRef: cat._id,
        customUrl: `/collections/${cat.slug || cat._id}`,
        openInNewTab: false,
        badge: '',
        badgeColor: '#ef4444',
        megaMenu: depth === 1,
        isActive: cat.isActive !== false,
        parentId,
        depth,
        children: childItems,
      };
    };

    const newChildrenTree = treeToUse.map((cat) => mapCategoryNode(cat, 1, dmcItem._id));

    const dmcIdx = nextFlat.findIndex((i) => i._id === dmcItem._id);
    let end = dmcIdx + 1;
    while (end < nextFlat.length && nextFlat[end].depth > dmcItem.depth) {
      end++;
    }
    nextFlat.splice(dmcIdx + 1, end - (dmcIdx + 1));

    const flatNewChildren = flattenTree(newChildrenTree, 1, dmcItem._id);
    nextFlat.splice(dmcIdx + 1, 0, ...flatNewChildren);

    setFlatItems(nextFlat);
    const childIdsToExpand = flatNewChildren
      .filter((i) => i.children?.length > 0 || flatNewChildren.some((f) => f.parentId === i._id))
      .map((i) => i._id);
    setExpandedIds((prev) => new Set([...prev, dmcItem._id, ...childIdsToExpand]));
    toast.success(`Đã nạp ${treeToUse.length} nhóm danh mục cha - con! Hãy bấm 'Lưu menu' để lưu lại.`);
  };

  const handleSave = () => {
    const tree = buildTree(flatItems);
    updateMut.mutate({ id, data: { name: menuName, items: tree } });
  };

  return {
    flatItems,
    visibleItems,
    expandedIds,
    selectedItem,
    setSelectedItem,
    deleteTargetId,
    setDeleteTargetId,
    activeId,
    setActiveId,
    menuName,
    setMenuName,
    sensors,
    handleDragEnd,
    handleAddRoot,
    handleAddChild,
    handleDelete,
    confirmDelete,
    handleToggleActive,
    handleUpdateItem,
    handleToggleExpand,
    handleSyncCategories,
    handleSave,
  };
}
