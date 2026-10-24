import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from '@/components/ui/Icons';

export default function CouponFilterBar({
  keyword,
  onKeywordChange,
  filterStatus,
  onStatusChange,
  filterCategory,
  onCategoryChange,
  selectedCount,
  onBulkDeleteClick,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[6px] border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        <Input
          className="h-8 w-full sm:w-64 rounded-[6px] text-xs"
          placeholder="Tìm theo tên hoặc mã code..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
        <select
          className="h-8 rounded-[6px] border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Tắt</option>
        </select>
        <select
          className="h-8 rounded-[6px] border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
          value={filterCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Tất cả loại mã</option>
          <option value="order">Giảm đơn hàng</option>
          <option value="shipping">Miễn/Giảm phí ship (Freeship)</option>
        </select>
      </div>

      {selectedCount > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDeleteClick}
          className="h-8 px-3 rounded-[6px] text-xs font-semibold"
        >
          <Trash2 size={13} className="mr-1" /> Xóa {selectedCount} mã
        </Button>
      )}
    </div>
  );
}
