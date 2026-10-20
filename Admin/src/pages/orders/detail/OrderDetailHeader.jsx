import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  ChevronDown,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  Check,
} from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../components/OrderTable';

export default function OrderDetailHeader({
  order,
  onOpenStatusModal,
  onOpenCancelModal,
  onPrint,
}) {
  const navigate = useNavigate();

  const statusCfg = ORDER_STATUS_CONFIG[order.orderStatus] || {
    label: order.orderStatus,
    badgeClass: 'bg-muted text-muted-foreground',
  };

  const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || {
    label: order.paymentStatus,
    badgeClass: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
      {/* Left: Back button + Order code + Badges */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/orders')}
          className="size-8 p-0 rounded-[6px] border-border bg-card hover:bg-accent text-foreground cursor-pointer"
          title="Quay lại danh sách đơn hàng"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-foreground font-mono tracking-tight">
            #{order.orderCode}
          </h1>

          {/* Payment Status Badge */}
          <Badge
            variant="outline"
            className={`px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${paymentCfg.badgeClass}`}
          >
            {paymentCfg.label}
          </Badge>

          {/* Order Processing Status Badge */}
          <Badge
            variant="outline"
            className={`px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${statusCfg.badgeClass}`}
          >
            {statusCfg.label}
          </Badge>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="h-8 text-xs font-medium rounded-[6px] border-border bg-card hover:bg-accent text-foreground cursor-pointer"
        >
          <Printer className="size-3.5 mr-1 text-muted-foreground" />
          In đơn hàng
        </Button>

        {order.orderStatus === 'PENDING' && (
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenStatusModal(order, 'CONFIRMED')}
            className="h-8 text-xs font-semibold rounded-[6px] bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            <CheckCircle2 className="size-3.5 mr-1" />
            Xác nhận đơn
          </Button>
        )}

        {order.orderStatus === 'CONFIRMED' && (
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenStatusModal(order, 'SHIPPING')}
            className="h-8 text-xs font-semibold rounded-[6px] bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
          >
            <Truck className="size-3.5 mr-1" />
            Xuất kho giao hàng
          </Button>
        )}

        {order.orderStatus === 'SHIPPING' && (
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenStatusModal(order, 'DELIVERED')}
            className="h-8 text-xs font-semibold rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Check className="size-3.5 mr-1" />
            Xác nhận đã giao
          </Button>
        )}
      </div>
    </div>
  );
}
