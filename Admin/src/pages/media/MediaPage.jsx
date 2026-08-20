import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Upload, ExternalLink, Copy, X, Search } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { useMedia, useMediaSearch } from '@/hooks/useMedia';
import { useFolders } from '@/hooks/useFolders';
import { mediaService } from '@/services/media.service';
import FolderTree from './FolderTree';
import MediaGrid from './MediaGrid';
import MediaToolbar from './MediaToolbar';
import UploadZone from './UploadZone';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import MediaUsageModal from '@/components/media/MediaUsageModal';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function flattenFolders(folders, level = 0) {
  const result = [];
  for (const f of folders) {
    result.push({ _id: f._id, name: f.name, level });
    if (f.children?.length) result.push(...flattenFolders(f.children, level + 1));
  }
  return result;
}

function buildBreadcrumb(folders, targetId) {
  const map = {};
  const flatten = (items) => items.forEach((f) => {
    map[f._id] = f;
    if (f.children) flatten(f.children);
  });
  flatten(folders);
  const crumbs = [];
  let current = map[targetId];
  while (current) {
    crumbs.unshift(current);
    current = current.parentId ? map[current.parentId] : null;
  }
  return crumbs;
}

function BreadcrumbPath({ folders, selectedFolder, onSelect }) {
  if (!selectedFolder) {
    return <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>Media</span></div>;
  }
  const crumbs = buildBreadcrumb(folders, selectedFolder);
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <button className="hover:text-foreground transition-colors cursor-pointer" onClick={() => onSelect(null)}>Media</button>
      {crumbs.map((c, i) => (
        <span key={c._id} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-muted-foreground/50" />
          {i === crumbs.length - 1
            ? <span className="font-semibold text-foreground">{c.name}</span>
            : <button className="hover:text-foreground transition-colors cursor-pointer" onClick={() => onSelect(c._id)}>{c.name}</button>
          }
        </span>
      ))}
    </div>
  );
}

