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

// ── Custom Folder Select Dropdown ──────────────────────────────────────────────
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
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="field-input"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontWeight: 600, color: '#0f172a', background: '#ffffff',
          cursor: 'pointer', textAlign: 'left', width: '100%',
          borderColor: open ? '#0f172a' : 'var(--border)'
        }}
      >
        <FolderOpen size={16} style={{ color: '#0f172a', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selectedFolder ? selectedFolder.name : 'Chưa chọn thư mục (Tải lên Root)'}
        </span>
        <ChevronDown size={15} style={{ color: '#94a3b8', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.12)', padding: 4, zIndex: 50,
          maxHeight: 220, overflowY: 'auto'
        }}>
          {/* Root option */}
          <button
            type="button"
            className="dropdown-item-btn"
            onClick={() => { onChange(''); setOpen(false); }}
            style={{ fontWeight: !selectedFolderId ? 700 : 500, background: !selectedFolderId ? '#f1f5f9' : 'transparent' }}
          >
            <FolderOpen size={15} style={{ color: '#64748b', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Chưa chọn thư mục (Tải lên Root)
            </span>
            {!selectedFolderId && <Check size={14} style={{ marginLeft: 'auto', color: '#0f172a', flexShrink: 0 }} />}
          </button>

          <div className="ctx-divider" style={{ margin: '4px 0' }} />

          {/* Folder items */}
          {flatFolders.map((f) => {
            const isSelected = f._id === selectedFolderId;
            return (
              <button
                key={f._id}
                type="button"
                className="dropdown-item-btn"
                onClick={() => { onChange(f._id); setOpen(false); }}
                style={{
                  paddingLeft: 8 + f.depth * 14,
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? '#f1f5f9' : 'transparent'
                }}
              >
                <Folder size={15} style={{ color: isSelected ? '#0f172a' : '#64748b', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                {isSelected && <Check size={14} style={{ marginLeft: 'auto', color: '#0f172a', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FileItem({ file, status, error }) {
  const icon = status === 'done' ? <CheckCircle size={15} style={{ color: '#22c55e' }} />
    : status === 'error' ? <AlertCircle size={15} style={{ color: '#ef4444' }} />
      : status === 'uploading' ? <Loader2 size={15} className="spin" style={{ color: '#2563eb' }} />
        : <Image size={15} style={{ color: '#9ca3af' }} />;
  return (
    <div className={`upload-file-item upload-${status}`}>
      {icon}
      <div className="upload-file-info">
        <span className="upload-file-name">{file.name}</span>
        <span className="upload-file-size">{error || formatSize(file.size)}</span>
      </div>
    </div>
  );
}

// ── Tab: Upload file ──────────────────────────────────────────────────────────
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
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <Upload size={28} className="upload-icon" />
          <p className="dropzone-text">{isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh vào đây'}</p>
          <span className="dropzone-hint">hoặc click để chọn • PNG, JPG, WebP, GIF • tối đa 5MB</span>
        </div>
      ) : (
        <div className="upload-file-list">
          {files.map((item, i) => <FileItem key={i} {...item} />)}
        </div>
      )}
      {files.length > 0 && (
        <div className="upload-footer">
          <span className="upload-summary">
            {isUploading ? 'Đang upload...' : `${totalDone} thành công${totalErr > 0 ? `, ${totalErr} lỗi` : ''}`}
          </span>
          {!isUploading && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost-sm" onClick={() => setFiles([])}>Thêm file</button>
              <button className="btn-ghost-sm" onClick={onClose}>Đóng</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── Tab: Upload từ URL ────────────────────────────────────────────────────────
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
    <div className="url-upload-panel">
      <p className="url-upload-label">URL ảnh</p>
      <div className="url-upload-row">
        <input
          className="field-input"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setStatus('idle'); }}
          placeholder="https://example.com/image.jpg"
          onKeyDown={(e) => e.key === 'Enter' && handleUpload()}
          disabled={status === 'uploading'}
        />
        <button
          className="btn-primary-sm"
          onClick={handleUpload}
          disabled={status === 'uploading' || !url.trim()}
        >
          {status === 'uploading' ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
          Upload
        </button>
      </div>
      {status === 'error' && <p className="url-upload-err">{errMsg}</p>}
      {status === 'done' && <p className="url-upload-ok">✓ Upload thành công!</p>}
    </div>
  );
}

// ── Main UploadZone ───────────────────────────────────────────────────────────
export default function UploadZone({ folderId: initialFolderId, onClose }) {
  const [tab, setTab] = useState('file');
  const [selectedFolderId, setSelectedFolderId] = useState(initialFolderId || '');
  const { data: rawFolders = [] } = useFolders();

  const flatFolders = flattenFolders(rawFolders);

  return (
    <div className="modal-overlay" style={{ zIndex: 10050 }} onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Thêm ảnh</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Custom Folder Select Popover */}
        <div style={{ padding: '14px 20px 4px 20px' }}>
          <label className="form-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
            <span>Thư mục lưu ảnh:</span>
          </label>
          <FolderSelectPopover
            selectedFolderId={selectedFolderId}
            onChange={setSelectedFolderId}
            flatFolders={flatFolders}
          />
        </div>

        {/* Tabs */}
        <div className="upload-tabs">
          <button
            className={`upload-tab ${tab === 'file' ? 'active' : ''}`}
            onClick={() => setTab('file')}
          >
            <Upload size={14} /> Tải lên
          </button>
          <button
            className={`upload-tab ${tab === 'url' ? 'active' : ''}`}
            onClick={() => setTab('url')}
          >
            <Link size={14} /> Từ URL
          </button>
        </div>

        {/* Tab content */}
        <div className="upload-body">
          {tab === 'file'
            ? <UploadFileTab folderId={selectedFolderId} onClose={onClose} />
            : <UploadUrlTab folderId={selectedFolderId} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
