import React from 'react';
import { Input } from '@/components/ui/input';
import PromotionDateRangePicker from '@/components/ui/PromotionDateRangePicker';

export default function ComboBasicInfoSection({
  name,
  setName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isUnlimitedTime,
  setIsUnlimitedTime,
  usageLimit,
  setUsageLimit,
  description,
  setDescription,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Thông tin cơ bản
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Tên combo sản phẩm <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            placeholder="Ví dụ: Combo Siêu Tiết Kiệm Mùa Hè (3 Áo Thun + 1 Quần Short)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 rounded-[6px] text-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Thời gian áp dụng
          </label>
          <PromotionDateRangePicker
            startDate={startDate}
            endDate={endDate}
            isUnlimited={isUnlimitedTime}
            onChange={({ startDate: s, endDate: e, isUnlimited: unl }) => {
              setStartDate(s);
              setEndDate(e || '');
              setIsUnlimitedTime(unl);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Giới hạn số lần sử dụng
          </label>
          <Input
            type="number"
            min="0"
            placeholder="0 = Không giới hạn số lần bán"
            value={usageLimit}
            onChange={(e) => setUsageLimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="h-9 rounded-[6px] text-xs font-mono tabular-nums"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Mô tả / Ghi chú ưu đãi
          </label>
          <Input
            type="text"
            placeholder="Ưu đãi áp dụng cho khách mua gói combo trọn bộ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-9 rounded-[6px] text-xs"
          />
        </div>
      </div>
    </div>
  );
}
