import React from 'react';
import { Card } from '@/components/ui/card';
import {
  FolderGroupIcon,
  CustomerAutoIcon,
  CustomerManualIcon,
  CustomerNavIcon,
} from '@/components/ui/Icons';

export default function CustomerGroupStats({
  totalGroups = 0,
  autoGroups = 0,
  manualGroups = 0,
  totalMembers = 0,
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="p-3.5 rounded-[6px] border border-border bg-card shadow-none flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-muted-foreground">Tổng số nhóm</div>
          <div className="text-xl font-bold font-mono tabular-nums text-foreground mt-0.5">{totalGroups}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Đang kích hoạt trong hệ thống</div>
        </div>
        <div className="size-9 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <FolderGroupIcon size={19} />
        </div>
      </Card>

      <Card className="p-3.5 rounded-[6px] border border-border bg-card shadow-none flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-muted-foreground">Phân loại tự động</div>
          <div className="text-xl font-bold font-mono tabular-nums text-primary mt-0.5">{autoGroups}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Khớp theo tiêu chí chi tiêu & đơn</div>
        </div>
        <div className="size-9 rounded-[6px] bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
          <CustomerAutoIcon size={19} />
        </div>
      </Card>

      <Card className="p-3.5 rounded-[6px] border border-border bg-card shadow-none flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-muted-foreground">Phân loại thủ công</div>
          <div className="text-xl font-bold font-mono tabular-nums text-foreground mt-0.5">{manualGroups}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Gán trực tiếp từng khách hàng</div>
        </div>
        <div className="size-9 rounded-[6px] bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
          <CustomerManualIcon size={19} />
        </div>
      </Card>

      <Card className="p-3.5 rounded-[6px] border border-border bg-card shadow-none flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-muted-foreground">Khách đã phân nhóm</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totalMembers}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Lượt khách hàng được gán nhóm</div>
        </div>
        <div className="size-9 rounded-[6px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
          <CustomerNavIcon size={19} />
        </div>
      </Card>
    </div>
  );
}
