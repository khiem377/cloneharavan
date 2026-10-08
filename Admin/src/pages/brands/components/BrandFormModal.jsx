import { useState } from 'react';
import { X, Image, Loader2 } from '@/components/ui/Icons';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { Button } from '@/components/ui/button';

export default function BrandFormModal({
  form,
  setForm,
  editTarget,
  onSubmit,
  onClose,
  isMutating,
}) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="flex w-full max-w-lg flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-lg text-card-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4 font-semibold">
            <h2 className="text-base font-semibold text-foreground">
              {editTarget ? 'Sửa thương hiệu' : 'Tạo thương hiệu'}
            </h2>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[75vh]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tên thương hiệu <span className="text-destructive ml-0.5">*</span>
              </label>
              <input
                className="h-9 w-full rounded-[6px] border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nhập tên thương hiệu (vd: Samsung, Sony...)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Website</label>
              <input
                className="h-9 w-full rounded-[6px] border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Mô tả</label>
              <textarea
                className="w-full rounded-[6px] border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả về thương hiệu..."
              />
            </div>

            {/* Logo media */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Logo thương hiệu</label>
              {form.logoUrl ? (
                <div className="relative rounded-[6px] border border-border overflow-hidden group w-32 h-20 bg-white p-1">
                  <img src={form.logoUrl} alt="logo" className="h-full w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity font-medium"
                  >
                    Đổi logo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="flex h-20 w-32 flex-col items-center justify-center gap-1 rounded-[6px] border border-dashed border-border bg-muted/40 hover:bg-muted text-xs text-muted-foreground transition-colors"
                >
                  <Image className="size-4" />
                  <span>Chọn logo</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Thứ tự ưu tiên</label>
                <input
                  type="number"
                  className="h-9 w-full rounded-[6px] border border-border bg-background px-3 text-xs text-foreground font-mono outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <span>Kích hoạt hiển thị</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 rounded-[6px] text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={onSubmit}
              disabled={isMutating}
              className="h-8 rounded-[6px] text-xs gap-1.5 font-semibold active:scale-[0.98]"
            >
              {isMutating && <Loader2 className="size-3.5 animate-spin" />}
              {editTarget ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </div>
      </div>

      {showMediaPicker && (
        <MediaPickerModal
          onSelect={(media) => {
            setForm((f) => ({ ...f, logoMediaId: media._id, logoUrl: media.url }));
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </>
  );
}
