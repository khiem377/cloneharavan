import React from 'react';
import { StoreFrontIcon } from '@/components/ui/Icons';
import { SidebarHeader } from '@/components/ui/sidebar';

export default function SidebarHeaderStore() {
  return (
    <SidebarHeader className="flex flex-row items-center justify-between border-b border-border px-3 py-3">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground shadow-xs">
          <StoreFrontIcon size={16} />
        </div>
        <div className="flex flex-col text-left overflow-hidden group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-bold tracking-tight text-foreground">Admin panel</span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-[4px] bg-primary/10 text-primary text-[9px] font-mono font-semibold">
              PRO
            </span>
          </div>
          <span className="truncate text-[10px] text-muted-foreground">Trung tâm Quản trị</span>
        </div>
      </div>
    </SidebarHeader>
  );
}
