import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { Loader2 } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';

function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'GIAM';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const DEFAULT_FORM = {
  name: '',
  code: '',
  description: '',
  category: 'order',
  type: 'percent',
  value: 10,
  maxDiscount: '',
  minOrderValue: 0,
  usageLimit: '',
  usageLimitPerUser: 1,
  customerGroupRestriction: 'all',
  applicableCustomerGroups: [],
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  isActive: true,
};

export default function CouponFormModal({
  isOpen,
  onClose,
  editTarget,
  customerGroups = [],
  onSubmit,
  isPending,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (editTarget) {
      setForm({
        name: editTarget.name || '',
        code: editTarget.code || '',
        description: editTarget.description || '',
        category: editTarget.category || 'order',
        type: editTarget.type || 'percent',
        value: editTarget.value ?? 10,
        maxDiscount: editTarget.maxDiscount ?? '',
        minOrderValue: editTarget.minOrderValue ?? 0,
        usageLimit: editTarget.usageLimit ?? '',
        usageLimitPerUser: editTarget.usageLimitPerUser ?? 1,
        customerGroupRestriction: editTarget.customerGroupRestriction || 'all',
        applicableCustomerGroups: (editTarget.applicableCustomerGroups || []).map((g) => (g._id || g)),
        startDate: editTarget.startDate ? new Date(editTarget.startDate) : new Date(),
        endDate: editTarget.endDate ? new Date(editTarget.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: editTarget.isActive !== false,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [isOpen, editTarget]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên chương trình');
    if (!form.code.trim()) return toast.error('Vui lòng nhập mã Code');
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      category: form.category,
      type: form.type,
      value: form.type === 'free_shipping' ? 0 : Number(form.value) || 0,
      maxDiscount: form.maxDiscount !== '' ? Number(form.maxDiscount) : null,
      minOrderValue: Number(form.minOrderValue) || 0,
      usageLimit: form.usageLimit !== '' ? Number(form.usageLimit) : null,
      usageLimitPerUser: Number(form.usageLimitPerUser) || 1,
      customerGroupRestriction: form.customerGroupRestriction,
      applicableCustomerGroups: form.customerGroupRestriction === 'specific' ? form.applicableCustomerGroups : [],
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      isActive: Boolean(form.isActive),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <Card
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-xl text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold text-foreground">
            {editTarget ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá'}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[4px]" onClick={onClose}>
            ×
          </Button>
        </CardHeader>

        <CardContent className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {/* Thông tin cơ bản */}
          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-3.5 bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Tên chương trình / mã <span className="text-destructive">*</span></label>
              <Input
                className="h-8 rounded-[6px] text-xs"
                placeholder="VD: Giảm 15% mừng khai trương"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Mã Code <span className="text-destructive">*</span></label>
              <div className="flex gap-2">
                <Input
                  disabled={!!editTarget}
                  className="h-8 flex-1 rounded-[6px] font-mono text-xs font-bold uppercase disabled:opacity-60"
                  placeholder="VD: GIAM15K"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                />
                {!editTarget && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, code: generateRandomCode() }))}
                    className="h-8 rounded-[6px] text-xs font-medium"
                  >
                    Tạo mã
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Mô tả</label>
              <textarea
                className="w-full rounded-[6px] border border-input bg-background p-2.5 text-xs outline-none focus:border-ring resize-none"
                rows={2}
                placeholder="Mô tả ngắn gọn về ưu đãi..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {/* Cấu hình khuyến mãi */}
          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-3.5 bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấu hình khuyến mãi</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Phân loại Voucher</label>
              <select
                className="h-8 w-full rounded-[6px] border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
                value={form.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setForm((f) => ({
                    ...f,
                    category: newCat,
                    type: newCat === 'shipping' ? 'free_shipping' : 'percent',
                    value: newCat === 'shipping' ? 100 : 10,
                  }));
                }}
              >
                <option value="order">Mã giảm giá đơn hàng (Giảm tiền hàng)</option>
                <option value="shipping">Mã miễn / giảm phí vận chuyển (Freeship)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  {form.category === 'shipping' ? 'Hình thức giảm phí ship' : 'Loại giảm giá'}
                </label>
                <select
                  className="h-8 w-full rounded-[6px] border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, value: e.target.value === 'free_shipping' ? 100 : f.value }))}
                >
                  {form.category === 'shipping' ? (
                    <>
                      <option value="free_shipping">Miễn phí toàn bộ (Giảm 100% phí ship)</option>
                      <option value="percent">Giảm theo % phí ship</option>
                    </>
                  ) : (
                    <>
                      <option value="percent">Giảm theo phần trăm (%)</option>
                      <option value="fixed">Giảm số tiền cố định (đ)</option>
                    </>
                  )}
                </select>
              </div>

              {form.type !== 'free_shipping' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Giá trị giảm ({form.type === 'percent' ? '%' : 'VNĐ'})
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={form.type === 'percent' ? 100 : undefined}
                    className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 justify-center">
                  <span className="text-xs font-medium text-muted-foreground">Mức giảm:</span>
                  <span className="inline-flex items-center rounded-[4px] px-2 py-1 text-xs font-semibold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                    Miễn phí 100% cước ship
                  </span>
                </div>
              )}
            </div>

            {form.type === 'percent' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Giới hạn giảm tối đa (VNĐ) <span className="text-muted-foreground font-normal">(Trống = vô hạn)</span>
                </label>
                <Input
                  type="number"
                  className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                  placeholder="VD: 50000"
                  value={form.maxDiscount}
                  onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Điều kiện & Nhóm khách hàng */}
          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-3.5 bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Điều kiện & Đối tượng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Đơn tối thiểu (VNĐ)</label>
                <Input
                  type="number"
                  min={0}
                  className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                  value={form.minOrderValue}
                  onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Tổng số lượt dùng</label>
                <Input
                  type="number"
                  min={1}
                  className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                  placeholder="Vô hạn"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Lượt / khách</label>
                <Input
                  type="number"
                  min={1}
                  className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                  value={form.usageLimitPerUser}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimitPerUser: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1 border-t border-border/60">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modalRestriction"
                    checked={form.customerGroupRestriction === 'all'}
                    onChange={() => setForm((f) => ({ ...f, customerGroupRestriction: 'all' }))}
                    className="cursor-pointer"
                  />
                  <span>Tất cả khách hàng</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modalRestriction"
                    checked={form.customerGroupRestriction === 'specific'}
                    onChange={() => setForm((f) => ({ ...f, customerGroupRestriction: 'specific' }))}
                    className="cursor-pointer"
                  />
                  <span>Chỉ nhóm khách hàng chọn</span>
                </label>
              </div>

              {form.customerGroupRestriction === 'specific' && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {customerGroups.map((g) => {
                    const isSelected = form.applicableCustomerGroups?.includes(g._id);
                    return (
                      <button
                        key={g._id}
                        type="button"
                        onClick={() => {
                          setForm((f) => {
                            const prev = f.applicableCustomerGroups || [];
                            return {
                              ...f,
                              applicableCustomerGroups: isSelected
                                ? prev.filter((id) => id !== g._id)
                                : [...prev, g._id],
                            };
                          });
                        }}
                        className={`px-2 py-1 rounded-[4px] text-[11px] font-medium border transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary font-bold'
                            : 'bg-background text-muted-foreground border-border hover:border-foreground'
                        }`}
                      >
                        {g.name} ({g.code})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Thời gian & Trạng thái */}
          <div className="flex flex-col gap-3 rounded-[6px] border border-border p-3.5 bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thời gian & Trạng thái</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Ngày bắt đầu</label>
                <DateTimePicker
                  value={form.startDate}
                  onChange={(val) => setForm((f) => ({ ...f, startDate: val }))}
                  placeholder="Chọn ngày bắt đầu..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Ngày kết thúc</label>
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
                id="modal-coupon-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
              <label htmlFor="modal-coupon-active" className="text-xs text-foreground cursor-pointer select-none">
                Kích hoạt mã ngay sau khi lưu
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-[6px] text-xs" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={handleSubmit}
              className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
            >
              {isPending && <Loader2 size={13} className="animate-spin mr-1" />}
              {editTarget ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
