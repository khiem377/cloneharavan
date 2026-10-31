import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ComboItemsTable({
  selectedItems,
  virtualStock,
  limitingProduct,
  handleQuantityChange,
  handleRemoveItem,
  totalOriginalPrice,
  handleLoadAiBundles,
  isAiSuggestingBundles,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sản phẩm trong combo ({selectedItems.length})
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Chọn các sản phẩm thành phần cấu thành nên gói combo (tối thiểu 2 sản phẩm)
          </p>
        </div>

        {selectedItems.length >= 2 ? (
          <div className="flex items-center gap-2 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Tồn kho combo khả dụng:</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {virtualStock} bộ
            </span>
            {limitingProduct && (
              <span className="text-[10px] text-muted-foreground font-normal">
                (Giới hạn bởi: {limitingProduct.name.slice(0, 16)}...)
              </span>
            )}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadAiBundles}
            disabled={isAiSuggestingBundles}
            className="h-7 text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-semibold cursor-pointer active:scale-[0.98] transition-transform"
          >
            {isAiSuggestingBundles ? 'Đang phân tích kho...' : 'AI gợi ý tạo combo'}
          </Button>
        )}
      </div>

      <div className="rounded-[6px] border border-border overflow-hidden bg-background">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">Ảnh</th>
              <th className="py-2.5 px-3">Sản phẩm</th>
              <th className="py-2.5 px-3 text-right">Đơn giá gốc</th>
              <th className="py-2.5 px-3 text-center w-36">SL trong combo</th>
              <th className="py-2.5 px-3 text-right">Thành tiền gốc</th>
              <th className="py-2.5 px-3 text-center w-12">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {selectedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-7 px-4 text-center">
                  <div className="max-w-md mx-auto space-y-2.5">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Chưa có sản phẩm nào trong combo. Gõ tên hoặc SKU ở trên để thêm sản phẩm, hoặc dùng AI để đề xuất gói combo tối ưu từ kho hàng.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleLoadAiBundles}
                      disabled={isAiSuggestingBundles}
                      className="h-7 text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-semibold cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      {isAiSuggestingBundles ? 'Đang quét kho hàng...' : 'AI gợi ý tạo combo'}
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              selectedItems.map((item, index) => {
                const itemTotal = (item.originalPrice || 0) * (item.quantity || 1);
                return (
                  <tr key={item.productId || index} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 text-center">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="size-8 rounded-[4px] border border-border object-cover mx-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`size-8 rounded-[4px] border border-border bg-muted items-center justify-center font-bold text-xs uppercase text-muted-foreground mx-auto ${
                          item.thumbnail ? 'hidden' : 'flex'
                        }`}
                      >
                        {item.name ? item.name.charAt(0) : 'P'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-foreground line-clamp-1">{item.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <span>SKU: {item.sku || '—'}</span>
                        <span>•</span>
                        <span>Tồn kho: {item.stock}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      {Number(item.originalPrice).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, -1)}
                          className="size-6 rounded-[4px] border border-border bg-muted flex items-center justify-center text-foreground hover:bg-accent active:scale-[0.98] transition-transform"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, 1)}
                          className="size-6 rounded-[4px] border border-border bg-muted flex items-center justify-center text-foreground hover:bg-accent active:scale-[0.98] transition-transform"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-foreground">
                      {itemTotal.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {selectedItems.length > 0 && (
            <tfoot className="bg-muted/40 border-t border-border font-medium">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right font-semibold text-foreground">
                  Tổng giá trị gốc của các sản phẩm:
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-sm text-foreground tabular-nums">
                  {totalOriginalPrice.toLocaleString('vi-VN')} đ
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
