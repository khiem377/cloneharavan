import React from 'react';
import { Search } from '@/components/ui/Icons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';

/**
 * Filter & Column Visibility Toolbar for Staff Management
 */
export default function StaffToolbar({
  keyword,
  setKeyword,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  roles = [],
  setPage,
  columnVisibility,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardContent className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, email, SĐT nhân viên..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="h-9 pl-8 rounded-[6px] text-xs font-sans"
            />
          </div>

          {/* Role select */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs outline-none focus:border-ring cursor-pointer transition-colors"
          >
            <option value="all">Tất cả vai trò</option>
            {roles.map((r) => (
              <option key={r._id} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Status select */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs outline-none focus:border-ring cursor-pointer transition-colors"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã bị khóa</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ColumnToggleDropdown {...columnVisibility} />
        </div>
      </CardContent>
    </Card>
  );
}
