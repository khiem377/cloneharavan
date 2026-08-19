import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, RefreshCw, Image, ChevronDown, ChevronUp, Check, X, Loader2, Save, Edit } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import {
  useProductVariants,
  useBulkCreateVariants,
  useUpdateVariant,
  useDeleteVariant,
  useDeleteAllVariants,
} from '@/hooks/useProductVariants';

/* ─── utils ─── */
function cartesian(arrays) {
  if (!arrays.length) return [];
  return arrays.reduce((acc, arr) => acc.flatMap((a) => arr.map((b) => [...a, b])), [[]]);
}

function fmtPrice(val) {
  if (val === '' || val === null || val === undefined) return '';
  const n = Number(String(val).replace(/\D/g, ''));
  return isNaN(n) || n === 0 ? '' : n.toLocaleString('vi-VN');
}

function parsePrice(str) {
  if (!str && str !== 0) return null;
  const n = Number(String(str).replace(/\D/g, ''));
  return isNaN(n) ? null : n || null;
}

/* ─── Tag-style value input ─── */
function TagInput({ values = [], onChange, placeholder = 'Nhập giá trị, Enter để thêm...' }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const val = raw.trim();
    if (!val) return;
    if (values.find((v) => v.value.toLowerCase() === val.toLowerCase())) return;
    onChange([...values, { value: val, colorCode: '' }]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && values.length > 0) onChange(values.slice(0, -1));
  };

  const removeTag = (idx) => onChange(values.filter((_, i) => i !== idx));

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[36px] rounded-md border border-input bg-background px-2 py-1.5 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((v, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs px-2 py-0.5 font-medium">
          {v.value}
          <button type="button" className="hover:text-destructive cursor-pointer leading-none" onClick={(e) => { e.stopPropagation(); removeTag(i); }}>×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
        placeholder={values.length === 0 ? placeholder : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) addTag(input); }}
      />
    </div>
  );
}

