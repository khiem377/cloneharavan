import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RoleAdminIcon,
  RoleInventoryIcon,
  RoleSupportIcon,
  RoleDefaultStaffIcon,
} from './RoleCustomIcons';

export default function StaffStatsGrid({ stats = {}, departmentCounts = {} }) {
  const adminCount = departmentCounts.adminCount || 0;
  const inventoryCount = departmentCounts.inventoryCount || 0;
  const operationsCount = (departmentCounts.cskhCount || 0) + (departmentCounts.marketingCount || 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="rounded-[6px] border border-border shadow-xs bg-card">
        <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold text-slate-700 dark:text-foreground">Tổng nhân sự</span>
            <div className="size-6 rounded-[6px] bg-slate-100 dark:bg-muted flex items-center justify-center text-slate-600 dark:text-foreground">
              <RoleDefaultStaffIcon size={13} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono tabular-nums text-foreground tracking-tight">
              {stats.total || 0}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span className="text-emerald-600 font-medium font-mono tabular-nums">{stats.active || 0} hoạt động</span>
              <span>•</span>
              <span className="text-rose-600 font-medium font-mono tabular-nums">{stats.inactive || 0} khóa</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[6px] border border-border shadow-xs bg-card">
        <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold text-slate-700 dark:text-foreground">Ban Quản Trị</span>
            <div className="size-6 rounded-[6px] bg-slate-900 text-white flex items-center justify-center">
              <RoleAdminIcon size={13} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-foreground tracking-tight">
                {adminCount}
              </span>
              <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[6px] bg-slate-100 text-slate-800 border-slate-200">
                Toàn quyền
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Administrator & Admin</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[6px] border border-border shadow-xs bg-card">
        <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold text-slate-700 dark:text-foreground">Kho Vận & Hàng Hóa</span>
            <div className="size-6 rounded-[6px] bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <RoleInventoryIcon size={13} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-amber-800 dark:text-amber-400 tracking-tight">
                {inventoryCount}
              </span>
              <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[6px] bg-amber-50 text-amber-800 border-amber-200">
                Kho bãi
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Xuất, nhập, kiểm kê kho</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[6px] border border-border shadow-xs bg-card">
        <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold text-slate-700 dark:text-foreground">Bán Hàng & CSKH</span>
            <div className="size-6 rounded-[6px] bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <RoleSupportIcon size={13} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400 tracking-tight">
                {operationsCount}
              </span>
              <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[6px] bg-blue-50 text-blue-700 border-blue-200">
                Vận hành
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Tư vấn, tạo đơn & xử lý</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
