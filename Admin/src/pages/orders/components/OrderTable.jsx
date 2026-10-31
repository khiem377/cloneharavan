import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  CheckCircle2,
  Truck,
  Check,
  XCircle,
  Copy,
  Clock,
  RotateCcw,
  AlertCircle,
} from '@/components/ui/Icons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/providers/ToastProvider';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} ${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return '—';
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ duyệt',
    inventoryNote: 'Đang giữ chỗ tồn kho',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã duyệt',
    inventoryNote: 'Chờ đóng gói xuất kho',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    icon: CheckCircle2,
  },
  SHIPPING: {
    label: 'Đang giao',
    inventoryNote: 'Đã trừ tồn kho vật lý',
    badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Hoàn tất',
    inventoryNote: 'Giao hàng thành công',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    icon: Check,
  },
  CANCELLED: {
    label: 'Đã hủy',
    inventoryNote: 'Đã giải phóng kho',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    icon: XCircle,
  },
  RETURNED: {
    label: 'Hoàn hàng',
    inventoryNote: 'Đã hoàn kho vật lý',
    badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
    icon: RotateCcw,
  },
};

export const PAYMENT_STATUS_CONFIG = {
  UNPAID: {
    label: 'Chưa thanh toán',
    badgeClass: 'bg-muted text-muted-foreground border border-border',
  },
  PAID: {
    label: 'Đã thanh toán',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  },
};

