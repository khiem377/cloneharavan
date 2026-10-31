import React, { useState } from 'react';
import { X, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { mediaService } from '@/services/media.service';

export default function UploadUrlModal({ isOpen, onClose, onSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let cleanUrl = url.trim();
    if (!cleanUrl) {
      toast.error('Vui lòng nhập đường dẫn ảnh');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // Validate URL format ngay ở Frontend
    try {
      const parsed = new URL(cleanUrl);
      if (!parsed.hostname.includes('.')) {
        toast.error('Đường dẫn không hợp lệ. Ví dụ: https://example.com/anh.jpg');
        return;
      }
    } catch {
      toast.error('Đường dẫn ảnh không đúng định dạng URL');
      return;
    }

    try {
      setLoading(true);
      const res = await mediaService.uploadUrl({
        url: cleanUrl,
        folderId: 'store-logo',
      });

      const media = res.data?.data?.media || res.data?.data || res.data;
      if (!media?.url) {
        throw new Error('Không nhận được dữ liệu ảnh trả về');
      }

      toast.success('Đã tải ảnh từ URL và lưu vào Thư viện Media thành công');
      onSuccess({
        url: media.url,
        logoMediaId: media._id,
      });
      onClose();
      setUrl('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể tải ảnh từ URL';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-[500px] bg-card rounded-[6px] shadow-sm overflow-hidden border border-border animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Thêm ảnh từ URL</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 text-muted-foreground hover:text-foreground rounded-[6px] hover:bg-muted active:scale-[0.98] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY (Dùng div thay cho form để chống reload trang do nested form) */}
        <div>
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
                Đường dẫn ảnh
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  disabled={loading}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full h-9 px-3 text-[13px] rounded-[4px] border border-[#c4cdd5] dark:border-border bg-white dark:bg-background focus:outline-none focus:border-[#0088ff] text-[#212b36] dark:text-foreground placeholder-[#919eab] dark:placeholder-muted-foreground"
                />
                <LinkIcon className="w-3.5 h-3.5 text-[#919eab] dark:text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-[#fafbfb] dark:bg-muted/10 border-t border-[#f4f6f8] dark:border-border">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="h-8 px-4 text-[13px] font-medium border border-[#c4cdd5] dark:border-border bg-white dark:bg-background text-[#212b36] dark:text-foreground hover:bg-[#f4f6f8] dark:hover:bg-accent rounded-[4px] active:scale-[0.98] transition-transform"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={loading || !url.trim()}
              onClick={handleSubmit}
              className="h-8 px-4 text-[13px] font-medium bg-[#0088ff] hover:bg-[#0077e6] text-white rounded-[4px] shadow-xs active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Đang xử lý...' : 'Xác nhận'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
