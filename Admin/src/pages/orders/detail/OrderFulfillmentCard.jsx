import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  ExternalLink,
  PackageCheck,
} from '@/components/ui/Icons';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

export default function OrderFulfillmentCard({ order, shipment }) {
  const isDelivered = order.orderStatus === 'DELIVERED';
  const isShipping = order.orderStatus === 'SHIPPING';
  const isConfirmed = order.orderStatus === 'CONFIRMED';
  const isStockExported = !!order.isStockExported || order.stockExport?.status === 'completed';

  const statusTitle = isDelivered
    ? 'Đã giao hàng'
    : isShipping
    ? 'Đang giao hàng'
    : isConfirmed
    ? (isStockExported ? 'Đã đóng gói xuất kho (Chờ tạo vận đơn)' : 'Chờ xuất kho & Giao hàng')
    : 'Đang xử lý đơn hàng';

  const statusDotColor = isDelivered
    ? 'bg-emerald-500'
    : isShipping
    ? 'bg-cyan-500'
    : isStockExported
    ? 'bg-blue-500'
    : 'bg-amber-500';

  return (
    <Card className="overflow-hidden border-border bg-card">
      {/* Header */}
      <CardHeader className="px-5 py-3.5 border-b border-border bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${statusDotColor}`} />
          <CardTitle className="text-xs font-bold text-foreground">{statusTitle}</CardTitle>
        </div>

        <div className="flex items-center gap-2">
          {(isConfirmed || order.orderStatus === 'PENDING') && (
            isStockExported ? (
              <Link
                to={`/shipments?action=create&orderId=${order._id}&orderCode=${order.orderCode}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-[6px] bg-blue-600 text-white hover:bg-blue-700 shadow-2xs active:scale-[0.98]"
              >
                <Truck className="size-3.5" />
                <span>Tạo vận đơn giao hàng</span>
              </Link>
            ) : (
              <Link
                to={`/stock-exports?orderId=${order._id}&orderCode=${order.orderCode}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-[6px] bg-cyan-600 text-white hover:bg-cyan-700 shadow-2xs active:scale-[0.98]"
              >
                <PackageCheck className="size-3.5" />
                <span>Xuất kho giao hàng</span>
              </Link>
            )
          )}

          {shipment?.trackingCode && (
            <Link
              to="/shipments"
              className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Chi tiết vận đơn</span>
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
      </CardHeader>

      {/* Thông tin liên kết Vận đơn */}
      <CardContent className="p-0">
        <div className="p-5 bg-muted/5 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-28 shrink-0">Chi nhánh:</span>
            <span className="font-semibold text-foreground">
              {shipment?.warehouseName || 'Cửa hàng chính'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-28 shrink-0">Kiện hàng:</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-bold text-foreground">
                {shipment?.shipmentCode || (order.stockExport ? order.stockExport.exportNumber : `PKG-${order.orderCode}`)}
              </span>
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 rounded-[4px] font-normal">
                {isStockExported ? 'Đã đóng gói xuất kho' : 'Chờ đóng gói'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-28 shrink-0">NV phụ trách:</span>
            <span className="text-foreground font-medium">Admin Cửa hàng</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-28 shrink-0">Phiếu giao hàng:</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-semibold text-foreground">
                {shipment?.shipmentCode || order.orderCode}
              </span>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 rounded-[4px]">
                Đã in
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 md:col-span-2 pt-2 border-t border-dashed border-border">
            <span className="text-muted-foreground w-28 shrink-0">Vận chuyển:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Truck className="size-3.5 text-primary" />
              <span className="font-bold text-foreground uppercase">
                {shipment?.carrierName || order.shippingMethod || 'Đối tác vận chuyển'}
              </span>
              {shipment?.trackingCode && (
                <Badge variant="outline" className="font-mono text-primary font-bold bg-primary/5 border-primary/20">
                  #{shipment.trackingCode}
                </Badge>
              )}
              {shipment?.statusText && (
                <span className="text-muted-foreground text-[11px]">
                  ({shipment.statusText})
                </span>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Danh sách sản phẩm trong kiện bằng shadcn Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 text-xs">
              <TableHead className="min-w-[240px]">Sản phẩm</TableHead>
              <TableHead className="w-20 text-center">Số lượng</TableHead>
              <TableHead className="w-28 text-right">Đơn giá</TableHead>
              <TableHead className="w-28 text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items?.map((item, idx) => (
              <TableRow key={item._id || idx} className="text-xs">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-[4px] border border-border overflow-hidden bg-secondary/40 shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.productName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground">
                          <Package className="size-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground truncate text-xs">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        {item.variantName && <span>Phân loại: {item.variantName}</span>}
                        {item.sku && <span className="font-mono">SKU: {item.sku}</span>}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono tabular-nums text-foreground">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {formatCurrency(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-bold text-foreground">
                  {formatCurrency(item.lineTotal || item.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
