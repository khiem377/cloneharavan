import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';

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
    <Card className="rounded-[6px] border border-border shadow-xs bg-card">
      <CardContent className="p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground z-10 pointer-events-none" />
            <Input
              placeholder="Tìm theo tên, email, SĐT nhân viên..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="h-8 pl-8 rounded-[6px] text-xs font-sans border-border"
            />
          </div>

          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-44 rounded-[6px] text-xs border-border">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r._id} value={r.code}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-36 rounded-[6px] text-xs border-border">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Đã bị khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ColumnToggleDropdown {...columnVisibility} />
        </div>
      </CardContent>
    </Card>
  );
}
