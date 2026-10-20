import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/providers/ToastProvider';
import { useSearchInventoryProducts, useUpdateCompositeBom } from '@/hooks/useProducts';

export default function CompositeBomModal({ isOpen, onClose, product, onSuccess }) {
  if (!isOpen || !product) return null;

  const updateMutation = useUpdateCompositeBom();

  const [isComposite, setIsComposite] = useState(Boolean(product.isComposite));
  const [bomItems, setBomItems] = useState(() => {
    if (Array.isArray(product.bomItems) && product.bomItems.length > 0) {
      return product.bomItems.map((item) => ({
        productId: item.productId?._id || item.productId,
        name: item.productId?.name || 'Linh kiện thành phần',
        sku: item.productId?.sku || '',
        quantity: item.quantity || 1,
        costPrice: item.costPrice || item.productId?.costPrice || 0,
        stock: item.productId?.stock ?? 10,
      }));
    }
    return [];
  });

  // Search product components
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: searchResults = [], isLoading: isSearching } = useSearchInventoryProducts(searchQuery);

  const handleAddComponent = (prod) => {
    if (prod._id === product._id) {
      return toast.warning('Không thể thêm chính sản phẩm này làm linh kiện thành phần');
    }

    const existingIndex = bomItems.findIndex((it) => it.productId === prod._id);
    if (existingIndex > -1) {
      setBomItems((prev) =>
        prev.map((it, idx) => (idx === existingIndex ? { ...it, quantity: it.quantity + 1 } : it))
      );
      toast.info(`Tăng số lượng ${prod.name}`);
    } else {
      setBomItems((prev) => [
        ...prev,
        {
          productId: prod._id,
          name: prod.name,
          sku: prod.sku || '',
          quantity: 1,
          costPrice: prod.costPrice || 0,
          stock: prod.stock || 0,
        },
      ]);
      toast.success(`Đã thêm linh kiện: ${prod.name}`);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleRemoveComponent = (index) => {
    setBomItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuantityChange = (index, delta) => {
    setBomItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it;
        return { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) };
      })
    );
  };

  // Calculate composite stats
  const { totalCostPrice, maxAssemblableStock } = useMemo(() => {
    let cost = 0;
    let minStock = Infinity;

    for (const it of bomItems) {
      cost += (Number(it.costPrice) || 0) * (Number(it.quantity) || 1);
      const possible = Math.floor((Number(it.stock) || 0) / (Number(it.quantity) || 1));
      if (possible < minStock) {
        minStock = possible;
      }
    }

    return {
      totalCostPrice: cost,
      maxAssemblableStock: minStock === Infinity || bomItems.length === 0 ? 0 : Math.max(0, minStock),
    };
  }, [bomItems]);

  const handleSave = async () => {
    if (isComposite && bomItems.length === 0) {
      return toast.error('Vui lòng thêm ít nhất 1 linh kiện cấu thành hoặc tắt chế độ sản phẩm cấu thành');
    }

    try {
      await updateMutation.mutateAsync({
        id: product._id,
        data: {
          isComposite,
          bomItems: bomItems.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            costPrice: it.costPrice,
          })),
        },
      });
      toast.success('Đã lưu cấu hình sản phẩm cấu thành (BOM) thành công');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu cấu hình BOM');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-[6px] border border-border bg-card text-card-foreground shadow-xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Cấu Hình Sản Phẩm Cấu Thành (BOM - Bill of Materials)
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Lắp ráp / đóng gói: <span className="font-semibold text-foreground">{product.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Toggle Kích hoạt Sản phẩm Cấu thành */}
          <div className="p-3.5 rounded-[6px] border border-border bg-muted/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground">
                Chế độ Sản phẩm Cấu thành (Lắp ráp từ nhiều linh kiện)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Khi bán 1 sản phẩm này, hệ thống sẽ tự động trừ tồn kho của từng linh kiện thành phần bên dưới.
              </p>
            </div>
            <Switch
              id="composite-mode-toggle"
              checked={isComposite}
              onCheckedChange={setIsComposite}
            />
          </div>

          {isComposite && (
            <>
              {/* Tóm tắt tồn kho & giá vốn tính toán */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[6px] border border-border bg-background">
                  <span className="text-[11px] text-muted-foreground">Tồn kho khả dụng (Lắp ráp tối đa):</span>
                  <div className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {maxAssemblableStock} sản phẩm
                  </div>
                </div>
                <div className="p-3 rounded-[6px] border border-border bg-background">
                  <span className="text-[11px] text-muted-foreground">Tổng giá vốn linh kiện:</span>
                  <div className="text-base font-mono font-bold text-foreground tabular-nums">
                    {Number(totalCostPrice).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Tìm & thêm linh kiện thành phần */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers size={13} className="text-primary" /> Danh sách linh kiện cấu thành ({bomItems.length})
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tìm tên hoặc SKU linh kiện để thêm vào BOM..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className="pl-9 h-9 rounded-[6px] text-xs"
                  />
                  {isSearchOpen && searchQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-[6px] border border-border bg-popover shadow-md divide-y divide-border">
                      {searchResults.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => handleAddComponent(p)}
                          className="p-2.5 hover:bg-muted/60 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              SKU: {p.sku || '—'} • Tồn kho: {p.stock || 0}
                            </p>
                          </div>
                          <span className="font-mono text-muted-foreground text-xs">
                            Vốn: {Number(p.costPrice || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bảng linh kiện */}
                <div className="rounded-[6px] border border-border overflow-hidden bg-background">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Linh kiện</th>
                        <th className="py-2.5 px-3 text-right">Giá vốn</th>
                        <th className="py-2.5 px-3 text-center w-32">SL trong 1 bộ</th>
                        <th className="py-2.5 px-3 text-right">Tồn linh kiện</th>
                        <th className="py-2.5 px-3 text-right">Tổng vốn</th>
                        <th className="py-2.5 px-3 text-center w-12">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bomItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                            <Package className="mx-auto size-7 text-muted-foreground/40 mb-1.5" />
                            Chưa có linh kiện thành phần nào. Hãy tìm kiếm ở trên để thêm.
                          </td>
                        </tr>
                      ) : (
                        bomItems.map((item, idx) => {
                          const itemTotalCost = (item.costPrice || 0) * (item.quantity || 1);
                          return (
                            <tr key={item.productId || idx} className="hover:bg-muted/20 transition-colors">
                              <td className="py-2.5 px-3">
                                <p className="font-semibold text-foreground">{item.name}</p>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  SKU: {item.sku || '—'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                                {Number(item.costPrice).toLocaleString('vi-VN')} đ
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleQuantityChange(idx, -1)}
                                    className="size-6 rounded-[4px] border border-border bg-muted flex items-center justify-center text-foreground hover:bg-accent"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-mono font-bold tabular-nums">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuantityChange(idx, 1)}
                                    className="size-6 rounded-[4px] border border-border bg-muted flex items-center justify-center text-foreground hover:bg-accent"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground">
                                {item.stock} cái
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-foreground">
                                {Number(itemTotalCost).toLocaleString('vi-VN')} đ
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveComponent(idx)}
                                  className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-3.5 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-[6px] text-xs h-8"
            disabled={updateMutation.isPending}
          >
            Hủy
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-[6px] text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform font-semibold"
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình BOM'}
          </Button>
        </div>
      </div>
    </div>
  );
}
