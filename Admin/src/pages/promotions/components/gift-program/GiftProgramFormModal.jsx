import React from 'react';
import { Loader2 } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import DateTimePicker from '@/components/ui/DateTimePicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import TagPicker from './TagPicker';
import GiftProductList from './GiftProductList';

export default function GiftProgramFormModal({
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
            {editTarget ? 'Cập nhật chương trình' : 'Tạo chương trình tặng kèm'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Tên chương trình <span className="text-destructive">*</span></label>
              <Input
                className="h-9 rounded-[6px]"
                placeholder="VD: Mua 3 tặng 1 cùng loại"
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấu hình tặng kèm</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Loại tặng kèm <span className="text-destructive">*</span></label>
              <select
                disabled={!!editTarget}
                className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer disabled:opacity-60"
                value={form.giftType}
                onChange={(e) => setForm((f) => ({ ...f, giftType: e.target.value, giftProducts: [], scopeProducts: [], scopeCategories: [], scopeType: 'all' }))}
              >
                <option value="same_product">Tặng cùng loại sản phẩm</option>
                <option value="different_product">Tặng khác loại sản phẩm</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 rounded-[6px] border border-dashed border-border p-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">1</span>
                <label className="text-xs font-semibold text-foreground">
                  Sản phẩm kích hoạt (sản phẩm mua)
                </label>
              </div>
              <select
                className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer"
                value={form.scopeType}
                onChange={(e) => setForm((f) => ({ ...f, scopeType: e.target.value, scopeProducts: [], scopeCategories: [] }))}
              >
                <option value="all">Tất cả sản phẩm trong giỏ</option>
                <option value="categories">Danh mục cụ thể</option>
                <option value="products">Sản phẩm cụ thể</option>
              </select>
              {form.scopeType === 'products' && (
                <TagPicker
                  tags={form.scopeProducts}
                  onAdd={(p) => setForm((f) => ({ ...f, scopeProducts: [...f.scopeProducts, p] }))}
                  onRemove={(id) => setForm((f) => ({ ...f, scopeProducts: f.scopeProducts.filter((p) => p.id !== id) }))}
                  placeholder="Tìm sản phẩm kích hoạt..."
                  allItems={allProducts}
                  thumbKey="thumbnail"
                />
              )}
              {form.scopeType === 'categories' && (
                <TagPicker
                  tags={form.scopeCategories}
                  onAdd={(c) => setForm((f) => ({ ...f, scopeCategories: [...f.scopeCategories, c] }))}
                  onRemove={(id) => setForm((f) => ({ ...f, scopeCategories: f.scopeCategories.filter((c) => c.id !== id) }))}
                  placeholder="Tìm danh mục kích hoạt..."
                  allItems={allCategories}
                />
              )}
              <p className="text-[11px] text-muted-foreground">
                {form.scopeType === 'all'
                  ? 'Bất kỳ sản phẩm nào trong giỏ đều tính vào điều kiện mua.'
                  : form.scopeType === 'products'
                  ? 'Chỉ các sản phẩm được chọn mới tính vào điều kiện.'
                  : 'Chỉ sản phẩm thuộc danh mục được chọn mới tính vào điều kiện.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Số lượng mua tối thiểu <span className="text-destructive">*</span></label>
                <Input
                  type="number"
                  min={1}
                  className="h-9 rounded-[6px] font-mono"
                  placeholder="VD: 3"
                  value={form.triggerQty}
                  onChange={(e) => setForm((f) => ({ ...f, triggerQty: e.target.value }))}
                />
              </div>
              {form.giftType === 'same_product' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Số lượng tặng <span className="text-destructive">*</span></label>
                  <Input
                    type="number"
                    min={1}
                    className="h-9 rounded-[6px] font-mono"
                    placeholder="VD: 1"
                    value={form.giftQty}
                    onChange={(e) => setForm((f) => ({ ...f, giftQty: e.target.value }))}
                  />
                </div>
              )}
            </div>

            {form.giftType === 'different_product' && (
              <div className="flex flex-col gap-2 rounded-[6px] border border-dashed border-border p-3 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">2</span>
                  <label className="text-xs font-semibold text-foreground">Sản phẩm được tặng <span className="text-destructive">*</span></label>
                </div>
                <GiftProductList
                  selected={form.giftProducts}
                  allProducts={allProducts}
                  onAdd={(p) => setForm((f) => ({ ...f, giftProducts: [...f.giftProducts, { productId: p._id, name: p.name, qty: 1 }] }))}
                  onRemove={(id) => setForm((f) => ({ ...f, giftProducts: f.giftProducts.filter((g) => g.productId !== id) }))}
                  onQtyChange={(id, qty) => setForm((f) => ({ ...f, giftProducts: f.giftProducts.map((g) => g.productId === id ? { ...g, qty: Number(qty) } : g) }))}
                />
                <p className="text-[11px] text-muted-foreground">Các sản phẩm này sẽ được thêm miễn phí vào đơn hàng khi điều kiện được thỏa mãn.</p>
              </div>
            )}

            {form.giftType === 'same_product' && (
              <p className="text-xs text-muted-foreground bg-blue-500/5 border border-blue-500/20 rounded-[6px] px-3 py-2">
                Sản phẩm tặng = sản phẩm mua (cùng loại). Hệ thống tự động thêm <strong>số lượng tặng</strong> của chính sản phẩm đó vào đơn.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Giới hạn &amp; Thời gian</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Giới hạn số suất quà tặng <span className="text-muted-foreground font-normal">(Để trống = không giới hạn)</span></label>
              <Input
                type="number"
                min={1}
                className="h-9 rounded-[6px] font-mono"
                placeholder="Không giới hạn số suất (chỉ phụ thuộc tồn kho)"
                value={form.giftLimit}
                onChange={(e) => setForm((f) => ({ ...f, giftLimit: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground">
                Hệ thống luôn tự động kiểm tra tồn kho thực tế của sản phẩm quà tặng trước khi đính kèm vào đơn.
              </p>
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
                id="giftIsActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <label htmlFor="giftIsActive" className="text-xs font-medium text-foreground cursor-pointer select-none">
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
