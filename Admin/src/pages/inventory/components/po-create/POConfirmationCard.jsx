import React from 'react';
import { ShieldCheck, ArrowLeft, Save, CheckCircle2 } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function POConfirmationCard({
  selectedSupplier,
  deliveryDate,
  itemCount,
  totalQuantity,
  totalAmount,
  onBackToStep2,
  onSubmit,
  isPending,
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardHeader className="text-center pb-4 border-b border-border">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-2 mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold text-foreground">BƯỚC 3: Chốt Đơn Nhập Kho</CardTitle>
          <p className="text-xs text-muted-foreground">
            Lựa chọn Lưu bản nháp hoặc Xác nhận chính thức nhập kho hệ thống
          </p>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          <div className="space-y-2.5 bg-muted/30 p-4 rounded-[6px] border border-border text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nhà cung cấp:</span>
              <span className="font-bold text-foreground">{selectedSupplier?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hẹn ngày nhận:</span>
              <span className="font-medium text-foreground">{deliveryDate || 'Hôm nay'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng số mặt hàng:</span>
              <span className="font-mono font-bold text-foreground tabular-nums">{itemCount} loại sản phẩm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng số lượng thực đếm:</span>
              <span className="font-mono font-bold text-emerald-600 tabular-nums">{totalQuantity} cái</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2.5 text-sm">
              <span className="font-bold text-foreground">Tổng Giá Trị Nghiệm Thu:</span>
              <span className="font-mono font-bold text-emerald-600 tabular-nums text-base">
                {totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToStep2}
              className="h-8 rounded-[6px] text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Quay Lại Bảng Excel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSubmit('draft')}
                disabled={isPending}
                className="h-8 rounded-[6px] text-xs font-medium active:scale-[0.98]"
              >
                <Save className="h-3.5 w-3.5 mr-1" /> Lưu Bản Nháp
              </Button>
              <Button
                size="sm"
                onClick={() => onSubmit('completed')}
                disabled={isPending}
                className="h-8 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-[0.98]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {isPending ? 'Đang Xử Lý...' : 'Xác Nhận Tạo Đơn & Nhập Kho'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
