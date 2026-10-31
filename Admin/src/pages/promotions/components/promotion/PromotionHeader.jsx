import React from 'react';
import { Tag, Plus } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';

export default function PromotionHeader({ openCreate }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Tag className="size-5 text-primary" />
          Chương trình khuyến mãi
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tạo và quản lý các chương trình giảm giá tự động
        </p>
      </div>
      <Button onClick={openCreate} className="h-9 px-4 rounded-[6px] active:scale-[0.98] transition-transform">
        <Plus size={16} className="mr-1.5" /> Thêm chương trình
      </Button>
    </div>
  );
}
