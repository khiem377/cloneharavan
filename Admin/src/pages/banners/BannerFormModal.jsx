import { useState } from 'react';
import { Image, ExternalLink, Loader2, X } from 'lucide-react';
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
      <div className="custom-modal-overlay" onClick={onClose}>
        <div className="custom-modal-box" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
          <div className="custom-modal-header">
            <h3 className="custom-modal-title">{isEdit ? 'Cập nhật banner' : 'Thêm banner mới'}</h3>
            <button className="custom-modal-close" onClick={onClose}><X size={16} /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="custom-modal-body">
              {/* Image Picker */}
              <div className="form-group">
                <label className="form-label">Ảnh banner <span className="req">*</span></label>
                {media ? (
                  <div className="banner-preview-wrap">
                    <img src={media.url} alt="preview" className="banner-preview-img" />
                    <button
                      type="button"
                      className="banner-preview-change"
                      onClick={() => setShowPicker(true)}
                    >
                      Đổi ảnh
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="banner-pick-btn"
                    onClick={() => setShowPicker(true)}
                  >
                    <Image size={20} />
                    <span>Chọn từ thư viện ảnh</span>
                  </button>
                )}
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Tiêu đề</label>
                <input
                  className="field-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Tiêu đề banner (tuỳ chọn)"
                />
              </div>

              {/* Link */}
              <div className="form-group">
                <label className="form-label">Đường dẫn (link)</label>
                <div className="input-with-icon">
                  <ExternalLink size={14} className="input-icon" />
                  <input
                    className="field-input"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="https://example.com (tuỳ chọn)"
                  />
                </div>
              </div>

              {/* Visible Toggle */}
              <div className="form-group form-row">
                <div>
                  <label className="form-label">Hiển thị</label>
                  <p className="form-hint">Banner sẽ hiển thị trên trang chủ storefront</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${isVisible ? 'on' : ''}`}
                  onClick={() => setIsVisible(!isVisible)}
                  aria-checked={isVisible}
                  role="switch"
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            <div className="custom-modal-footer">
              <button type="button" className="btn-ghost-sm" onClick={onClose} disabled={isPending}>Hủy</button>
              <button type="submit" className="btn-primary-sm" disabled={isPending}>
                {isPending ? <Loader2 size={13} className="spin" /> : null}
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
