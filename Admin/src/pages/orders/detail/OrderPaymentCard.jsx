import React from 'react';
import { Receipt } from '@/components/ui/Icons';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

export default function OrderPaymentCard({ order }) {
  const isPaid = order.paymentStatus === 'PAID';
  const itemCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || order.items?.length || 0;

  return (
    <div className="space-y-4">
      {/* Khối Thanh toán */}
      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="px-5 py-3.5 border-b border-border bg-muted/20 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full ${
                isPaid ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <CardTitle className="text-xs font-bold text-foreground">
              {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </CardTitle>
          </div>

          <Badge variant="outline" className="text-xs font-mono uppercase">
            {order.paymentMethod === 'COD' ? 'Thu hộ COD' : order.paymentMethod || 'Chuyển khoản'}
          </Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Tổng tiền hàng ({itemCount} sản phẩm):</span>
            <span className="font-mono text-foreground font-medium">
              {formatCurrency(order.pricing?.subtotal)}
            </span>
          </div>

          {order.pricing?.couponDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span>Mã giảm giá ({order.pricing?.couponCode || 'Khuyến mãi'}):</span>
              <span className="font-mono font-medium">
                - {formatCurrency(order.pricing.couponDiscount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-muted-foreground">
            <span>Phí vận chuyển:</span>
            <span className="font-mono text-foreground font-medium">
              {order.pricing?.shippingFee === 0
                ? 'Miễn phí'
                : formatCurrency(order.pricing?.shippingFee)}
            </span>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between font-bold text-xs">
            <span className="text-foreground">Thành tiền:</span>
            <span className="font-mono text-foreground font-bold">
              {formatCurrency(order.pricing?.totalAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-dashed border-border text-xs">
            <span className="text-muted-foreground">
              Khách đã trả ({order.paymentMethod || 'Tiền mặt'}):
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(isPaid ? order.pricing?.totalAmount : 0)}
            </span>
          </div>

          {!isPaid && (
            <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 pt-1">
              <span>Cần thu của khách (COD):</span>
              <span className="font-mono">
                {formatCurrency(order.pricing?.totalAmount)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Khối Hóa đơn điện tử (Chuẩn Sapo) */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Chưa yêu cầu hóa đơn điện tử</span>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-[11px] font-medium text-primary hover:underline cursor-pointer"
          >
            Yêu cầu hóa đơn
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
