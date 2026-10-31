import React from 'react';
import { Search, RefreshCw, Download } from '@/components/ui/Icons';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OrderTotalBoxIcon,
  OrderPendingClockIcon,
  OrderConfirmedStampIcon,
  OrderShippingTruckIcon,
  OrderDeliveredSuccessIcon,
  OrderCancelledIcon,
} from './OrderCustomIcons';

export default function OrderToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  onRefresh,
  isFetching,
  columnVisibility,
  onExportCsv,
  stats,
}) {
  const ORDER_STATUS_TABS = [
    { key: 'ALL', label: 'Tất cả', Icon: OrderTotalBoxIcon, count: stats?.total },
    { key: 'PENDING', label: 'Chờ duyệt', Icon: OrderPendingClockIcon, count: stats?.pending },
    { key: 'CONFIRMED', label: 'Đã duyệt', Icon: OrderConfirmedStampIcon, count: stats?.confirmed },
    { key: 'SHIPPING', label: 'Đang giao', Icon: OrderShippingTruckIcon, count: stats?.shipping },
    { key: 'DELIVERED', label: 'Hoàn tất', Icon: OrderDeliveredSuccessIcon, count: stats?.delivered },
    { key: 'CANCELLED', label: 'Đã hủy', Icon: OrderCancelledIcon, count: stats?.cancelled },
  ];

  return (
    <div className="space-y-3.5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Đơn hàng
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý quy trình đóng gói, xác nhận đơn và điều phối tồn kho vật lý
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold cursor-pointer active:scale-[0.98]"
          >
            <Download className="size-3.5" />
            <span>Xuất CSV</span>
          </Button>

          <ColumnToggleDropdown columnVisibility={columnVisibility} />
        </div>
      </div>

      {/* Quick Status Tabs with Custom Icons & Counts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/60">
        {ORDER_STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.key;
          const TabIcon = tab.Icon;
          const count = tab.count !== undefined ? tab.count : null;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`h-8 px-3 rounded-[6px] text-xs font-medium inline-flex items-center gap-2 shrink-0 cursor-pointer transition-all duration-150 active:scale-[0.98] ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <TabIcon size={14} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'} />
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] tabular-nums font-bold ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters row: Search & Payment Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Tìm mã đơn, tên khách, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-card rounded-[6px]"
            />
          </div>

          {/* Payment Status Filter */}
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="h-8 w-48 rounded-[6px] text-xs">
              <SelectValue placeholder="Trạng thái thanh toán" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="ALL">Thanh toán: Tất cả</SelectItem>
              <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
              <SelectItem value="PAID">Đã thanh toán</SelectItem>
              <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
