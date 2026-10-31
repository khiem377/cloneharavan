import React from 'react';
import { Loader2 } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import DateTimePicker from '@/components/ui/DateTimePicker';
import PriceInput from '@/components/ui/PriceInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import ItemSearchInput from './ItemSearchInput';
import PromotionDiscountFields from './PromotionDiscountFields';

export default function PromotionFormModal({
  showForm,
  setShowForm,
  editTarget,
  form,
  setForm,
  allProducts,
  allCategories,
  handleSubmit,
  isMutating,
}) {
  return (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-[6px] border border-border">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-base font-semibold">
            {editTarget ? 'Cập nhật chương trình' : 'Tạo chương trình khuyến mãi'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Tên chương trình <span className="text-destructive">*</span></label>
              <Input
                className="h-9 rounded-[6px]"
                placeholder="VD: Giảm giá mùa hè 20%"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Mô tả</label>
              <textarea
                className="w-full rounded-[6px] border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-ring resize-none placeholder:text-muted-foreground"
                rows={2}
                placeholder="Mô tả ngắn về chương trình..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loại &amp; Mức giảm giá</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Loại khuyến mãi <span className="text-destructive">*</span></label>
              <select
                disabled={!!editTarget}
                className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer disabled:opacity-60"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="percent_discount">Giảm theo phần trăm (%)</option>
                <option value="fixed_discount">Giảm số tiền cố định (đ)</option>
                <option value="buy_x_pay_y">Mua X trả Y (VD: Mua 3 trả 2)</option>
                <option value="quantity_discount">Giảm theo số lượng mua</option>
              </select>
            </div>

            <PromotionDiscountFields form={form} setForm={setForm} />
          </div>

          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phạm vi áp dụng</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Áp dụng cho <span className="text-destructive">*</span></label>
              <select
                className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer"
                value={form.scopeType}
                onChange={(e) => setForm((f) => ({ ...f, scopeType: e.target.value, scopeProducts: [], scopeCategories: [] }))}
              >
                <option value="all">Tất cả sản phẩm</option>
                <option value="categories">Danh mục cụ thể</option>
                <option value="products">Sản phẩm cụ thể</option>
              </select>
            </div>
            {form.scopeType === 'products' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Chọn sản phẩm <span className="text-destructive">*</span></label>
                <ItemSearchInput
                  items={form.scopeProducts}
                  onAdd={(p) => setForm((f) => ({ ...f, scopeProducts: [...f.scopeProducts, p] }))}
                  onRemove={(id) => setForm((f) => ({ ...f, scopeProducts: f.scopeProducts.filter((p) => p.id !== id) }))}
                  placeholder="Tìm theo tên sản phẩm..."
                  allItems={allProducts}
                  thumbKey="thumbnail"
                />
              </div>
            )}
            {form.scopeType === 'categories' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Chọn danh mục <span className="text-destructive">*</span></label>
                <ItemSearchInput
                  items={form.scopeCategories}
                  onAdd={(c) => setForm((f) => ({ ...f, scopeCategories: [...f.scopeCategories, c] }))}
                  onRemove={(id) => setForm((f) => ({ ...f, scopeCategories: f.scopeCategories.filter((c) => c.id !== id) }))}
                  placeholder="Tìm theo tên danh mục..."
                  allItems={allCategories}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Điều kiện &amp; Thời gian</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Đơn hàng tối thiểu (đ)</label>
                <PriceInput
                  className="h-9 rounded-[6px]"
                  placeholder="VD: 200.000 (để trống = 0)"
                  value={form.minOrderValue}
                  onChange={(val) => setForm((f) => ({ ...f, minOrderValue: val }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Giới hạn số lượt dùng</label>
                <Input
                  type="number"
                  min={1}
                  className="h-9 rounded-[6px] font-mono"
                  placeholder="Không giới hạn"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Ngày bắt đầu <span className="text-destructive">*</span></label>
                <DateTimePicker
                  value={form.startDate}
                  onChange={(val) => setForm((f) => ({ ...f, startDate: val }))}
                  placeholder="Chọn ngày bắt đầu..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Ngày kết thúc <span className="text-destructive">*</span></label>
                <DateTimePicker
                  value={form.endDate}
                  onChange={(val) => setForm((f) => ({ ...f, endDate: val }))}
                  placeholder="Chọn ngày kết thúc..."
                  align="right"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <label htmlFor="isActive" className="text-xs font-medium text-foreground cursor-pointer select-none">
                Kích hoạt ngay sau khi tạo
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 bg-muted/20 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-[6px]" onClick={() => setShowForm(false)}>
            Hủy
          </Button>
          <Button size="sm" disabled={isMutating} onClick={handleSubmit} className="h-9 rounded-[6px] active:scale-[0.98] transition-transform">
            {isMutating && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            {editTarget ? 'Lưu thay đổi' : 'Tạo chương trình'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