/** ── Global Search Results Modal (opens on Enter) ── */
function GlobalSearchModal({ query, onClose }) {
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const { data, isLoading } = useMediaSearch({ q: query, page, limit: 24, sortBy: 'createdAt', sortDir: 'desc' });
  const items = data?.media ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const fmtSize = (b) => !b ? '' : b < 1024*1024 ? (b/1024).toFixed(0)+' KB' : (b/1024/1024).toFixed(1)+' MB';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-4xl rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
        style={{ maxHeight: '85vh', height: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left: results */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0 bg-muted/20">
            <div className="flex items-center gap-2 flex-wrap">
              <Search size={15} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Kết quả tìm kiếm:</span>
              <span className="text-sm font-bold text-primary">{total}</span>
              <span className="text-sm text-muted-foreground">ảnh khớp với</span>
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold">"{query}"</span>
            </div>
            <button onClick={onClose} className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer ml-3 shrink-0">
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-muted animate-pulse border border-border" style={{ aspectRatio: '1' }} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-sm font-medium">Không tìm thấy kết quả nào</p>
              </div>
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                {items.map((item, idx) => (
                  <SearchResultCard
                    key={item._id}
                    item={item}
                    isActive={preview?._id === item._id}
                    onClick={() => setPreview(item)}
                    animDelay={Math.min(idx * 15, 200)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-4 pb-3 shrink-0">
            <DataTablePagination
              page={page} pageSize={24} total={total} totalPages={totalPages}
              onPageChange={setPage} showPageSize={false} showJumpToPage={totalPages > 3}
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-64 shrink-0 border-l border-border flex flex-col bg-muted/10">
          {preview ? (
            <>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
                <span className="text-[11px] font-semibold text-foreground">Preview</span>
                <button onClick={() => setPreview(null)} className="size-5 flex items-center justify-center rounded text-muted-foreground hover:bg-accent cursor-pointer">
                  <X size={10} />
                </button>
              </div>
              <div className="flex items-center justify-center border-b border-border bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:12px_12px]" style={{ height: 180 }}>
                {preview.mimetype?.startsWith('image/')
                  ? <img src={preview.url} alt={preview.filename} className="max-h-[176px] max-w-full object-contain" />
                  : <span className="text-4xl font-extrabold text-muted-foreground/20">{preview.filename?.split('.').pop()?.toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-foreground break-all leading-relaxed">{preview.filename}</p>
                <div className="rounded-md border border-border overflow-hidden">
                  {[['Loại', preview.mimeType], ['Size', fmtSize(preview.size)], ['Ngày', preview.createdAt ? new Date(preview.createdAt).toLocaleDateString('vi-VN') : '—'], ['Folder', preview.folderId?.name || 'Gốc']].map(([l, v]) => (
                    <div key={l} className="flex gap-2 px-2.5 py-1.5 border-b border-border last:border-0">
                      <span className="text-[10px] text-muted-foreground w-12 shrink-0">{l}</span>
                      <span className="text-[10px] text-foreground break-all flex-1">{v || '—'}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-md bg-muted/60 border border-border px-2 py-1.5">
                  <p className="text-[9px] text-muted-foreground break-all font-mono leading-relaxed">{preview.url}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(preview.url); toast.success('Đã copy!'); }}
                  className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-md border border-border text-[10px] font-medium hover:bg-accent cursor-pointer">
                  <Copy size={11} /> Copy URL
                </button>
                <a href={preview.url} target="_blank" rel="noreferrer"
                  className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-md bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90">
                  <ExternalLink size={11} /> Mở ảnh
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
              <Search size={24} className="mb-2 opacity-30" />
              <p className="text-xs">Click vào ảnh để xem preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ item, isActive, onClick, animDelay }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      className={`group relative flex flex-col rounded-lg border cursor-pointer overflow-hidden transition-all bg-card media-wave-in ${isActive ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border hover:border-primary/40 hover:shadow-sm'}`}
      style={{ animationDelay: `${animDelay}ms` }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: '1' }}>
        {imgErr
          ? <div className="flex size-full items-center justify-center text-[9px] text-muted-foreground">Err</div>
          : <img src={item.url} alt={item.filename} loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-200" onError={() => setImgErr(true)} />}
      </div>
      <div className="px-1.5 py-1">
        <p className="text-[9px] font-medium text-foreground truncate" title={item.filename}>{item.filename}</p>
      </div>
    </div>
  );
}

/** Right-side preview panel */
function PreviewPanel({ item, onClose }) {
  // BE stores field as `mimeType` (camelCase). Fallback to extension check.
  const mime = item.mimeType || item.mimetype || '';
  const isImage = mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg|bmp|avif|ico)$/i.test(item.filename || '');
  const ext = item.filename?.split('.').pop()?.toUpperCase() || '—';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(item.url);
    toast.success('Đã copy URL');
  };

  return (
    <div className="flex flex-col h-full border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground">Preview</span>
        <button onClick={onClose} className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer">
          <X size={13} />
        </button>
      </div>

      {/* Image preview area */}
      <div className="flex items-center justify-center bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] border-b border-border shrink-0" style={{ height: 200 }}>
        {isImage ? (
          <img src={item.url} alt={item.filename} className="max-h-[196px] max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-4xl font-extrabold text-muted-foreground/20">{ext}</span>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <p className="text-xs font-semibold text-foreground break-all leading-relaxed">{item.filename}</p>

        <div className="flex flex-col gap-0 rounded-lg border border-border overflow-hidden">
          {[
            ['Loại file', item.mimetype || ext],
            ['Kích thước', formatSize(item.size)],
            ['Ngày tạo', formatDate(item.createdAt)],
            ['Thư mục', item.folderId?.name || 'Gốc'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start gap-2 px-3 py-2 border-b border-border last:border-0">
              <span className="text-[11px] text-muted-foreground font-medium w-20 shrink-0 pt-px">{label}</span>
              <span className="text-[11px] text-foreground break-all flex-1">{value}</span>
            </div>
          ))}
        </div>

        {/* URL box */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Đường dẫn</span>
          <div className="rounded-md bg-muted/50 border border-border px-2.5 py-2">
            <p className="text-[10px] text-muted-foreground break-all leading-relaxed font-mono">{item.url}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 px-4 py-3 border-t border-border shrink-0">
        <button onClick={handleCopyUrl}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer">
          <Copy size={13} /> Copy URL
        </button>
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <ExternalLink size={13} /> Mở ảnh
        </a>
      </div>
    </div>
  );
}

export default function MediaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFolder = searchParams.get('folderId') || null;

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [previewItem, setPreviewItem] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModal, setSearchModal] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [usageModal, setUsageModal] = useState(null);
  const [usagesMap, setUsagesMap] = useState({});
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  const qc = useQueryClient();
  const { data: allFolders = [] } = useFolders();
  const flatFolders = useMemo(() => flattenFolders(allFolders), [allFolders]);

  const { data: browseData, isLoading: loadingBrowse } = useMedia({
    folderId: selectedFolder, page, limit, sortBy, sortDir,
  });
  const { data: searchData, isLoading: loadingSearch } = useMediaSearch({
    q: searchQuery, page, limit, sortBy, sortDir,
  });

  const isSearching = searchQuery.length > 0;
  const displayData = isSearching ? searchData : browseData;
  const mediaItems = displayData?.media ?? [];
  const isLoading = isSearching ? loadingSearch : loadingBrowse;
  const total = displayData?.total ?? 0;
  const totalPages = displayData?.totalPages ?? 1;

  const invalidateAll = () => qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });

  useEffect(() => {
    if (!mediaItems.length) { setUsagesMap({}); return; }
    const ids = mediaItems.map((m) => m._id);
    mediaService.checkUsages(ids)
      .then((res) => setUsagesMap(res.data.data.usages || {}))
      .catch(() => setUsagesMap({}));
  }, [mediaItems]);

  const { mutate: bulkDelete, isPending: isDeletingBulk } = useMutation({
    mutationFn: (ids) => mediaService.deleteBulk(ids),
    onSuccess: () => {
      toast.success('Đã xóa thành công');
      setSelectedIds(new Set());
      setShowBulkConfirm(false);
      setUsageModal(null);
      invalidateAll();
    },
    onError: (err) => { toast.error(err.response?.data?.message || 'Xóa thất bại'); },
  });

  const { mutate: deleteOne, isPending: isDeletingOne } = useMutation({
    mutationFn: (id) => mediaService.deleteOne(id),
    onSuccess: () => { toast.success('Đã xóa thành công'); setUsageModal(null); invalidateAll(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Xóa thất bại'),
  });

  const handleDeleteRequest = (item) => {
    const usages = usagesMap[item._id];
    if (usages && usages.length > 0) {
      setUsageModal({ items: [item], usages: { [item._id]: usages }, type: 'single', ids: [item._id] });
    } else {
      setConfirmDeleteItem(item);
    }
  };

  const handleBulkDeleteCheck = async () => {
    const ids = [...selectedIds];
    try {
      const res = await mediaService.checkUsages(ids);
      const usages = res.data.data.usages;
      if (Object.keys(usages).length > 0) {
        const usedItems = mediaItems.filter((m) => ids.includes(m._id));
        setUsageModal({ items: usedItems, usages, type: 'bulk', ids });
        setShowBulkConfirm(false);
      } else {
        setShowBulkConfirm(true);
      }
    } catch {
      setShowBulkConfirm(true);
    }
  };

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    const found = mediaItems.find(m => m._id === id);
    if (found) setPreviewItem(found);
  }, [mediaItems]);

  const handleFolderSelect = (id) => {
    setSearchParams((prev) => {
      if (id) prev.set('folderId', id);
      else prev.delete('folderId');
      return prev;
    }, { replace: true });
    setSelectedIds(new Set());
    setPreviewItem(null);
    setPage(1);
    setSearchQuery('');
  };

  const showPreview = !!previewItem;

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto flex flex-col gap-5">
      <div className="rounded-xl border border-border bg-card shadow-2xs text-foreground overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Thư viện ảnh</h1>
          <button
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
            onClick={() => setShowUpload(true)}
          >
            <Upload size={15} /> Thêm file
          </button>
        </div>

        {/* Body — fixed height flex so each column scrolls independently */}
        <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: 480 }}>

          {/* Col 1: Folder Tree — independently scrollable */}
          <div className="w-52 shrink-0 border-r border-border overflow-y-auto p-2.5 bg-muted/10">
            <FolderTree selectedId={selectedFolder} onSelect={handleFolderSelect} />
          </div>

          {/* Col 2: Toolbar + Grid + Pagination */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Toolbar row — fixed, doesn't scroll */}
            <div className="shrink-0 border-b border-border px-4 py-2">
              <MediaToolbar
                search={searchQuery}
                onSearch={(q) => { setSearchQuery(q); setPage(1); }}
                onSearchEnter={(q) => { if (q.trim()) setSearchModal(q.trim()); }}
                selectedCount={selectedIds.size}
                onBulkDelete={handleBulkDeleteCheck}
                onClearSelect={() => setSelectedIds(new Set())}
                total={total}
                sortBy={sortBy} sortDir={sortDir}
                onSortChange={(by, dir) => { setSortBy(by); setSortDir(dir); setPage(1); }}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            {/* Breadcrumb — fixed */}
            <div className="shrink-0 px-4 py-1.5 border-b border-border bg-muted/20">
              <BreadcrumbPath folders={allFolders} selectedFolder={selectedFolder} onSelect={handleFolderSelect} />
            </div>

            {/* Media grid — the only scrollable part */}
            <div className="flex-1 overflow-y-auto p-4">
              <MediaGrid
                items={mediaItems}
                selectedIds={selectedIds}
                onToggle={toggleSelect}
                onPreview={setPreviewItem}
                onDeleteRequest={handleDeleteRequest}
                onRefresh={invalidateAll}
                isLoading={isLoading}
                viewMode={viewMode}
                allFolders={flatFolders}
                columns={showPreview ? 3 : 6}
                usagesMap={usagesMap}
              />
            </div>

            {/* Pagination — fixed at bottom */}
            <div className="shrink-0 px-4 py-2 border-t border-border bg-background">
              <DataTablePagination
                page={page}
                pageSize={limit}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={(v) => { setLimit(v); setPage(1); }}
                pageSizeOptions={[50, 100]}
                showPageSize={true}
                showJumpToPage={true}
              />
            </div>
          </div>

          {/* Col 3: Preview Panel — independently scrollable, always same height */}
          {showPreview && (
            <div className="w-64 shrink-0 border-l border-border overflow-y-auto bg-muted/5">
              <PreviewPanel item={previewItem} onClose={() => setPreviewItem(null)} />
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadZone folderId={selectedFolder} onClose={() => setShowUpload(false)} />
      )}

      {showBulkConfirm && (
        <ConfirmDialog
          title="Xóa ảnh"
          message={`Xóa ${selectedIds.size} ảnh đã chọn? Hành động này không thể hoàn tác.`}
          confirmText="Xóa tất cả"
          variant="danger"
          onConfirm={() => bulkDelete([...selectedIds])}
          onCancel={() => setShowBulkConfirm(false)}
        />
      )}

      {confirmDeleteItem && (
        <ConfirmDialog
          open={true}
          title="Xóa ảnh"
          message={`Xóa ảnh "${confirmDeleteItem.filename}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          variant="danger"
          onConfirm={() => { deleteOne(confirmDeleteItem._id); setConfirmDeleteItem(null); }}
          onCancel={() => setConfirmDeleteItem(null)}
        />
      )}

      {usageModal && (
        <MediaUsageModal
          mediaItems={usageModal.items}
          usages={usageModal.usages}
          isDeleting={isDeletingBulk || isDeletingOne}
          onForceDelete={() => {
            if (usageModal.type === 'single') deleteOne(usageModal.ids[0]);
            else bulkDelete(usageModal.ids);
          }}
          onCancel={() => setUsageModal(null)}
        />
      )}

      {searchModal && (
        <GlobalSearchModal query={searchModal} onClose={() => setSearchModal('')} />
      )}
    </div>
  );
}

