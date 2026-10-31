import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, TicketPercent } from '@/components/ui/Icons';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CouponUsageHistoryModal({
  isOpen,
  onClose,
  coupon,
}) {
  if (!isOpen || !coupon) return null;

  const usedCount = coupon.usedCount || 0;
  const historyList = coupon.usageHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <Card
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-sm text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <History size={16} className="text-primary" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Lịch sử sử dụng: <span className="font-mono text-primary font-bold">{coupon.code}</span>
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[6px] active:scale-[0.98]" onClick={onClose}>
            ×
          </Button>
        </CardHeader>

        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-[6px] bg-muted/30 border border-border text-xs">
            <div>
              <span className="text-muted-foreground">Tổng lượt đã dùng:</span>{' '}
              <strong className="font-mono text-foreground">{usedCount} lượt</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Giới hạn:</span>{' '}
              <span className="font-mono text-foreground">{coupon.usageLimit ? `${coupon.usageLimit} lượt` : 'Vô hạn'}</span>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {historyList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                <TicketPercent size={32} className="opacity-30" />
                <p className="text-xs">Mã này chưa được áp dụng trên đơn hàng nào</p>
              </div>
            ) : (
              <div className="divide-y divide-border border border-border rounded-[6px] overflow-hidden text-xs">
                {historyList.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-muted/30">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{item.userName || item.userEmail || 'Khách hàng'}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">Đơn: #{item.orderCode || item.orderId}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">{formatDate(item.usedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" variant="outline" className="h-8 rounded-[6px] text-xs" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
