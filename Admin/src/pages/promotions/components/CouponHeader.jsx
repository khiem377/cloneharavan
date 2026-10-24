import React from 'react';
import { Button } from '@/components/ui/button';
import { TicketPercent, Plus } from '@/components/ui/Icons';

export default function CouponHeader({ onOpenCreate }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <TicketPercent className="size-5 text-primary" />
          Mã giảm giá (Coupons)
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quản lý và thiết lập các mã voucher giảm giá cho khách hàng
        </p>
      </div>
      <Button
        onClick={onOpenCreate}
        size="sm"
        className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
      >
        <Plus size={15} className="mr-1" /> Thêm mã giảm giá
      </Button>
    </div>
  );
}
