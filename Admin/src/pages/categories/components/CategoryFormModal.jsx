import { useState } from 'react';
import { X, Image, Loader2 } from '@/components/ui/Icons';
import SearchableSelect from '@/components/ui/SearchableSelect';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { Button } from '@/components/ui/button';

export default function CategoryFormModal({
  form,
  setForm,
  editTarget,
  flatCats = [],
  brands = [],
  onSubmit,
  onClose,
  isMutating,
}) {
  const [mediaPickerFor, setMediaPickerFor] = useState(null);

  const handleMediaPick = (media) => {
    if (mediaPickerFor === 'image') {
      setForm((f) => ({ ...f, imageMediaId: media._id, imageUrl: media.url }));
    } else if (mediaPickerFor === 'icon') {
      setForm((f) => ({ ...f, iconMediaId: media._id, iconUrl: media.url }));
    }
    setMediaPickerFor(null);
  };

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
              {editTarget ? 'Sửa danh mục' : 'Tạo danh mục'}
            </h2>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[75vh]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tên danh mục <span className="text-destructive ml-0.5">*</span>
              </label>
              <input
                className="h-9 w-full rounded-[6px] border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nhập tên danh mục"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Danh mục cha</label>
              <SearchableSelect
                options={[
                  { label: '-- Không có (danh mục gốc) --', value: '' },
                  ...flatCats
                    .filter((c) => c._id !== editTarget?._id)
                    .map((c) => ({ label: c.name, value: c._id })),
                ]}
                value={form.parentId}
                onChange={(val) => setForm((f) => ({ ...f, parentId: val }))}
                creatable={false}
                placeholder="-- Không có (danh mục gốc) --"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Liên kết Brand</label>
                <SearchableSelect
                  options={[
                    { label: '-- Không liên kết --', value: '' },
                    ...brands.map((b) => ({ label: b.name, value: b._id })),
                  ]}
                  value={form.brandId}
                  onChange={(val) => setForm((f) => ({ ...f, brandId: val }))}
                  creatable={false}
                  placeholder="-- Không liên kết --"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Link tùy chỉnh</label>
                <input
                  className="h-9 w-full rounded-[6px] border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="/tivi-tra-gop hoặc https://..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Mô tả</label>
              <textarea
                className="w-full rounded-[6px] border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors resize-none"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả danh mục..."
              />
            </div>

            {/* Media selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Ảnh đại diện</label>
                {form.imageUrl ? (
                  <div className="relative rounded-[6px] border border-border overflow-hidden group">
                    <img src={form.imageUrl} alt="img" className="h-20 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaPickerFor('image')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity font-medium"
                    >
                      Đổi ảnh
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMediaPickerFor('image')}
                    className="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-[6px] border border-dashed border-border bg-muted/40 hover:bg-muted text-xs text-muted-foreground transition-colors"
                  >
                    <Image className="size-4" />
                    <span>Chọn ảnh</span>
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Icon biểu tượng</label>
                {form.iconUrl ? (
                  <div className="relative rounded-[6px] border border-border overflow-hidden group">
                    <img src={form.iconUrl} alt="icon" className="h-20 w-full object-contain p-2 bg-muted/30" />
                    <button
                      type="button"
                      onClick={() => setMediaPickerFor('icon')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity font-medium"
                    >
                      Đổi icon
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMediaPickerFor('icon')}
                    className="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-[6px] border border-dashed border-border bg-muted/40 hover:bg-muted text-xs text-muted-foreground transition-colors"
                  >
                    <Image className="size-4" />
                    <span>Chọn icon</span>
                  </button>
                )}
              </div>
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

              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    checked={form.showOnMenu}
                    onChange={(e) => setForm((f) => ({ ...f, showOnMenu: e.target.checked }))}
                  />
                  <span>Hiện menu</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <span>Kích hoạt</span>
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

      {mediaPickerFor && (
        <MediaPickerModal
          onSelect={handleMediaPick}
          onClose={() => setMediaPickerFor(null)}
        />
      )}
    </>
  );
}
