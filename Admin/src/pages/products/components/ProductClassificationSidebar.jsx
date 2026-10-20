import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import SearchableSelect from '@/components/ui/SearchableSelect';
import CategoryTreeMultiPicker from './CategoryTreeMultiPicker';

/**
 * Product Categories, Brand, Supplier and Status Sidebar Card
 */
export default function ProductClassificationSidebar({
  form,
  setField,
  categories = [],
  brands = [],
  suppliers = [],
  warehouses = [],
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">Phân loại & Trạng thái</CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Kho thao tác (Pancake POS style) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Kho thao tác</span>
            <span className="text-[10px] text-muted-foreground font-mono">Pancake POS</span>
          </label>
          <SearchableSelect
            options={[
              { label: 'Tất cả các kho', value: 'all' },
              ...(Array.isArray(warehouses) ? warehouses : []).map((w) => ({
                label: `${w.name} ${w.isDefault ? '(Kho mặc định)' : ''}`,
                value: w._id,
              })),
            ]}
            value={form.warehouseId || 'all'}
            onChange={(v) => setField('warehouseId', v)}
            creatable={false}
            placeholder="-- Chọn kho thao tác --"
          />
          <p className="text-[11px] text-muted-foreground">
            {form.warehouseId === 'all'
              ? 'Tồn kho ban đầu sẽ ghi nhận vào kho mặc định và đồng bộ trạng thái.'
              : 'Tồn kho ban đầu sẽ ghi nhận trực tiếp vào kho đã chọn.'}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Danh mục <span className="text-destructive ml-0.5">*</span>
          </label>
          <CategoryTreeMultiPicker
            categories={Array.isArray(categories) ? categories : []}
            value={form.categories}
            onChange={(v) => setField('categories', v)}
          />
          {form.categories.length === 0 && (
            <p className="text-[11px] text-muted-foreground">Có thể chọn nhiều danh mục</p>
          )}
        </div>

        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Thương hiệu</label>
          <SearchableSelect
            options={(Array.isArray(brands) ? brands : []).map((b) => ({
              label: b.name,
              value: b._id,
            }))}
            value={form.brand}
            onChange={(v) => setField('brand', v)}
            creatable={false}
            placeholder="-- Chọn thương hiệu --"
          />
        </div>

        {/* Supplier */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Nhà Cung Cấp</label>
          <SearchableSelect
            options={(Array.isArray(suppliers) ? suppliers : []).map((s) => ({
              label: `${s.name} (${s.code})`,
              value: s._id,
            }))}
            value={form.supplierId}
            onChange={(v) => setField('supplierId', v)}
            creatable={false}
            placeholder="-- Chọn nhà cung cấp --"
          />
        </div>

        {/* Product Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Trạng thái sản phẩm</label>
          <SearchableSelect
            options={[
              { label: 'Công khai', value: 'published' },
              { label: 'Nháp', value: 'draft' },
              { label: 'Hết hàng', value: 'out_of_stock' },
            ]}
            value={form.status}
            onChange={(v) => setField('status', v)}
            creatable={false}
            placeholder="Chọn trạng thái..."
          />
        </div>

        {/* Visibility Flags */}
        <div className="flex flex-col gap-2.5 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Checkbox
              id="prod-is-active"
              checked={form.isActive}
              onCheckedChange={(checked) => setField('isActive', checked)}
            />
            <label htmlFor="prod-is-active" className="text-xs font-medium text-foreground cursor-pointer select-none">
              Kích hoạt hiển thị sản phẩm
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="prod-is-featured"
              checked={form.isFeatured}
              onCheckedChange={(checked) => setField('isFeatured', checked)}
            />
            <label htmlFor="prod-is-featured" className="text-xs font-medium text-foreground cursor-pointer select-none">
              Sản phẩm nổi bật
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="prod-is-hot"
              checked={form.isHot}
              onCheckedChange={(checked) => setField('isHot', checked)}
            />
            <label htmlFor="prod-is-hot" className="text-xs font-medium text-foreground cursor-pointer select-none">
              Sản phẩm HOT
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
