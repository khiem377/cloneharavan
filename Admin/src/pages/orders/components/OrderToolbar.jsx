import React from 'react';
import { Search, RefreshCw, Download, Filter } from '@/components/ui/Icons';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
}) {
  const ORDER_STATUS_TABS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ duyệt', dot: 'bg-amber-400' },
    { key: 'CONFIRMED', label: 'Đã duyệt', dot: 'bg-indigo-400' },
    { key: 'SHIPPING', label: 'Đang giao', dot: 'bg-cyan-500' },
    { key: 'DELIVERED', label: 'Hoàn tất', dot: 'bg-emerald-500' },
    { key: 'CANCELLED', label: 'Đã hủy', dot: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Đơn hàng</h1>
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
            className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Xuất CSV</span>
          </Button>

          <ColumnToggleDropdown columnVisibility={columnVisibility} />
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {ORDER_STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <Button
              key={tab.key}
              variant={isActive ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(tab.key)}
              className={`h-7 px-3 rounded-[6px] text-xs font-medium gap-1.5 shrink-0 cursor-pointer shadow-none ${
                isActive ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.dot && (
                <span
                  className={`size-1.5 rounded-full ${
                    isActive ? 'bg-primary-foreground' : tab.dot
                  }`}
                />
              )}
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
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
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-8 px-2.5 rounded-[6px] border border-border bg-card text-xs text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
          >
            <option value="ALL">Thanh toán: Tất cả</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
        </div>
      </div>
    </div>
  );
}
