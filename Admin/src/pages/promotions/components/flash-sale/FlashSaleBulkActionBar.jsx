import React from 'react';
import { Sparkles } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FlashSaleBulkActionBar({
  bulkDiscountType,
  setBulkDiscountType,
  bulkDiscountValue,
  setBulkDiscountValue,
  onApplyBulkDiscount,
}) {
  return (
    <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-[6px] border border-border flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Áp dụng nhanh:</span>
      <select
        className="h-8 px-2 rounded-[6px] border border-input bg-background text-xs font-medium outline-none focus:border-ring cursor-pointer"
        value={bulkDiscountType}
        onChange={(e) => setBulkDiscountType(e.target.value)}
      >
        <option value="percent">Giảm theo %</option>
        <option value="fixed_discount">Giảm bớt số tiền (đ)</option>
        <option value="fixed_price">Set giá Flash Sale cố định (đ)</option>
      </select>
      <Input
        type="number"
        className="w-28 h-8 px-2 rounded-[6px] font-mono text-xs font-semibold tabular-nums"
        placeholder="Nhập giá trị..."
        value={bulkDiscountValue}
        onChange={(e) => setBulkDiscountValue(Number(e.target.value))}
      />
      <Button
        type="button"
        size="sm"
        onClick={onApplyBulkDiscount}
        className="h-8 px-3 rounded-[6px] text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white active:scale-[0.98]"
      >
        <Sparkles className="size-3.5 mr-1" /> Áp dụng
      </Button>
    </div>
  );
}
