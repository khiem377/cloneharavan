import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Percent, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/providers/ToastProvider';
import { useUpdateWholesaleTiers } from '@/hooks/useProducts';

export default function WholesalePricingModal({ isOpen, onClose, product, onSuccess }) {
  if (!isOpen || !product) return null;

  const basePrice = product.cachedPrice ?? product.price ?? 0;
  const updateMutation = useUpdateWholesaleTiers();

  // Tier format: [{ minQuantity, price, discountPercent }]
  const [tiers, setTiers] = useState(() => {
    if (Array.isArray(product.wholesaleTiers) && product.wholesaleTiers.length > 0) {
      return product.wholesaleTiers.map((t) => ({
        minQuantity: t.minQuantity || 2,
        price: t.price || Math.round(basePrice * 0.9),
        discountPercent: t.discountPercent || (basePrice > 0 ? Math.round(((basePrice - t.price) / basePrice) * 100) : 0),
      }));
    }
    // Default 1 initial tier
    return [
      {
        minQuantity: 5,
        price: Math.round(basePrice * 0.9),
        discountPercent: 10,
      },
      {
        minQuantity: 10,
        price: Math.round(basePrice * 0.85),
        discountPercent: 15,
      },
    ];
  });

  const handleAddTier = () => {
    const lastQty = tiers.length > 0 ? tiers[tiers.length - 1].minQuantity : 1;
    const nextQty = lastQty + 5;
    const discountedPrice = Math.round(basePrice * 0.8);
    setTiers([
      ...tiers,
      {
        minQuantity: nextQty,
        price: discountedPrice,
        discountPercent: 20,
      },
    ]);
  };

  const handleRemoveTier = (index) => {
    setTiers(tiers.filter((_, idx) => idx !== index));
  };

  const handlePriceChange = (index, newPriceVal) => {
    const p = Math.max(0, parseInt(newPriceVal, 10) || 0);
    const pct = basePrice > 0 ? Math.max(0, Math.round(((basePrice - p) / basePrice) * 100)) : 0;
    setTiers((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, price: p, discountPercent: pct } : t))
    );
  };

  const handlePercentChange = (index, newPctVal) => {
    const pct = Math.max(0, Math.min(100, parseInt(newPctVal, 10) || 0));
    const calculatedPrice = Math.round((basePrice * (100 - pct)) / 100);
    setTiers((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, price: calculatedPrice, discountPercent: pct } : t))
    );
  };

  const handleQuantityChange = (index, newQtyVal) => {
    const q = Math.max(2, parseInt(newQtyVal, 10) || 2);
    setTiers((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, minQuantity: q } : t))
    );
  };

  const handleApplyPreset = (type) => {
    if (type === 'retail_plus') {
      setTiers([
        { minQuantity: 3, price: Math.round(basePrice * 0.95), discountPercent: 5 },
        { minQuantity: 5, price: Math.round(basePrice * 0.90), discountPercent: 10 },
        { minQuantity: 10, price: Math.round(basePrice * 0.85), discountPercent: 15 },
      ]);
    } else if (type === 'wholesale_distributor') {
      setTiers([
        { minQuantity: 10, price: Math.round(basePrice * 0.80), discountPercent: 20 },
        { minQuantity: 50, price: Math.round(basePrice * 0.70), discountPercent: 30 },
        { minQuantity: 100, price: Math.round(basePrice * 0.60), discountPercent: 40 },
      ]);
    }
    toast.success('Đã áp dụng mẫu bậc giá bán sỉ');
  };

  const handleSave = async () => {
    // Validate: each tier must have minQuantity >= 2
    for (const t of tiers) {
      if (t.minQuantity < 2) {
        return toast.error('Số lượng tối thiểu của bậc sỉ phải từ 2 trở lên');
      }
      if (t.price <= 0) {
        return toast.error('Giá bán sỉ phải lớn hơn 0đ');
      }
    }

    try {
      await updateMutation.mutateAsync({
        id: product._id,
        tiers,
      });
      toast.success('Đã lưu bảng giá bán sỉ cho sản phẩm thành công');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu bảng giá sỉ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-[6px] border border-border bg-card text-card-foreground shadow-sm flex flex-col max-h-[90vh] overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Coins size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Bảng Giá Bán Sỉ Tự Động Theo Số Lượng
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Sản phẩm: <span className="font-semibold text-foreground">{product.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Thông tin giá niêm yết hiện tại */}
          <div className="flex items-center justify-between p-3 rounded-[6px] border border-border bg-muted/30">
            <div>
              <span className="text-xs text-muted-foreground">Giá bán lẻ niêm yết hiện tại:</span>
              <div className="text-base font-mono font-bold text-foreground tabular-nums">
                {Number(basePrice).toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Gợi ý mẫu:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('retail_plus')}
                className="text-xs px-2 py-0.5 rounded-[4px] border border-border bg-background hover:bg-muted text-foreground cursor-pointer"
              >
                Bán buôn nhỏ (3-10 cái)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('wholesale_distributor')}
                className="text-xs px-2 py-0.5 rounded-[4px] border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer"
              >
                Đại lý / Sỉ lớn (10-100 cái)
              </button>
            </div>
          </div>

          {/* Bảng các bậc giá sỉ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag size={13} className="text-primary" /> Thiết lập các bậc số lượng & giá sỉ
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTier}
                className="h-7 text-xs rounded-[6px] flex items-center gap-1 cursor-pointer active:scale-[0.98]"
              >
                <Plus size={13} /> Thêm bậc sỉ
              </Button>
            </div>

            <div className="rounded-[6px] border border-border overflow-hidden bg-background">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Bậc</th>
                    <th className="py-2.5 px-3 w-36">Mua từ (Số lượng)</th>
                    <th className="py-2.5 px-3">Giá bán sỉ (đ)</th>
                    <th className="py-2.5 px-3 w-28">Giảm (%)</th>
                    <th className="py-2.5 px-3 text-right">Khách tiết kiệm</th>
                    <th className="py-2.5 px-3 text-center w-12">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tiers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground text-xs">
                        Chưa thiết lập bậc giá sỉ nào. Nhấn "Thêm bậc sỉ" để cấu hình.
                      </td>
                    </tr>
                  ) : (
                    tiers.map((tier, idx) => {
                      const savings = Math.max(0, basePrice - tier.price);
                      return (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-muted-foreground">
                            Bậc {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">≥</span>
                              <Input
                                type="number"
                                min="2"
                                value={tier.minQuantity}
                                onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                className="h-7 w-20 text-xs font-mono font-bold tabular-nums rounded-[4px]"
                              />
                              <span className="text-muted-foreground text-[11px]">cái</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <Input
                              type="number"
                              min="0"
                              step="1000"
                              value={tier.price}
                              onChange={(e) => handlePriceChange(idx, e.target.value)}
                              className="h-7 text-xs font-mono font-bold text-primary tabular-nums rounded-[4px]"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={tier.discountPercent}
                                onChange={(e) => handlePercentChange(idx, e.target.value)}
                                className="h-7 w-16 text-xs font-mono tabular-nums rounded-[4px]"
                              />
                              <span className="text-muted-foreground text-[11px]">%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                            -{Number(savings).toLocaleString('vi-VN')} đ/cái
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveTier(idx)}
                              className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Xóa bậc này"
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

          <div className="text-[11px] text-muted-foreground bg-muted/40 p-3 rounded-[6px] border border-border">
            💡 <strong>Cơ chế tự động:</strong> Khi thu ngân tạo đơn hoặc khách hàng sỉ mua hàng đạt mốc số lượng tương ứng, hệ thống sẽ tự động hạ đơn giá về mức giá sỉ của bậc đó mà không cần nhập mã giảm giá.
          </div>
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
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu bảng giá sỉ'}
          </Button>
        </div>
      </div>
    </div>
  );
}
