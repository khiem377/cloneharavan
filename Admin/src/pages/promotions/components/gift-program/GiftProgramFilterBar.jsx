import React from 'react';
import { Search, Trash2 } from '@/components/ui/Icons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function GiftProgramFilterBar({
  keyword,
  setKeyword,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  setPage,
  selectedIds,
  setBulkDeleteConfirm,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardContent className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="h-9 pl-8 rounded-[6px]"
              placeholder="Tìm theo tên..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả loại</option>
            <option value="same_product">Tặng cùng sản phẩm</option>
            <option value="different_product">Tặng khác sản phẩm</option>
          </select>
          <select
            className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Tắt</option>
          </select>
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteConfirm(true)}
            className="h-9 rounded-[6px] active:scale-[0.98] transition-transform"
          >
            <Trash2 size={14} className="mr-1.5" /> Xóa {selectedIds.length} mục
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
