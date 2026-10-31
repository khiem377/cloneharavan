import React from 'react';
import { SearchIcon as Search } from '@/components/ui/Icons';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái quy trình', value: '' },
  { label: 'Bản nháp (Đã tạo đơn)', value: 'draft' },
  { label: 'Đã gửi NCC', value: 'sent' },
  { label: 'Đang vận chuyển', value: 'in_transit' },
  { label: 'Đã đến kho thành phẩm', value: 'arrived' },
  { label: 'Đang kiểm tra hàng hóa', value: 'inspecting' },
  { label: 'Đã xác nhận & Nhập kho', value: 'completed' },
  { label: 'Đã hủy đơn', value: 'cancelled' },
];

export default function POFilterBar({
  keyword,
  setKeyword,
  warehouseFilter,
  setWarehouseFilter,
  warehouses,
  statusFilter,
  setStatusFilter,
  setPage,
  columnVisibility,
}) {
  return (
    <Card className="rounded-[6px] border border-border p-4 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm mã đơn nhập PO, ghi chú..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs rounded-[6px]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-56">
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 text-xs bg-background rounded-[6px] border border-input focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="">Tất cả kho nhận hàng</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} {w.isDefault ? '(Kho mặc định)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="w-64">
            <SearchableSelect
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              creatable={false}
              placeholder="Tất cả trạng thái quy trình"
            />
          </div>

          <ColumnToggleDropdown columnVisibility={columnVisibility} />
        </div>
      </div>
    </Card>
  );
}
