import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import {
  useBanners,
  useDeleteBanner,
  useDeleteBulkBanners,
  useUpdateBanner,
  BANNERS_KEY,
} from '@/hooks/useBanners';
import { bannerService } from '@/services/banner.service';
import { useMediaByIds } from '@/hooks/useMedia';
import { toast } from '@/providers/ToastProvider';

import BannerToolbar from './components/BannerToolbar';
import BannerTable from './components/BannerTable';
import BannerGrid from './components/BannerGrid';
import BannerBulkBar from './components/BannerBulkBar';
import BannerFormModal from './BannerFormModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';

export default function BannerPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [formTarget, setFormTarget] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkDel, setShowBulkDel] = useState(false);
  const [localOrder, setLocalOrder] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const res = useBanners({ page, limit, type: typeFilter === 'all' ? undefined : typeFilter });
  const bannerData = res.data;
  const remoteBanners = bannerData?.data ?? (Array.isArray(bannerData) ? bannerData : []);
  const pagination = bannerData?.pagination;
  const banners = localOrder ?? remoteBanners;

  // Resolve media objects for preview
  const resolveId = (v) => (v && typeof v === 'object' ? v._id : v);
  const allMediaIds = banners.map((b) => resolveId(b.mediaId)).filter(Boolean);
  const { data: mediaMap = {} } = useMediaByIds(allMediaIds);
  const bannersWithMedia = banners.map((b) => {
    const mid = resolveId(b.mediaId);
    return { ...b, _mediaObj: mid ? mediaMap[mid] : null };
  });

  const highlightId = searchParams.get('highlight');
  useEffect(() => {
    if (!highlightId) return;
    bannerService
      .locate(highlightId, limit, typeFilter === 'all' ? undefined : typeFilter)
      .then((r) => {
        setPage(r.data?.data?.page || 1);
      })
      .catch(() => {});
  }, [highlightId, typeFilter, limit]);

  useEffect(() => {
    if (!highlightId || !banners.length) return;
    const found = banners.find((b) => b._id === highlightId);
    if (!found) return;
    setSelectedIds((prev) => new Set(prev).add(highlightId));
    setSearchParams((p) => {
      p.delete('highlight');
      return p;
    }, { replace: true });
  }, [highlightId, banners, setSearchParams]);

  const { mutate: deleteBanner } = useDeleteBanner();
  const { mutate: deleteBulk } = useDeleteBulkBanners();
  const { mutate: updateBanner } = useUpdateBanner();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex((b) => b._id === active.id);
    const newIndex = banners.findIndex((b) => b._id === over.id);
    const startPosition = (page - 1) * limit;
    const reordered = arrayMove(banners, oldIndex, newIndex).map((b, i) => ({
      ...b,
      position: startPosition + i + 1,
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

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === banners.length ? new Set() : new Set(banners.map((b) => b._id))
    );
  };

  const handleDelete = (id) => {
    deleteBanner(id, {
      onSuccess: () => {
        toast.success('Đã xóa banner');
        setDeleteTarget(null);
        setLocalOrder(null);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Xóa thất bại'),
    });
  };

  const handleBulkDelete = () => {
    deleteBulk([...selectedIds], {
      onSuccess: () => {
        toast.success(`Đã xóa ${selectedIds.size} banner`);
        setSelectedIds(new Set());
        setShowBulkDel(false);
        setLocalOrder(null);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi khi xóa hàng loạt'),
    });
  };

  const handleToggleVisible = (banner) => {
    updateBanner(
      { id: banner._id, data: { isVisible: !banner.isVisible } },
      {
        onSuccess: () => {
          toast.success(banner.isVisible ? 'Đã ẩn banner' : 'Đã hiện banner');
          setLocalOrder(null);
        },
        onError: () => toast.error('Lỗi khi cập nhật trạng thái'),
      }
    );
  };

  const visibleCount = banners.filter((b) => b.isVisible).length;

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden pb-12 antialiased">
      {/* 1. Header Toolbar with Filter Tabs */}
      <BannerToolbar
        typeFilter={typeFilter}
        setTypeFilter={(t) => {
          setTypeFilter(t);
          setPage(1);
          setLocalOrder(null);
        }}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalCount={pagination?.total ?? banners.length}
        visibleCount={visibleCount}
        onCreateNew={() => setFormTarget(null)}
      />

      {/* 2. Drag-and-drop Content Body */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {viewMode === 'table' ? (
          <BannerTable
            banners={bannersWithMedia}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            onEdit={(b) => setFormTarget(b)}
            onDelete={(b) => setDeleteTarget(b)}
            onToggleVisible={handleToggleVisible}
            highlightId={highlightId}
          />
        ) : (
          <BannerGrid
            banners={bannersWithMedia}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onEdit={(b) => setFormTarget(b)}
            onDelete={(b) => setDeleteTarget(b)}
            onToggleVisible={handleToggleVisible}
          />
        )}
      </DndContext>

      {/* 3. Pagination */}
      {pagination && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      )}

      {/* 4. Floating Bulk Bar */}
      <BannerBulkBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDeleteSelected={() => setShowBulkDel(true)}
      />

      {/* 5. Modals */}
      {formTarget !== undefined && (
        <BannerFormModal banner={formTarget} onClose={() => setFormTarget(undefined)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Xác nhận xóa banner"
          description={`Bạn có chắc chắn muốn xóa banner "${deleteTarget.title || 'không có tiêu đề'}"? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa banner"
          danger
          onConfirm={() => handleDelete(deleteTarget._id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {showBulkDel && (
        <ConfirmDialog
          open={showBulkDel}
          title={`Xác nhận xóa ${selectedIds.size} banner`}
          description="Hành động này sẽ xóa vĩnh viễn tất cả các banner đã chọn và không thể khôi phục."
          confirmLabel={`Xóa ${selectedIds.size} banner`}
          danger
          onConfirm={handleBulkDelete}
          onClose={() => setShowBulkDel(false)}
        />
      )}
    </div>
  );
}
