import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  FolderGroupIcon,
  CustomerAutoIcon,
  CustomerManualIcon,
  CustomerVipIcon,
  CustomerLoyalIcon,
  CustomerWholesaleIcon,
  SyncRefreshCustomIcon,
  PencilIcon,
  Trash2,
} from '@/components/ui/Icons';

const COLOR_CLASSES = {
  blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  slate: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

const FIELD_LABELS = {
  totalSpent: 'Chi tiêu',
  orderCount: 'Số đơn',
  createdAtDays: 'Tuổi tài khoản (ngày)',
};

export default function CustomerGroupTable({
  groups = [],
  isLoading = false,
  isSyncing = false,
  isSeeding = false,
  onSync,
  onEdit,
  onDelete,
  onSeedDefault,
}) {
  return (
    <Card className="rounded-[6px] border border-border bg-card shadow-none overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center text-xs">#</TableHead>
            <TableHead className="text-xs font-semibold">Tên & Mã nhóm</TableHead>
            <TableHead className="text-xs font-semibold">Cơ chế</TableHead>
            <TableHead className="text-xs font-semibold">Điều kiện lọc</TableHead>
            <TableHead className="text-xs font-semibold text-center">Thành viên</TableHead>
            <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={6} className="py-3">
                  <Skeleton className="h-5 w-full rounded-[4px]" />
                </TableCell>
              </TableRow>
            ))
          ) : groups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                <FolderGroupIcon size={44} className="mx-auto mb-2 text-primary opacity-30" />
                <p className="font-semibold text-foreground text-sm mb-1">Chưa có nhóm khách hàng nào</p>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  Bạn có thể tự tạo nhóm mới hoặc bấm nút dưới đây để tạo sẵn 4 nhóm mẫu chuẩn và tự động quét gán khách hàng.
                </p>
                <Button
                  onClick={onSeedDefault}
                  disabled={isSeeding}
                  size="sm"
                  className="h-8 gap-1.5 rounded-[6px] text-xs font-semibold"
                >
                  <SyncRefreshCustomIcon size={14} className={isSeeding ? 'animate-spin' : ''} />
                  {isSeeding ? 'Đang tạo & quét...' : 'Khởi tạo 4 nhóm mẫu & quét tự động'}
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group, idx) => (
              <TableRow key={group._id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-center text-xs text-muted-foreground font-mono">
                  {idx + 1}
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      {group.code === 'VIP' && <CustomerVipIcon size={13} className="text-purple-600 shrink-0" />}
                      {group.code === 'THAN_THIET' && <CustomerLoyalIcon size={13} className="text-emerald-600 shrink-0" />}
                      {group.code === 'KHACH_SI' && <CustomerWholesaleIcon size={13} className="text-amber-600 shrink-0" />}
                      {group.name}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-bold border ${
                        COLOR_CLASSES[group.color] || COLOR_CLASSES.blue
                      }`}
                    >
                      {group.code}
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {group.description}
                    </p>
                  )}
                </TableCell>
                <TableCell className="py-2.5">
                  {group.type === 'automatic' ? (
                    <Badge variant="outline" className="text-[11px] gap-1.5 bg-primary/5 text-primary border-primary/20 rounded-[4px]">
                      <CustomerAutoIcon size={12} />
                      Tự động
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[11px] gap-1.5 bg-muted text-muted-foreground rounded-[4px]">
                      <CustomerManualIcon size={12} />
                      Thủ công
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-2.5 max-w-xs">
                  {group.type === 'automatic' && group.conditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {group.conditions.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center text-[10px] bg-muted/60 px-1.5 py-0.5 rounded border border-border font-mono"
                        >
                          {FIELD_LABELS[c.field] || c.field} {c.operator === 'gte' ? '>=' : c.operator === 'lte' ? '<=' : '='} {c.value.toLocaleString('vi-VN')}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">Gán thủ công</span>
                  )}
                </TableCell>
                <TableCell className="py-2.5 text-center">
                  <span className="inline-flex items-center justify-center font-mono font-bold text-xs tabular-nums px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary">
                    {group.memberCount || 0}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {group.type === 'automatic' && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Quét & cập nhật thành viên"
                        disabled={isSyncing}
                        onClick={() => onSync(group._id, group.name)}
                        className="size-7 text-primary hover:bg-primary/10 rounded-[4px]"
                      >
                        <SyncRefreshCustomIcon size={13} className={isSyncing ? 'animate-spin' : ''} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Chỉnh sửa nhóm"
                      onClick={() => onEdit(group)}
                      className="size-7 text-muted-foreground hover:text-foreground rounded-[4px]"
                    >
                      <PencilIcon size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Xóa nhóm"
                      onClick={() => onDelete(group)}
                      className="size-7 text-destructive hover:bg-destructive/10 rounded-[4px]"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
