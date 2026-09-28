import { useState } from 'react';
import { Image, Loader2, X, Calendar } from '@/components/ui/Icons';
import { useCreateBanner, useUpdateBanner } from '@/hooks/useBanners';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import { toast } from '@/providers/ToastProvider';
import { BANNER_TYPE_LABELS } from '@/services/banner.service';

const inputCls = 'w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors placeholder:text-muted-foreground';
const labelCls = 'block text-sm font-medium text-foreground mb-1.5';

// Chuyển Date → "YYYY-MM-DDTHH:mm" cho input[type=datetime-local]
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function BannerFormModal({ banner, onClose }) {
  const isEdit = !!banner;

  const [title, setTitle] = useState(banner?.title ?? '');
  const [altText, setAltText] = useState(banner?.altText ?? '');
  const [link, setLink] = useState(banner?.link ?? '');
  const [type, setType] = useState(banner?.type ?? 'hero');
  const [isVisible, setIsVisible] = useState(banner?.isVisible ?? true);
  const [startAt, setStartAt] = useState(toLocalInput(banner?.startAt));
  const [endAt, setEndAt] = useState(toLocalInput(banner?.endAt));
  const [media, setMedia] = useState(
    banner ? { url: banner.imageUrl, _id: banner.mediaId } : null
  );
  const [showPicker, setShowPicker] = useState(false);

  const { mutate: createBanner, isPending: creating } = useCreateBanner();
  const { mutate: updateBanner, isPending: updating } = useUpdateBanner();
  const isPending = creating || updating;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!media) { toast.error('Vui lòng chọn ảnh banner'); return; }

    // Validate lịch
    if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    const payload = {
      title: title.trim() || undefined,
      altText: altText.trim() || undefined,
      link: link.trim() || undefined,
      type,
      isVisible,
      mediaId: media._id,
      startAt: startAt ? new Date(startAt).toISOString() : null,
      endAt: endAt ? new Date(endAt).toISOString() : null,
    };

    if (isEdit) {
      updateBanner({ id: banner._id, data: payload }, {
        onSuccess: () => { toast.success('Cập nhật banner thành công'); onClose(); },
        onError: (err) => toast.error(err.response?.data?.message || 'Lỗi cập nhật'),
      });
    } else {
      createBanner(payload, {
        onSuccess: () => { toast.success('Tạo banner thành công'); onClose(); },
        onError: (err) => toast.error(err.response?.data?.message || 'Lỗi tạo banner'),
      });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h3 className="text-base font-semibold text-foreground">
              {isEdit ? 'Cập nhật banner' : 'Thêm banner mới'}
            </h3>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

              {/* Image picker */}
              <div>
                <label className={labelCls}>Ảnh banner <span className="text-destructive">*</span></label>
                {media ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <MediaThumbnailHover media={media}>
                      <img src={media.url} alt="preview" className="w-full h-40 object-cover" />
                    </MediaThumbnailHover>
                    <button
                      type="button"
                      onClick={() => setShowPicker(true)}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium rounded-md backdrop-blur-sm transition-colors"
                    >
                      Thay đổi ảnh
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="w-full h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Image className="size-6" />
                    <span className="text-sm">Chọn từ thư viện ảnh</span>
                  </button>
                )}
              </div>

              {/* Title + Type (2 cols) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tiêu đề</label>
                  <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên banner (tuỳ chọn)" />
                </div>
                <div>
                  <label className={labelCls}>Loại / Vị trí</label>
                  <select
                    className={`${inputCls} cursor-pointer`}
                    value={type}
                    onChange={e => setType(e.target.value)}
                  >
                    {Object.entries(BANNER_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alt text */}
              <div>
                <label className={labelCls}>Alt text <span className="text-muted-foreground font-normal text-xs">(SEO — tuỳ chọn)</span></label>
                <input className={inputCls} value={altText} onChange={e => setAltText(e.target.value)} placeholder="Mô tả ảnh cho SEO" />
              </div>

              {/* Link */}
              <div>
                <label className={labelCls}>Đường dẫn (link)</label>
                <input className={inputCls} value={link} onChange={e => setLink(e.target.value)} placeholder="https://... hoặc /danh-muc/..." />
              </div>

              {/* Schedule: startAt + endAt */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  Lên lịch hiển thị <span className="text-muted-foreground font-normal text-xs">(để trống = không giới hạn)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Bắt đầu</label>
                    <DateTimePicker
                      value={startAt}
                      onChange={(val) => setStartAt(val)}
                      placeholder="Thời gian bắt đầu..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Kết thúc</label>
                    <DateTimePicker
                      value={endAt}
                      onChange={(val) => setEndAt(val)}
                      placeholder="Thời gian kết thúc..."
                      align="right"
                    />
                  </div>
                </div>
                {startAt && endAt && (
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Hien thi {new Date(startAt).toLocaleString('vi-VN')} → {new Date(endAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>

              {/* Visible toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-foreground">Hiển thị ngay</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {startAt ? 'Sẽ tự bật theo lịch đã đặt' : 'Banner hiển thị trên trang chủ storefront'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  onClick={() => setIsVisible(!isVisible)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${isVisible ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? 'Cập nhật' : 'Tạo banner'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPicker && (
        <MediaPickerModal
          onSelect={(item) => { setMedia(item); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
