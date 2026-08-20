import React, { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  LayoutGrid, List, Check, ExternalLink, Image,
} from '@/components/ui/Icons';
import { useBanners, useDeleteBanner, useDeleteBulkBanners, useUpdateBanner } from '@/hooks/useBanners';
import { bannerService } from '@/services/banner.service';
import { toast } from '@/providers/ToastProvider';
import BannerFormModal from './BannerFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useQueryClient } from '@tanstack/react-query';
import { BANNERS_KEY } from '@/hooks/useBanners';
import DataTablePagination from '@/components/ui/DataTablePagination';

function VisibleBadge({ isVisible }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${isVisible ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
      <span className={`size-1.5 rounded-full ${isVisible ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
      {isVisible ? 'Hiển thị' : 'Đang ẩn'}
    </span>
  );
}

function InlineActions({ banner, onEdit, onDelete, onToggleVisible }) {
  return (
    <div className="flex items-center gap-1">
      <button
        className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
        title="Sửa"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
      >
        <Pencil size={13} /><span>Sửa</span>
      </button>
      <button
        className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
        title={banner.isVisible ? 'Ẩn banner' : 'Hiện banner'}
        onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
      >
        {banner.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
        <span>{banner.isVisible ? 'Ẩn' : 'Hiện'}</span>
      </button>
      <button
        className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
        title="Xóa"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <Trash2 size={13} /><span>Xóa</span>
      </button>
    </div>
  );
}

function SortableBannerRow({ banner, index, selected, onToggle, onEdit, onDelete, onToggleVisible }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: banner._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const stopDrag = (e) => e.stopPropagation();

  const displayPosition = banner.position > 0 ? banner.position : index + 1;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-border/60 transition-colors hover:bg-muted/40 ${selected ? 'bg-muted/70' : ''} ${!banner.isVisible ? 'opacity-60' : ''}`}
      {...attributes}
      {...listeners}
    >
      <td className="px-3.5 py-3 align-middle w-10" onPointerDown={stopDrag}>
        <button
          className={`flex size-4 items-center justify-center rounded border border-input bg-background transition-colors cursor-pointer ${selected ? 'bg-primary border-primary text-primary-foreground' : ''}`}
          onClick={() => onToggle(banner._id)}
        >
          {selected && <Check size={10} />}
        </button>
      </td>

      <td className="px-3.5 py-3 align-middle w-24">
        <div className="relative inline-block">
          <img src={banner.imageUrl} alt={banner.title || 'banner'} className="h-12 w-20 object-cover rounded border border-border bg-muted" />
          {!banner.isVisible && <div className="absolute inset-0 rounded bg-background/60" />}
        </div>
      </td>

      <td className="px-3.5 py-3 align-middle">
        <span className={`text-sm font-medium text-foreground ${!banner.isVisible ? 'opacity-50' : ''}`}>
          {banner.title || <span className="text-muted-foreground italic text-xs">Chưa đặt tiêu đề</span>}
        </span>
      </td>

      <td className="px-3.5 py-3 align-middle" onPointerDown={stopDrag}>
        {banner.link ? (
          <a
            href={banner.link} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={11} />
            <span>{banner.link.length > 38 ? banner.link.slice(0, 38) + '…' : banner.link}</span>
          </a>
        ) : <span className="text-muted-foreground italic text-xs">—</span>}
      </td>

      <td className="px-3.5 py-3 align-middle"><VisibleBadge isVisible={banner.isVisible} /></td>
      <td className="px-3.5 py-3 align-middle text-center">
        <span className="inline-flex items-center justify-center min-w-6 h-5 px-1.5 bg-muted border border-border rounded text-xs font-mono font-semibold text-muted-foreground">
          {displayPosition}
        </span>
      </td>
      <td className="px-3.5 py-3 align-middle text-xs text-muted-foreground">{new Date(banner.createdAt).toLocaleDateString('vi-VN')}</td>

      <td className="px-3.5 py-3 align-middle" onPointerDown={stopDrag}>
        <InlineActions banner={banner} onEdit={onEdit} onDelete={onDelete} onToggleVisible={onToggleVisible} />
      </td>
    </tr>
  );
}

