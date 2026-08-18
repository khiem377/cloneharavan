import { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import {
  Upload, X, CheckCircle, AlertCircle, Loader2, Image, Link,
  FolderOpen, Folder, ChevronDown, Check
} from 'lucide-react';
import { mediaService } from '@/services/media.service';
import { useFolders, FOLDERS_KEY } from '@/hooks/useFolders';
import { toast } from '@/providers/ToastProvider';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function flattenFolders(folders, depth = 0) {
  let list = [];
  folders.forEach((f) => {
    list.push({ _id: f._id, name: f.name, depth });
    if (f.children?.length) {
      list = list.concat(flattenFolders(f.children, depth + 1));
    }
  });
  return list;
}

function FolderSelectPopover({ selectedFolderId, onChange, flatFolders }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedFolder = flatFolders.find(f => f._id === selectedFolderId);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground cursor-pointer text-left transition-colors"
      >
        <FolderOpen size={16} className="text-foreground shrink-0" />
        <span className="truncate flex-1">
          {selectedFolder ? selectedFolder.name : 'Chưa chọn thư mục (Tải lên Root)'}
        </span>
        <ChevronDown size={15} className={`text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-xl text-popover-foreground text-xs flex flex-col gap-0.5">
          <button
            type="button"
            className={`flex items-center gap-2 w-full rounded-md px-2.5 py-2 text-left cursor-pointer transition-colors ${!selectedFolderId ? 'bg-accent font-bold text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
            onClick={() => { onChange(''); setOpen(false); }}
          >
            <FolderOpen size={15} className="shrink-0 text-muted-foreground" />
            <span className="truncate flex-1">Chưa chọn thư mục (Tải lên Root)</span>
            {!selectedFolderId && <Check size={14} className="ml-auto text-primary shrink-0" />}
          </button>

          <div className="my-1 h-px bg-border" />

          {flatFolders.map((f) => {
            const isSelected = f._id === selectedFolderId;
            return (
              <button
                key={f._id}
                type="button"
                className={`flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left cursor-pointer transition-colors ${isSelected ? 'bg-accent font-bold text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                onClick={() => { onChange(f._id); setOpen(false); }}
                style={{ paddingLeft: 10 + f.depth * 14 }}
              >
                <Folder size={15} className={`shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="truncate flex-1">{f.name}</span>
                {isSelected && <Check size={14} className="ml-auto text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FileItem({ file, status, error }) {
  const icon = status === 'done' ? <CheckCircle size={15} className="text-emerald-500 shrink-0" />
    : status === 'error' ? <AlertCircle size={15} className="text-destructive shrink-0" />
      : status === 'uploading' ? <Loader2 size={15} className="animate-spin text-primary shrink-0" />
        : <Image size={15} className="text-muted-foreground shrink-0" />;
  return (
    <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs ${status === 'error' ? 'border-destructive/30 bg-destructive/10' : status === 'done' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card'}`}>
      {icon}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-medium text-foreground truncate">{file.name}</span>
        <span className="text-[11px] text-muted-foreground">{error || formatSize(file.size)}</span>
      </div>
    </div>
  );
}

function UploadFileTab({ folderId, onClose }) {
  const qc = useQueryClient();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });
    qc.invalidateQueries({ queryKey: FOLDERS_KEY });
  };

  const onDropSimple = useCallback((accepted) => {
    const newItems = accepted.map((file) => ({ file, status: 'idle', error: null }));
    setFiles(newItems);
    const doUpload = async () => {
      setIsUploading(true);
      const results = await Promise.allSettled(
        newItems.map(async (item, i) => {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
          const fd = new FormData();
          fd.append('file', item.file);
          if (folderId) fd.append('folderId', folderId);
          await mediaService.upload(fd, () => { });
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));
        })
      );
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const msg = r.reason?.response?.data?.message || 'Lỗi';
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: msg } : f));
        }
      });
      invalidate();
      setIsUploading(false);
      const ok = results.filter(r => r.status === 'fulfilled').length;
      if (ok > 0) toast.success(`Đã upload ${ok} ảnh`);
      if (ok === newItems.length) setTimeout(onClose, 800);
    };
    doUpload();
  }, [folderId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropSimple,
    accept: { 'image/*': [] },
    multiple: true,
    disabled: isUploading,
  });

  const totalDone = files.filter(f => f.status === 'done').length;
  const totalErr = files.filter(f => f.status === 'error').length;

  return (
    <>
      {files.length === 0 ? (
        <div {...getRootProps()} className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-colors cursor-pointer text-center m-4 ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/20 hover:border-primary/50'}`}>
          <input {...getInputProps()} />
          <Upload size={28} className="text-muted-foreground mb-2" />
          <p className="text-sm font-semibold text-foreground">{isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh vào đây'}</p>
          <span className="text-xs text-muted-foreground mt-1">hoặc click để chọn • PNG, JPG, WebP, GIF • tối đa 5MB</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 max-h-64 overflow-y-auto">
          {files.map((item, i) => <FileItem key={i} {...item} />)}
        </div>
      )}
      {files.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
          <span className="text-xs font-medium text-foreground">
            {isUploading ? 'Đang upload...' : `${totalDone} thành công${totalErr > 0 ? `, ${totalErr} lỗi` : ''}`}
          </span>
          {!isUploading && (
            <div className="flex items-center gap-2">
              <button className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={() => setFiles([])}>Thêm file</button>
              <button className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onClose}>Đóng</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function UploadUrlTab({ folderId, onClose }) {
  const qc = useQueryClient();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleUpload = async () => {
    if (!url.trim()) { toast.error('Nhập URL ảnh'); return; }
    setStatus('uploading');
    try {
      await mediaService.uploadUrl({ url: url.trim(), folderId: folderId || undefined });
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });
      qc.invalidateQueries({ queryKey: FOLDERS_KEY });
      setStatus('done');
      toast.success('Upload từ URL thành công!');
      setTimeout(onClose, 700);
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Upload thất bại');
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-3 p-5">
      <p className="text-xs font-medium text-foreground">URL ảnh</p>
      <div className="flex gap-2">
        <input
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setStatus('idle'); }}
          placeholder="https://example.com/image.jpg"
          onKeyDown={(e) => e.key === 'Enter' && handleUpload()}
          disabled={status === 'uploading'}
        />
        <button
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
          onClick={handleUpload}
          disabled={status === 'uploading' || !url.trim()}
        >
          {status === 'uploading' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-destructive">{errMsg}</p>}
      {status === 'done' && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Upload thành công!</p>}
    </div>
  );
}

export default function UploadZone({ folderId: initialFolderId, onClose }) {
  const [tab, setTab] = useState('file');
  const [selectedFolderId, setSelectedFolderId] = useState(initialFolderId || '');
  const { data: rawFolders = [] } = useFolders();

  const flatFolders = flattenFolders(rawFolders);

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl text-foreground" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4 font-semibold text-foreground">
          <h3 className="text-base font-semibold text-foreground">Thêm ảnh</h3>
          <button className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="px-5 pt-3">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <span>Thư mục lưu ảnh:</span>
          </label>
          <FolderSelectPopover
            selectedFolderId={selectedFolderId}
            onChange={setSelectedFolderId}
            flatFolders={flatFolders}
          />
        </div>

        <div className="flex border-b border-border mt-3 px-5">
          <button
            className={`inline-flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer mr-4 ${tab === 'file' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setTab('file')}
          >
            <Upload size={14} /> Tải lên
          </button>
          <button
            className={`inline-flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${tab === 'url' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setTab('url')}
          >
            <Link size={14} /> Từ URL
          </button>
        </div>

        <div className="flex flex-col">
          {tab === 'file'
            ? <UploadFileTab folderId={selectedFolderId} onClose={onClose} />
            : <UploadUrlTab folderId={selectedFolderId} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
