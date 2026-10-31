import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload } from '@/components/ui/Icons';
import { useMedia, useMediaSearch } from '@/hooks/useMedia';
import { useFolders, FOLDERS_KEY } from '@/hooks/useFolders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { buildFolderMap, buildBreadcrumb } from './media-picker/mediaPickerUtils';
import FolderTreeSidebar, { FolderCtxMenu } from './media-picker/FolderTreeSidebar';
import UploadPanel from './media-picker/UploadPanel';
import MediaPreviewPanel from './media-picker/MediaPreviewPanel';
import MediaGridContent from './media-picker/MediaGridContent';
import { FolderActionModals } from './media-picker/FolderActionModals';

export default function MediaPickerModal({ onSelect, onClose, isMultiple = false }) {
  const qc = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [pickedSingle, setPickedSingle] = useState(null);
  const [pickedMultiple, setPickedMultiple] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderParent, setNewFolderParent] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteFolder, setDeleteFolder] = useState(null);
  const [pickerPreview, setPickerPreview] = useState(null);

  const { data: folders = [] } = useFolders();
  const folderMap = buildFolderMap(folders);

  const isSearching = search.trim().length > 0;

  const { data: browseData, isLoading: lb } = useMedia({ folderId: selectedFolder, page, limit: 24 });
  const { data: searchData, isLoading: ls } = useMediaSearch({ q: search, page: 1, limit: 24 });

  const displayData = isSearching ? searchData : browseData;
  const mediaItems = displayData?.media ?? [];
  const total = displayData?.total ?? 0;
  const totalPages = displayData?.totalPages ?? 1;
  const isLoading = isSearching ? ls : lb;

  const searchFolders = isSearching ? (searchData?.folders ?? []) : [];
  const modalFolders = isSearching
    ? searchFolders
    : selectedFolder
      ? (folderMap[selectedFolder]?.children ?? [])
      : [];
  const crumbs = selectedFolder ? buildBreadcrumb(folderMap, selectedFolder) : [];

  const invalidateFolders = () => {
    qc.invalidateQueries({ queryKey: FOLDERS_KEY });
    qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });
  };

  const handleFolderSelect = (id) => {
    setSelectedFolder(id);
    setPage(1);
    setSearch('');
    setPickerPreview(null);
  };

  const handleCardClick = (item) => {
    setPickerPreview(item);
    if (isMultiple) {
      setPickedMultiple((prev) => {
        const exists = prev.some((x) => x._id === item._id);
        if (exists) return prev.filter((x) => x._id !== item._id);
        return [...prev, item];
      });
    } else {
      setPickedSingle(item);
    }
  };

  const isSelected = (id) => {
    if (isMultiple) return pickedMultiple.some((x) => x._id === id);
    return pickedSingle?._id === id;
  };

  const handleConfirmPick = () => {
    if (isMultiple) {
      if (pickedMultiple.length > 0) {
        onSelect(pickedMultiple);
        onClose();
      }
    } else {
      if (pickedSingle) {
        onSelect(pickedSingle);
        onClose();
      }
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl w-[92vw] h-[85vh] p-0 flex flex-col overflow-hidden gap-0 rounded-[6px] border border-border bg-background shadow-sm">
        <DialogHeader className="px-5 py-3.5 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0 pr-12">
          <DialogTitle className="text-base font-bold text-foreground">Chọn ảnh từ thư viện</DialogTitle>
          <div className="flex items-center gap-2 mr-6">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center gap-1 rounded-[6px] bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer active:scale-[0.98]"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Upload size={13} /> Upload ảnh
            </button>
          </div>
        </DialogHeader>

        {showUpload && (
          <UploadPanel folderId={selectedFolder} onClose={() => setShowUpload(false)} />
        )}

        <div className="flex flex-1 min-h-0 overflow-hidden" style={{ minWidth: 0 }}>
          <FolderTreeSidebar
            folders={folders}
            folderMap={folderMap}
            selectedFolder={selectedFolder}
            onSelectFolder={handleFolderSelect}
            onCtxMenu={(e, folder) => setCtxMenu({ x: e.clientX, y: e.clientY, folder })}
            showNewFolder={showNewFolder}
            setShowNewFolder={setShowNewFolder}
            newFolderParent={newFolderParent}
            setNewFolderParent={setNewFolderParent}
          />

          <div className="flex flex-1 min-w-0 overflow-hidden">
            <MediaGridContent
              crumbs={crumbs}
              search={search}
              setSearch={setSearch}
              setPage={setPage}
              onFolderSelect={handleFolderSelect}
              isLoading={isLoading}
              modalFolders={modalFolders}
              mediaItems={mediaItems}
              isSelected={isSelected}
              handleCardClick={handleCardClick}
              onSelect={onSelect}
              onClose={onClose}
              isMultiple={isMultiple}
              pickedMultiple={pickedMultiple}
              page={page}
              total={total}
              totalPages={totalPages}
            />

            <MediaPreviewPanel
              pickerPreview={pickerPreview}
              onClose={() => setPickerPreview(null)}
            />
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="text-xs text-muted-foreground">
            {isMultiple ? (
              pickedMultiple.length > 0 ? (
                <span className="font-semibold text-foreground tabular-nums font-mono">
                  Đã chọn {pickedMultiple.length} ảnh
                </span>
              ) : (
                'Click chọn 1 hoặc nhiều ảnh'
              )
            ) : (
              pickedSingle ? (
                <span className="font-semibold text-foreground">
                  Đã chọn: {pickedSingle.filename}
                </span>
              ) : (
                'Click chọn ảnh hoặc nhấp đôi để xác nhận'
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Hủy</Button>
            <Button size="sm" disabled={isMultiple ? pickedMultiple.length === 0 : !pickedSingle} onClick={handleConfirmPick}>
              {isMultiple ? `Chọn ${pickedMultiple.length} ảnh` : 'Chọn ảnh này'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {ctxMenu && (
        <FolderCtxMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          folder={ctxMenu.folder}
          folderMap={folderMap}
          onClose={() => setCtxMenu(null)}
          onAddChild={(id) => {
            setNewFolderParent(id);
            setShowNewFolder(true);
          }}
          onRename={(f) => setRenameTarget(f)}
          onDelete={(f) => setDeleteFolder(f)}
        />
      )}

      <FolderActionModals
        renameTarget={renameTarget}
        setRenameTarget={setRenameTarget}
        deleteFolder={deleteFolder}
        setDeleteFolder={setDeleteFolder}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        invalidateFolders={invalidateFolders}
      />
    </Dialog>
  );
}
