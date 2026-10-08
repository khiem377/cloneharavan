import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import PriceInput, { formatVND } from '@/components/ui/PriceInput';

const UNIT_OPTIONS = [
  'Cái', 'Chiếc', 'Hộp', 'Thùng', 'Lốc', 'Lon', 'Bộ', 'Gói', 'Chai', 'Mét', 'Kg', 'Cuộn', 'Bao', 'Tấm', 'Cặp', 'Thỏi'
];

const ITEM_TYPE_OPTIONS = [
  { label: 'Hàng hóa (Mua bán)', value: 'merchandise' },
  { label: 'Thành phẩm', value: 'finished_good' },
  { label: 'Nguyên vật liệu', value: 'raw_material' },
  { label: 'Dịch vụ', value: 'service' },
];

/**
 * Basic Product Information Form Card
 */
export default function ProductBasicInfoCard({
  form,
  setField,
  discountMode,
  setDiscountMode,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">Thông tin cơ bản</CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Product Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Tên sản phẩm <span className="text-destructive ml-0.5">*</span>
          </label>
          <Input
            className="h-8 rounded-[6px] text-xs font-sans"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Tên sản phẩm"
          />
        </div>

        {/* SKU, Unit, ItemType, Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-muted-foreground">
              Mã SKU <span className="text-destructive ml-0.5">*</span>
            </label>
            <Input
              className="h-8 rounded-[6px] text-xs font-mono uppercase"
              value={form.sku}
              onChange={(e) => setField('sku', e.target.value)}
              placeholder="Mã SKU"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-muted-foreground">
              ĐVT <span className="text-destructive ml-0.5">*</span>
            </label>
            <SearchableSelect
              options={UNIT_OPTIONS}
              value={form.unit || 'Cái'}
              onChange={(v) => setField('unit', v)}
              creatable={true}
              placeholder="Chọn ĐVT..."
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-muted-foreground">Tính chất VTHH</label>
            <SearchableSelect
              options={ITEM_TYPE_OPTIONS}
              value={form.itemType || 'merchandise'}
              onChange={(v) => setField('itemType', v)}
              creatable={false}
              placeholder="Chọn..."
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-muted-foreground">
              Tồn kho <span className="text-destructive ml-0.5">*</span>
            </label>
            <Input
              type="number"
              className="h-8 rounded-[6px] text-xs font-mono font-bold tabular-nums"
              value={form.stock}
              onChange={(e) => setField('stock', e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Pricing: Cost, Price, Sale Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Giá nhập vốn (Giá gốc)
            </label>
            <PriceInput
              value={form.costPrice}
              onChange={(v) => setField('costPrice', v)}
              placeholder="5,000,000"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Giá niêm yết <span className="text-destructive ml-0.5">*</span>
            </label>
            <PriceInput
              value={form.price}
              onChange={(v) => setField('price', v)}
              placeholder="8,000,000"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Giá khuyến mãi</label>
              <div className="flex items-center rounded-[4px] border border-border bg-muted p-0.5 text-[11px]">
                <button
                  type="button"
                  className={`px-1.5 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                    discountMode === 'price'
                      ? 'bg-background text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setDiscountMode('price')}
                >
                  Giá
                </button>
                <button
                  type="button"
                  className={`px-1.5 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                    discountMode === 'percent'
                      ? 'bg-background text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setDiscountMode('percent')}
                >
                  %
                </button>
              </div>
            </div>

            {discountMode === 'price' ? (
              <PriceInput
                value={form.salePrice}
                onChange={(v) => setField('salePrice', v)}
                placeholder="0"
              />
            ) : (
              <div className="relative flex items-center">
                <Input
                  type="number"
                  className="h-8 rounded-[6px] pr-8 text-xs font-mono tabular-nums"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={
                    form.price && form.salePrice
                      ? Math.round((1 - form.salePrice / form.price) * 100)
                      : ''
                  }
                  onChange={(e) => {
                    const pct = Math.min(100, Math.max(0, Number(e.target.value)));
                    if (form.price) setField('salePrice', Math.round(form.price * (1 - pct / 100)));
                  }}
                />
                <span className="absolute right-3 text-xs text-muted-foreground font-medium pointer-events-none">
                  %
                </span>
              </div>
            )}

            {form.price > 0 && form.salePrice > 0 && form.salePrice < form.price && (
              <div className="mt-1 rounded-[4px] bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium font-mono tabular-nums">
                Giảm {Math.round((1 - form.salePrice / form.price) * 100)}% — Tiết kiệm{' '}
                {formatVND(form.price - form.salePrice)}đ → Còn{' '}
                <strong>{formatVND(form.salePrice)}đ</strong>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
