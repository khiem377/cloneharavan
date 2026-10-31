import React from 'react';
import { Building2 } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import DateTimePicker from '@/components/ui/DateTimePicker';

export default function POSupplierInfoCard({
  subType,
  setSubType,
  supplierId,
  setSupplierId,
  suppliers,
  warehouseId,
  setWarehouseId,
  warehouses,
  referenceDoc,
  setReferenceDoc,
  deliveryDate,
  setDeliveryDate,
  note,
  setNote,
  itemCount,
  totalQuantity,
  totalAmount,
}) {
  return (
    <div className="space-y-6 lg:col-span-1">
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Thông Tin Nhà Cung Cấp
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Loại Phiếu Nhập Kho <span className="text-destructive">*</span>
            </label>
            <SearchableSelect
              options={[
                { label: 'Nhập kho mua hàng (PO)', value: 'PO_PURCHASE' },
                { label: 'Hàng bán bị trả lại', value: 'CUSTOMER_RETURN' },
                { label: 'Nhập kho khác / Tăng kho', value: 'OTHER_IMPORT' },
              ]}
              value={subType}
              onChange={(val) => setSubType(val)}
              creatable={false}
              placeholder="Chọn loại phiếu..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Chọn Nhà Cung Cấp <span className="text-destructive">*</span>
            </label>
            <SearchableSelect
              options={suppliers.map((sup) => ({
                label: `${sup.name} (${sup.code})`,
                value: sup._id,
              }))}
              value={supplierId}
              onChange={(val) => setSupplierId(val)}
              creatable={false}
              placeholder="-- Chọn nhà cung cấp --"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Kho Nhận Hàng Dự Kiến <span className="text-destructive">*</span>
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-background rounded-[6px] border border-input focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} {w.isDefault ? '(Kho mặc định)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Chứng Từ Tham Chiếu</label>
            <Input
              type="text"
              value={referenceDoc}
              onChange={(e) => setReferenceDoc(e.target.value)}
              placeholder="Ví dụ: DMH00028, PNK00039..."
              className="h-9 rounded-[6px] text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hẹn Ngày Nhận Hàng</label>
            <DateTimePicker
              value={deliveryDate}
              onChange={(val) => setDeliveryDate(val)}
              showTime={false}
              placeholder="Chọn ngày hẹn nhận hàng..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi Chú Đơn Nhập</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú đợt nhập hàng, số hóa đơn chứng từ..."
              className="w-full rounded-[6px] border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[6px] border border-border shadow-none">
        <CardHeader className="pb-2 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">Tạm Tính Đơn</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Tổng số mặt hàng:</span>
            <span className="font-semibold text-foreground tabular-nums font-mono">{itemCount} mục</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Tổng SL thực nhập:</span>
            <span className="font-semibold text-foreground tabular-nums font-mono">{totalQuantity} cái</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2.5">
            <span>Tổng Giá Trị Đơn:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {totalAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
