import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Image, Link } from 'lucide-react';
import { mediaService } from '@/services/media.service';
import { FOLDERS_KEY } from '@/hooks/useFolders';
import { toast } from '@/providers/ToastProvider';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
    if (!folderId) { toast.error('Vui lòng chọn thư mục trước'); return; }
    const newItems = accepted.map((file) => ({ file, status: 'idle', error: null }));
    setFiles(newItems);
    const doUpload = async () => {
      setIsUploading(true);
      const results = await Promise.allSettled(
        newItems.map(async (item, i) => {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
          const fd = new FormData();
          fd.append('file', item.file);
          fd.append('folderId', folderId);
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
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [errMsg, setErrMsg] = useState('');

  const handleUpload = async () => {
    if (!url.trim()) { toast.error('Nhập URL ảnh'); return; }
    if (!folderId) { toast.error('Vui lòng chọn thư mục'); return; }
    setStatus('uploading');
    try {
      await mediaService.uploadUrl({ url: url.trim(), folderId });
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
      {/* <p className="url-upload-hint">Nhập URL trực tiếp đến file ảnh. Ảnh sẽ được lưu vào Cloudinary.</p> */}
    </div>
  );
}

// ── Main UploadZone ───────────────────────────────────────────────────────────
export default function UploadZone({ folderId, onClose }) {
  const [tab, setTab] = useState('file'); // 'file' | 'url'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Thêm ảnh</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
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
            ? <UploadFileTab folderId={folderId} onClose={onClose} />
            : <UploadUrlTab folderId={folderId} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
