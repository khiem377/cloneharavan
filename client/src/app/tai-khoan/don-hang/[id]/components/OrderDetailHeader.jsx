'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  Printer,
  Ban,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ORDER_STATUS_MAP = {
  PENDING: {
    label: 'Chờ xác nhận',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đang xử lý',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle2,
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Đã hoàn tất',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: Ban,
  },
  RETURNED: {
    label: 'Trả hàng/Hoàn tiền',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: AlertCircle,
  },
};

const PAYMENT_STATUS_MAP = {
  PAID: {
    label: 'Đã thanh toán',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  UNPAID: {
    label: 'Chưa thanh toán',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  PARTIAL: {
    label: 'Thanh toán 1 phần',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  FAILED: {
    label: 'Thanh toán thất bại',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export default function OrderDetailHeader({
  order,
  shipment: propShipment,
  onCancel,
  isCancelling,
}) {
  const shipment = propShipment || order?.shipment;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!order?.orderCode) return;
    navigator.clipboard?.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  let statusConfig = ORDER_STATUS_MAP[order?.orderStatus] || {
    label: order?.orderStatus || 'Không xác định',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: AlertCircle,
  };

  // Nếu đơn hàng đã có vận đơn thì hiển thị đúng trạng thái của vận đơn
  if (shipment) {
    if (shipment.status === 'ready_to_pick') {
      statusConfig = {
        label: shipment.statusText || 'Chờ lấy hàng',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
      };
    } else if (shipment.status === 'delivering' || shipment.status === 'picking') {
      statusConfig = {
        label: shipment.statusText || 'Đang giao hàng',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Truck,
      };
    } else if (shipment.status === 'delivered') {
      statusConfig = {
        label: shipment.statusText || 'Đã giao hàng',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    }
  }

  const StatusIcon = statusConfig.icon;

  const paymentConfig = PAYMENT_STATUS_MAP[order?.paymentStatus] || {
    label: order?.paymentStatus || 'Chưa thanh toán',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const canCancel = order?.orderStatus === 'PENDING' && !shipment;

  return (
    <div className="space-y-4">
      {/* Top Nav Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/tai-khoan?tab=orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Quay lại danh sách đơn hàng</span>
        </Link>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-8 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 rounded-[6px] gap-1.5 cursor-pointer print:hidden"
        >
          <Printer size={13} />
          <span>In đơn hàng</span>
        </Button>
      </div>

      {/* Main Order Identity Header Card */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Đơn hàng</span>
              <span className="font-mono text-[#e30019]">#{order?.orderCode}</span>
            </h1>

            <button
              type="button"
              onClick={handleCopy}
              title="Sao chép mã đơn"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check size={14} className="text-emerald-600" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Ngày đặt hàng:{' '}
            <span className="font-mono font-medium text-slate-700">
              {order?.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}
            </span>
          </p>
        </div>

        {/* Status Badges & Action */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <Badge
            variant="outline"
            className={`text-xs font-semibold px-2.5 py-1 rounded-[6px] border flex items-center gap-1.5 ${statusConfig.badgeClass}`}
          >
            <StatusIcon size={13} />
            <span>{statusConfig.label}</span>
          </Badge>

          <Badge
            variant="outline"
            className={`text-xs font-medium px-2.5 py-1 rounded-[6px] border ${paymentConfig.badgeClass}`}
          >
            {paymentConfig.label}
          </Badge>

          {canCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isCancelling}
              onClick={onCancel}
              className="h-8 text-xs font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-[6px] cursor-pointer"
            >
              {isCancelling ? (
                <Loader2 size={12} className="animate-spin mr-1.5" />
              ) : (
                <Ban size={12} className="mr-1.5" />
              )}
              <span>Hủy đơn</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
