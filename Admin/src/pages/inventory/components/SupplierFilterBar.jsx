import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    <Card className="rounded-[6px] border border-border p-3 shadow-none bg-card">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground z-10" />
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
          <Select
            value={supplierTypeFilter}
            onValueChange={(val) => {
              setSupplierTypeFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-full sm:w-48 rounded-[6px] text-xs">
              <SelectValue placeholder="Loại NCC" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="all">Tất cả loại NCC</SelectItem>
              <SelectItem value="Sản phẩm / Nguyên vật liệu">Sản phẩm / Nguyên vật liệu</SelectItem>
              <SelectItem value="Sản phẩm">Sản phẩm</SelectItem>
              <SelectItem value="Nguyên phụ liệu">Nguyên phụ liệu</SelectItem>
            </SelectContent>
          </Select>

          <ColumnToggleDropdown columnVisibility={columnVisibility} />
        </div>
      </div>
    </Card>
  );
}
