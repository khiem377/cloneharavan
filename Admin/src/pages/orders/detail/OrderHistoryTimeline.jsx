import React from 'react';
import { History } from '@/components/ui/Icons';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { ORDER_STATUS_CONFIG } from '../components/OrderTable';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDateGroup = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export default function OrderHistoryTimeline({ order, shipment }) {
  const events = [];

  // Mốc khởi tạo
  if (order.createdAt) {
    events.push({
      time: order.createdAt,
      actor: 'Khách hàng',
      action: `Đã tạo mới đơn hàng #${order.orderCode} qua Website`,
    });
  }

  // Mốc thanh toán
  if (order.paymentStatus === 'PAID') {
    events.push({
      time: order.updatedAt || order.createdAt,
      actor: 'Hệ thống Sapo',
      action: `Khoản thanh toán được xác nhận thông qua ${order.paymentMethod || 'Cổng thanh toán'}`,
    });
  }

  // Mốc statusHistory của đơn hàng
  if (order.statusHistory && order.statusHistory.length > 0) {
    order.statusHistory.forEach((h) => {
      const label = ORDER_STATUS_CONFIG[h.status]?.label || h.status;
      events.push({
        time: h.changedAt,
        actor: 'Admin Cửa hàng',
        action: `Cập nhật trạng thái đơn sang: ${label} ${h.note ? `(${h.note})` : ''}`,
      });
    });
  }

  // Mốc từ vận đơn (Shipment)
  if (shipment?.historyLogs && shipment.historyLogs.length > 0) {
    shipment.historyLogs.forEach((log) => {
      events.push({
        time: log.updatedAt,
        actor: shipment.carrierName || 'Vận chuyển',
        action: log.description || log.status,
      });
    });
  }

  // Sắp xếp thời gian giảm dần (mới nhất lên trên)
  events.sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader className="px-5 py-3.5 border-b border-border bg-muted/20 flex flex-row items-center gap-2 space-y-0">
        <History className="size-4 text-primary" />
        <CardTitle className="text-xs font-bold text-foreground">Lịch sử đơn hàng</CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <div className="text-[11px] font-bold text-muted-foreground font-mono mb-3">
          {formatDateGroup(order.createdAt)}
        </div>

        <div className="space-y-4 relative pl-4 border-l-2 border-primary/20 ml-1.5">
          {events.map((ev, idx) => (
            <div key={idx} className="relative text-xs">
              <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary ring-4 ring-background" />

              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono tabular-nums text-muted-foreground text-[11px]">
                  {formatTime(ev.time)}
                </span>
                <span className="font-semibold text-foreground text-xs">
                  {ev.actor}
                </span>
                <span className="text-muted-foreground text-xs">
                  {ev.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
