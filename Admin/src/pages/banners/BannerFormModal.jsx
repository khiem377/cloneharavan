import { useState } from 'react';
import { Image, ExternalLink, Loader2 } from 'lucide-react';
import { useCreateBanner, useUpdateBanner } from '@/hooks/useBanners';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { toast } from '@/providers/ToastProvider';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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

  const handleSubmit = () => {
    if (!media) { toast.error('Vui lòng chọn ảnh banner'); return; }
    const payload = {
      title:     title.trim() || undefined,
      link:      link.trim()  || undefined,
      isVisible,
      mediaId:   media._id,
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
      <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Cập nhật banner' : 'Thêm banner mới'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-1">
            {/* Image picker */}
            <div className="grid gap-1.5">
              <Label>Ảnh banner <span className="text-red-500">*</span></Label>
              {media ? (
                <div className="relative rounded-lg overflow-hidden border">
                  <img src={media.url} alt="preview"
                    className="w-full max-h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-md hover:bg-black/80 transition"
                  >
                    Đổi ảnh
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="flex flex-col items-center gap-2 py-8 rounded-lg border-2 border-dashed text-muted-foreground hover:border-foreground/40 hover:text-foreground transition"
                >
                  <Image size={24} />
                  <span className="text-sm">Chọn từ thư viện ảnh</span>
                </button>
              )}
            </div>

            {/* Title */}
            <div className="grid gap-1.5">
              <Label htmlFor="b-title">Tiêu đề</Label>
              <Input
                id="b-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Tiêu đề banner (tuỳ chọn)"
              />
            </div>

            {/* Link */}
            <div className="grid gap-1.5">
              <Label htmlFor="b-link">Đường dẫn (link)</Label>
              <div className="relative flex items-center">
                <ExternalLink size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
                <Input
                  id="b-link"
                  className="pl-9"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="https://example.com (tuỳ chọn)"
                />
              </div>
            </div>

            {/* Visible toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="b-visible" className="text-sm font-medium cursor-pointer">Hiển thị</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Banner sẽ hiển thị trên trang chủ storefront
                </p>
              </div>
              <Switch
                id="b-visible"
                checked={isVisible}
                onCheckedChange={setIsVisible}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Tạo banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPicker && (
        <MediaPickerModal
          onSelect={(item) => { setMedia(item); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
