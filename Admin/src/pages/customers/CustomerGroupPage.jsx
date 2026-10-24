import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  CustomerGroupNavIcon,
  CustomerNavIcon,
  CustomerAutoIcon,
  CustomerManualIcon,
  CustomerVipIcon,
  CustomerLoyalIcon,
  CustomerWholesaleIcon,
  SyncRefreshCustomIcon,
  FolderGroupIcon,
  PlusIcon,
  SearchIcon,
  PencilIcon,
  Trash2,
} from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import {
  useCustomerGroups,
  useDeleteCustomerGroup,
  useSyncCustomerGroup,
  useSeedCustomerGroups,
} from '@/hooks/useCustomerGroups';
import CustomerGroupModal from './components/CustomerGroupModal';
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

export default function CustomerGroupPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: res, isLoading, refetch } = useCustomerGroups({ search, type: typeFilter });
  const groups = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

  const deleteMut = useDeleteCustomerGroup();
  const syncMut = useSyncCustomerGroup();
  const seedMut = useSeedCustomerGroups();

  const totalGroups = groups.length;
  const autoGroups = groups.filter((g) => g.type === 'automatic').length;
  const manualGroups = groups.filter((g) => g.type === 'manual').length;
  const totalMembers = groups.reduce((acc, g) => acc + (g.memberCount || 0), 0);

  const handleSync = async (id, name) => {
    try {
      const result = await syncMut.mutateAsync(id);
      toast.success(result.message || `Đã đồng bộ nhóm ${name}`);
      refetch();
    } catch (err) {
      toast.error('Lỗi khi đồng bộ thành viên: ' + err.message);
    }
  };

  const handleSeedDefault = async () => {
    try {
      const result = await seedMut.mutateAsync();
      toast.success(result.message || 'Đã khởi tạo và đồng bộ nhóm khách hàng');
      refetch();
    } catch (err) {
      toast.error('Lỗi khi khởi tạo nhóm: ' + err.message);
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
    <div className="space-y-4 max-w-full overflow-x-hidden pb-12 antialiased">
      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2.5">
            <CustomerGroupNavIcon size={22} className="text-primary" />
            Nhóm khách hàng
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý và phân loại khách hàng tự động theo tiêu chí hoặc phân loại thủ công
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSeedDefault}
            disabled={seedMut.isPending}
            size="sm"
            className="h-8 gap-1.5 rounded-[6px] text-xs font-semibold"
          >
            <SyncRefreshCustomIcon size={14} className={seedMut.isPending ? 'animate-spin' : ''} />
            {seedMut.isPending ? 'Đang tạo & quét...' : 'Khởi tạo nhóm mẫu & quét tự động'}
          </Button>
          <Button
            onClick={() => {
              setSelectedGroup(null);
              setModalOpen(true);
            }}
            size="sm"
            className="h-8 gap-1.5 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
          >
            <PlusIcon size={14} />
            Tạo nhóm khách hàng
          </Button>
        </div>
      </div>

      {/* Thẻ chỉ số tổng quan với Custom SVG Icons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5 rounded-[6px] border border-border bg-card shadow-none flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Tổng số nhóm</div>
            <div className="text-xl font-bold font-mono tabular-nums text-foreground mt-0.5">{totalGroups}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Đang kích hoạt trong hệ thống</div>
          </div>
          <div className="size-9 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FolderGroupIcon size={19} />
          </div>
        </Card>

        <Card className="p-3.5 rounded-[6px] border border-border bg-card shadow-none flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Phân loại tự động</div>
            <div className="text-xl font-bold font-mono tabular-nums text-primary mt-0.5">{autoGroups}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Khớp theo tiêu chí chi tiêu & đơn</div>
          </div>
          <div className="size-9 rounded-[6px] bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <CustomerAutoIcon size={19} />
          </div>
        </Card>

        <Card className="p-3.5 rounded-[6px] border border-border bg-card shadow-none flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Phân loại thủ công</div>
            <div className="text-xl font-bold font-mono tabular-nums text-foreground mt-0.5">{manualGroups}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Gán trực tiếp từng khách hàng</div>
          </div>
          <div className="size-9 rounded-[6px] bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <CustomerManualIcon size={19} />
          </div>
        </Card>

        <Card className="p-3.5 rounded-[6px] border border-border bg-card shadow-none flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Khách đã phân nhóm</div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
              {totalMembers}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Lượt khách hàng được gán nhóm</div>
          </div>
          <div className="size-9 rounded-[6px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CustomerNavIcon size={19} />
          </div>
        </Card>
      </div>

      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-[6px] border border-border bg-card">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <SearchIcon size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc mã nhóm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-[6px]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 rounded-[6px] border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none cursor-pointer"
          >
            <option value="all">Tất cả loại nhóm</option>
            <option value="automatic">Tự động</option>
            <option value="manual">Thủ công</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách */}
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
                    Bạn có thể tự tạo nhóm mới hoặc bấm nút dưới đây để tạo sẵn 4 nhóm mẫu chuẩn Sapo và tự động quét gán khách hàng.
                  </p>
                  <Button
                    onClick={handleSeedDefault}
                    disabled={seedMut.isPending}
                    size="sm"
                    className="h-8 gap-1.5 rounded-[6px] text-xs font-semibold"
                  >
                    <SyncRefreshCustomIcon size={14} className={seedMut.isPending ? 'animate-spin' : ''} />
                    {seedMut.isPending ? 'Đang tạo & quét...' : 'Khởi tạo 4 nhóm mẫu & quét tự động'}
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
                      <Badge variant="outline" className="text-[11px] gap-1.5 bg-primary/5 text-primary border-primary/20">
                        <CustomerAutoIcon size={12} />
                        Tự động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px] gap-1.5 bg-muted text-muted-foreground">
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
                          <SyncRefreshCustomIcon size={13} className={syncMut.isPending ? 'animate-spin' : ''} />
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
                        <PencilIcon size={13} />
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
