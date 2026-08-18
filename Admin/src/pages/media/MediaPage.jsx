import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Home, Upload, Plus } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { useMedia, useMediaSearch } from '@/hooks/useMedia';
import { useFolders } from '@/hooks/useFolders';
import { mediaService } from '@/services/media.service';
import FolderTree from './FolderTree';
import MediaGrid from './MediaGrid';
import MediaToolbar from './MediaToolbar';
import UploadZone from './UploadZone';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Media</span>
      </div>
    );
  }
  const crumbs = buildBreadcrumb(folders, selectedFolder);
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <button className="hover:text-foreground transition-colors cursor-pointer" onClick={() => onSelect(null)}>
        Media
      </button>
      {crumbs.map((c, i) => (
        <span key={c._id} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-muted-foreground/50" />
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-foreground">{c.name}</span>
          ) : (
            <button className="hover:text-foreground transition-colors cursor-pointer" onClick={() => onSelect(c._id)}>{c.name}</button>
          )}
        </span>
      ))}
    </div>
  );
}

export default function MediaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFolder = searchParams.get('folderId') || null;

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');

  const qc = useQueryClient();
  const { data: allFolders = [] } = useFolders();
  const flatFolders = useMemo(() => flattenFolders(allFolders), [allFolders]);

  const { data: browseData, isLoading: loadingBrowse } = useMedia({
    folderId: selectedFolder, page, limit: 15, sortBy, sortDir,
  });
  const { data: searchData, isLoading: loadingSearch } = useMediaSearch({
    q: searchQuery, page: 1, limit: 15, sortBy, sortDir,
  });

  const isSearching = searchQuery.length > 0;
  const displayData = isSearching ? searchData : browseData;
  const mediaItems = displayData?.media ?? [];
  const isLoading = isSearching ? loadingSearch : loadingBrowse;
  const total = displayData?.total ?? 0;
  const totalPages = displayData?.totalPages ?? 1;

  const invalidateAll = () => qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });

  const { mutate: bulkDelete } = useMutation({
    mutationFn: () => mediaService.deleteBulk([...selectedIds]),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setSelectedIds(new Set());
      setShowBulkConfirm(false);
      invalidateAll();
    },
    onError: (err) => { toast.error(err.response?.data?.message || 'Xóa thất bại'); setShowBulkConfirm(false); },
  });

  const { mutate: deleteOne } = useMutation({
    mutationFn: (id) => mediaService.deleteOne(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidateAll();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xóa thất bại'),
  });

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleFolderSelect = (id) => {
    setSearchParams((prev) => {
      if (id) prev.set('folderId', id);
      else prev.delete('folderId');
      return prev;
    }, { replace: true });
    setSelectedIds(new Set());
    setPage(1);
    setSearchQuery('');
  };

  return (
    <div className="p-6 w-full max-w-7xl mx-auto flex flex-col gap-5">
      {/* Outer Card Box */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs text-foreground flex flex-col gap-5">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Thư viện ảnh</h1>
          <button
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
            onClick={() => setShowUpload(true)}
          >
            <Upload size={15} /> Thêm file
          </button>
        </div>

        {/* Main Content Layout: Left Tree + Right Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Folder Tree */}
          <div className="md:col-span-3 rounded-lg border border-border bg-background p-3 flex flex-col gap-1 min-h-[480px]">
            <FolderTree selectedId={selectedFolder} onSelect={handleFolderSelect} />
          </div>

          {/* Right Column: Toolbar + Media List + Pagination */}
          <div className="md:col-span-9 rounded-lg border border-border bg-background p-4 flex flex-col gap-4 min-h-[480px]">
            
            {/* Top Toolbar inside right column */}
            <MediaToolbar
              search={searchQuery}
              onSearch={(q) => { setSearchQuery(q); setPage(1); }}
              selectedCount={selectedIds.size}
              onBulkDelete={() => setShowBulkConfirm(true)}
              onClearSelect={() => setSelectedIds(new Set())}
              total={total}
              sortBy={sortBy} sortDir={sortDir}
              onSortChange={(by, dir) => { setSortBy(by); setSortDir(dir); setPage(1); }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Breadcrumb Path */}
            <div className="px-1 py-0.5">
              <BreadcrumbPath folders={allFolders} selectedFolder={selectedFolder} onSelect={handleFolderSelect} />
            </div>

            {/* Media Items Grid */}
            <div className="flex-1">
              <MediaGrid
                items={mediaItems}
                selectedIds={selectedIds}
                onToggle={toggleSelect}
                onDeleteConfirmed={deleteOne}
                onRefresh={invalidateAll}
                isLoading={isLoading}
                viewMode={viewMode}
                allFolders={flatFolders}
              />
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-border mt-auto text-xs text-muted-foreground">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="inline-flex h-8 items-center justify-center rounded-md px-3 font-medium hover:bg-accent hover:text-foreground disabled:opacity-40 cursor-pointer"
                >
                  ← Trước
                </button>
                <span>Trang {page} / {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="inline-flex h-8 items-center justify-center rounded-md px-3 font-medium hover:bg-accent hover:text-foreground disabled:opacity-40 cursor-pointer"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
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
          onConfirm={() => bulkDelete()}
          onCancel={() => setShowBulkConfirm(false)}
        />
      )}
    </div>
  );
}
