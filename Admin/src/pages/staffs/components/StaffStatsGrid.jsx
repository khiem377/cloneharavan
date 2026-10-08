import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * KPI Stat Cards & Department Distribution for Staff Management
 */
export default function StaffStatsGrid({ stats, departmentCounts }) {
  return (
    <>
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tổng nhân sự</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
              {stats.total || 0}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">Tất cả tài khoản hệ thống</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Đang hoạt động</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {stats.active || 0}
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Khả dụng đăng nhập</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Bị tạm khóa</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {stats.inactive || 0}
            </span>
            <span className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">Đã thu hồi truy cập</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Ban Quản Trị</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-primary">
              {departmentCounts.adminCount || 0}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">Admin & Administrator</span>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Khối Quản Trị
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-foreground">
                {departmentCounts.adminCount}
              </span>
              <Badge variant="outline" className="rounded-[6px] text-xs bg-primary/10 text-primary border-primary/20 font-semibold">
                Cấp cao
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">Toàn quyền hệ thống</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Kho & Hàng Hóa
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {departmentCounts.inventoryCount}
              </span>
              <Badge variant="outline" className="rounded-[6px] text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-semibold">
                Kho vận
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">Nhập, xuất, kiểm kê</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Marketing & Nội Dung
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {departmentCounts.marketingCount}
              </span>
              <Badge variant="outline" className="rounded-[6px] text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-semibold">
                Truyền thông
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">Blog, Catalog, Flash Sale</span>
          </CardContent>
        </Card>

        <Card className="rounded-[6px] border border-border shadow-none">
          <CardContent className="p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Vận Hành & CSKH
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {departmentCounts.cskhCount}
              </span>
              <Badge variant="outline" className="rounded-[6px] text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                Vận hành
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">Xử lý đơn & tư vấn</span>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
