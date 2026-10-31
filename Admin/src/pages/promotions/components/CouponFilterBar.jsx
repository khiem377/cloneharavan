import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

        <Select
          value={filterStatus === '' ? 'ALL' : filterStatus}
          onValueChange={(val) => onStatusChange(val === 'ALL' ? '' : val)}
        >
          <SelectTrigger className="h-8 w-36 rounded-[6px] text-xs">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="rounded-[6px]">
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Tắt</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterCategory === '' ? 'ALL' : filterCategory}
          onValueChange={(val) => onCategoryChange(val === 'ALL' ? '' : val)}
        >
          <SelectTrigger className="h-8 w-44 rounded-[6px] text-xs">
            <SelectValue placeholder="Loại mã" />
          </SelectTrigger>
          <SelectContent className="rounded-[6px]">
            <SelectItem value="ALL">Tất cả loại mã</SelectItem>
            <SelectItem value="order">Giảm đơn hàng</SelectItem>
            <SelectItem value="shipping">Miễn/Giảm phí ship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedCount > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDeleteClick}
          className="h-8 px-3 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
        >
          <Trash2 size={13} className="mr-1" /> Xóa {selectedCount} mã
        </Button>
      )}
    </div>
  );
}