/* ─── Option Builder ─── */
function OptionBuilder({ options, onChange, parentSku, onGenerate, hasVariants, isGenerating }) {
  const addOption = () => onChange([...options, { name: '', type: 'text', values: [] }]);
  const removeOption = (i) => onChange(options.filter((_, idx) => idx !== i));
  const updateName = (i, name) => onChange(options.map((o, idx) => idx === i ? { ...o, name } : o));
  const updateValues = (i, values) => onChange(options.map((o, idx) => idx === i ? { ...o, values } : o));

  const validOptions = options.filter((o) => o.name.trim() && o.values.some((v) => v.value.trim()));
  const validValueArrays = validOptions.map((o) => o.values.filter((v) => v.value.trim()));
  const comboCount = validValueArrays.length > 0 ? validValueArrays.reduce((a, b) => a * b.length, 1) : 0;

  return (
    <div className="flex flex-col gap-3">
      {options.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">
          Chưa có thuộc tính nào. Thêm thuộc tính để tạo biến thể (VD: Màu sắc, RAM, Dung lượng, Size, Chất liệu...)
        </p>
      ) : (
        options.map((opt, i) => (
          <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground placeholder:text-muted-foreground"
                placeholder="Tên thuộc tính (VD: Màu sắc / RAM / Size / Dung lượng / Chất liệu...)"
                value={opt.name}
                onChange={(e) => updateName(i, e.target.value)}
              />
              <button
                type="button"
                className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                onClick={() => removeOption(i)}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <TagInput
              values={opt.values}
              onChange={(vals) => updateValues(i, vals)}
              placeholder="Nhập giá trị rồi Enter để thêm (VD: Đỏ, 8GB RAM, Size M, 256GB SSD...)"
            />
            {opt.values.length > 0 && (
              <p className="text-[10px] text-muted-foreground">{opt.values.length} giá trị · Nhấn Enter để thêm, Backspace để xóa cuối</p>
            )}
          </div>
        ))
      )}

      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={addOption}
        >
          <Plus size={14} /> Thêm thuộc tính
        </button>

        {comboCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              → Sẽ tạo <strong className="text-foreground">{comboCount}</strong> biến thể
              {hasVariants && <span className="text-amber-500 ml-1">(đã có biến thể cũ)</span>}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              onClick={() => onGenerate(validOptions, comboCount)}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {hasVariants ? 'Tạo lại biến thể' : 'Tạo biến thể'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Inline price input ─── */
function PriceCell({ value, onChange, placeholder = '' }) {
  const [display, setDisplay] = useState(() => fmtPrice(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => { if (!focused) setDisplay(fmtPrice(value)); }, [value, focused]);

  return (
    <input
      className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-xs text-foreground text-right outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors placeholder:text-muted-foreground/60"
      value={display}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onChange={(e) => { setDisplay(e.target.value); onChange(parsePrice(e.target.value)); }}
      onBlur={() => { setFocused(false); setDisplay(fmtPrice(value)); }}
    />
  );
}

/* ─── Variant Row (always editable inline) ─── */
function VariantRow({ local, onChange, onPickImage, onPickGallery, onRemoveImage, onDelete, onEdit, basePrice, baseSalePrice }) {
  return (
    <tr className={`border-b border-border last:border-0 transition-colors ${local._dirty ? 'bg-amber-500/5 hover:bg-amber-500/8' : 'hover:bg-muted/20'}`}>
      {/* Thumbnail + Gallery */}
      <td className="px-2 py-1.5 w-24">
        <div className="flex flex-col gap-1">
          {/* Main thumbnail */}
          <div
            className="size-10 rounded-md border border-border overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all relative group"
            onClick={() => onPickImage(local._rowId)}
            title="Ảnh đại diện (click để thay)"
          >
            {local.thumbnailUrl ? (
              <img src={local.thumbnailUrl} alt="thumb" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground/50">
                <Image size={14} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Image size={11} className="text-white" />
            </div>
          </div>
          {/* Gallery strip */}
          <div className="flex gap-1 flex-wrap">
            {(local.imageUrls || []).map((url, i) => (
              <div key={i} className="size-5 rounded overflow-hidden border border-border relative group/img bg-muted">
                <img src={url} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  className="absolute inset-0 bg-black/50 text-white text-[8px] opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                  onClick={() => onRemoveImage(local._rowId, i)}
                >×</button>
              </div>
            ))}
            <button
              type="button"
              className="size-5 rounded border border-dashed border-primary/40 text-primary/60 hover:border-primary hover:text-primary flex items-center justify-center cursor-pointer transition-colors"
              onClick={() => onPickGallery(local._rowId)}
              title="Thêm ảnh bộ sưu tập"
            >
              <Plus size={8} />
            </button>
          </div>
        </div>
      </td>

      {/* Attribute chips */}
      <td className="px-2 py-1.5">
        <div className="flex flex-wrap gap-1">
          {(local.attributes || []).map((attr, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[11px] rounded bg-muted border border-border px-1.5 py-0.5">
              <span className="text-muted-foreground">{attr.name}:</span>
              <span className="text-foreground font-medium">{attr.value}</span>
            </span>
          ))}
        </div>
      </td>

      {/* SKU */}
      <td className="px-2 py-1.5 w-32">
        <input
          className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-xs font-mono text-foreground outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors uppercase"
          value={local.sku}
          onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })}
          placeholder="SKU"
        />
      </td>

      {/* Price */}
      <td className="px-1.5 py-1.5 w-28">
        <PriceCell
          value={local.price}
          onChange={(v) => onChange({ price: v })}
          placeholder={fmtPrice(basePrice) || '0'}
        />
      </td>

      {/* Sale price */}
      <td className="px-1.5 py-1.5 w-28">
        <PriceCell
          value={local.salePrice}
          onChange={(v) => onChange({ salePrice: v })}
          placeholder={fmtPrice(baseSalePrice) || '0'}
        />
      </td>

      {/* Stock */}
      <td className="px-1.5 py-1.5 w-20">
        <input
          type="number"
          min="0"
          className="h-7 w-full rounded border border-transparent bg-transparent px-2 text-xs text-foreground text-center outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors"
          value={local.stock ?? 0}
          onChange={(e) => onChange({ stock: Math.max(0, Number(e.target.value)) })}
        />
      </td>

      {/* Active toggle */}
      <td className="px-2 py-1.5 w-14 text-center">
        <button
          type="button"
          className={`inline-flex size-5 items-center justify-center rounded-full border transition-colors cursor-pointer ${local.isActive ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-muted border-border text-muted-foreground'}`}
          onClick={() => onChange({ isActive: !local.isActive })}
          title={local.isActive ? 'Đang hiện — nhấn để ẩn' : 'Đang ẩn — nhấn để hiện'}
        >
          {local.isActive ? <Check size={10} /> : <X size={10} />}
        </button>
      </td>

      {/* Delete */}
      <td className="px-2 py-1.5 w-10 text-center">
        <button
          type="button"
          className="size-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          onClick={() => onDelete(local)}
        >
          <Trash2 size={13} />
        </button>
      </td>
      {/* Edit drawer */}
      <td className="px-1 py-1.5 w-9 text-center">
        <button
          type="button"
          className="size-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          onClick={() => onEdit(local)}
          title="Chỉnh sửa đầy đủ"
        >
          <Edit size={13} />
        </button>
      </td>
    </tr>
  );
}

/* ─── Bulk action bar ─── */
function BulkBar({ onSetAll }) {
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');

  const applyPrice = () => { const v = parsePrice(price); if (v !== null) { onSetAll('price', v); setPrice(''); } };
  const applySale = () => { const v = parsePrice(salePrice); if (v !== null) { onSetAll('salePrice', v); setSalePrice(''); } };
  const applyStock = () => { if (stock !== '') { onSetAll('stock', Number(stock)); setStock(''); } };

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-muted/20 border-b border-border">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Áp dụng cho tất cả:</span>
      <div className="flex items-center gap-1">
        <input className="h-6 w-28 rounded border border-input bg-background px-2 text-xs outline-none focus:border-ring text-foreground placeholder:text-muted-foreground" placeholder="Giá niêm yết" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyPrice()} />
        <button type="button" className="h-6 px-2 rounded bg-muted border border-border text-xs hover:bg-accent cursor-pointer transition-colors font-medium" onClick={applyPrice}>Áp dụng</button>
      </div>
      <div className="flex items-center gap-1">
        <input className="h-6 w-28 rounded border border-input bg-background px-2 text-xs outline-none focus:border-ring text-foreground placeholder:text-muted-foreground" placeholder="Giá khuyến mãi" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applySale()} />
        <button type="button" className="h-6 px-2 rounded bg-muted border border-border text-xs hover:bg-accent cursor-pointer transition-colors font-medium" onClick={applySale}>Áp dụng</button>
      </div>
      <div className="flex items-center gap-1">
        <input type="number" min="0" className="h-6 w-20 rounded border border-input bg-background px-2 text-xs outline-none focus:border-ring text-foreground placeholder:text-muted-foreground" placeholder="Tồn kho" value={stock} onChange={(e) => setStock(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyStock()} />
        <button type="button" className="h-6 px-2 rounded bg-muted border border-border text-xs hover:bg-accent cursor-pointer transition-colors font-medium" onClick={applyStock}>Áp dụng</button>
      </div>
    </div>
  );
}

/* ─── Generate confirm dialog ─── */
function GenerateConfirmDialog({ existingCount, newCount, onReplace, onAppend, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="flex w-full max-w-sm flex-col rounded-xl border border-border bg-background p-5 shadow-2xl text-foreground gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Đã có {existingCount} biến thể</h3>
          <p className="text-sm text-muted-foreground">
            Sản phẩm này đã có {existingCount} biến thể. Bạn muốn làm gì với {newCount} biến thể được tạo mới?
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button className="h-9 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium cursor-pointer hover:bg-destructive/90 transition-colors" onClick={onReplace}>
            Xóa {existingCount} cái cũ → Tạo {newCount} biến thể mới
          </button>
          <button className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors" onClick={onAppend}>
            Giữ cũ + Thêm {newCount} biến thể mới
          </button>
          <button className="h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete confirm dialog ─── */
function DeleteConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="flex w-full max-w-sm flex-col rounded-xl border border-border bg-background p-5 shadow-2xl text-foreground gap-4">
        <h3 className="text-sm font-semibold">Xác nhận xóa</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-2 justify-end">
          <button className="h-8 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent cursor-pointer transition-colors" onClick={onCancel}>Hủy</button>
          <button className="h-8 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium cursor-pointer hover:bg-destructive/90 transition-colors" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
}

/* ─── row ID counter ─── */
let _rid = 0;
const rid = () => `r${++_rid}`;

function serverToLocal(v) {
  return {
    _rowId: rid(),
    _serverId: v._id,
    _dirty: false,
    attributes: v.attributes || [],
    displayName: v.displayName || v.attributes?.map((a) => a.value).join(' / ') || '',
    sku: v.sku || '',
    price: v.price ?? null,
    salePrice: v.salePrice ?? null,
    stock: v.stock ?? 0,
    isActive: v.isActive ?? true,
    thumbnailMediaId: v.thumbnail?.mediaId || null,
    thumbnailUrl: v.thumbnail?.url || '',
    imageMediaIds: (v.images || []).map((img) => img.mediaId).filter(Boolean),
    imageUrls: (v.images || []).map((img) => img.url).filter(Boolean),
  };
}

/* ─── Main ─── */
export default function VariantManager({ productId, product, options = [], onOptionsChange, basePrice = 0, baseSalePrice = 0, parentSku = '' }) {
  const [showOptions, setShowOptions] = useState(true);
  const { data: serverVariants = [], isLoading } = useProductVariants(productId);
  const bulkCreateMut = useBulkCreateVariants(productId);
  const updateMut = useUpdateVariant(productId);
  const deleteMut = useDeleteVariant(productId);
  const deleteAllMut = useDeleteAllVariants(productId);

  const [locals, setLocals] = useState([]);
  const [pickerMode, setPickerMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [generateConfirm, setGenerateConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setLocals(serverVariants.map(serverToLocal));
  }, [serverVariants]);

  const dirtyLocals = locals.filter((l) => l._dirty && l._serverId);

  const updateLocal = (rowId, patch) =>
    setLocals((prev) => prev.map((l) => l._rowId === rowId ? { ...l, ...patch, _dirty: true } : l));

  const setAllField = (field, value) =>
    setLocals((prev) => prev.map((l) => ({ ...l, [field]: value, _dirty: true })));

  /* navigate to variant edit page */
  const handleEdit = (local) => {
    if (local._serverId && productId) {
      navigate(`/products/${productId}/variants/${local._serverId}/edit`);
    }
  };

  /* image pick - supports thumbnail and gallery */
  const handlePickImage = (rowId) => setPickerMode({ rowId, type: 'thumbnail' });
  const handlePickGallery = (rowId) => setPickerMode({ rowId, type: 'images' });

  const handleImageSelected = (media) => {
    if (!pickerMode) return;
    const { rowId, type } = pickerMode;
    if (type === 'thumbnail') {
      const m = Array.isArray(media) ? media[0] : media;
      if (m) updateLocal(rowId, { thumbnailMediaId: m._id, thumbnailUrl: m.url });
    } else {
      const list = Array.isArray(media) ? media : [media];
      setLocals((prev) => prev.map((l) => {
        if (l._rowId !== rowId) return l;
        const ids = [...(l.imageMediaIds || [])], urls = [...(l.imageUrls || [])];
        list.forEach((m) => { if (!ids.includes(m._id)) { ids.push(m._id); urls.push(m.url); } });
        return { ...l, imageMediaIds: ids, imageUrls: urls, _dirty: true };
      }));
    }
    setPickerMode(null);
  };

  const removeGalleryImage = (rowId, idx) => {
    setLocals((prev) => prev.map((l) => l._rowId !== rowId ? l : {
      ...l,
      imageMediaIds: (l.imageMediaIds || []).filter((_, i) => i !== idx),
      imageUrls: (l.imageUrls || []).filter((_, i) => i !== idx),
      _dirty: true,
    }));
  };

  /* generate */
  const handleGenerateRequest = (validOptions, count) => {
    if (serverVariants.length > 0) setGenerateConfirm({ validOptions, count });
    else doGenerate(validOptions, false);
  };

  const doGenerate = (validOptions, deleteFirst) => {
    setGenerateConfirm(null);
    const run = () => {
      const valueArrays = validOptions.map((o) => o.values.filter((v) => v.value.trim()));
      const combos = cartesian(valueArrays);
      const generated = combos.map((combo, idx) => {
        const skuSuffix = combo.map((val) => val.value.replace(/\s+/g, '').slice(0, 5).toUpperCase()).join('-');
        const sku = parentSku ? `${parentSku}-${skuSuffix}` : `VAR-${skuSuffix || idx + 1}`;
        return {
          attributes: combo.map((val, i) => ({ name: validOptions[i].name, value: val.value, colorCode: val.colorCode || '' })),
          sku,
          stock: 0,
          price: null,
          salePrice: null,
          isActive: true,
        };
      });
      bulkCreateMut.mutate(generated, {
        onSuccess: (res) => toast.success(res.data?.message || `Tạo ${generated.length} biến thể thành công`),
        onError: (e) => toast.error(e.response?.data?.message || 'Lỗi tạo biến thể'),
      });
    };

    if (deleteFirst) {
      deleteAllMut.mutate(undefined, { onSuccess: run, onError: () => toast.error('Lỗi xóa biến thể cũ') });
    } else {
      run();
    }
  };

  /* delete single */
  const handleDeleteConfirm = () => {
    if (!deleteTarget || deleteTarget === 'all') return;
    deleteMut.mutate(deleteTarget._serverId, {
      onSuccess: () => { toast.success('Đã xóa biến thể'); setDeleteTarget(null); },
      onError: (e) => { toast.error(e.response?.data?.message || 'Lỗi xóa'); setDeleteTarget(null); },
    });
  };

  /* delete all */
  const handleDeleteAll = () => {
    deleteAllMut.mutate(undefined, {
      onSuccess: () => { toast.success('Đã xóa toàn bộ biến thể'); setDeleteTarget(null); },
      onError: (e) => { toast.error(e.response?.data?.message || 'Lỗi'); setDeleteTarget(null); },
    });
  };

  /* save all dirty */
  const handleSaveAll = async () => {
    if (!dirtyLocals.length) return;
    setIsSaving(true);
    let ok = 0, fail = 0;
    for (const local of dirtyLocals) {
      try {
        await updateMut.mutateAsync({
          id: local._serverId,
          data: {
            sku: local.sku,
            price: local.price,
            salePrice: local.salePrice,
            stock: local.stock,
            isActive: local.isActive,
            thumbnailMediaId: local.thumbnailMediaId || null,
            imageMediaIds: local.imageMediaIds || [],
          },
        });
        ok++;
      } catch { fail++; }
    }
    setIsSaving(false);
    if (ok > 0) toast.success(`Đã lưu ${ok} biến thể`);
    if (fail > 0) toast.error(`${fail} biến thể lỗi khi lưu`);
  };

  if (!productId) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">Lưu sản phẩm trước để quản lý biến thể</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Option Builder ── */}
      <div className="rounded-xl border border-border bg-card shadow-2xs">
        <button
          type="button"
          className="flex items-center justify-between w-full px-5 py-3.5 cursor-pointer"
          onClick={() => setShowOptions((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Thuộc tính biến thể</h4>
            {options.length > 0 && (
              <span className="rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 border border-primary/20">
                {options.length} thuộc tính
              </span>
            )}
          </div>
          {showOptions ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>

        {showOptions && (
          <div className="border-t border-border px-5 py-4">
            <OptionBuilder
              options={options}
              onChange={onOptionsChange}
              parentSku={parentSku}
              onGenerate={handleGenerateRequest}
              hasVariants={serverVariants.length > 0}
              isGenerating={bulkCreateMut.isPending || deleteAllMut.isPending}
            />
          </div>
        )}
      </div>

      {/* ── Variants Table ── */}
      {isLoading ? (
        <div className="flex justify-center py-10 gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Đang tải biến thể...
        </div>
      ) : locals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium text-foreground">Chưa có biến thể nào</p>
          <p className="text-xs text-muted-foreground mt-1">Thêm thuộc tính ở trên và nhấn "Tạo biến thể" để tạo tự động</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">{locals.length} biến thể</span>
              {dirtyLocals.length > 0 && (
                <span className="rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5">
                  {dirtyLocals.length} chưa lưu
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {dirtyLocals.length > 0 && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Lưu {dirtyLocals.length} thay đổi
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-destructive/30 text-destructive text-xs cursor-pointer hover:bg-destructive/10 transition-colors disabled:opacity-50"
                onClick={() => setDeleteTarget('all')}
                disabled={deleteAllMut.isPending}
              >
                {deleteAllMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          <BulkBar onSetAll={setAllField} />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-24">Ảnh / Bộ ảnh</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Biến thể</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-32">SKU</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-28 text-right">Giá niêm yết</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-28 text-right">Giá KM</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-20 text-center">Tồn kho</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-14 text-center">Hiện</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {locals.map((local) => (
                  <VariantRow
                    key={local._rowId}
                    local={local}
                    onChange={(patch) => updateLocal(local._rowId, patch)}
                    onPickImage={handlePickImage}
                    onPickGallery={handlePickGallery}
                    onRemoveImage={removeGalleryImage}
                    onDelete={setDeleteTarget}
                    onEdit={handleEdit}
                    basePrice={basePrice}
                    baseSalePrice={baseSalePrice}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-2 border-t border-border bg-muted/10">
            <p className="text-[10px] text-muted-foreground">
              Click vào ô bất kỳ để chỉnh sửa trực tiếp · Ô giá trống = kế thừa từ sản phẩm gốc · Ô vàng = có thay đổi chưa lưu
            </p>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {pickerMode && (
        <MediaPickerModal
          isMultiple={pickerMode.type === 'images'}
          onSelect={handleImageSelected}
          onClose={() => setPickerMode(null)}
        />
      )}

      {deleteTarget && deleteTarget !== 'all' && (
        <DeleteConfirmDialog
          message={`Xóa biến thể "${deleteTarget.displayName || deleteTarget.sku}"? Không thể hoàn tác.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteTarget === 'all' && (
        <DeleteConfirmDialog
          message={`Xóa toàn bộ ${locals.length} biến thể? Không thể hoàn tác.`}
          onConfirm={handleDeleteAll}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {generateConfirm && (
        <GenerateConfirmDialog
          existingCount={serverVariants.length}
          newCount={generateConfirm.count}
          onReplace={() => doGenerate(generateConfirm.validOptions, true)}
          onAppend={() => doGenerate(generateConfirm.validOptions, false)}
          onCancel={() => setGenerateConfirm(null)}
        />
      )}
    </div>
  );
}
