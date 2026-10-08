import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">Phân loại & Trạng thái</CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
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
          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
            <input
              type="checkbox"
              className="size-3.5 rounded-[4px] border-input text-primary focus:ring-ring cursor-pointer"
              checked={form.isActive}
              onChange={(e) => setField('isActive', e.target.checked)}
            />
            <span>Kích hoạt hiển thị sản phẩm</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
            <input
              type="checkbox"
              className="size-3.5 rounded-[4px] border-input text-primary focus:ring-ring cursor-pointer"
              checked={form.isFeatured}
              onChange={(e) => setField('isFeatured', e.target.checked)}
            />
            <span>Sản phẩm nổi bật</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
            <input
              type="checkbox"
              className="size-3.5 rounded-[4px] border-input text-primary focus:ring-ring cursor-pointer"
              checked={form.isHot}
              onChange={(e) => setField('isHot', e.target.checked)}
            />
            <span>Sản phẩm HOT</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
