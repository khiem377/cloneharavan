import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CustomerGroupNavIcon,
  SyncRefreshCustomIcon,
  PlusIcon,
  SearchIcon,
} from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import {
  useCustomerGroups,
  useDeleteCustomerGroup,
  useSyncCustomerGroup,
  useSeedCustomerGroups,
} from '@/hooks/useCustomerGroups';
import CustomerGroupStats from './components/CustomerGroupStats';
import CustomerGroupTable from './components/CustomerGroupTable';
import CustomerGroupModal from './components/CustomerGroupModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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

      {/* Thống kê */}
      <CustomerGroupStats
        totalGroups={totalGroups}
        autoGroups={autoGroups}
        manualGroups={manualGroups}
        totalMembers={totalMembers}
      />

      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-[6px] border border-border bg-card">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <SearchIcon size={14} className="absolute left-2.5 top-2.5 text-muted-foreground z-10" />
            <Input
              placeholder="Tìm theo tên hoặc mã nhóm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-[6px]"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-40 rounded-[6px] text-xs">
              <SelectValue placeholder="Loại nhóm" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="all">Tất cả loại nhóm</SelectItem>
              <SelectItem value="automatic">Tự động</SelectItem>
              <SelectItem value="manual">Thủ công</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bảng danh sách */}
      <CustomerGroupTable
        groups={groups}
        isLoading={isLoading}
        isSyncing={syncMut.isPending}
        isSeeding={seedMut.isPending}
        onSync={handleSync}
        onEdit={(group) => {
          setSelectedGroup(group);
          setModalOpen(true);
        }}
        onDelete={setDeleteTarget}
        onSeedDefault={handleSeedDefault}
      />

      {modalOpen && (
        <CustomerGroupModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          group={selectedGroup}
          onSuccess={() => refetch()}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Xác nhận xóa nhóm khách hàng"
          description={`Bạn có chắc chắn muốn xóa nhóm "${deleteTarget.name}"? Thành viên trong nhóm sẽ không bị xóa khỏi hệ thống.`}
          confirmLabel="Xóa nhóm"
          danger
          loading={deleteMut.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
