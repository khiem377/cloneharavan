import { useState, useEffect } from 'react';
import { X, Image, Plus, Trash2, Loader2, Check, Save, ChevronDown, ChevronUp } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { useUpdateVariant } from '@/hooks/useProductVariants';

/* ─── helpers ─── */
function fmtPrice(v) {
  if (!v) return '';
  const n = Number(v);
  return isNaN(n) ? '' : n.toLocaleString('vi-VN');
}
function parsePrice(s) {
  const n = Number(String(s || '').replace(/\D/g, ''));
  return isNaN(n) || n === 0 ? null : n;
}

/* ─── Price input ─── */
function PriceInput({ label, value, onChange, placeholder }) {
  const [raw, setRaw] = useState(() => fmtPrice(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setRaw(fmtPrice(value)); }, [value, focused]);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <div className="relative">
        <input
          className="h-9 w-full rounded-md border border-input bg-background pl-3 pr-10 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
          placeholder={placeholder}
          value={raw}
          onFocus={() => setFocused(true)}
          onChange={(e) => { setRaw(e.target.value); onChange(parsePrice(e.target.value)); }}
          onBlur={() => { setFocused(false); setRaw(fmtPrice(value)); }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₫</span>
      </div>
    </div>
  );
}

/* ─── Specs Editor ─── */
function SpecsEditor({ specs, onChange }) {
  const addRow = () => onChange([...specs, { group: 'Thông tin chung', key: '', value: '' }]);
  const removeRow = (i) => onChange(specs.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => onChange(specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  return (
    <div className="flex flex-col gap-2">
      {specs.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">Chưa có thông số nào. Đang kế thừa từ sản phẩm cha.</p>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-1.5 font-medium text-muted-foreground w-28">Nhóm</th>
                <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Tên</th>
                <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Giá trị</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {specs.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-2 py-1">
                    <input
                      className="h-6 w-full rounded border-transparent bg-transparent px-1 outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors text-foreground text-xs"
                      value={s.group}
                      onChange={(e) => updateRow(i, 'group', e.target.value)}
                      placeholder="Nhóm"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      className="h-6 w-full rounded border-transparent bg-transparent px-1 outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors text-foreground text-xs"
                      value={s.key}
                      onChange={(e) => updateRow(i, 'key', e.target.value)}
                      placeholder="VD: CPU, RAM, Màu sắc..."
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      className="h-6 w-full rounded border-transparent bg-transparent px-1 outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors text-foreground text-xs"
                      value={s.value}
                      onChange={(e) => updateRow(i, 'value', e.target.value)}
                      placeholder="Giá trị"
                    />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <button type="button" className="size-5 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer" onClick={() => removeRow(i)}>
                      <Trash2 size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer w-fit"
        onClick={addRow}
      >
        <Plus size={11} /> Thêm thông số
      </button>
    </div>
  );
}

/* ─── Image thumbnail picker ─── */
function ThumbnailPicker({ url, onPick }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">Ảnh đại diện</label>
      {url ? (
        <div className="relative group w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border border-border bg-muted">
          <img src={url} alt="thumb" className="size-full object-cover" />
          <div
            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={onPick}
          >
            <Image size={14} className="text-white" />
            <span className="text-white text-xs font-medium">Thay ảnh</span>
          </div>
        </div>
      ) : (
        <div
          className="w-full max-w-[200px] aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={onPick}
        >
          <Image size={24} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Chọn ảnh đại diện</span>
        </div>
      )}
    </div>
  );
}

/* ─── Gallery strip ─── */
function GalleryPicker({ urls, ids, onPick, onRemove }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">Bộ ảnh biến thể</label>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <div key={i} className="relative size-16 rounded-md overflow-hidden border border-border group bg-muted">
            <img src={url} alt="" className="size-full object-cover" />
            <button
              type="button"
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => onRemove(i)}
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="size-16 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
          onClick={onPick}
        >
          <Plus size={16} />
          <span className="text-[9px] font-medium">Thêm ảnh</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Collapsible section ─── */
function Section({ title, defaultOpen = true, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">{badge}</span>}
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border px-4 py-4 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

/* ─── Inherited display ─── */
function InheritedRow({ label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-foreground/70 flex-1">{value || '—'}</span>
    </div>
  );
}

/* ─── Main Drawer ─── */
export default function VariantDetailDrawer({ variant, product, onClose }) {
  const updateMut = useUpdateVariant(product?._id);

  const [pickerMode, setPickerMode] = useState(null); // 'thumbnail' | 'images'
  const [saving, setSaving] = useState(false);
  const [overrideSpecs, setOverrideSpecs] = useState(() => (variant.specifications || []).length > 0);

  const [form, setForm] = useState(() => ({
    sku: variant.sku || '',
    price: variant.price ?? null,
    salePrice: variant.salePrice ?? null,
    stock: variant.stock ?? 0,
    isActive: variant.isActive ?? true,
    nameOverride: variant.nameOverride || '',
    descriptionOverride: variant.descriptionOverride || '',
    specifications: variant.specifications || [],
    thumbnailMediaId: variant.thumbnail?.mediaId || null,
    thumbnailUrl: variant.thumbnail?.url || '',
    imageMediaIds: (variant.images || []).map((img) => img.mediaId).filter(Boolean),
    imageUrls: (variant.images || []).map((img) => img.url).filter(Boolean),
  }));

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const displayName = (variant.attributes || []).map((a) => `${a.name}: ${a.value}`).join('  ·  ') || variant.displayName || 'Biến thể';

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMut.mutateAsync({
        id: variant._id,
        data: {
          sku: form.sku,
          price: form.price,
          salePrice: form.salePrice,
          stock: form.stock,
          isActive: form.isActive,
          nameOverride: form.nameOverride || null,
          descriptionOverride: form.descriptionOverride || null,
          specifications: overrideSpecs ? form.specifications : [],
          thumbnailMediaId: form.thumbnailMediaId || null,
          imageMediaIds: form.imageMediaIds || [],
        },
      });
      toast.success('Đã lưu biến thể');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu biến thể');
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelected = (media) => {
    if (pickerMode === 'thumbnail') {
      const m = Array.isArray(media) ? media[0] : media;
      if (m) set({ thumbnailMediaId: m._id, thumbnailUrl: m.url });
    } else {
      const list = Array.isArray(media) ? media : [media];
      const ids = [...form.imageMediaIds], urls = [...form.imageUrls];
      list.forEach((m) => { if (!ids.includes(m._id)) { ids.push(m._id); urls.push(m.url); } });
      set({ imageMediaIds: ids, imageUrls: urls });
    }
    setPickerMode(null);
  };

  const removeGalleryImage = (idx) => {
    set({
      imageMediaIds: form.imageMediaIds.filter((_, i) => i !== idx),
      imageUrls: form.imageUrls.filter((_, i) => i !== idx),
    });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Chỉnh sửa biến thể</span>
            <h2 className="text-sm font-semibold text-foreground truncate max-w-[450px]">{displayName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Lưu biến thể
            </button>
            <button
              type="button"
              className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Inherited from parent */}
          <Section title="Kế thừa từ sản phẩm cha" defaultOpen={true}>
            <InheritedRow label="Tên sản phẩm" value={product?.name} />
            <InheritedRow label="Thương hiệu" value={product?.brand?.name} />
            <InheritedRow label="Danh mục" value={(product?.categories || []).map((c) => c.name).join(', ')} />
            <InheritedRow label="Mô tả" value={product?.description ? 'Có mô tả (kế thừa)' : 'Không có'} />
            <InheritedRow label="Thông số" value={product?.specifications?.length ? `${product.specifications.length} thông số (kế thừa)` : 'Không có'} />
          </Section>

          {/* Variant identity */}
          <Section title="Thuộc tính biến thể" defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {(variant.attributes || []).map((attr, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/8 border border-primary/20 px-3 py-1.5">
                  <span className="text-xs text-muted-foreground font-medium">{attr.name}:</span>
                  <span className="text-sm font-semibold text-primary">{attr.value}</span>
                </div>
              ))}
            </div>

            {/* Name override */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Tên riêng <span className="text-muted-foreground font-normal">(để trống = dùng tên sản phẩm cha)</span>
              </label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors placeholder:text-muted-foreground"
                placeholder={product?.name || 'Tên sản phẩm (kế thừa)'}
                value={form.nameOverride}
                onChange={(e) => set({ nameOverride: e.target.value })}
              />
            </div>
          </Section>

          {/* Core variant fields */}
          <Section title="Thông tin bán hàng" defaultOpen={true}>
            {/* SKU */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Mã SKU <span className="text-destructive">*</span></label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-mono text-foreground uppercase outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                value={form.sku}
                onChange={(e) => set({ sku: e.target.value.toUpperCase() })}
                placeholder="VD: SP001-DO-256GB"
              />
            </div>

            {/* Price row */}
            <div className="grid grid-cols-2 gap-3">
              <PriceInput
                label="Giá niêm yết"
                value={form.price}
                onChange={(v) => set({ price: v })}
                placeholder={product?.price ? `${fmtPrice(product.price)} (kế thừa)` : '0'}
              />
              <PriceInput
                label="Giá khuyến mãi"
                value={form.salePrice}
                onChange={(v) => set({ salePrice: v })}
                placeholder={product?.salePrice ? `${fmtPrice(product.salePrice)} (kế thừa)` : '0'}
              />
            </div>

            {/* Stock + Active */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Tồn kho</label>
                <input
                  type="number"
                  min="0"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                  value={form.stock}
                  onChange={(e) => set({ stock: Math.max(0, Number(e.target.value)) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Trạng thái hiển thị</label>
                <button
                  type="button"
                  className={`h-9 w-full rounded-md border text-sm font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                    form.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                  onClick={() => set({ isActive: !form.isActive })}
                >
                  <span className={`size-2 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                  {form.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                </button>
              </div>
            </div>
          </Section>

          {/* Images */}
          <Section title="Hình ảnh biến thể" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-4">
              <ThumbnailPicker url={form.thumbnailUrl} onPick={() => setPickerMode('thumbnail')} />
              <GalleryPicker
                urls={form.imageUrls}
                ids={form.imageMediaIds}
                onPick={() => setPickerMode('images')}
                onRemove={removeGalleryImage}
              />
            </div>
          </Section>

          {/* Description override */}
          <Section title="Mô tả riêng" defaultOpen={false} badge={form.descriptionOverride ? 'Đã override' : null}>
            <p className="text-xs text-muted-foreground">Để trống = kế thừa mô tả từ sản phẩm cha.</p>
            <textarea
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors resize-y placeholder:text-muted-foreground"
              placeholder="Mô tả riêng cho biến thể này (tuỳ chọn)..."
              value={form.descriptionOverride}
              onChange={(e) => set({ descriptionOverride: e.target.value })}
            />
          </Section>

          {/* Specifications */}
          <Section title="Thông số kỹ thuật" defaultOpen={false} badge={overrideSpecs && form.specifications.length > 0 ? `${form.specifications.length} thông số` : null}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {overrideSpecs ? 'Đang dùng thông số riêng cho biến thể này' : 'Đang kế thừa thông số từ sản phẩm cha'}
              </span>
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium cursor-pointer border transition-colors ${
                  overrideSpecs
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
                onClick={() => {
                  if (!overrideSpecs && form.specifications.length === 0 && product?.specifications?.length > 0) {
                    // Copy from parent as starting point
                    set({ specifications: [...product.specifications] });
                  }
                  setOverrideSpecs((v) => !v);
                }}
              >
                {overrideSpecs ? <Check size={11} /> : null}
                {overrideSpecs ? 'Override đang bật' : 'Bật override'}
              </button>
            </div>

            {overrideSpecs && (
              <SpecsEditor
                specs={form.specifications}
                onChange={(specs) => set({ specifications: specs })}
              />
            )}

            {!overrideSpecs && product?.specifications?.length > 0 && (
              <div className="rounded-md border border-border overflow-hidden opacity-60">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground w-28">Nhóm</th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Tên</th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.specifications.map((s, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-3 py-1.5 text-muted-foreground">{s.group}</td>
                        <td className="px-3 py-1.5 text-foreground/70">{s.key}</td>
                        <td className="px-3 py-1.5 text-foreground/70">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground italic border-t border-border bg-muted/10">
                  Đây là thông số từ sản phẩm cha — bật override để chỉnh riêng cho biến thể
                </div>
              </div>
            )}
          </Section>

        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-border bg-card flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground">Giá để trống = kế thừa từ sản phẩm cha</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="h-8 px-4 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent cursor-pointer transition-colors"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Lưu biến thể
            </button>
          </div>
        </div>
      </div>

      {/* Media picker */}
      {pickerMode && (
        <MediaPickerModal
          isMultiple={pickerMode === 'images'}
          onSelect={handleMediaSelected}
          onClose={() => setPickerMode(null)}
        />
      )}
    </>
  );
}
