import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  FileCheck,
  FileText,
  TrendingDown,
  Package,
  Clock,
  CalendarX,
} from '@/components/ui/Icons';

export default function StockAlertWidgets({
  poStats = { totalActive: 0, draft: 0, pending: 0, partial: 0 },
  exStats = { totalActive: 0, pending_pick: 0, picking: 0, packed: 0 },
  summary = { lowStockCount: 0, outOfStockCount: 0, safeStockCount: 0 },
  viewMode = 'all',
  onViewModeChange,
}) {
  return (
    <div className="space-y-6">
      {/* 2 Real-data Status Widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: PO Inbound Status */}
        <Card className="rounded-[6px] border border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 px-5 pt-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" /> Trạng Thái Đơn Nhập Kho (PO)
            </CardTitle>
            <span className="text-xs font-bold text-muted-foreground">
              Đơn chưa xong:{' '}
              <span className="text-primary font-mono text-sm font-extrabold tabular-nums">
                {poStats.totalActive}
              </span>
            </span>
          </CardHeader>

          <CardContent className="p-5 pt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Bản nháp</span>
                <span className="text-lg font-bold font-mono text-foreground tabular-nums">
                  {poStats.draft}
                </span>
              </div>
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Chờ nhận hàng</span>
                <span className="text-lg font-bold font-mono text-primary tabular-nums">
                  {poStats.pending}
                </span>
              </div>
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Nhập 1 phần</span>
                <span className="text-lg font-bold font-mono text-amber-600 tabular-nums">
                  {poStats.partial}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: EX Outbound Status */}
        <Card className="rounded-[6px] border border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 px-5 pt-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Lệnh Xuất Kho (EX)
            </CardTitle>
            <span className="text-xs font-bold text-muted-foreground">
              Lệnh đang xử lý:{' '}
              <span className="text-primary font-mono text-sm font-extrabold tabular-nums">
                {exStats.totalActive}
              </span>
            </span>
          </CardHeader>

          <CardContent className="p-5 pt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Chờ soạn hàng</span>
                <span className="text-lg font-bold font-mono text-amber-600 tabular-nums">
                  {exStats.pending_pick}
                </span>
              </div>
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Đang lấy hàng</span>
                <span className="text-lg font-bold font-mono text-primary tabular-nums">
                  {exStats.picking}
                </span>
              </div>
              <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Đã đóng gói</span>
                <span className="text-lg font-bold font-mono text-emerald-600 tabular-nums">
                  {exStats.packed}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4 Monitoring Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={() => onViewModeChange('low_stock')}
          className={`rounded-[6px] border p-4 shadow-none cursor-pointer transition-all active:scale-[0.98] ${
            viewMode === 'low_stock' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-amber-500/10 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Tồn dưới mức tối thiểu</span>
              <p className="text-xl font-bold text-amber-600 font-mono tracking-tight mt-0.5 tabular-nums">
                {summary.lowStockCount + summary.outOfStockCount}{' '}
                <span className="text-xs font-normal text-muted-foreground font-sans">mặt hàng</span>
              </p>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => onViewModeChange('all')}
          className={`rounded-[6px] border p-4 shadow-none cursor-pointer transition-all active:scale-[0.98] ${
            viewMode === 'all' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Tồn kho an toàn</span>
              <p className="text-xl font-bold text-foreground font-mono tracking-tight mt-0.5 tabular-nums">
                {summary.safeStockCount}{' '}
                <span className="text-xs font-normal text-muted-foreground font-sans">mặt hàng</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[6px] border border-border bg-card p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-indigo-500/10 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Sắp hết hạn (30 ngày)</span>
              <p className="text-xl font-bold text-indigo-600 font-mono tracking-tight mt-0.5 tabular-nums">
                0 <span className="text-xs font-normal text-muted-foreground font-sans">mặt hàng</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[6px] border border-border bg-card p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-rose-500/10 text-rose-600">
              <CalendarX className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Quá hạn sử dụng</span>
              <p className="text-xl font-bold text-rose-600 font-mono tracking-tight mt-0.5 tabular-nums">
                0 <span className="text-xs font-normal text-muted-foreground font-sans">mặt hàng</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
