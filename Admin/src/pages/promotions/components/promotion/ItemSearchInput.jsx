import React, { useState } from 'react';
import { X } from '@/components/ui/Icons';
import { Input } from '@/components/ui/input';

export default function ItemSearchInput({ items, onAdd, onRemove, placeholder, searchFn, allItems, labelKey = 'name', thumbKey = null }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const results = searchFn
    ? searchFn(search)
    : allItems?.filter((i) => !search || (i[labelKey] || '').toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => {
            const itemObj = allItems?.find((x) => x._id === it.id);
            const displayLabel = (itemObj ? itemObj[labelKey] : null) || (it.label && it.label !== it.id ? it.label : null) || 'Sản phẩm';
            const rawThumb = (itemObj && thumbKey) ? itemObj[thumbKey] : it.thumbnail;
            const thumbSrc = typeof rawThumb === 'string' ? rawThumb : rawThumb?.url;

            return (
              <span key={it.id} className="inline-flex items-center gap-1.5 rounded-[6px] bg-muted border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                {thumbSrc && (
                  <img src={thumbSrc} alt="" className="size-4 rounded-[2px] object-cover shrink-0" />
                )}
                <span className="max-w-[220px] truncate" title={displayLabel}>{displayLabel}</span>
                <button type="button" className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer" onClick={() => onRemove(it.id)}>
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="relative">
        <Input
          className="h-9 w-full rounded-[6px]"
          placeholder={placeholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {open && results.filter((r) => !items.some((it) => it.id === r._id)).length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-[6px] border border-border bg-popover shadow-sm overflow-hidden max-h-48 overflow-y-auto">
            {results.filter((r) => !items.some((it) => it.id === r._id)).map((r) => {
              const rThumb = thumbKey ? (typeof r[thumbKey] === 'string' ? r[thumbKey] : r[thumbKey]?.url) : null;
              return (
                <button
                  key={r._id}
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-foreground hover:bg-muted transition-colors cursor-pointer"
                  onMouseDown={() => {
                    onAdd({ id: r._id, label: r[labelKey], thumbnail: r[thumbKey] });
                    setSearch('');
                    setOpen(false);
                  }}
                >
                  {rThumb ? (
                    <img src={rThumb} alt="" className="size-7 rounded-[4px] object-cover border border-border bg-muted shrink-0" />
                  ) : (
                    <div className="size-7 rounded-[4px] border border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0 font-bold">
                      {(r[labelKey] || 'SP').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-xs font-medium text-foreground">{r[labelKey]}</span>
                    {r.sku && <span className="text-[10px] text-muted-foreground font-mono">SKU: {r.sku}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
