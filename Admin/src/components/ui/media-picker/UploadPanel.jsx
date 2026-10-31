import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Upload, Link, Loader2 } from '@/components/ui/Icons';
import { mediaService } from '@/services/media.service';
import { FOLDERS_KEY } from '@/hooks/useFolders';
import { toast } from '@/providers/ToastProvider';

export default function UploadPanel({ folderId, onClose }) {
  const qc = useQueryClient();
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });
    qc.invalidateQueries({ queryKey: FOLDERS_KEY });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    disabled: uploading,
    onDrop: async (accepted) => {
      if (!folderId) {
        toast.error('Vui lòng chọn thư mục trước');
        return;
      }
      setUploading(true);
      let ok = 0;
      for (const file of accepted) {
        try {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('folderId', folderId);
          await mediaService.upload(fd, () => {});
          ok++;
        } catch {
          toast.error(`Lỗi: ${file.name}`);
        }
      }
      invalidate();
      setUploading(false);
      if (ok > 0) {
        toast.success(`Đã upload ${ok} ảnh`);
        onClose();
      }
    },
  });

  const handleUrlUpload = async () => {
    if (!url.trim()) {
      toast.error('Nhập URL ảnh');
      return;
    }
    if (!folderId) {
      toast.error('Vui lòng chọn thư mục');
      return;
    }
    setUploading(true);
    try {
      await mediaService.uploadUrl({ url: url.trim(), folderId });
      invalidate();
      toast.success('Upload từ URL thành công');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border-b border-border bg-muted/20 flex flex-col gap-3">
      <div className="flex border-b border-border gap-2 pb-2">
        <button
          type="button"
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-colors active:scale-[0.98] ${!urlMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          onClick={() => setUrlMode(false)}
        >
          <Upload size={13} /> Tải lên
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-colors active:scale-[0.98] ${urlMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          onClick={() => setUrlMode(true)}
        >
          <Link size={13} /> Từ URL
        </button>
      </div>

      {!urlMode ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-6 rounded-[6px] border-2 border-dashed transition-colors cursor-pointer text-center ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
        >
          <input {...getInputProps()} />
          {uploading ? <Loader2 size={24} className="animate-spin text-primary" /> : <Upload size={24} className="text-muted-foreground" />}
          <p className="text-xs font-medium text-foreground mt-2">{uploading ? 'Đang upload...' : isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để chọn ảnh'}</p>
          {!folderId && <span className="text-[11px] text-destructive font-medium mt-1">Chọn thư mục trước</span>}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className="h-8 flex-1 rounded-[6px] border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring font-mono"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
          />
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-1 rounded-[6px] bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            onClick={handleUrlUpload}
            disabled={uploading || !url.trim()}
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            Upload
          </button>
        </div>
      )}

      <button
        type="button"
        className="inline-flex h-7 items-center justify-center rounded-[6px] px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent cursor-pointer self-end active:scale-[0.98]"
        onClick={onClose}
      >
        Đóng
      </button>
    </div>
  );
}
