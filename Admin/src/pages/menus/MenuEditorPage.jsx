import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight, ChevronDown, Plus, Trash2, Loader2,
  GripVertical, ArrowLeft, Save, ExternalLink, CategoriesIcon,
} from '@/components/ui/Icons';
import { useMenu, useUpdateMenu } from '@/hooks/useMenus';
import { useCategories, useAllCategoriesSelect } from '@/hooks/useCategories';
import { useAllBrands } from '@/hooks/useBrands';
import { useBlogCategories } from '@/hooks/useBlog';
import { flattenTree, buildTree } from '@/utils/treeUtils';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from '@/providers/ToastProvider';

// ─── Utils ────────────────────────────────────────────────────────────────────
const nanoid = () => Math.random().toString(36).slice(2, 10);

function makeItem(overrides = {}) {
  return {
    _id: nanoid(),
    label: '',
    linkType: 'url',
    linkRef: null,
    customUrl: '',
    openInNewTab: false,
    badge: '',
    badgeColor: '#ef4444',
    megaMenu: false,
    isActive: true,
    children: [],
    ...overrides,
  };
}

const LINK_TYPE_LABELS = {
  none: 'Không có link',
  url: 'URL tùy chỉnh',
  category: 'Danh mục sản phẩm',
  brand: 'Thương hiệu',
  blog: 'Danh mục Blog',
};

const BADGE_COLORS = [
  { label: 'Đỏ', value: '#ef4444' },
  { label: 'Cam', value: '#f97316' },
  { label: 'Xanh lá', value: '#22c55e' },
  { label: 'Xanh dương', value: '#3b82f6' },
  { label: 'Tím', value: '#a855f7' },
];

// flattenTree, buildTree được import từ @/utils/treeUtils

// ─── Sortable Item Row ─────────────────────────────────────────────────────────
function SortableItemRow({ item, depth, isSelected, onSelect, onAdd, onDelete, expanded, onToggle, hasChildren }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const depthColors = [
    'text-primary bg-primary/10 border-primary/20',
    'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  ];

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, paddingLeft: depth * 24 + 8 }}
      className={`flex items-center gap-2 py-2 pr-3 border-b border-border/60 hover:bg-muted/40 transition-colors cursor-default
        ${isSelected ? 'bg-primary/8 ring-1 ring-inset ring-primary/30' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 p-0.5 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={15} />
      </button>

      {/* Expand toggle */}
      {hasChildren ? (
        <button
          className="shrink-0 inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent"
          onClick={() => onToggle(item._id)}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      ) : (
        <span className="size-5 shrink-0" />
      )}

      {/* Label + badge */}
      <div
        className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer"
        onClick={() => onSelect(item)}
      >
        <span className={`text-sm truncate font-medium ${!item.label ? 'text-muted-foreground italic' : 'text-foreground'}`}>
          {item.label || 'Chưa đặt tên'}
        </span>
        {item.badge && (
          <span
            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: item.badgeColor || '#ef4444' }}
          >
            {item.badge}
          </span>
        )}
        {!item.isActive && (
          <span className="text-[10px] text-muted-foreground border border-border rounded-full px-1.5 py-0.5 shrink-0">Ẩn</span>
        )}
      </div>

      {/* Link type badge */}
      <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${depthColors[Math.min(depth, 2)]}`}>
        {LINK_TYPE_LABELS[item.linkType] ?? item.linkType}
      </span>

      {/* Actions */}
      {depth < 2 && (
        <button
          className="shrink-0 inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Thêm mục con"
          onClick={() => onAdd(item._id)}
        >
          <Plus size={13} />
        </button>
      )}
      <button
        className="shrink-0 inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        title="Xóa"
        onClick={() => onDelete(item._id)}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Item Form Panel ───────────────────────────────────────────────────────────
