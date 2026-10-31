import React from 'react';
import { Search, Loader2, Plus } from '@/components/ui/Icons';
import { Input } from '@/components/ui/input';

export default function FlashSaleProductSearch({
  productSearch,
  setProductSearch,
  showProductDropdown,
  setShowProductDropdown,
  searching,
  searchResults,
  onSelectProduct,
  onSelectVariant,
}) {
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="h-9 pl-9 pr-3 rounded-[6px]"
          placeholder="Tìm kiếm và chọn sản phẩm thêm vào Flash Sale..."
          value={productSearch}
          onChange={(e) => {
            setProductSearch(e.target.value);
            setShowProductDropdown(true);
          }}
          onFocus={() => setShowProductDropdown(true)}
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />}
      </div>

      {showProductDropdown && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-[6px] border border-border bg-popover shadow-sm py-1">
          {searchResults.map((prod) => (
            <div key={prod._id} className="border-b border-border/40 last:border-0">
              <div
                onClick={() => onSelectProduct(prod)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
              >
                {(() => {
                  const thumbSrc = typeof prod.thumbnail === 'string' ? prod.thumbnail : prod.thumbnail?.url;
                  return thumbSrc ? (
                    <img src={thumbSrc} alt="" className="size-8 object-cover rounded-[6px] border border-border shrink-0" />
                  ) : (
                    <div className="size-8 rounded-[6px] bg-muted flex items-center justify-center text-xs shrink-0">SP</div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {prod.name} {prod.variants?.length > 0 && <span className="text-[11px] text-muted-foreground font-normal">(SP Gốc)</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                    Giá gốc: {(prod.salePrice || prod.price || 0).toLocaleString('vi-VN')}đ | Tồn: {prod.stock || 0}
                  </p>
                </div>
                <Plus className="size-4 text-muted-foreground" />
              </div>

              {prod.variants?.map((v) => {
                const attrStr = v.attributes?.map((a) => `${a.name}: ${a.value}`).join(', ') || v.sku || 'Biến thể';
                return (
                  <div
                    key={v._id}
                    onClick={() => onSelectVariant(prod, v)}
                    className="flex items-center gap-3 pl-8 pr-3 py-1.5 hover:bg-primary/10 transition-colors cursor-pointer bg-muted/20 border-t border-border/30 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs">↳ Biến thể: {attrStr}</p>
                      <p className="text-[11px] font-mono text-muted-foreground tabular-nums">
                        SKU: {v.sku || '—'} | Giá: {(v.price || prod.price || 0).toLocaleString('vi-VN')}đ | Tồn: {v.stock ?? 0}
                      </p>
                    </div>
                    <Plus className="size-3.5 text-primary" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
