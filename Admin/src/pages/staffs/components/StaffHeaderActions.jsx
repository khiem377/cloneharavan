import React from 'react';
import {
  Plus,
  Mail,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Can from '@/components/auth/Can';
import { RoleAdminIcon } from './RoleCustomIcons';

export default function StaffHeaderActions({
  onRefresh,
  isFetching,
  onExportCSV,
  hasStaffs,
  onOpenInvite,
  onOpenCreate,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <RoleAdminIcon size={20} className="text-slate-900 dark:text-foreground shrink-0" />
          <span>Quản Lý Nhân Sự & Quản Trị Viên</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quản lý tài khoản nhân viên, cấp phát vai trò RBAC và phân bổ quyền hạn chuyên sâu trên hệ thống.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-8.5 px-2.5 text-xs rounded-[6px] cursor-pointer border-border hover:bg-muted"
          title="Tải lại danh sách"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          disabled={!hasStaffs}
          className="h-8.5 text-xs rounded-[6px] gap-1.5 cursor-pointer border-border hover:bg-muted"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Xuất CSV</span>
        </Button>

        <Can permission="user.create">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenInvite}
            className="h-8.5 text-xs rounded-[6px] gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer"
          >
            <Mail className="size-3.5" />
            <span>Mời Qua Email</span>
          </Button>
        </Can>

        <Can permission="user.create">
          <Button
            size="sm"
            onClick={onOpenCreate}
            className="h-8.5 text-xs rounded-[6px] gap-1.5 font-semibold bg-[#e30019] hover:bg-[#c40015] text-white active:scale-[0.98] shadow-xs cursor-pointer px-3.5"
          >
            <Plus className="size-3.5" />
            <span>Thêm Nhân Viên</span>
          </Button>
        </Can>
      </div>
    </div>
  );
}
