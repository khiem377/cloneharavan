import React from 'react';
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
  isLoading = false,
  onViewOrder,
  onOpenStatusModal,
  onOpenCancelModal,
  isColumnVisible,
}) {
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
            {isColumnVisible('payment') && <TableHead className="w-32 text-center">Thanh toán</TableHead>}
            {isColumnVisible('status') && <TableHead className="w-36 text-center">Trạng thái</TableHead>}
            {isColumnVisible('actions') && <TableHead className="text-right w-36">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="py-12 text-center text-xs text-muted-foreground font-mono">
                Đang tải dữ liệu đơn hàng...
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-12 text-center text-xs text-muted-foreground font-mono">
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
                  className="transition-colors hover:bg-muted/40 cursor-pointer"
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
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${paymentCfg.badgeClass}`}
                        >
                          {paymentCfg.label}
                        </span>
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
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${statusCfg.badgeClass}`}
                        >
                          <statusCfg.icon className="size-3 shrink-0" />
                          <span>{statusCfg.label}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {statusCfg.inventoryNote}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* Thao tác */}
                  {isColumnVisible('actions') && (
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                          <Button
                            size="sm"
                            className="h-7 px-2 text-[11px] rounded-[4px] bg-cyan-600 hover:bg-cyan-700 text-white font-medium cursor-pointer"
                            onClick={() => onOpenStatusModal(order, 'SHIPPING')}
                          >
                            Xuất kho
                          </Button>
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
