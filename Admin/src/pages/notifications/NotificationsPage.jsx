import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  SearchIcon as Search,
  RotateCcw,
  CheckCheck,
  Loader2,
} from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/providers/ToastProvider';
import notificationService from '@/services/notification.service';
import DataTablePagination from '@/components/ui/DataTablePagination';
import NotificationTable from './components/NotificationTable';
import NotificationBatchBar from './components/NotificationBatchBar';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({
        page,
        limit,
        search: search.trim() || undefined,
      });

      if (res?.success) {
        setNotifications(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      toast.error('Không thể tải danh sách thông báo', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle Selection
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n._id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Handle Mark All Read
  const handleMarkAllRead = async () => {
    try {
      setIsProcessing(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (err) {
      toast.error('Lỗi khi đánh dấu đã đọc', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Mark Single Item Read
  const handleMarkReadItem = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái', { description: err.message });
    }
  };

  // Handle Mark Selected Read
  const handleMarkReadSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsProcessing(true);
      await Promise.all(selectedIds.map((id) => notificationService.markAsRead(id)));
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.includes(n._id) ? { ...n, isRead: true } : n))
      );
      toast.success(`Đã đánh dấu ${selectedIds.length} thông báo là đã đọc`);
      setSelectedIds([]);
    } catch (err) {
      toast.error('Lỗi khi đánh dấu thông báo đã chọn', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Delete Single Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      toast.success('Đã xóa thông báo');
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      toast.error('Lỗi khi xóa thông báo', { description: err.message });
    }
  };

  // Handle Delete Selected Items
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} thông báo đã chọn?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      const res = await notificationService.deleteBulkNotifications(selectedIds);
      toast.success(res?.message || 'Đã xóa các thông báo đã chọn');
      setSelectedIds([]);
      fetchNotifications();
    } catch (err) {
      toast.error('Lỗi khi xóa các thông báo đã chọn', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Item Click (Redirect if link exists)
  const handleItemClick = async (item) => {
    if (!item.isRead) {
      handleMarkReadItem(item._id);
    }
    if (item.link) {
      navigate(item.link);
    } else if (item.metadata?.orderId) {
      navigate(`/orders/${item.metadata.orderId}`);
    } else if (item.metadata?.orderCode) {
      navigate(`/orders/${item.metadata.orderCode}`);
    } else {
      navigate('/orders');
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Thông báo hệ thống
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý và theo dõi toàn bộ thông báo đơn hàng, kho vận và hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="h-8 text-xs rounded-[6px] border-border bg-card hover:bg-accent text-foreground cursor-pointer"
          >
            <RotateCcw className={`size-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isProcessing || notifications.length === 0}
            className="h-8 text-xs font-semibold rounded-[6px] bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <CheckCheck className="size-3.5 mr-1" />
            Đánh dấu tất cả là đã đọc
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm thông báo theo nội dung hoặc mã..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs rounded-[6px] border-border bg-card"
          />
        </div>
      </div>

      {/* Batch Action Bar */}
      <NotificationBatchBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onMarkReadSelected={handleMarkReadSelected}
        onDeleteSelected={handleDeleteSelected}
        isProcessing={isProcessing}
      />

      {/* Table Content */}
      {loading && notifications.length === 0 ? (
        <div className="rounded-[6px] border border-border bg-card p-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-6 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">Đang tải danh sách thông báo...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-[6px] border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
          <Bell className="size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-foreground">Không có thông báo nào</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {search
              ? 'Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm.'
              : 'Hiện tại hệ thống chưa có thông báo mới nào được ghi nhận.'}
          </p>
        </div>
      ) : (
        <>
          <NotificationTable
            notifications={notifications}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onItemClick={handleItemClick}
            onDeleteItem={handleDeleteItem}
            onMarkReadItem={handleMarkReadItem}
          />

          <DataTablePagination
            page={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
          />
        </>
      )}
    </div>
  );
}
