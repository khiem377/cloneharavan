import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';

export default function SupplierFilterBar({
  keyword,
  setKeyword,
  supplierTypeFilter,
  setSupplierTypeFilter,
  setPage,
  columnVisibility,
}) {
  return (
    <Card className="rounded-[6px] border border-border p-3 shadow-xs bg-card">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên nhà cung cấp, mã NCC, SĐT, email..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="pl-8 h-8 rounded-[6px] text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={supplierTypeFilter}
            onChange={(e) => {
              setSupplierTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-8 px-2.5 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer w-full sm:w-48"
          >
            <option value="all">Tất cả loại NCC</option>
            <option value="Sản phẩm / Nguyên vật liệu">Sản phẩm / Nguyên vật liệu</option>
            <option value="Sản phẩm">Sản phẩm</option>
            <option value="Nguyên phụ liệu">Nguyên phụ liệu</option>
          </select>

          <ColumnToggleDropdown columnVisibility={columnVisibility} />
        </div>
      </div>
    </Card>
  );
}
