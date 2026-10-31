import React from 'react';
import { Input } from '@/components/ui/input';
import PriceInput from '@/components/ui/PriceInput';

export default function PromotionDiscountFields({ form, setForm }) {
  if (form.type === 'percent_discount') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Phần trăm giảm (%) <span className="text-destructive">*</span></label>
          <Input
            type="number"
            min={1}
            max={100}
            className="h-9 rounded-[6px] font-mono"
            placeholder="VD: 15"
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Giảm tối đa (đ)</label>
          <PriceInput
            className="h-9 rounded-[6px]"
            placeholder="Không giới hạn"
            value={form.maxDiscountValue}
            onChange={(val) => setForm((f) => ({ ...f, maxDiscountValue: val }))}
          />
        </div>
      </div>
    );
  }

  if (form.type === 'fixed_discount') {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">Số tiền giảm (đ) <span className="text-destructive">*</span></label>
        <PriceInput
          className="h-9 rounded-[6px]"
          placeholder="VD: 50.000"
          value={form.discountValue}
          onChange={(val) => setForm((f) => ({ ...f, discountValue: val }))}
        />
      </div>
    );
  }

  if (form.type === 'buy_x_pay_y') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Số lượng mua (X) <span className="text-destructive">*</span></label>
          <Input
            type="number"
            min={2}
            className="h-9 rounded-[6px] font-mono"
            placeholder="VD: 3"
            value={form.triggerQty}
            onChange={(e) => setForm((f) => ({ ...f, triggerQty: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Số lượng tính tiền (Y) <span className="text-destructive">*</span></label>
          <Input
            type="number"
            min={1}
            className="h-9 rounded-[6px] font-mono"
            placeholder="VD: 2"
            value={form.payQty}
            onChange={(e) => setForm((f) => ({ ...f, payQty: e.target.value }))}
          />
        </div>
      </div>
    );
  }

  if (form.type === 'quantity_discount') {
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Số lượng tối thiểu <span className="text-destructive">*</span></label>
          <Input
            type="number"
            min={1}
            className="h-9 rounded-[6px] font-mono"
            placeholder="VD: 5"
            value={form.triggerQty}
            onChange={(e) => setForm((f) => ({ ...f, triggerQty: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Hình thức giảm</label>
          <select
            className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer"
            value={form.discountType}
            onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
          >
            <option value="percent">Theo %</option>
            <option value="fixed">Số tiền cố định</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Mức giảm <span className="text-destructive">*</span></label>
          {form.discountType === 'percent' ? (
            <Input
              type="number"
              min={1}
              max={100}
              className="h-9 rounded-[6px] font-mono"
              placeholder="VD: 10"
              value={form.discountValue}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
            />
          ) : (
            <PriceInput
              className="h-9 rounded-[6px]"
              placeholder="VD: 20.000"
              value={form.discountValue}
              onChange={(val) => setForm((f) => ({ ...f, discountValue: val }))}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
