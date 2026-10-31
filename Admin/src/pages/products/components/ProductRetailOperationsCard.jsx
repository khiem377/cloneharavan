import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, ShieldAlert, EyeOff, Printer, Scale, Gift, Sparkles } from 'lucide-react';
import ProductAiSpecsModal from './ProductAiSpecsModal';

/**
 * ProductRetailOperationsCard
 * Quản lý các công tắc vận hành bán lẻ, in ấn, từ khóa và kích thước đóng gói theo chuẩn Pancake POS
 */
export default function ProductRetailOperationsCard({ form, setField, brands = [], onApplyAiData }) {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleKeywordChange = (e) => {
    const val = e.target.value;
    const list = val.split(',').map((k) => k.trim()).filter(Boolean);
    setField('keywords', list);
  };

  const selectedBrand = brands?.find((b) => b._id === form.brand || b.name === form.brand);
  const brandName = selectedBrand?.name || (typeof form.brand === 'string' ? form.brand : '');

  const handleApplyAiSpecs = (aiData) => {
    if (typeof onApplyAiData === 'function') {
      onApplyAiData(aiData);
      return;
    }

    const { weight, dimensions, specifications, description, price, sku } = aiData;
    if (weight !== undefined) setField('weight', weight);
    if (dimensions) setField('dimensions', dimensions);
    if (description && typeof description === 'string' && description.trim()) {
      setField('description', description);
    }
    if (price && Number(price) > 0) setField('price', Number(price));
    if (sku && typeof sku === 'string' && sku.trim() && !form.sku) setField('sku', sku.trim());
    if (specifications && Array.isArray(specifications) && specifications.length > 0) {
      const existingSpecs = Array.isArray(form.specifications) ? form.specifications : [];
      const merged = [...existingSpecs];
      specifications.forEach((newSpec) => {
        const found = merged.find((s) => s.key?.toLowerCase() === newSpec.key?.toLowerCase());
        if (!found) {
          merged.push(newSpec);
        }
      });
      setField('specifications', merged);
    }
  };

  const keywordsString = Array.isArray(form.keywords) ? form.keywords.join(', ') : '';

  return (
    <Card className="rounded-[6px] border border-border shadow-none bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Package className="size-4 text-primary" /> Vận hành bán lẻ & Đóng gói
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Cho phép bán tồn kho âm */}
          <div className="flex items-start justify-between p-3 rounded-[6px] border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="allow-neg-stock" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5 select-none">
                Cho phép bán tồn kho âm
              </label>
              <p className="text-[11px] text-muted-foreground">
                Tiếp tục chốt đơn khi tồn kho khả dụng về 0
              </p>
            </div>
            <Checkbox
              id="allow-neg-stock"
              checked={Boolean(form.allowNegativeStock)}
              onCheckedChange={(checked) => setField('allowNegativeStock', checked)}
              className="mt-0.5"
            />
          </div>

          {/* Che tên khi in */}
          <div className="flex items-start justify-between p-3 rounded-[6px] border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="hide-name-print" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5 select-none">
                <EyeOff className="size-3.5 text-muted-foreground" /> Che tên khi in vận đơn
              </label>
              <p className="text-[11px] text-muted-foreground">
                Ẩn tên hàng trên nhãn bưu điện cho hàng nhạy cảm
              </p>
            </div>
            <Checkbox
              id="hide-name-print"
              checked={Boolean(form.hideNameOnPrint)}
              onCheckedChange={(checked) => setField('hideNameOnPrint', checked)}
              className="mt-0.5"
            />
          </div>

          {/* Ẩn khi in đơn */}
          <div className="flex items-start justify-between p-3 rounded-[6px] border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="hide-invoice" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5 select-none">
                <Printer className="size-3.5 text-muted-foreground" /> Ẩn khi in phiếu bán lẻ
              </label>
              <p className="text-[11px] text-muted-foreground">
                Dành cho bao bì, vật phẩm phụ trợ hoặc quà tặng
              </p>
            </div>
            <Checkbox
              id="hide-invoice"
              checked={Boolean(form.hideOnInvoice)}
              onCheckedChange={(checked) => setField('hideOnInvoice', checked)}
              className="mt-0.5"
            />
          </div>

          {/* Tính tiền theo cân nặng */}
          <div className="flex items-start justify-between p-3 rounded-[6px] border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
            <div className="space-y-0.5 pr-2">
              <label htmlFor="weight-pricing" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5 select-none">
                <Scale className="size-3.5 text-muted-foreground" /> Tính tiền theo cân nặng
              </label>
              <p className="text-[11px] text-muted-foreground">
                Áp dụng cho nông sản, thực phẩm bán theo kg
              </p>
            </div>
            <Checkbox
              id="weight-pricing"
              checked={Boolean(form.weightBasedPricing)}
              onCheckedChange={(checked) => setField('weightBasedPricing', checked)}
              className="mt-0.5"
            />
          </div>
        </div>

        {/* Ngưỡng cảnh báo hết hàng & Từ khóa gõ tắt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-amber-500" /> Ngưỡng báo hết hàng
            </label>
            <Input
              type="number"
              min="0"
              value={form.lowStockThreshold ?? 5}
              onChange={(e) => setField('lowStockThreshold', Number(e.target.value))}
              className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
              placeholder="5"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Từ khóa tìm kiếm nhanh (phân cách bằng dấu phẩy)
            </label>
            <Input
              value={keywordsString}
              onChange={handleKeywordChange}
              className="h-8 rounded-[6px] text-xs font-mono"
              placeholder="ví dụ: atb, thuncotton, basicdak"
            />
          </div>
        </div>

        {/* Trọng lượng & Kích thước đóng gói */}
        <div className="pt-2 border-t border-border space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Scale className="size-3.5 text-primary" /> Kiện hàng đóng gói phục vụ tính cước GHN / GHTK
                </p>
                {form.shippingDataStatus === 'verified' && (
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    ✓ Đã xác minh từ hãng
                  </span>
                )}
                {form.shippingDataStatus === 'estimated' && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                    ⚡ Quy đổi đóng gói E-commerce
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dùng độc quyền để tính phí ship bưu điện (Quần áo được tính theo kích thước gập túi ni-lông niêm phong).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              className="h-7 px-2.5 rounded-[6px] text-xs font-medium border-primary/30 text-primary hover:bg-primary/5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs gap-1.5"
            >
              <Sparkles className="size-3 text-amber-500" />
              <span>AI Tra cứu thông số</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-muted-foreground">Cả gói (gram)</label>
              <Input
                type="number"
                min="0"
                value={form.packageWeight || form.weight || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setField('packageWeight', val);
                  setField('weight', val);
                }}
                className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                placeholder="250"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-muted-foreground">Dài (cm)</label>
              <Input
                type="number"
                min="0"
                value={form.packageDimensions?.length || form.dimensions?.length || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const updated = { ...(form.packageDimensions || form.dimensions || {}), length: val };
                  setField('packageDimensions', updated);
                  setField('dimensions', updated);
                }}
                className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                placeholder="25"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-muted-foreground">Rộng (cm)</label>
              <Input
                type="number"
                min="0"
                value={form.packageDimensions?.width || form.dimensions?.width || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const updated = { ...(form.packageDimensions || form.dimensions || {}), width: val };
                  setField('packageDimensions', updated);
                  setField('dimensions', updated);
                }}
                className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                placeholder="18"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-muted-foreground">Cao (cm)</label>
              <Input
                type="number"
                min="0"
                value={form.packageDimensions?.height || form.dimensions?.height || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const updated = { ...(form.packageDimensions || form.dimensions || {}), height: val };
                  setField('packageDimensions', updated);
                  setField('dimensions', updated);
                }}
                className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                placeholder="3"
              />
            </div>
          </div>
        </div>
      </CardContent>

      <ProductAiSpecsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        productName={form.name}
        brandName={brandName}
        onApply={handleApplyAiSpecs}
      />
    </Card>
  );
}
