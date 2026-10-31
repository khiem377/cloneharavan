import React from 'react';
import { Search, RefreshCw, Download, Lock, Unlock } from '@/components/ui/Icons';
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

export default function CustomerToolbar({
  keyword,
  setKeyword,
  statusFilter,
  setStatusFilter,
  providerFilter,
  setProviderFilter,
  phoneFilter,
  setPhoneFilter,
  addressFilter,
  setAddressFilter,
  onRefresh,
  isFetching,
  selectedCount,
  onBulkLock,
  onBulkUnlock,
  onExportCsv,
  columnVisibility,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Khách hàng</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Danh sách tài khoản người dùng đăng ký và thông tin liên hệ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold"
          >
            <Download className="size-3.5" />
            <span>Xuất CSV</span>
          </Button>

          <ColumnToggleDropdown columnVisibility={columnVisibility} />
        </div>
      </div>

      {/* Filters & Bulk controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Tìm theo tên, email, sđt..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-[6px] text-xs"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-36 rounded-[6px] text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Đã khóa</SelectItem>
            </SelectContent>
          </Select>

          {/* Provider Filter */}
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="h-8 w-36 rounded-[6px] text-xs">
              <SelectValue placeholder="Nguồn" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="all">Nguồn: Tất cả</SelectItem>
              <SelectItem value="zalo">Zalo</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="local">Email / Mật khẩu</SelectItem>
            </SelectContent>
          </Select>

          {/* Phone Filter */}
          <Select value={phoneFilter} onValueChange={setPhoneFilter}>
            <SelectTrigger className="h-8 w-32 rounded-[6px] text-xs">
              <SelectValue placeholder="SĐT" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="all">SĐT: Tất cả</SelectItem>
              <SelectItem value="has_phone">Có số ĐT</SelectItem>
              <SelectItem value="no_phone">Chưa có số ĐT</SelectItem>
            </SelectContent>
          </Select>

          {/* Address Filter */}
          <Select value={addressFilter} onValueChange={setAddressFilter}>
            <SelectTrigger className="h-8 w-36 rounded-[6px] text-xs">
              <SelectValue placeholder="Địa chỉ" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="all">Địa chỉ: Tất cả</SelectItem>
              <SelectItem value="has_addr">Đã có địa chỉ</SelectItem>
              <SelectItem value="no_addr">Chưa có địa chỉ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Action Buttons */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkUnlock}
              className="h-8 px-2.5 rounded-[6px] text-xs gap-1 font-semibold text-emerald-600 hover:bg-emerald-500/10 active:scale-[0.98]"
            >
              <Unlock className="size-3.5" />
              <span>Mở khóa ({selectedCount})</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkLock}
              className="h-8 px-2.5 rounded-[6px] text-xs gap-1 font-semibold text-destructive hover:bg-destructive/10 active:scale-[0.98]"
            >
              <Lock className="size-3.5" />
              <span>Khóa ({selectedCount})</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
