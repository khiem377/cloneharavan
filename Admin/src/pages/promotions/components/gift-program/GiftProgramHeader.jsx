import React from 'react';
import { Gift, Plus } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';

export default function GiftProgramHeader({ openCreate }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Gift className="size-5 text-primary" />
          Chương trình tặng kèm
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tạo và quản lý các chương trình tặng sản phẩm kèm theo đơn hàng
        </p>
      </div>
      <Button onClick={openCreate} className="h-9 px-4 rounded-[6px] active:scale-[0.98] transition-transform">
        <Plus size={16} className="mr-1.5" /> Thêm chương trình
      </Button>
    </div>
  );
}
