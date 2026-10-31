import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { folderService } from '@/services/folder.service';
import { toast } from '@/providers/ToastProvider';

export function FolderActionModals({
  renameTarget,
  setRenameTarget,
  deleteFolder,
  setDeleteFolder,
  selectedFolder,
  setSelectedFolder,
  invalidateFolders,
}) {
  const [renameName, setRenameName] = useState('');

  useEffect(() => {
    if (renameTarget) setRenameName(renameTarget.name || '');
  }, [renameTarget]);

  const handleConfirmRename = async () => {
    if (!renameName.trim() || !renameTarget) return;
    try {
      await folderService.rename(renameTarget._id, renameName.trim());
      invalidateFolders();
      toast.success('Đổi tên thư mục thành công');
      setRenameTarget(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi');
    }
  };

  const handleConfirmDeleteFolder = async () => {
    if (!deleteFolder) return;
    try {
      await folderService.delete(deleteFolder._id);
      if (selectedFolder === deleteFolder._id) setSelectedFolder(null);
      invalidateFolders();
      toast.success('Xóa thư mục thành công');
      setDeleteFolder(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi');
    }
  };

  return (
    <>
      {renameTarget && (
        <Dialog open onOpenChange={() => setRenameTarget(null)}>
          <DialogContent className="max-w-xs p-5 rounded-[6px] border border-border">
            <DialogHeader>
              <DialogTitle className="text-sm">Đổi tên thư mục</DialogTitle>
            </DialogHeader>
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Tên mới..."
              autoFocus
              className="h-8 rounded-[6px]"
            />
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setRenameTarget(null)}>Hủy</Button>
              <Button size="sm" onClick={handleConfirmRename} className="rounded-[6px] active:scale-[0.98]">Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteFolder && (
        <ConfirmDialog
          open
          title="Xóa thư mục"
          description={`Xóa thư mục "${deleteFolder.name}"?`}
          onConfirm={handleConfirmDeleteFolder}
          onCancel={() => setDeleteFolder(null)}
        />
      )}
    </>
  );
}