function ItemFormPanel({ item, onChange, categories, brands, blogCats, flatCategoryOptions = [] }) {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-8">
        <ChevronRight size={36} strokeWidth={1.2} />
        <p className="text-sm text-center">Chọn một mục bên trái để chỉnh sửa</p>
      </div>
    );
  }

  const set = (key, val) => onChange({ ...item, [key]: val });

  const refOptions = {
    category: flatCategoryOptions.length > 0 ? flatCategoryOptions : categories,
    brand: brands,
    blog: blogCats,
  };

  return (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto">
      {/* Label */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">
          Tên hiển thị <span className="text-destructive ml-0.5">*</span>
        </label>
        <input
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
          value={item.label}
          onChange={(e) => set('label', e.target.value)}
          placeholder="Ví dụ: Tivi, Flash Sale..."
        />
      </div>

      {/* Link Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">Loại link</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
          value={item.linkType}
          onChange={(e) => {
            const newType = e.target.value;
            const updates = { linkType: newType };
            if (newType === 'none') {
              updates.customUrl = '';
              updates.linkRef = null;
            }
            onChange({ ...item, ...updates });
          }}
        >
          {Object.entries(LINK_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Ref select: category / brand / blog - Hiển thị chọn từ API */}
      {(item.linkType === 'category' || item.linkType === 'brand' || item.linkType === 'blog') && (
        <div className="flex flex-col gap-1.5 bg-primary/5 p-3 rounded-lg border border-primary/20">
          <label className="text-xs font-semibold text-primary flex items-center justify-between">
            <span>Chọn {LINK_TYPE_LABELS[item.linkType]} (từ hệ thống)</span>
            <span className="text-[11px] font-normal text-muted-foreground">Tự động điền tên & link</span>
          </label>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors font-medium"
            value={item.linkRef || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              const options = refOptions[item.linkType] || [];
              const selectedObj = options.find((o) => o._id === selectedId);

              const updates = { linkRef: selectedId || null };
              if (selectedObj) {
                // Tự động điền Tên hiển thị
                updates.label = selectedObj.name;
                // Tự động cập nhật URL chuẩn SEO
                if (item.linkType === 'category') {
                  updates.customUrl = `/collections/${selectedObj.slug || selectedObj._id}`;
                } else if (item.linkType === 'brand') {
                  updates.customUrl = `/brands/${selectedObj.slug || selectedObj._id}`;
                } else if (item.linkType === 'blog') {
                  updates.customUrl = `/blogs/${selectedObj.slug || selectedObj._id}`;
                }
              }
              onChange({ ...item, ...updates });
            }}
          >
            <option value="">-- Bấm vào đây để chọn {LINK_TYPE_LABELS[item.linkType]} --</option>
            {(refOptions[item.linkType] || []).map((opt) => (
              <option key={opt._id} value={opt._id}>
                {item.linkType === 'category' && opt.depth
                  ? `${'　'.repeat(opt.depth)}└ ${opt.name}`
                  : opt.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* URL tùy chỉnh */}
      {item.linkType === 'url' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">URL</label>
          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors font-mono"
            value={item.customUrl}
            onChange={(e) => set('customUrl', e.target.value)}
            placeholder="/pages/chinh-sach hoặc https://..."
          />
        </div>
      )}

      {/* Open in new tab */}
      {item.linkType !== 'none' && (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="size-4 rounded border-input text-primary focus:ring-ring"
            checked={item.openInNewTab}
            onChange={(e) => set('openInNewTab', e.target.checked)}
          />
          <span className="text-sm text-foreground flex items-center gap-1.5">
            Mở tab mới <ExternalLink size={12} className="text-muted-foreground" />
          </span>
        </label>
      )}

      <div className="border-t border-border" />

      {/* Badge */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">Badge (Hot, Mới, Sale...)</label>
        <div className="flex gap-2">
          <input
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
            value={item.badge}
            onChange={(e) => set('badge', e.target.value)}
            placeholder="Để trống nếu không cần"
          />
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring transition-colors"
            value={item.badgeColor}
            onChange={(e) => set('badgeColor', e.target.value)}
          >
            {BADGE_COLORS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mega menu toggle (chỉ cấp 1 có ý nghĩa) */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          className="size-4 rounded border-input text-primary focus:ring-ring"
          checked={item.megaMenu}
          onChange={(e) => set('megaMenu', e.target.checked)}
        />
        <span className="text-sm text-foreground">Hiển thị Mega Menu</span>
      </label>

      {/* Active */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          className="size-4 rounded border-input text-primary focus:ring-ring"
          checked={item.isActive}
          onChange={(e) => set('isActive', e.target.checked)}
        />
        <span className="text-sm text-foreground">Hiển thị mục này</span>
      </label>
    </div>
  );
}

// ─── Main Editor ───────────────────────────────────────────────────────────────
export default function MenuEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: menu, isLoading } = useMenu(id);
  const updateMut = useUpdateMenu();

  const { data: rawCategories = [] } = useCategories({});
  const { data: rawCategoryTree = [] } = useAllCategoriesSelect(true);
  const { data: brands = [] } = useAllBrands();
  const { data: rawBlogCats = [] } = useBlogCategories({});

  const categories = Array.isArray(rawCategories) ? rawCategories : rawCategories?.data ?? [];
  const categoryTree = Array.isArray(rawCategoryTree) ? rawCategoryTree : rawCategoryTree?.data ?? [];
  const blogCats = Array.isArray(rawBlogCats) ? rawBlogCats : rawBlogCats?.data ?? [];

  const flatCategoryOptions = flattenTree(
    categoryTree.length > 0 && categoryTree[0].children !== undefined
      ? categoryTree
      : buildTree(categories)
  );

  const [flatItems, setFlatItems] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [menuName, setMenuName] = useState('');

  const handleSyncCategories = () => {
    const treeToUse =
      categoryTree.length > 0 && categoryTree[0].children !== undefined
        ? categoryTree
        : buildTree(categories);

    if (!treeToUse || treeToUse.length === 0) {
      toast.error('Không tìm thấy danh mục nào trong hệ thống để đồng bộ');
      return;
    }

    // 1. Tìm hoặc tạo mục "Danh mục sản phẩm"
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

    // 2. Chuyển đổi cây danh mục thành các menu items có phân cấp cha - con
    const mapCategoryNode = (cat, depth, parentId) => {
      const id = nanoid();
      const childItems = (cat.children || []).map((ch) =>
        mapCategoryNode(ch, depth + 1, id)
      );
      return {
        _id: id,
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

    // 3. Xoá toàn bộ các con cũ dưới dmcItem
    const dmcIdx = nextFlat.findIndex((i) => i._id === dmcItem._id);
    let end = dmcIdx + 1;
    while (end < nextFlat.length && nextFlat[end].depth > dmcItem.depth) {
      end++;
    }
    nextFlat.splice(dmcIdx + 1, end - (dmcIdx + 1));

    // 4. Flatten các con mới và chèn ngay sau dmcItem
    const flatNewChildren = flattenTree(newChildrenTree, 1, dmcItem._id);
    nextFlat.splice(dmcIdx + 1, 0, ...flatNewChildren);

    setFlatItems(nextFlat);
    const childIdsToExpand = flatNewChildren
      .filter((i) => i.children?.length > 0 || flatNewChildren.some((f) => f.parentId === i._id))
      .map((i) => i._id);
    setExpandedIds((prev) => new Set([...prev, dmcItem._id, ...childIdsToExpand]));
    toast.success(`Đã nạp ${treeToUse.length} nhóm danh mục cha - con! Hãy bấm 'Lưu menu' để lưu lại.`);
  };

  useEffect(() => {
    if (!menu) return;
    setMenuName(menu.name || '');
    const flat = flattenTree(menu.items || []);
    setFlatItems(flat);
    // Expand tất cả cấp 0 và các mục cha mặc định để dễ nhìn cấu trúc
    setExpandedIds(new Set(flat.filter((i) => i.depth === 0 || i.children?.length > 0 || flat.some((f) => f.parentId === i._id)).map((i) => i._id)));
  }, [menu]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Chỉ hiển thị items không bị ẩn bởi collapse
  const visibleItems = flatItems.filter((item) => {
    if (item.depth === 0) return true;
    // Cần tất cả ancestors expanded
    let current = item;
    let flat = flatItems;
    let ok = true;
    // Check parentId chain
    const checkAncestors = (id) => {
      const parent = flat.find((f) => f._id === id);
      if (!parent) return true;
      if (!expandedIds.has(parent._id)) return false;
      if (parent.parentId) return checkAncestors(parent.parentId);
      return true;
    };
    ok = checkAncestors(item.parentId);
    return ok;
  });

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setFlatItems((prev) => {
      const oldIndex = prev.findIndex((i) => i._id === active.id);
      const newIndex = prev.findIndex((i) => i._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      // Preserve parentId from target
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
    // Insert right after parent + its subtree
    setFlatItems((prev) => {
      const parentIdx = prev.findIndex((i) => i._id === parentId);
      // Find end of subtree
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

  const handleUpdateItem = (updated) => {
    setFlatItems((prev) => prev.map((i) => i._id === updated._id ? { ...i, ...updated } : i));
    setSelectedItem(updated);
  };

  const handleSave = () => {
    const tree = buildTree(flatItems);
    updateMut.mutate({ id, data: { name: menuName, items: tree } });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  const activeItem = flatItems.find((i) => i._id === activeId);
  const hasVisibleChildren = (itemId) => visibleItems.some((i) => i.parentId === itemId);

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-6xl mx-auto min-h-full bg-background text-foreground">
      {/* Sticky header */}
      <div className="sticky -top-3 sm:-top-6 z-30 -mt-3 sm:-mt-6 -mx-3 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0"
            onClick={() => navigate('/menus')}
          >
            <ArrowLeft size={17} />
          </button>
          <input
            className="h-8 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold text-foreground outline-none focus:border-input focus:bg-background focus:ring-2 focus:ring-ring/20 transition-colors min-w-0 max-w-48"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            placeholder="Tên menu"
          />
          <span className="text-xs text-muted-foreground hidden sm:block">
            {flatItems.filter((i) => i.depth === 0).length} mục gốc
          </span>
        </div>
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer shrink-0"
          onClick={handleSave}
          disabled={updateMut.isPending}
        >
          {updateMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span className="hidden sm:inline">Lưu menu</span>
        </button>
      </div>

      {/* Editor body */}
      <div className="flex gap-4 min-h-[600px]">
        {/* Left: Item tree */}
        <div className="flex flex-col w-full sm:w-1/2 lg:w-2/5 rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-sm font-semibold text-foreground">Cấu trúc menu</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-border bg-background hover:bg-accent px-2.5 text-xs font-medium text-foreground transition-colors cursor-pointer shadow-2xs"
                onClick={handleSyncCategories}
                title="Tự động đồng bộ toàn bộ cây danh mục sản phẩm (cha - con) vào menu"
              >
                <CategoriesIcon size={12} className="text-primary" />
                <span className="hidden sm:inline">Đồng bộ danh mục</span>
                <span className="sm:hidden">Đồng bộ</span>
              </button>
              <button
                className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
                onClick={handleAddRoot}
              >
                <Plus size={12} /> Thêm mục
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <p className="text-sm">Chưa có mục nào</p>
                <button
                  className="text-xs text-primary underline-offset-2 hover:underline cursor-pointer"
                  onClick={handleAddRoot}
                >
                  + Thêm mục đầu tiên
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveId(active.id)}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={visibleItems.map((i) => i._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {visibleItems.map((item) => (
                    <SortableItemRow
                      key={item._id}
                      item={item}
                      depth={item.depth}
                      isSelected={selectedItem?._id === item._id}
                      hasChildren={item.children?.length > 0 || flatItems.some((f) => f.parentId === item._id)}
                      expanded={expandedIds.has(item._id)}
                      onSelect={setSelectedItem}
                      onAdd={handleAddChild}
                      onDelete={handleDelete}
                      onToggle={(itemId) =>
                        setExpandedIds((s) => {
                          const next = new Set(s);
                          next.has(itemId) ? next.delete(itemId) : next.add(itemId);
                          return next;
                        })
                      }
                    />
                  ))}
                </SortableContext>

                <DragOverlay>
                  {activeItem && (
                    <div className="flex items-center gap-2 py-2 px-3 bg-card border border-border rounded-lg shadow-lg text-sm font-medium text-foreground">
                      <GripVertical size={15} className="text-muted-foreground" />
                      {activeItem.label || 'Chưa đặt tên'}
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>

        {/* Right: Item form */}
        <div className="hidden sm:flex flex-col flex-1 rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-sm font-semibold text-foreground">
              {selectedItem ? `Chỉnh sửa: ${selectedItem.label || 'Chưa đặt tên'}` : 'Thuộc tính mục'}
            </span>
          </div>
          <ItemFormPanel
            item={selectedItem}
            onChange={handleUpdateItem}
            categories={categories}
            brands={brands}
            blogCats={blogCats}
            flatCategoryOptions={flatCategoryOptions}
          />
        </div>
      </div>

      {/* Mobile: show form below if selected */}
      {selectedItem && (
        <div className="sm:hidden rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-sm font-semibold text-foreground">
              Chỉnh sửa: {selectedItem.label || 'Chưa đặt tên'}
            </span>
          </div>
          <ItemFormPanel
            item={selectedItem}
            onChange={handleUpdateItem}
            categories={categories}
            brands={brands}
            blogCats={blogCats}
            flatCategoryOptions={flatCategoryOptions}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Xóa mục menu"
        description="Xóa mục này sẽ xóa luôn tất cả mục con bên trong. Hành động không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
