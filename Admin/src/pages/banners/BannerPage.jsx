import { useState, useCallback } from 'react';
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
} from 'lucide-react';
import { useBanners, useDeleteBanner, useDeleteBulkBanners, useUpdateBanner } from '@/hooks/useBanners';
import { bannerService } from '@/services/banner.service';
import { toast } from '@/providers/ToastProvider';
import BannerFormModal from './BannerFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useQueryClient } from '@tanstack/react-query';
import { BANNERS_KEY } from '@/hooks/useBanners';

// ── Visible Badge ──────────────────────────────────────────────────────────────
function VisibleBadge({ isVisible }) {
  return (
    <span className={`status-badge ${isVisible ? 'active' : 'inactive'}`}>
      <span className={`status-dot ${isVisible ? 'dot-active' : 'dot-inactive'}`} />
      {isVisible ? 'Hiển thị' : 'Đang ẩn'}
    </span>
  );
}

// ── Inline Actions ─────────────────────────────────────────────────────────────
function InlineActions({ banner, onEdit, onDelete, onToggleVisible }) {
  return (
    <div className="inline-actions">
      <button className="ia-btn ia-edit" title="Sửa"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}>
        <Pencil size={13} /><span>Sửa</span>
      </button>
      <button className="ia-btn ia-toggle"
        title={banner.isVisible ? 'Ẩn banner' : 'Hiện banner'}
        onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}>
        {banner.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
        <span>{banner.isVisible ? 'Ẩn' : 'Hiện'}</span>
      </button>
      <button className="ia-btn ia-delete" title="Xóa"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        <Trash2 size={13} /><span>Xóa</span>
      </button>
    </div>
  );
}

// ── Sortable Table Row ─────────────────────────────────────────────────────────
function SortableBannerRow({ banner, selected, onToggle, onEdit, onDelete, onToggleVisible }) {
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

  // Stop pointer events on interactive cells so buttons/links still work
  const stopDrag = (e) => e.stopPropagation();

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`data-row sortable-row ${selected ? 'tr-selected' : ''} ${!banner.isVisible ? 'tr-hidden' : ''}`}
      {...attributes}
      {...listeners}
    >
      {/* Checkbox – stop drag propagation */}
      <td className="td-check" onPointerDown={stopDrag}>
        <button className={`row-checkbox ${selected ? 'checked' : ''}`} onClick={() => onToggle(banner._id)}>
          {selected && <Check size={10} />}
        </button>
      </td>

      <td className="td-img">
        <div className="banner-thumb-wrap">
          <img src={banner.imageUrl} alt={banner.title || 'banner'} className="banner-thumb" />
          {!banner.isVisible && <div className="thumb-dim" />}
        </div>
      </td>

      <td className="td-title">
        <span className={`banner-title-text ${!banner.isVisible ? 'dim' : ''}`}>
          {banner.title || <span className="text-muted">Chưa đặt tiêu đề</span>}
        </span>
      </td>

      <td className="td-link" onPointerDown={stopDrag}>
        {banner.link ? (
          <a href={banner.link} target="_blank" rel="noreferrer"
            className="banner-link-cell" onClick={e => e.stopPropagation()}>
            <ExternalLink size={11} />
            <span>{banner.link.length > 38 ? banner.link.slice(0, 38) + '…' : banner.link}</span>
          </a>
        ) : <span className="text-muted">—</span>}
      </td>

      <td className="td-status"><VisibleBadge isVisible={banner.isVisible} /></td>
      <td className="td-pos"><span className="pos-chip">{banner.position}</span></td>
      <td className="td-date">{new Date(banner.createdAt).toLocaleDateString('vi-VN')}</td>

      <td className="td-actions-inline" onPointerDown={stopDrag}>
        <InlineActions banner={banner} onEdit={onEdit} onDelete={onDelete} onToggleVisible={onToggleVisible} />
      </td>
    </tr>
  );
}