export default function OrderTable({
  orders = [],
  shipmentsMap = {},
  isLoading = false,
  onViewOrder,
  onOpenStatusModal,
  onOpenCancelModal,
  onCreateShipment,
  isColumnVisible,
}) {
  const navigate = useNavigate();

  const copyOrderCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã đơn: ${code}`);
  };

  return (
    <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
            {isColumnVisible('orderCode') && <TableHead className="w-36">Mã đơn hàng</TableHead>}
            {isColumnVisible('createdAt') && <TableHead className="w-36">Thời gian đặt</TableHead>}
            {isColumnVisible('customer') && <TableHead>Khách hàng</TableHead>}
            {isColumnVisible('itemsSummary') && <TableHead>Sản phẩm</TableHead>}
            {isColumnVisible('address') && <TableHead>Địa chỉ giao</TableHead>}
            {isColumnVisible('totalAmount') && <TableHead className="text-right w-32">Tổng tiền</TableHead>}
            {isColumnVisible('payment') && <TableHead className="w-32 text-center">Trạng thái thanh toán</TableHead>}
            {isColumnVisible('status') && <TableHead className="w-36 text-center">Trạng thái xử lý</TableHead>}
            {isColumnVisible('shipping') && <TableHead className="w-40">Dịch vụ vận chuyển</TableHead>}
            {isColumnVisible('actions') && (
              <TableHead className="text-right w-36 sticky right-0 z-20 bg-secondary/95 dark:bg-secondary shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70">
                Thao tác
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                {isColumnVisible('orderCode') && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                {isColumnVisible('createdAt') && <TableCell><Skeleton className="h-4 w-28" /></TableCell>}
                {isColumnVisible('customer') && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                {isColumnVisible('itemsSummary') && <TableCell><Skeleton className="h-4 w-36" /></TableCell>}
                {isColumnVisible('address') && <TableCell><Skeleton className="h-4 w-40" /></TableCell>}
                {isColumnVisible('totalAmount') && <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>}
                {isColumnVisible('payment') && <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto rounded-[4px]" /></TableCell>}
                {isColumnVisible('status') && <TableCell className="text-center"><Skeleton className="h-5 w-24 mx-auto rounded-[4px]" /></TableCell>}
                {isColumnVisible('shipping') && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                {isColumnVisible('actions') && (
                  <TableCell className="text-right sticky right-0 z-10 bg-background shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70">
                    <Skeleton className="h-7 w-16 ml-auto rounded-[4px]" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center text-xs text-muted-foreground font-mono">
                Không tìm thấy đơn hàng nào phù hợp
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const statusCfg = ORDER_STATUS_CONFIG[order.orderStatus] || {
                label: order.orderStatus,
                badgeClass: 'bg-muted text-muted-foreground',
                icon: AlertCircle,
              };
              const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || {
                label: order.paymentStatus,
                badgeClass: 'bg-muted text-muted-foreground',
              };

              const itemCount = order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0;
              const firstItem = order.items?.[0];

              return (
                <TableRow
                  key={order._id}
                  className="group transition-colors hover:bg-muted/40 cursor-pointer"
                  onClick={() => onViewOrder(order)}
                >
                  {/* Mã đơn */}
                  {isColumnVisible('orderCode') && (
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onViewOrder(order)}
                          className="hover:underline font-bold"
                        >
                          {order.orderCode}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyOrderCode(order.orderCode)}
                          className="p-1 rounded-[4px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Sao chép mã đơn"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                    </TableCell>
                  )}

                  {/* Thời gian đặt */}
                  {isColumnVisible('createdAt') && (
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  )}

                  {/* Khách hàng */}
                  {isColumnVisible('customer') && (
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-foreground">
                          {order.shippingAddress?.fullName || 'Khách vãng lai'}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {order.shippingAddress?.phone || '—'}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* Sản phẩm snapshot */}
                  {isColumnVisible('itemsSummary') && (
                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-foreground truncate font-medium">
                          {firstItem?.productName || 'Không có tên SP'}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {order.items?.length > 1
                            ? `+ ${order.items.length - 1} sản phẩm khác (Tổng: ${itemCount})`
                            : `Số lượng: ${itemCount}`}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* Địa chỉ giao */}
                  {isColumnVisible('address') && (
                    <TableCell className="max-w-[220px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-foreground line-clamp-1">
                          {order.shippingAddress?.detailAddress || ''}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {[order.shippingAddress?.ward, order.shippingAddress?.district, order.shippingAddress?.province]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                        {order.note && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 italic line-clamp-1">
                            Ghi chú: {order.note}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Tổng tiền */}
                  {isColumnVisible('totalAmount') && (
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-bold font-mono text-foreground">
                          {formatCurrency(order.pricing?.totalAmount)}
                        </span>
                        {order.pricing?.couponDiscount > 0 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            - {formatCurrency(order.pricing.couponDiscount)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Thanh toán */}
                  {isColumnVisible('payment') && (
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold py-0.5 px-2 rounded-[4px] border ${paymentCfg.badgeClass}`}
                        >
                          {paymentCfg.label}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {order.paymentMethod || 'COD'}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* Trạng thái đơn */}
                  {isColumnVisible('status') && (
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant="secondary"
                          className={`text-[11px] font-semibold py-0.5 px-2 rounded-[4px] border gap-1 ${statusCfg.badgeClass}`}
                        >
                          <statusCfg.icon className="size-3 shrink-0" />
                          <span>{statusCfg.label}</span>
                        </Badge>
                        <span className={`text-[10px] ${order.isStockExported ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-muted-foreground'}`}>
                          {order.orderStatus === 'CONFIRMED'
                            ? (order.isStockExported ? 'Đã đóng gói xuất kho' : 'Chờ đóng gói xuất kho')
                            : statusCfg.inventoryNote}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* Dịch vụ vận chuyển / Vận đơn */}
                  {isColumnVisible('shipping') && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {shipmentsMap[order.orderCode] ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                            <Truck className="size-3 text-blue-600 shrink-0" />
                            <span>{shipmentsMap[order.orderCode].carrierName}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/shipments?search=${shipmentsMap[order.orderCode].trackingCode}`)}
                            className="font-mono text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 text-left cursor-pointer"
                            title="Bấm để chuyển đến vận đơn này"
                          >
                            <span>{shipmentsMap[order.orderCode].trackingCode}</span>
                          </button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground py-0.5 px-1.5 font-normal">
                          Chưa tạo vận đơn
                        </Badge>
                      )}
                    </TableCell>
                  )}

                  {/* Thao tác */}
                  {isColumnVisible('actions') && (
                    <TableCell
                      className="text-right sticky right-0 z-10 bg-background group-hover:bg-muted/70 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Xem chi tiết"
                          onClick={() => onViewOrder(order)}
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        {/* Nút thao tác nhanh theo trạng thái */}
                        {order.orderStatus === 'PENDING' && (
                          <Button
                            size="sm"
                            className="h-7 px-2 text-[11px] rounded-[4px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer"
                            onClick={() => onOpenStatusModal(order, 'CONFIRMED')}
                          >
                            Duyệt đơn
                          </Button>
                        )}

                        {order.orderStatus === 'CONFIRMED' && (
                          order.isStockExported ? (
                            <Button
                              size="sm"
                              className="h-7 px-2 text-[11px] rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer flex items-center gap-1"
                              title="Tạo phiếu vận đơn giao hàng cho đơn đã xuất kho"
                              onClick={() => {
                                if (typeof onCreateShipment === 'function') {
                                  onCreateShipment(order);
                                } else {
                                  navigate(`/shipments?action=create&orderId=${order._id}&orderCode=${order.orderCode}`);
                                }
                              }}
                            >
                              <Truck className="size-3" />
                              <span>Tạo vận đơn</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="h-7 px-2 text-[11px] rounded-[4px] bg-cyan-600 hover:bg-cyan-700 text-white font-medium cursor-pointer"
                              title="Tạo lệnh xuất kho cho đơn hàng"
                              onClick={() => navigate(`/stock-exports?orderId=${order._id}&orderCode=${order.orderCode}`)}
                            >
                              Xuất kho
                            </Button>
                          )
                        )}

                        {order.orderStatus === 'SHIPPING' && (
                          <Button
                            size="sm"
                            className="h-7 px-2 text-[11px] rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
                            onClick={() => onOpenStatusModal(order, 'DELIVERED')}
                          >
                            Hoàn tất
                          </Button>
                        )}

                        {/* Nút hủy cho đơn PENDING hoặc CONFIRMED */}
                        {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px] rounded-[4px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 cursor-pointer"
                            onClick={() => onOpenCancelModal(order)}
                          >
                            Hủy
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
