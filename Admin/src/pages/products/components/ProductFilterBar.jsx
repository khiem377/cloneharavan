import React from 'react';
import { LayoutList, LayoutGrid, Trash2 } from '@/components/ui/Icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/ui/SearchableSelect';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';

const STATUS_CHIPS = [
  { label: 'Tất cả', value: '' },
  { label: 'Công khai', value: 'published' },
  { label: 'Bản nháp', value: 'draft' },
  { label: 'Hết hàng', value: 'out_of_stock' },
];

export default function ProductFilterBar({
  keyword,
  onKeywordChange,
  filterCategory,
  onCategoryChange,
  categories = [],
  filterBrand,
  onBrandChange,
  brands = [],
  filterStatus,
  onStatusChange,
  columnVisibility,
  viewMode,
  onViewModeChange,
  selectedCount = 0,
  onBulkDelete,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Input
            className="h-9 w-full sm:w-64 rounded-[6px] text-xs"
            placeholder="Tìm sản phẩm, mã SKU..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />

          <SearchableSelect
            className="w-44 shrink-0"
            options={[
              { label: 'Tất cả danh mục', value: '' },
              ...(Array.isArray(categories) ? categories : []).map((c) => ({ label: c.name, value: c._id })),
            ]}
            value={filterCategory}
            onChange={onCategoryChange}
            creatable={false}
            placeholder="Tất cả danh mục"
          />

          <SearchableSelect
            className="w-44 shrink-0"
            options={[
              { label: 'Tất cả thương hiệu', value: '' },
              ...(Array.isArray(brands) ? brands : []).map((b) => ({ label: b.name, value: b._id })),
            ]}
            value={filterBrand}
            onChange={onBrandChange}
            creatable={false}
            placeholder="Tất cả thương hiệu"
          />

          <SearchableSelect
            className="w-40 shrink-0"
            options={[
              { label: 'Tất cả trạng thái', value: '' },
              { label: 'Công khai', value: 'published' },
              { label: 'Nháp', value: 'draft' },
              { label: 'Hết hàng', value: 'out_of_stock' },
            ]}
            value={filterStatus}
            onChange={onStatusChange}
            creatable={false}
            placeholder="Tất cả trạng thái"
          />
        </div>

        <div className="flex items-center gap-2">
          <ColumnToggleDropdown columnVisibility={columnVisibility} />
          <div className="flex items-center rounded-[6px] border border-border bg-muted p-0.5">
            <button
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-background text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onViewModeChange('table')}
              title="Bảng"
            >
              <LayoutList size={15} />
            </button>
            <button
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onViewModeChange('grid')}
              title="Lưới"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="rounded-[6px] text-xs font-semibold h-9"
              onClick={onBulkDelete}
            >
              <Trash2 size={14} className="mr-1.5" /> Xóa {selectedCount}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Status Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-muted-foreground font-medium shrink-0">Lọc nhanh:</span>
        {STATUS_CHIPS.map((chip) => {
          const isActive = filterStatus === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => onStatusChange(chip.value)}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
