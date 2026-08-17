import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Home } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { useMedia, useMediaSearch } from '@/hooks/useMedia';
import { useFolders } from '@/hooks/useFolders';
import { mediaService } from '@/services/media.service';
import FolderTree from './FolderTree';
import MediaGrid from './MediaGrid';
import MediaToolbar from './MediaToolbar';
import UploadZone from './UploadZone';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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

function Breadcrumb({ folders, selectedFolder, onSelect }) {
  if (!selectedFolder) {
    return (
      <div className="breadcrumb">
        <span className="bc-item bc-current"><Home size={13} /> Tất cả</span>
      </div>
    );
  }
  const crumbs = buildBreadcrumb(folders, selectedFolder);
  return (
    <div className="breadcrumb">
      <button className="bc-item bc-link" onClick={() => onSelect(null)}>
        <Home size={13} />
      </button>
      {crumbs.map((c, i) => (
        <span key={c._id} className="bc-segment">
          <ChevronRight size={12} className="bc-sep" />
          {i === crumbs.length - 1 ? (
            <span className="bc-item bc-current">{c.name}</span>
          ) : (
            <button className="bc-item bc-link" onClick={() => onSelect(c._id)}>{c.name}</button>
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

  const { data: browseData, isLoading: loadingBrowse } = useMedia({
    folderId: selectedFolder, page, limit: 20, sortBy, sortDir,
  });
  const { data: searchData, isLoading: loadingSearch } = useMediaSearch({
    q: searchQuery, page: 1, limit: 20, sortBy, sortDir,
  });

  const isSearching = searchQuery.length > 0;
  const displayData = isSearching ? searchData : browseData;
  const mediaItems = displayData?.media ?? [];
  const isLoading = isSearching ? loadingSearch : loadingBrowse;
  const total = displayData?.total ?? 0;
  const totalPages = displayData?.totalPages ?? 1;

  const invalidateAll = () => qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });

  // Bulk delete
  const { mutate: bulkDelete } = useMutation({
    mutationFn: () => mediaService.deleteBulk([...selectedIds]),
    onSuccess: (res) => {
      toast.success(res.data.message); // backend trả đầy đủ message
      setSelectedIds(new Set());
      setShowBulkConfirm(false);
      invalidateAll();
    },
    onError: (err) => { toast.error(err.response?.data?.message || 'Xóa thất bại'); setShowBulkConfirm(false); },
  });

  // Single delete – message trả về từ backend
  const { mutate: deleteOne } = useMutation({
    mutationFn: (id) => mediaService.deleteOne(id),
    onSuccess: (res) => {
      toast.success(res.data.message); // Backend trả đầy đủ, kể cả usedBy info
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
    // Sync vào URL, reset filter
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
    <div className="media-page">
      {/* Left – folder tree */}
      <FolderTree selectedId={selectedFolder} onSelect={handleFolderSelect} />

      {/* Right – content */}
      <div className="media-content">
        {/* Breadcrumb */}
        <div className="media-breadcrumb-bar">
          <Breadcrumb folders={allFolders} selectedFolder={selectedFolder} onSelect={handleFolderSelect} />
        </div>

        <MediaToolbar
          search={searchQuery}
          onSearch={(q) => { setSearchQuery(q); setPage(1); }}
          selectedCount={selectedIds.size}
          onUpload={() => setShowUpload(true)}
          onBulkDelete={() => setShowBulkConfirm(true)}
          onClearSelect={() => setSelectedIds(new Set())}
          total={total}
          sortBy={sortBy} sortDir={sortDir}
          onSortChange={(by, dir) => { setSortBy(by); setSortDir(dir); setPage(1); }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <MediaGrid
          items={mediaItems}
          selectedIds={selectedIds}
          onToggle={toggleSelect}
          onDeleteConfirmed={deleteOne}
          isLoading={isLoading}
          viewMode={viewMode}
        />

        {/* SubFolders chips nếu là parent folder */}
        {!isSearching && browseData?.type === 'parent' && browseData.subFolders?.length > 0 && (
          <div className="subfolder-tabs">
            {browseData.subFolders.map((sf) => (
              <button key={sf._id} className="subfolder-chip" onClick={() => handleFolderSelect(sf._id)}>
                📁 {sf.name}
              </button>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost">← Trước</button>
            <span>Trang {page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn-ghost">Sau →</button>
          </div>
        )}
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
