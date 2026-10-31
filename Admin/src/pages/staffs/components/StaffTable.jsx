import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DataTablePagination from '@/components/ui/DataTablePagination';
import StaffTableRow from './StaffTableRow';

export default function StaffTable({
  staffs = [],
  isLoading,
  currentAdminUser,
  isColumnVisible,
  pagination,
  setPage,
  setPageSize,
  onOpenDrawer,
  onOpenEditRole,
  onOpenResetPass,
  onToggleStatus,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-xs overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-muted/40">
            <TableRow className="border-b border-border">
              {isColumnVisible('staff') && <TableHead className="p-3 font-semibold text-xs text-slate-700 dark:text-foreground">Nhân Viên</TableHead>}
              {isColumnVisible('contact') && <TableHead className="p-3 font-semibold text-xs text-slate-700 dark:text-foreground">Liên Hệ</TableHead>}
              {isColumnVisible('role') && <TableHead className="p-3 font-semibold text-xs text-slate-700 dark:text-foreground">Vai Trò & Quyền Hạn</TableHead>}
              {isColumnVisible('warehouse') && <TableHead className="p-3 font-semibold text-xs text-slate-700 dark:text-foreground">Kho Phụ Trách</TableHead>}
              {isColumnVisible('lastLogin') && <TableHead className="p-3 font-semibold text-xs text-slate-700 dark:text-foreground">Đăng Nhập Gần Nhất</TableHead>}
              {isColumnVisible('createdAt') && <TableHead className="p-3 font-semibold text-xs text-slate-700 dark:text-foreground">Ngày Tạo</TableHead>}
              {isColumnVisible('status') && <TableHead className="p-3 font-semibold text-xs text-center text-slate-700 dark:text-foreground">Trạng Thái</TableHead>}
              {isColumnVisible('actions') && (
                <TableHead className="p-3 font-semibold text-xs text-right text-slate-700 dark:text-foreground sticky right-0 z-20 bg-slate-50 dark:bg-muted shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70">
                  Thao Tác
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs">Đang tải danh sách nhân viên...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : staffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground text-xs">
                  Không tìm thấy nhân viên nào phù hợp
                </TableCell>
              </TableRow>
            ) : (
              staffs.map((user) => (
                <StaffTableRow
                  key={user._id}
                  user={user}
                  currentAdminUser={currentAdminUser}
                  isColumnVisible={isColumnVisible}
                  onOpenDrawer={onOpenDrawer}
                  onOpenEditRole={onOpenEditRole}
                  onOpenResetPass={onOpenResetPass}
                  onToggleStatus={onToggleStatus}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={pagination.page}
        pageSize={pagination.limit}
        totalItems={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </Card>
  );
}
