import React, { useState } from 'react';
import { Upload, Trash2, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { mediaService } from '@/services/media.service';
import UploadUrlModal from './UploadUrlModal';

export default function LogoUploadSection({ logo, logoMediaId, onChange }) {
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Xử lý upload trực tiếp file ảnh từ thiết bị
  const handleUploadFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 2MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', 'store-logo');

      const res = await mediaService.upload(formData);
      const mediaItem = res.data?.data?.media || res.data?.data || res.data;

      if (mediaItem?.url) {
        onChange({ logo: mediaItem.url, logoMediaId: mediaItem._id });
        toast.success('Đã tải lên logo và lưu vào Thư viện Media');
      }
    } catch (err) {
      toast.error('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  };

  const handleRemove = () => {
    onChange({ logo: '', logoMediaId: null });
    toast.info('Đã xóa logo cửa hàng');
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground">Logo</label>

      {logo ? (
        /* KHI ĐÃ CÓ LOGO (SAPO STYLE 100%) */
        <div className="flex items-center gap-4 p-3.5 border border-[#dfe3e8] dark:border-border rounded-[6px] bg-[#fafbfb] dark:bg-muted/30">
          <div className="w-24 h-16 bg-white dark:bg-background border border-[#dfe3e8] dark:border-border rounded-[4px] p-1 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={logo}
              alt="Logo cửa hàng"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#212b36] dark:text-foreground">
                Logo cửa hàng hiện tại
              </span>
              <span className="text-[10px] font-semibold bg-[#e8f2fe] dark:bg-blue-950/60 text-[#0088ff] dark:text-blue-400 px-1.5 py-0.5 rounded-[3px]">
                ĐÃ LƯU MEDIA
              </span>
            </div>

            <div className="flex items-center gap-3 text-[12px]">
              <label className="text-[#0088ff] hover:underline font-medium cursor-pointer inline-flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Đổi ảnh từ máy</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </label>
              <span className="text-[#c4cdd5] dark:text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() => setShowUrlModal(true)}
                className="text-[#0088ff] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>Đổi ảnh từ URL</span>
              </button>
              <span className="text-[#c4cdd5] dark:text-muted-foreground">•</span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-[#e3001b] dark:text-rose-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa logo</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* KHI CHƯA CÓ LOGO (KHUNG VIỀN ĐỨT NÉT SAPO 100% - KÉO THẢ HOẶC CHỌN 1 TRONG 2 CÁCH) */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-[6px] p-6 text-center transition-colors ${
            isDragOver
              ? 'border-[#0088ff] bg-[#f0f7ff] dark:bg-blue-950/20'
              : 'border-[#c4cdd5] dark:border-border hover:border-[#0088ff] bg-[#fafbfb] dark:bg-muted/10 hover:bg-white dark:hover:bg-muted/20'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5">
            {uploading ? (
              <div className="flex items-center gap-2 text-[13px] text-[#0088ff] py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang tải ảnh lên Thư viện Media...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 text-[13px] text-[#637381] dark:text-muted-foreground">
                  <span className="text-base text-[#0088ff] font-bold">+</span>
                  <span>Kéo thả hoặc</span>
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(true)}
                    className="text-[#0088ff] font-medium hover:underline cursor-pointer"
                  >
                    thêm ảnh từ URL
                  </button>
                </div>

                <div className="pt-0.5">
                  <label className="text-[#0088ff] font-medium hover:underline cursor-pointer inline-flex items-center gap-1 text-[13px]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh lên từ thiết bị</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                  </label>
                </div>

                <span className="text-[11px] text-[#919eab] dark:text-muted-foreground pt-0.5">
                  (Dung lượng ảnh tối đa 2MB)
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* POPUP MODAL THÊM ẢNH TỪ URL (SAPO ẢNH 5) */}
      <UploadUrlModal
        isOpen={showUrlModal}
        onClose={() => setShowUrlModal(false)}
        onSuccess={({ url: newUrl, logoMediaId: newMediaId }) => {
          onChange({ logo: newUrl, logoMediaId: newMediaId });
        }}
      />
    </div>
  );
}

