import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const formatStepDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function OrderTimelineStepper({ order, shipment }) {
  if (!order) return null;

  const status = order.orderStatus;
  const isCancelled = status === 'CANCELLED';

  const steps = [
    {
      key: 'created',
      label: 'Đặt hàng',
      completed: true,
      date: order.createdAt,
    },
    {
      key: 'confirmed',
      label: 'Xác nhận',
      completed: ['CONFIRMED', 'SHIPPING', 'DELIVERED'].includes(status),
      date: order.statusHistory?.find((h) => h.status === 'CONFIRMED')?.changedAt || (status !== 'PENDING' ? order.updatedAt : null),
    },
    {
      key: 'picking',
      label: 'ĐTVC lấy hàng',
      completed: ['SHIPPING', 'DELIVERED'].includes(status) || (shipment && shipment.status !== 'ready_to_pick'),
      date: shipment?.createdAt || order.statusHistory?.find((h) => h.status === 'SHIPPING')?.changedAt,
    },
    {
      key: 'delivering',
      label: 'Giao hàng',
      completed: ['SHIPPING', 'DELIVERED'].includes(status),
      date: order.statusHistory?.find((h) => h.status === 'SHIPPING')?.changedAt,
    },
    {
      key: 'completed',
      label: 'Hoàn thành',
      completed: status === 'DELIVERED',
      date: order.statusHistory?.find((h) => h.status === 'DELIVERED')?.changedAt,
    },
  ];

  if (isCancelled) {
    return (
      <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-500/10">
        <CardContent className="p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
          Đơn hàng này đã bị hủy: {order.cancelReason || 'Khách hàng / Quản trị viên đã yêu cầu hủy đơn'}.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between relative">
          {steps.map((step, idx) => {
            const isDone = step.completed;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.key} className="flex-1 relative flex flex-col items-center">
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={`absolute top-2 left-1/2 w-full h-[2px] -z-0 transition-colors ${
                      steps[idx + 1].completed ? 'bg-emerald-500' : 'bg-border'
                    }`}
                  />
                )}

                {/* Dot icon */}
                <div
                  className={`size-4 rounded-full z-10 flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                      : 'bg-muted border border-border'
                  }`}
                >
                  {isDone && <span className="size-1.5 rounded-full bg-white" />}
                </div>

                {/* Label & Date */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs block ${
                      isDone ? 'font-bold text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.date && isDone && (
                    <span className="text-[10px] text-muted-foreground font-mono tabular-nums block mt-0.5">
                      {formatStepDate(step.date)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
