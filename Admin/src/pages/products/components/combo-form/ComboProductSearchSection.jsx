import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ComboProductSearchSection({
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
  isSearching,
  searchResults,
  handleSelectProduct,
  suggestedBundles,
  setSuggestedBundles,
  handleApplyBundle,
  selectedItemsCount,
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Gõ tên hoặc mã SKU sản phẩm để thêm vào combo..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="pl-9 h-9 rounded-[6px] text-xs"
          />
          {isSearching && (
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
              Đang tìm...
            </span>
          )}
        </div>

        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto rounded-[6px] border border-border bg-popover shadow-sm divide-y divide-border">
            {searchResults.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Không tìm thấy sản phẩm phù hợp với từ khóa "{searchQuery}"
              </div>
            ) : (
              searchResults.map((product) => {
                const thumb = (typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url) || '';
                const price = product.cachedPrice ?? product.price ?? 0;
                return (
                  <div
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className="flex items-center justify-between p-2.5 hover:bg-muted/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={product.name}
                          className="size-8 rounded-[4px] border border-border object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`size-8 rounded-[4px] border border-border bg-muted items-center justify-center font-bold text-xs uppercase text-muted-foreground shrink-0 ${
                          thumb ? 'hidden' : 'flex'
                        }`}
                      >
                        {product.name ? product.name.charAt(0) : 'P'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                          <span>SKU: {product.sku || '—'}</span>
                          <span>•</span>
                          <span>Tồn: {product.stock || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-foreground font-mono tabular-nums">
                        {price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {suggestedBundles.length > 0 && selectedItemsCount === 0 && (
        <div className="rounded-[6px] border border-primary/30 bg-primary/5 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-primary">
                Gợi ý gói combo từ kho hàng:
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Chọn gói combo bên dưới để tự động điền sản phẩm và giá bán tối ưu
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuggestedBundles([])}
              className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              title="Đóng gợi ý"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedBundles.map((b) => (
              <div
                key={b.id}
                className="rounded-[6px] border border-border bg-background p-3 flex flex-col justify-between space-y-2.5 hover:border-primary/50 transition-colors shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="outline" className="text-[10px] font-semibold rounded-[4px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                      {b.strategyLabel}
                    </Badge>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      -{b.discountPercent}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground line-clamp-2">
                    {b.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {b.description}
                  </p>

                  <div className="space-y-1 pt-1 border-t border-border">
                    {b.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                        {it.thumbnail ? (
                          <img
                            src={it.thumbnail}
                            alt={it.name}
                            className="size-5 rounded-[2px] object-cover shrink-0 border border-border"
                          />
                        ) : (
                          <div className="size-5 rounded-[2px] bg-muted text-[9px] font-bold flex items-center justify-center shrink-0 border border-border">
                            {it.name ? it.name.charAt(0) : 'P'}
                          </div>
                        )}
                        <span className="truncate text-foreground/90 flex-1">{it.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[10px] text-muted-foreground line-through font-mono">
                      {Number(b.totalOriginalPrice).toLocaleString('vi-VN')} đ
                    </span>
                    <span className="font-mono font-bold text-primary">
                      {Number(b.suggestedPrice).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleApplyBundle(b)}
                    className="h-7 w-full text-xs rounded-[4px] font-semibold active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    Sử dụng combo này
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
