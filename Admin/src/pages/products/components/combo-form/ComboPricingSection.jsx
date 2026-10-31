import React from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ComboPricingSection({
  pricingStrategy,
  setPricingStrategy,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  comboPriceInput,
  setComboPriceInput,
  totalOriginalPrice,
  finalComboPrice,
  savingsAmount,
  savingsPercent,
  handleTriggerAiSuggestion,
  isAiSuggestingPricing,
  selectedItemsCount,
  aiSuggestionData,
  setAiSuggestionData,
  handleApplyAiName,
  handleApplyAiOption,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Thiết lập Giá bán Combo & Mức ưu đãi
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Đưa ra mức giá combo hợp lý dựa trên tổng giá trị gốc của sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTriggerAiSuggestion}
            disabled={isAiSuggestingPricing || selectedItemsCount < 2}
            className="h-7 text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-semibold cursor-pointer active:scale-[0.98] transition-transform"
          >
            {isAiSuggestingPricing ? 'AI đang phân tích...' : 'AI gợi ý giá bán'}
          </Button>

          <div className="flex rounded-[6px] border border-border p-0.5 bg-muted">
            <button
              type="button"
              onClick={() => setPricingStrategy('fixed_price')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all ${
                pricingStrategy === 'fixed_price'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Giá trị combo
            </button>
            <button
              type="button"
              onClick={() => setPricingStrategy('discount')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all ${
                pricingStrategy === 'discount'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Giảm giá
            </button>
          </div>
        </div>
      </div>

      {aiSuggestionData && (
        <div className="rounded-[6px] border border-primary/30 bg-primary/5 p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-primary">Gợi ý từ Trợ lý AI:</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">{aiSuggestionData.marketingTitle}</span>
                <button
                  type="button"
                  onClick={() => handleApplyAiName(aiSuggestionData.marketingTitle)}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  [Dùng tên này]
                </button>
              </div>
              {aiSuggestionData.slogan && (
                <p className="text-[11px] text-muted-foreground italic">"{aiSuggestionData.slogan}"</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAiSuggestionData(null)}
              className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              title="Đóng gợi ý AI"
            >
              <X size={14} />
            </button>
          </div>

          {aiSuggestionData.analysis && (
            <p className="text-xs text-foreground/80 bg-background/80 p-2 rounded-[4px] border border-border/60">
              <strong>Phân tích chiến lược:</strong> {aiSuggestionData.analysis}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {aiSuggestionData.options?.map((opt, idx) => {
              const isBest = opt.strategy === 'best_choice' || idx === 0;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-[6px] border flex flex-col justify-between transition-all ${
                    isBest
                      ? 'border-primary bg-background shadow-xs ring-1 ring-primary/40'
                      : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{opt.label}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono rounded-[4px] px-1.5 py-0 ${
                          isBest ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        -{opt.discountPercent}%
                      </Badge>
                    </div>
                    <div className="text-sm font-mono font-bold text-primary tabular-nums">
                      {Number(opt.suggestedPrice).toLocaleString('vi-VN')} đ
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Tiết kiệm: {Number(opt.savingsAmount).toLocaleString('vi-VN')} đ
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 pt-0.5">{opt.reason}</p>
                  </div>

                  <Button
                    type="button"
                    variant={isBest ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleApplyAiOption(opt)}
                    className="mt-2.5 h-7 w-full text-xs rounded-[4px] font-semibold active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    Áp dụng giá này
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {pricingStrategy === 'fixed_price' ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Giá bán thực tế của Combo <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="1000"
                placeholder="Nhập giá bán combo..."
                value={comboPriceInput}
                onChange={(e) => setComboPriceInput(e.target.value)}
                className="h-10 rounded-[6px] text-sm font-mono font-bold tabular-nums pr-10"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-semibold">đ</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Mức giảm giá so với Tổng tiền gốc <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="h-10 px-2 text-xs rounded-[6px] border border-input bg-background font-semibold cursor-pointer"
              >
                <option value="amount">Tiền mặt (đ)</option>
                <option value="percent">Phần trăm (%)</option>
              </select>
              <div className="col-span-2 relative">
                <Input
                  type="number"
                  min="0"
                  placeholder={discountType === 'percent' ? 'Ví dụ: 15' : 'Ví dụ: 50000'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                  className="h-10 rounded-[6px] text-sm font-mono font-bold tabular-nums pr-10"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-semibold">
                  {discountType === 'percent' ? '%' : 'đ'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-[6px] border border-border bg-muted/30 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tổng giá trị gốc:</span>
            <span className="font-mono text-muted-foreground line-through tabular-nums">
              {totalOriginalPrice.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Giá bán gói combo:</span>
            <span className="font-mono font-bold text-base text-primary tabular-nums">
              {finalComboPrice.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="border-t border-border pt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Khách tiết kiệm được:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {savingsAmount.toLocaleString('vi-VN')} đ
              </span>
              <Badge variant="outline" className="rounded-[4px] text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-1.5 py-0">
                -{savingsPercent}%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