// ── Banner Card (Grid) ─────────────────────────────────────────────────────────
function BannerCard({ banner, selected, onToggle, onEdit, onDelete, onToggleVisible }) {
  return (
    <div className={`banner-card ${selected ? 'selected' : ''}`}>
      <div className="banner-card-img" onClick={() => onToggle(banner._id)}>
        <img src={banner.imageUrl} alt={banner.title || 'banner'} />
        {selected && <div className="banner-card-check"><Check size={14} /></div>}
        {!banner.isVisible && <div className="banner-card-hidden-overlay"><EyeOff size={14} /> Đang ẩn</div>}
      </div>
      <div className="banner-card-info">
        <span className="banner-card-title">{banner.title || <span className="text-muted">Chưa đặt tiêu đề</span>}</span>
        <VisibleBadge isVisible={banner.isVisible} />
        <div className="banner-card-actions">
          <button className="ia-btn ia-edit" onClick={onEdit}><Pencil size={12} /></button>
          <button className="ia-btn ia-toggle" onClick={onToggleVisible}>
            {banner.isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button className="ia-btn ia-delete" onClick={onDelete}><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  );
}

// ── Main BannerPage ────────────────────────────────────────────────────────────
export default function BannerPage() {
  const qc = useQueryClient();
  const [viewMode,     setViewMode]     = useState('table');
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [formTarget,   setFormTarget]   = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkDel,  setShowBulkDel]  = useState(false);
  const [activeId,     setActiveId]     = useState(null); // DnD active item
  const [localOrder,   setLocalOrder]   = useState(null); // optimistic order

  const { data: remoteBanners = [], isLoading } = useBanners();
  const banners = localOrder ?? remoteBanners;

  const { mutate: deleteBanner }  = useDeleteBanner();
  const { mutate: deleteBulk }    = useDeleteBulkBanners();
  const { mutate: updateBanner }  = useUpdateBanner();

  // DnD sensors – small activation distance to avoid accidental drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex(b => b._id === active.id);
    const newIndex = banners.findIndex(b => b._id === over.id);
    const reordered = arrayMove(banners, oldIndex, newIndex);

    // Optimistic update
    setLocalOrder(reordered);

    const items = reordered.map((b, i) => ({ id: b._id, position: i }));
    try {
      await bannerService.reorder(items);
      qc.invalidateQueries({ queryKey: BANNERS_KEY });
      toast.success('Đã cập nhật thứ tự banner');
    } catch {
      toast.error('Lỗi cập nhật thứ tự');
      setLocalOrder(null); // rollback
    }
  };

  // Sync local order when remote data changes (after invalidate)
  const prevRemote = remoteBanners;
  if (localOrder && JSON.stringify(remoteBanners.map(b => b._id)) !== JSON.stringify(localOrder.map(b => b._id))) {
    // Remote updated → clear optimistic
  }

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
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Banners</h1>
          <p className="page-subtitle">
            {banners.length} banner &nbsp;·&nbsp;
            <span className="subtitle-green">{visibleCount} đang hiển thị</span>
            {viewMode === 'table' && <span className="subtitle-hint"> · Kéo ⠿ để sắp xếp</span>}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selectedIds.size > 0 && (
            <>
              <span className="selected-badge">{selectedIds.size} đã chọn</span>
              <button className="btn-danger-sm" onClick={() => setShowBulkDel(true)}>
                <Trash2 size={13} /> Xóa
              </button>
              <button className="btn-ghost-sm" onClick={() => setSelectedIds(new Set())}>Bỏ chọn</button>
            </>
          )}
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="Bảng">
              <List size={14} />
            </button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Lưới">
              <LayoutGrid size={14} />
            </button>
          </div>
          <button className="btn-primary" onClick={() => setFormTarget(null)}>
            <Plus size={15} /> Tạo mới
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="page-card">
        {isLoading ? (
          <div className="page-loading">Đang tải...</div>
        ) : banners.length === 0 ? (
          <div className="page-empty">
            <Image size={40} style={{ color: 'var(--text-3)' }} />
            <p>Chưa có banner nào</p>
            <button className="btn-primary" onClick={() => setFormTarget(null)}>
              <Plus size={14} /> Tạo banner đầu tiên
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE with DnD */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="th-check">
                      <button className={`row-checkbox ${allSelected ? 'checked' : ''}`} onClick={toggleAll}>
                        {allSelected && <Check size={10} />}
                      </button>
                    </th>
                    <th>Ảnh</th>
                    <th>Tiêu đề</th>
                    <th>Link</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'center' }}>Vị trí</th>
                    <th>Ngày tạo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext items={banners.map(b => b._id)} strategy={verticalListSortingStrategy}>
                    {banners.map(b => (
                      <SortableBannerRow
                        key={b._id} banner={b}
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

            {/* Drag overlay */}
            <DragOverlay>
              {activeItem && (
                <table className="data-table drag-overlay-table">
                  <tbody>
                    <tr style={{ background: 'var(--surface)' }}>
                      <td className="td-check" />
                      <td className="td-img">
                        <img src={activeItem.imageUrl} alt="" className="banner-thumb" />
                      </td>
                      <td className="td-title">
                        <span className="banner-title-text">{activeItem.title || '—'}</span>
                      </td>
                      <td colSpan={5} />
                    </tr>
                  </tbody>
                </table>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          /* GRID */
          <div className="banner-grid">
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
