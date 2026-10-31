import React from 'react';
import {
  Globe,
  Phone,
  Mail,
  XCircle,
} from '@/components/ui/Icons';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function OrderSidebarInfo({
  order,
  onOpenCancelModal,
}) {
  const addr = order.shippingAddress || {};
  const fullAddress = [addr.detailAddress, addr.ward, addr.district, addr.province]
    .filter(Boolean)
    .join(', ');

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.orderStatus);

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Nguồn đơn */}
      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold text-foreground">Nguồn đơn</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Globe className="size-4 text-emerald-500" />
            <span>Website bán hàng</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Khách hàng */}
      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold text-foreground">Khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="space-y-1">
            <p className="font-semibold text-primary">
              {order.customerName || addr.fullName || order.userId?.fullName || order.userId?.name || 'Khách vãng lai'}
            </p>
            <Badge variant="secondary" className="text-[10px] font-normal py-0 px-1.5">
              Nhóm: Khách hàng bán lẻ
            </Badge>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <span className="font-medium text-foreground block">Thông tin liên hệ</span>
            {(order.customerPhone || addr.phone || order.userId?.phone) ? (
              <div className="flex items-center gap-1.5 font-mono text-foreground">
                <Phone className="size-3 text-muted-foreground" />
                <span>{order.customerPhone || addr.phone || order.userId?.phone}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-[11px]">Không có số điện thoại</span>
            )}

            {(order.customerEmail || addr.email || order.userId?.email) ? (
              <div className="flex items-center gap-1.5 text-foreground">
                <Mail className="size-3 text-muted-foreground" />
                <span className="truncate">{order.customerEmail || addr.email || order.userId?.email}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-[11px] block">Không có email</span>
            )}
          </div>

          <Separator />

          <div className="space-y-1">
            <span className="font-medium text-foreground block">Địa chỉ giao hàng</span>
            <p className="text-muted-foreground leading-relaxed">
              {fullAddress || 'Không có địa chỉ giao hàng'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Ghi chú */}
      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold text-foreground">Ghi chú</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-muted-foreground italic leading-relaxed">
            {order.note || 'Chưa có ghi chú cho đơn hàng này.'}
          </p>
        </CardContent>
      </Card>

      {/* 4. Thông tin bổ sung */}
      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold text-foreground">Thông tin bổ sung</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Chi nhánh:</span>
            <span className="font-medium text-foreground">Cửa hàng chính</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Nhân viên tạo đơn:</span>
            <span className="font-medium text-foreground">Admin Cửa hàng</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ngày đặt hàng:</span>
            <span className="font-mono text-foreground">
              {formatDateTime(order.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 5. Nút Hủy / Xóa đơn hàng */}
      {canCancel && (
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenCancelModal(order)}
            className="w-full h-9 rounded-[6px] text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 cursor-pointer"
          >
            <XCircle className="size-3.5 mr-1" />
            Hủy đơn hàng này
          </Button>
        </div>
      )}
    </div>
  );
}
