import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Sparkles, UserCheck, Plus, RefreshCw, Pencil, Trash2, Search, Users } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import {
  useCustomerGroups,
  useDeleteCustomerGroup,
  useSyncCustomerGroup,
} from '@/hooks/useCustomerGroups';
import CustomerGroupModal from './CustomerGroupModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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

export default function CustomerGroupTab() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: res, isLoading, refetch } = useCustomerGroups({ search, type: typeFilter });
  const groups = res?.data || [];

  const deleteMut = useDeleteCustomerGroup();
  const syncMut = useSyncCustomerGroup();

  const handleSync = async (id, name) => {
    try {
      const result = await syncMut.mutateAsync(id);
      toast.success(result.message || `Đã đồng bộ nhóm ${name}`);
      refetch();
    } catch (err) {
      toast.error('Lỗi khi đồng bộ thành viên: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget._id);
      toast.success('Đã xóa nhóm khách hàng');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error('Lỗi khi xóa nhóm: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Thanh công cụ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc mã nhóm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs rounded-[6px]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-[6px] border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none"
          >
            <option value="all">Tất cả loại nhóm</option>
            <option value="automatic">Tự động (Smart Rule)</option>
            <option value="manual">Thủ công</option>
          </select>
        </div>

        <Button
          onClick={() => {
            setSelectedGroup(null);
            setModalOpen(true);
          }}
          size="sm"
          className="h-9 gap-1.5 rounded-[6px] text-xs font-medium"
        >
          <Plus className="size-4" />
          Tạo nhóm khách hàng
        </Button>
      </div>

      {/* Bảng danh sách */}
      <Card className="rounded-[6px] border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
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
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  <Users className="size-8 mx-auto mb-2 opacity-40" />
                  Chưa có nhóm khách hàng nào phù hợp
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group, idx) => (
                <TableRow key={group._id} className="hover:bg-muted/40">
                  <TableCell className="text-center text-xs text-muted-foreground font-mono">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{group.name}</span>
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
                      <Badge variant="outline" className="text-[11px] gap-1 bg-primary/5 text-primary border-primary/20">
                        <Sparkles className="size-3" />
                        Tự động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px] gap-1 bg-muted text-muted-foreground">
                        <UserCheck className="size-3" />
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
                    <span className="inline-flex items-center justify-center font-mono font-bold text-xs tabular-nums px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {group.memberCount || 0}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {group.type === 'automatic' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Quét & cập nhật thành viên"
                          disabled={syncMut.isPending}
                          onClick={() => handleSync(group._id, group.name)}
                          className="h-7 w-7 text-primary hover:bg-primary/10 rounded-[4px]"
                        >
                          <RefreshCw className={`size-3.5 ${syncMut.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Chỉnh sửa nhóm"
                        onClick={() => {
                          setSelectedGroup(group);
                          setModalOpen(true);
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-[4px]"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Xóa nhóm"
                        onClick={() => setDeleteTarget(group)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-[4px]"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CustomerGroupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        group={selectedGroup}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa nhóm khách hàng"
        message={`Bạn có chắc muốn xóa nhóm "${deleteTarget?.name}"? Các khách hàng trong nhóm sẽ được gỡ ra khỏi nhóm.`}
        confirmLabel="Xóa nhóm"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