function BannerCard({ banner, selected, onToggle, onEdit, onDelete, onToggleVisible }) {
  return (
    <div className={`rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden transition-all hover:border-primary/50 ${selected ? 'border-primary ring-2 ring-primary/30' : ''}`}>
      <div className="relative aspect-video w-full bg-muted cursor-pointer overflow-hidden" onClick={() => onToggle(banner._id)}>
        <img src={banner.imageUrl} alt={banner.title || 'banner'} className="size-full object-cover" />
        {selected && (
          <div className="absolute top-2 right-2 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs z-10">
            <Check size={12} />
          </div>
        )}
        {!banner.isVisible && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
            <EyeOff size={14} /> Đang ẩn
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2">
        <span className="font-semibold text-sm text-foreground line-clamp-1">
          {banner.title || <span className="text-muted-foreground italic text-xs">Chưa đặt tiêu đề</span>}
        </span>
        <VisibleBadge isVisible={banner.isVisible} />
        <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
          <button className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 px-2 py-1 text-xs font-medium transition-colors cursor-pointer" onClick={onEdit}><Pencil size={12} /></button>
          <button className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 px-2 py-1 text-xs font-medium transition-colors cursor-pointer" onClick={onToggleVisible}>
            {banner.isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 px-2 py-1 text-xs font-medium transition-colors cursor-pointer" onClick={onDelete}><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  );
}

export default function BannerPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [formTarget, setFormTarget] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkDel, setShowBulkDel] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [localOrder, setLocalOrder] = useState(null);

  const res = useBanners({ page, limit });
  const bannerData = res.data;
  const remoteBanners = bannerData?.data ?? (Array.isArray(bannerData) ? bannerData : []);
  const pagination = bannerData?.pagination;
  const isLoading = res.isLoading;
  const banners = localOrder ?? remoteBanners;

  const { mutate: deleteBanner } = useDeleteBanner();
  const { mutate: deleteBulk } = useDeleteBulkBanners();
  const { mutate: updateBanner } = useUpdateBanner();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex(b => b._id === active.id);
    const newIndex = banners.findIndex(b => b._id === over.id);
    const reordered = arrayMove(banners, oldIndex, newIndex).map((b, i) => ({
      ...b,
      position: i + 1,
    }));

    setLocalOrder(reordered);

    const items = reordered.map((b) => ({ id: b._id, position: b.position }));
    try {
      await bannerService.reorder(items);
      qc.invalidateQueries({ queryKey: BANNERS_KEY });
      toast.success('Đã cập nhật thứ tự banner');
    } catch {
      toast.error('Lỗi cập nhật thứ tự');
      setLocalOrder(null);
    }
  };

  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () =>
    setSelectedIds(prev => prev.size === banners.length ? new Set() : new Set(banners.map(b => b._id)));

  const handleDelete = (id) => {
    deleteBanner(id, {
      onSuccess: () => { toast.success('Đã xóa banner'); setDeleteTarget(null); setLocalOrder(null); },
      onError: (e) => toast.error(e.response?.data?.message || 'Xóa thất bại'),
    });
  };

  const handleBulkDelete = () => {
    deleteBulk([...selectedIds], {
      onSuccess: () => {
        toast.success(`Đã xóa ${selectedIds.size} banner`);
        setSelectedIds(new Set()); setShowBulkDel(false); setLocalOrder(null);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const handleToggleVisible = (banner) => {
    updateBanner(
      { id: banner._id, data: { isVisible: !banner.isVisible } },
      {
        onSuccess: () => { toast.success(banner.isVisible ? 'Đã ẩn banner' : 'Đã hiện banner'); setLocalOrder(null); },
        onError: () => toast.error('Lỗi cập nhật'),
      }
    );
  };

  const allSelected = banners.length > 0 && selectedIds.size === banners.length;
  const visibleCount = banners.filter(b => b.isVisible).length;
  const activeItem = activeId ? banners.find(b => b._id === activeId) : null;

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto min-h-full bg-background text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Banners</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {banners.length} banner &nbsp;·&nbsp;
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{visibleCount} đang hiển thị</span>
            {viewMode === 'table' && <span className="text-muted-foreground text-xs"> · Kéo ⠿ để sắp xếp</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{selectedIds.size} đã chọn</span>
              <button className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-destructive/10 text-destructive px-3 text-xs font-medium hover:bg-destructive/20 transition-colors cursor-pointer" onClick={() => setShowBulkDel(true)}>
                <Trash2 size={13} /> Xóa
              </button>
              <button className="inline-flex h-8 items-center justify-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={() => setSelectedIds(new Set())}>Bỏ chọn</button>
            </>
          )}
          <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
            <button className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setViewMode('table')} title="Bảng">
              <List size={14} />
            </button>
            <button className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setViewMode('grid')} title="Lưới">
              <LayoutGrid size={14} />
            </button>
          </div>
          <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer" onClick={() => setFormTarget(null)}>
            <Plus size={15} /> Tạo mới
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-sm text-muted-foreground">Đang tải...</div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-sm text-muted-foreground">
            <Image size={40} className="text-muted-foreground/60" />
            <p>Chưa có banner nào</p>
            <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer" onClick={() => setFormTarget(null)}>
              <Plus size={14} /> Tạo banner đầu tiên
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    <th className="px-3.5 py-3 w-10">
                      <button className={`flex size-4 items-center justify-center rounded border border-input bg-background transition-colors cursor-pointer ${allSelected ? 'bg-primary border-primary text-primary-foreground' : ''}`} onClick={toggleAll}>
                        {allSelected && <Check size={10} />}
                      </button>
                    </th>
                    <th className="px-3.5 py-3">Ảnh</th>
                    <th className="px-3.5 py-3">Tiêu đề</th>
                    <th className="px-3.5 py-3">Link</th>
                    <th className="px-3.5 py-3">Trạng thái</th>
                    <th className="px-3.5 py-3 text-center">Vị trí</th>
                    <th className="px-3.5 py-3">Ngày tạo</th>
                    <th className="px-3.5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext items={banners.map(b => b._id)} strategy={verticalListSortingStrategy}>
                    {banners.map((b, idx) => (
                      <SortableBannerRow
                        key={b._id} banner={b} index={idx}
                        selected={selectedIds.has(b._id)}
                        onToggle={toggleSelect}
                        onEdit={() => setFormTarget(b)}
                        onDelete={() => setDeleteTarget(b)}
                        onToggleVisible={() => handleToggleVisible(b)}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </div>

            <DragOverlay>
              {activeItem && (
                <table className="w-full text-left text-sm border-collapse bg-background shadow-xl rounded-lg border border-border">
                  <tbody>
                    <tr className="bg-background">
                      <td className="px-3.5 py-3 w-10" />
                      <td className="px-3.5 py-3 w-24">
                        <img src={activeItem.imageUrl} alt="" className="h-12 w-20 object-cover rounded border border-border bg-muted" />
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="text-sm font-medium text-foreground">{activeItem.title || '—'}</span>
                      </td>
                      <td colSpan={5} />
                    </tr>
                  </tbody>
                </table>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {banners.map(b => (
              <BannerCard
                key={b._id} banner={b}
                selected={selectedIds.has(b._id)}
                onToggle={toggleSelect}
                onEdit={() => setFormTarget(b)}
                onDelete={() => setDeleteTarget(b)}
                onToggleVisible={() => handleToggleVisible(b)}
              />
            ))}
          </div>
        )}
      </div>

      <DataTablePagination
        page={page}
        pageSize={limit}
        total={pagination?.total ?? 0}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
      />

      {formTarget !== undefined && (
        <BannerFormModal banner={formTarget} onClose={() => { setFormTarget(undefined); setLocalOrder(null); }} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Xóa banner"
          message={`Xóa banner "${deleteTarget.title || 'này'}"? Hành động không thể hoàn tác.`}
          confirmText="Xóa" variant="danger"
          onConfirm={() => handleDelete(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showBulkDel && (
        <ConfirmDialog
          title="Xóa banner"
          message={`Xóa ${selectedIds.size} banner đã chọn? Hành động không thể hoàn tác.`}
          confirmText="Xóa tất cả" variant="danger"
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDel(false)}
        />
      )}
    </div>
  );
}
