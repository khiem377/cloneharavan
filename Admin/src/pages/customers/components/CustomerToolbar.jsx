import { Search, RefreshCw, Download, Lock, Unlock } from '@/components/ui/Icons';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';
import { Button } from '@/components/ui/button';

export default function CustomerToolbar({
  keyword,
  setKeyword,
  statusFilter,
  setStatusFilter,
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

          <ColumnToggleDropdown {...columnVisibility} />
        </div>
      </div>

      {/* Filters & Bulk controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, sđt..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-[6px] border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-[6px] border border-border bg-card text-xs text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>

          {/* Phone Filter */}
          <select
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            className="h-8 px-2.5 rounded-[6px] border border-border bg-card text-xs text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
          >
            <option value="all">SĐT: Tất cả</option>
            <option value="has_phone">Có số ĐT</option>
            <option value="no_phone">Chưa có số ĐT</option>
          </select>

          {/* Address Filter */}
          <select
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            className="h-8 px-2.5 rounded-[6px] border border-border bg-card text-xs text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
          >
            <option value="all">Địa chỉ: Tất cả</option>
            <option value="has_addr">Đã có địa chỉ</option>
            <option value="no_addr">Chưa có địa chỉ</option>
          </select>
        </div>

        {/* Bulk Action Buttons */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkUnlock}
              className="h-8 px-2.5 rounded-[6px] text-xs gap-1 font-semibold text-emerald-600 hover:bg-emerald-500/10"
            >
              <Unlock className="size-3.5" />
              <span>Mở khóa ({selectedCount})</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkLock}
              className="h-8 px-2.5 rounded-[6px] text-xs gap-1 font-semibold text-destructive hover:bg-destructive/10"
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
