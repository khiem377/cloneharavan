import { useState } from 'react';
import { Image, Loader2, X } from '@/components/ui/Icons';
import { useCreateBanner, useUpdateBanner } from '@/hooks/useBanners';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { toast } from '@/providers/ToastProvider';

export default function BannerFormModal({ banner, onClose }) {
  const isEdit = !!banner;

  const [title,      setTitle]      = useState(banner?.title     ?? '');
  const [link,       setLink]       = useState(banner?.link      ?? '');
  const [isVisible,  setIsVisible]  = useState(banner?.isVisible ?? true);
  const [media,      setMedia]      = useState(
    banner ? { url: banner.imageUrl, _id: banner.mediaId } : null
  );
  const [showPicker, setShowPicker] = useState(false);

  const { mutate: createBanner, isPending: creating } = useCreateBanner();
  const { mutate: updateBanner, isPending: updating  } = useUpdateBanner();
  const isPending = creating || updating;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!media) { toast.error('Vui lòng chọn ảnh banner'); return; }
    const payload = {
      title:    title.trim() || undefined,
      link:     link.trim()  || undefined,
      isVisible,
      mediaId:  media._id,
    };

    if (isEdit) {
      updateBanner({ id: banner._id, data: payload }, {
        onSuccess: () => { toast.success('Cập nhật banner thành công'); onClose(); },
        onError:   (err) => toast.error(err.response?.data?.message || 'Lỗi cập nhật'),
      });
    } else {
      createBanner(payload, {
        onSuccess: () => { toast.success('Tạo banner thành công'); onClose(); },
        onError:   (err) => toast.error(err.response?.data?.message || 'Lỗi tạo banner'),
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
          className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">
              {isEdit ? 'Cập nhật banner' : 'Thêm banner mới'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-5">
              {/* Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Ảnh banner <span className="text-destructive">*</span>
                </label>
                {media ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={media.url}
                      alt="preview"
                      className="w-full h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPicker(true)}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium rounded-md backdrop-blur-sm transition-colors"
                    >
                      Đổi ảnh
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Image className="size-6" />
                    <span className="text-sm">Chọn từ thư viện ảnh</span>
                  </button>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Tiêu đề</label>
                <input
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors placeholder:text-muted-foreground"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Tiêu đề banner (tuỳ chọn)"
                />
              </div>

              {/* Link */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Đường dẫn (link)</label>
                <input
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors placeholder:text-muted-foreground"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="https://example.com hoặc /san-pham"
                />
              </div>

              {/* Visible toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-foreground">Hiển thị</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Banner hiển thị trên trang chủ storefront</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  onClick={() => setIsVisible(!isVisible)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${isVisible ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${isVisible ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
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
