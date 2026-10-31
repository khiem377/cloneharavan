import { useState } from 'react';
import { X } from '@/components/ui/Icons';
import { Input } from '@/components/ui/input';

export default function GiftProductList({ selected, onAdd, onRemove, onQtyChange, allProducts }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const results = allProducts?.filter((p) => !search || (p.name || '').toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-col gap-2">
          {selected.map((g) => {
            const prod = allProducts?.find((p) => p._id === g.productId);
            const displayName = g.name && g.name !== 'Sản phẩm' && g.name !== g.productId ? g.name : (prod?.name || 'Sản phẩm');
            const rawThumb = prod?.thumbnail || g.thumbnail;
            const thumbSrc = typeof rawThumb === 'string' ? rawThumb : rawThumb?.url;

            return (
              <div key={g.productId} className="flex items-center gap-3 rounded-[6px] border border-border bg-background px-3 py-2">
                {thumbSrc ? (
                  <img src={thumbSrc} alt="" className="size-8 rounded-[4px] object-cover border border-border bg-muted shrink-0" />
                ) : (
                  <div className="size-8 rounded-[4px] border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0 font-bold">
                    {(displayName || 'SP').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground truncate">{displayName}</span>
                  {prod?.sku && <span className="text-[10px] text-muted-foreground font-mono">SKU: {prod.sku}</span>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground">SL tặng:</span>
                  <Input
                    type="number"
                    min={1}
                    className="h-8 w-16 text-center font-mono rounded-[6px] text-xs"
                    value={g.qty}
                    onChange={(e) => onQtyChange(g.productId, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                  onClick={() => onRemove(g.productId)}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative">
        <Input
          className="h-9 w-full rounded-[6px]"
          placeholder="Tìm sản phẩm quà tặng..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {open && results.filter((p) => !selected.some((g) => g.productId === p._id)).length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-[6px] border border-border bg-popover shadow-sm overflow-hidden max-h-48 overflow-y-auto">
            {results.filter((p) => !selected.some((g) => g.productId === p._id)).map((p) => {
              const rawThumb = p.thumbnail;
              const thumbSrc = typeof rawThumb === 'string' ? rawThumb : rawThumb?.url;

              return (
                <button
                  key={p._id}
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-foreground hover:bg-muted transition-colors cursor-pointer"
                  onMouseDown={() => {
                    onAdd(p);
                    setSearch('');
                    setOpen(false);
                  }}
                >
                  {thumbSrc ? (
                    <img src={thumbSrc} alt="" className="size-7 rounded-[4px] object-cover border border-border bg-muted shrink-0" />
                  ) : (
                    <div className="size-7 rounded-[4px] border border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0 font-bold">
                      {(p.name || 'SP').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-xs font-medium text-foreground">{p.name}</span>
                    {p.sku && <span className="text-[10px] text-muted-foreground font-mono">SKU: {p.sku}</span>}
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
