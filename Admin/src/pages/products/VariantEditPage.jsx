import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, Image, Check, Save } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { useProduct } from '@/hooks/useProducts';
import { useVariant, useUpdateVariant } from '@/hooks/useProductVariants';
import RichTextEditor from '@/components/ui/RichTextEditor';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ─── helpers ─── */
function fmtVND(v) {
  if (!v && v !== 0) return '';
  const n = Number(v);
  return isNaN(n) || n === 0 ? '' : n.toLocaleString('vi-VN');
}
function parseVND(s) {
  if (!s) return null;
  const n = Number(String(s).replace(/\D/g, ''));
  return isNaN(n) || n === 0 ? null : n;
}

/* ─── Price input (same style as ProductFormPage) ─── */
function PriceInput({ value, onChange, placeholder = '0' }) {
  const [display, setDisplay] = useState(() => fmtVND(value));
  useEffect(() => { setDisplay(fmtVND(value)); }, [value]);
  return (
    <div className="relative">
      <input
        type="text"
        className="h-9 w-full rounded-md border border-input bg-background pl-3 pr-10 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
        value={display}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = parseVND(e.target.value);
          setDisplay(raw ? fmtVND(raw) : '');
          onChange(raw);
        }}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₫</span>
    </div>
  );
}

/* ─── Specs editor (same structure as product) ─── */
function SpecsEditor({ specs = [], onChange }) {
  const add = () => onChange([...specs, { group: 'Thông tin chung', key: '', value: '' }]);
  const remove = (i) => onChange(specs.filter((_, idx) => idx !== i));
  const update = (i, field, val) => onChange(specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  return (
    <div className="flex flex-col gap-3">
      {specs.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-32">Nhóm</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Tên thông số</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Giá trị</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {specs.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-2 py-1.5">
                    <input
                      className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-sm outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors text-foreground"
                      value={s.group}
                      onChange={(e) => update(i, 'group', e.target.value)}
                      placeholder="Nhóm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-sm outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors text-foreground"
                      value={s.key}
                      onChange={(e) => update(i, 'key', e.target.value)}
                      placeholder="VD: CPU, RAM, Màu sắc..."
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-sm outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors text-foreground"
                      value={s.value}
                      onChange={(e) => update(i, 'value', e.target.value)}
                      placeholder="Giá trị"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button type="button" onClick={() => remove(i)} className="size-6 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer">
                      <Trash2 size={13} />
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
        onClick={add}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer w-fit"
      >
        <Plus size={14} /> Thêm thông số
      </button>
    </div>
  );
}

/* ─── Image grid (Sortable dnd-kit gallery) ─── */
function SortableImageTile({ id, url, idx, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative size-20 rounded-lg overflow-hidden border border-border group bg-muted select-none cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/40 transition-all"
    >
      <img src={url} alt="" className="size-full object-cover pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
          className="size-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center text-xs hover:scale-105 cursor-pointer font-bold shadow-xs"
          title="Xóa ảnh"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function ImageGrid({ urls = [], ids = [], onAdd, onRemove, onReorder }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const getTileId = (i) => ids[i] || `v-img-${i}`;
      const oldIdx = urls.findIndex((_, i) => getTileId(i) === active.id);
      const newIdx = urls.findIndex((_, i) => getTileId(i) === over.id);

      if (oldIdx !== -1 && newIdx !== -1 && onReorder) {
        onReorder(arrayMove(ids, oldIdx, newIdx), arrayMove(urls, oldIdx, newIdx));
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={urls.map((_, i) => ids[i] || `v-img-${i}`)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => {
            const tileId = ids[i] || `v-img-${i}`;
            return <SortableImageTile key={tileId} id={tileId} url={url} idx={i} onRemove={onRemove} />;
          })}
          <button
            type="button"
            onClick={onAdd}
            className="size-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
          >
            <Plus size={18} />
            <span className="text-[10px] font-medium">Thêm ảnh</span>
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* ─── VariantEditPage ─── */
export default function VariantEditPage() {
  const navigate = useNavigate();
  const { id: productId, variantId } = useParams();

  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const { data: variant, isLoading: loadingVariant, isError: variantError } = useVariant(variantId);
  const updateMut = useUpdateVariant(productId);

  const [pickerMode, setPickerMode] = useState(null);
  const [overrideSpecs, setOverrideSpecs] = useState(false);
  const [saving, setSaving] = useState(false);

  // Derive base form from server data — synchronous via useMemo, no useEffect delay
  const baseForm = useMemo(() => {
    if (!variant) return null;
    return {
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
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?._id]);

  // User edits overlay
  const [userEdits, setUserEdits] = useState({});
  const lastVariantId = useRef(null);
  useEffect(() => {
    if (variant?._id && variant._id !== lastVariantId.current) {
      lastVariantId.current = variant._id;
      setUserEdits({});
      setOverrideSpecs((variant.specifications || []).length > 0);
    }
  }, [variant?._id]);

  const form = baseForm ? { ...baseForm, ...userEdits } : null;
  const set = (patch) => setUserEdits((prev) => ({ ...prev, ...patch }));

  const handleMediaSelected = (media) => {
    if (pickerMode === 'thumbnail') {
      const m = Array.isArray(media) ? media[0] : media;
      if (m) set({ thumbnailMediaId: m._id, thumbnailUrl: m.url });
    } else {
      const list = Array.isArray(media) ? media : [media];
      const ids = [...(form.imageMediaIds || [])], urls = [...(form.imageUrls || [])];
      list.forEach((m) => { if (!ids.includes(m._id)) { ids.push(m._id); urls.push(m.url); } });
      set({ imageMediaIds: ids, imageUrls: urls });
    }
    setPickerMode(null);
  };

  const removeGalleryImage = (idx) => {
    set({
      imageMediaIds: (form.imageMediaIds || []).filter((_, i) => i !== idx),
      imageUrls: (form.imageUrls || []).filter((_, i) => i !== idx),
    });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await updateMut.mutateAsync({
        id: variantId,
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
      toast.success('Đã lưu biến thể thành công');
      navigate(`/products/${productId}/variants`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu biến thể');
    } finally {
      setSaving(false);
    }
  };

  // ── Guard: no variantId
  if (!variantId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-2 text-muted-foreground">
        <span className="text-sm">Không tìm thấy ID biến thể</span>
        <button className="text-xs text-primary underline cursor-pointer" onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  if (loadingVariant && !variant) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Đang tải biến thể...</span>
      </div>
    );
  }

  if (!loadingVariant && !variant) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
        <span className="text-sm">Không tải được biến thể. Hãy kiểm tra lại đường dẫn.</span>
        <button className="text-xs text-primary underline cursor-pointer" onClick={() => navigate(`/products/${productId}/variants`)}>Quay về danh sách biến thể</button>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  const displayName = (variant?.attributes || []).map((a) => a.value).join(' / ') || variant?.sku || 'Biến thể';

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto p-6">
      <div className="sticky -top-3 sm:-top-6 z-30 -mt-3 sm:-mt-6 -mx-3 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/products/${productId}/variants`)}
            className="size-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {loadingProduct
                ? <span className="inline-block w-24 h-3 rounded bg-muted animate-pulse" />
                : product?.name}
              {' '}&rsaquo;{' '}Biến thể
            </p>
            <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Lưu biến thể
        </button>
      </div>

      {/* ── Body: 2-col like ProductFormPage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Inherited from parent */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Kế thừa từ sản phẩm cha</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">Chỉ xem</span>
              {loadingProduct && <Loader2 size={11} className="animate-spin text-muted-foreground ml-1" />}
            </div>
            {loadingProduct ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-20 h-3 rounded bg-muted animate-pulse shrink-0" />
                    <div className="h-3 rounded bg-muted animate-pulse flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Tên SP</span>
                  <span className="text-xs text-foreground font-medium">{product?.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Thương hiệu</span>
                  <span className="text-xs text-foreground font-medium">{product?.brand?.name || '—'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Danh mục</span>
                  <span className="text-xs text-foreground">{(product?.categories || []).map((c) => c.name).join(', ') || '—'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Giá gốc</span>
                  <span className="text-xs text-foreground font-medium">{fmtVND(product?.price)}₫</span>
                </div>
              </div>
            )}
          </div>

          {/* Variant identity */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">Thông tin biến thể</h3>

            {/* Attribute chips */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Thuộc tính</label>
              <div className="flex flex-wrap gap-2">
                {(variant?.attributes || []).map((attr, i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/8 border border-primary/20 px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">{attr.name}:</span>
                    <span className="text-sm font-semibold text-primary">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Name override */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Tên riêng <span className="text-muted-foreground font-normal">(để trống = dùng tên SP cha)</span>
              </label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors placeholder:text-muted-foreground"
                placeholder={product?.name || 'Kế thừa tên sản phẩm cha'}
                value={form.nameOverride}
                onChange={(e) => set({ nameOverride: e.target.value })}
              />
            </div>

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

            {/* Price + Sale */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Giá niêm yết <span className="text-muted-foreground font-normal">(để trống = kế thừa)</span>
                </label>
                <PriceInput
                  value={form.price}
                  onChange={(v) => set({ price: v })}
                  placeholder={product?.price ? `${fmtVND(product.price)} (kế thừa)` : '0'}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Giá khuyến mãi <span className="text-muted-foreground font-normal">(để trống = kế thừa)</span>
                </label>
                <PriceInput
                  value={form.salePrice}
                  onChange={(v) => set({ salePrice: v })}
                  placeholder={product?.salePrice ? `${fmtVND(product.salePrice)} (kế thừa)` : '0'}
                />
              </div>
            </div>

            {/* Stock */}
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
          </div>

          {/* Description override */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Mô tả riêng</h3>
              <span className="text-xs text-muted-foreground">Để trống = kế thừa từ sản phẩm cha</span>
            </div>
            <RichTextEditor
              value={form.descriptionOverride}
              onChange={(v) => set({ descriptionOverride: v })}
            />
          </div>

          {/* Specifications */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Thông số kỹ thuật</h3>
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium cursor-pointer border transition-colors ${
                  overrideSpecs
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
                onClick={() => {
                  if (!overrideSpecs && form.specifications.length === 0 && product?.specifications?.length > 0) {
                    set({ specifications: product.specifications.map((s) => ({ ...s })) });
                  }
                  setOverrideSpecs((v) => !v);
                }}
              >
                {overrideSpecs ? <Check size={11} /> : null}
                {overrideSpecs ? 'Đang dùng thông số riêng' : 'Bật override thông số'}
              </button>
            </div>

            {overrideSpecs ? (
              <SpecsEditor specs={form.specifications} onChange={(specs) => set({ specifications: specs })} />
            ) : (
              <>
                <p className="text-xs text-muted-foreground italic">Đang kế thừa thông số từ sản phẩm cha.</p>
                {product?.specifications?.length > 0 && (
                  <div className="rounded-lg border border-border overflow-hidden opacity-60 pointer-events-none">
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: 1 col */}
        <div className="flex flex-col gap-5">

          {/* Trạng thái */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">Trạng thái</h3>
            <button
              type="button"
              className={`h-9 w-full rounded-lg border text-sm font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                form.isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/15'
                  : 'bg-muted border-border text-muted-foreground hover:bg-accent'
              }`}
              onClick={() => set({ isActive: !form.isActive })}
            >
              <span className={`size-2 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
              {form.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
            </button>
          </div>

          {/* Thumbnail */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">Ảnh đại diện</h3>
            {form.thumbnailUrl ? (
              <div className="relative group w-full aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                <img src={form.thumbnailUrl} alt="thumb" className="size-full object-cover" />
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setPickerMode('thumbnail')}
                >
                  <Image size={16} className="text-white" />
                  <span className="text-white text-xs font-semibold">Thay ảnh</span>
                </div>
              </div>
            ) : (
              <div
                className="w-full aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => setPickerMode('thumbnail')}
              >
                <Image size={28} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Chọn ảnh đại diện</span>
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-2xs flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border">Bộ ảnh biến thể</h3>
            <ImageGrid
              urls={form.imageUrls}
              ids={form.imageMediaIds}
              onAdd={() => setPickerMode('images')}
              onRemove={removeGalleryImage}
              onReorder={(newIds, newUrls) => set({ imageMediaIds: newIds, imageUrls: newUrls })}
            />
          </div>

          {/* Save footer */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu biến thể
          </button>
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
    </div>
  );
}
