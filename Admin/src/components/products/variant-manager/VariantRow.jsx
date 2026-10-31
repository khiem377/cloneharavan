import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image, Check, X, Edit } from '@/components/ui/Icons';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import { fmtPrice, parsePrice } from './variantManagerUtils';

function PriceCell({ value, onChange, placeholder = '' }) {
  const [display, setDisplay] = useState(() => fmtPrice(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(fmtPrice(value));
  }, [value, focused]);

  return (
    <input
      className="h-7 w-full rounded-[6px] border border-transparent bg-transparent px-2 text-xs text-foreground text-right outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors placeholder:text-muted-foreground/60 tabular-nums font-mono"
      value={display}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        setDisplay(e.target.value);
        onChange(parsePrice(e.target.value));
      }}
      onBlur={() => {
        setFocused(false);
        setDisplay(fmtPrice(value));
      }}
    />
  );
}

export default function VariantRow({
  local,
  mediaObjects = {},
  onChange,
  onPickImage,
  onPickGallery,
  onRemoveImage,
  onDelete,
  onEdit,
  basePrice,
  baseSalePrice,
}) {
  return (
    <tr className={`border-b border-border last:border-0 transition-colors ${local._dirty ? 'bg-amber-500/5 hover:bg-amber-500/8' : 'hover:bg-muted/20'}`}>
      <td className="px-2 py-1.5 w-24">
        <div className="flex flex-col gap-1">
          <MediaThumbnailHover
            media={local.thumbnailMediaId ? mediaObjects[local.thumbnailMediaId] : null}
            className="size-10 rounded-[6px] border border-border overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
          >
            <div
              className="size-10 rounded-[6px] relative group"
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
          </MediaThumbnailHover>
          <div className="flex gap-1 flex-wrap">
            {(local.imageUrls || []).map((url, i) => (
              <div key={i} className="size-5 rounded-[6px] overflow-hidden border border-border relative group/img bg-muted">
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
              className="size-5 rounded-[6px] border border-dashed border-primary/40 text-primary/60 hover:border-primary hover:text-primary flex items-center justify-center cursor-pointer transition-colors"
              onClick={() => onPickGallery(local._rowId)}
              title="Thêm ảnh bộ sưu tập"
            >
              <Plus size={8} />
            </button>
          </div>
        </div>
      </td>

      <td className="px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {local.isDefault && (
            <span className="inline-flex items-center gap-1 text-[11px] rounded-[6px] bg-primary/15 border border-primary/30 text-primary font-bold px-2 py-0.5 shadow-xs">
              Mặc định
            </span>
          )}
          {(local.attributes || []).map((attr, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[11px] rounded-[6px] bg-muted border border-border px-1.5 py-0.5">
              <span className="text-muted-foreground">{attr.name}:</span>
              <span className="text-foreground font-medium">{attr.value}</span>
            </span>
          ))}
        </div>
      </td>

      <td className="px-2 py-1.5 w-32">
        <input
          className="h-7 w-full rounded-[6px] border border-transparent bg-transparent px-2 text-xs font-mono text-foreground outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors uppercase tabular-nums"
          value={local.sku}
          onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })}
          placeholder="SKU"
        />
      </td>

      <td className="px-1.5 py-1.5 w-28">
        <PriceCell
          value={local.price}
          onChange={(v) => onChange({ price: v })}
          placeholder={fmtPrice(basePrice) || '0'}
        />
      </td>

      <td className="px-1.5 py-1.5 w-28">
        <PriceCell
          value={local.salePrice}
          onChange={(v) => onChange({ salePrice: v })}
          placeholder={fmtPrice(baseSalePrice) || '0'}
        />
      </td>

      <td className="px-1.5 py-1.5 w-20">
        <input
          type="number"
          min="0"
          className="h-7 w-full rounded-[6px] border border-transparent bg-transparent px-2 text-xs text-foreground text-center outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors tabular-nums font-mono"
          value={local.stock ?? 0}
          onChange={(e) => onChange({ stock: Math.max(0, Number(e.target.value)) })}
        />
      </td>

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

      <td className="px-2 py-1.5 w-10 text-center">
        <button
          type="button"
          className="size-7 inline-flex items-center justify-center rounded-[6px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          onClick={() => onDelete(local)}
        >
          <Trash2 size={13} />
        </button>
      </td>

      <td className="px-1 py-1.5 w-9 text-center">
        <button
          type="button"
          className="size-7 inline-flex items-center justify-center rounded-[6px] text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          onClick={() => onEdit(local)}
          title="Chỉnh sửa đầy đủ"
        >
          <Edit size={13} />
        </button>
      </td>
    </tr>
  );
}
