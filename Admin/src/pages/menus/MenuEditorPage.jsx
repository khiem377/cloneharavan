import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Loader2, GripVertical, CategoriesIcon } from '@/components/ui/Icons';
import { useMenu, useUpdateMenu } from '@/hooks/useMenus';
import { useCategories, useAllCategoriesSelect } from '@/hooks/useCategories';
import { useAllBrands } from '@/hooks/useBrands';
import { useBlogCategories } from '@/hooks/useBlog';
import { flattenTree, buildTree } from '@/utils/treeUtils';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useMenuEditorState } from './components/menu-editor/useMenuEditorState';
import SortableItemRow from './components/menu-editor/SortableItemRow';
import ItemFormPanel from './components/menu-editor/ItemFormPanel';
import MenuEditorHeader from './components/menu-editor/MenuEditorHeader';

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

  const {
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
  } = useMenuEditorState({ menu, id, updateMut, categoryTree, categories });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  const activeItem = flatItems.find((i) => i._id === activeId);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 h-auto sm:h-[calc(100dvh-112px)] min-h-[550px] text-foreground">
      <MenuEditorHeader
        menuName={menuName}
        setMenuName={setMenuName}
        rootCount={flatItems.filter((i) => i.depth === 0).length}
        onSave={handleSave}
        isPending={updateMut.isPending}
        onBack={() => navigate('/menus')}
      />

      <div className="flex-1 min-h-0 flex flex-col sm:flex-row gap-4 items-stretch">
        <div className="flex flex-col w-full sm:w-1/2 lg:w-5/12 h-full rounded-[6px] border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
            <span className="text-sm font-semibold text-foreground">Cấu trúc menu</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="inline-flex h-7 items-center justify-center gap-1.5 rounded-[6px] border border-border bg-background hover:bg-accent px-2.5 text-xs font-medium text-foreground transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                onClick={handleSyncCategories}
                title="Tự động đồng bộ danh mục"
              >
                <CategoriesIcon size={12} className="text-primary" />
                <span className="hidden sm:inline">Đồng bộ danh mục</span>
                <span className="sm:hidden">Đồng bộ</span>
              </button>
              <button
                type="button"
                className="inline-flex h-7 items-center justify-center gap-1 rounded-[6px] bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                onClick={handleAddRoot}
              >
                <Plus size={12} /> Thêm mục
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {visibleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <p className="text-sm">Chưa có mục nào</p>
                <button
                  type="button"
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
                      onToggleActive={handleToggleActive}
                      onToggle={handleToggleExpand}
                    />
                  ))}
                </SortableContext>

                <DragOverlay>
                  {activeItem && (
                    <div className="flex items-center gap-2 py-2 px-3 bg-card border border-border rounded-[6px] shadow-sm text-sm font-medium text-foreground">
                      <GripVertical size={15} className="text-muted-foreground" />
                      {activeItem.label || 'Chưa đặt tên'}
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>

        <div className="hidden sm:flex flex-col flex-1 h-full rounded-[6px] border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-border bg-muted/30 shrink-0">
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

      {selectedItem && (
        <div className="sm:hidden rounded-[6px] border border-border bg-card shadow-xs overflow-hidden">
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
