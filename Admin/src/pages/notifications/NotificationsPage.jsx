import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import notificationService from '@/services/notification.service';
import { getSocket } from '@/services/socket.service';
import { playNotificationSound } from '@/utils/notificationAudio';
import DataTablePagination from '@/components/ui/DataTablePagination';
import NotificationHeader from './components/NotificationHeader';
import NotificationStats from './components/NotificationStats';
import NotificationFilters from './components/NotificationFilters';
import NotificationTable from './components/NotificationTable';
import NotificationBatchBar from './components/NotificationBatchBar';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
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
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
      };

      if (statusFilter === 'unread') params.isRead = false;
      if (statusFilter === 'read') params.isRead = true;
      if (typeFilter !== 'all') params.type = typeFilter;

      const res = await notificationService.getNotifications(params);

      if (res?.success) {
        setNotifications(res.data || []);
        if (typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        }
        if (res.stats) {
          setStats(res.stats);
        }
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
  }, [page, limit, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time Socket.io listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNew = (newNotif) => {
      playNotificationSound();
      toast.info(newNotif.message || newNotif.title, {
        title: newNotif.title || 'Thông báo mới',
        duration: 5000,
      });
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
      setStats((prev) =>
        prev ? { ...prev, totalAll: prev.totalAll + 1, unreadCount: prev.unreadCount + 1 } : null
      );
    };

    socket.on('notification:new', handleNew);
    return () => socket.off('notification:new', handleNew);
  }, []);

  // Selection
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

  // Actions
  const handleMarkAllRead = async () => {
    try {
      setIsProcessing(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setStats((prev) => (prev ? { ...prev, unreadCount: 0 } : null));
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (err) {
      toast.error('Lỗi khi đánh dấu đã đọc', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkReadItem = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      setStats((prev) =>
        prev ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) } : null
      );
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái', { description: err.message });
    }
  };

  const handleMarkReadSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsProcessing(true);
      await Promise.all(selectedIds.map((id) => notificationService.markAsRead(id)));
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - selectedIds.length));
      toast.success(`Đã đánh dấu ${selectedIds.length} thông báo là đã đọc`);
      setSelectedIds([]);
    } catch (err) {
      toast.error('Lỗi khi đánh dấu thông báo đã chọn', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      toast.success('Đã xóa thông báo');
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      setStats((prev) =>
        prev ? { ...prev, totalAll: Math.max(0, prev.totalAll - 1) } : null
      );
    } catch (err) {
      toast.error('Lỗi khi xóa thông báo', { description: err.message });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} thông báo đã chọn?`)) {
      return;
    }
    try {
      setIsProcessing(true);
      await notificationService.deleteBulkNotifications(selectedIds);
      setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n._id)));
      toast.success(`Đã xóa ${selectedIds.length} thông báo`);
      setSelectedIds([]);
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - selectedIds.length),
      }));
      setStats((prev) =>
        prev ? { ...prev, totalAll: Math.max(0, prev.totalAll - selectedIds.length) } : null
      );
    } catch (err) {
      toast.error('Lỗi khi xóa hàng loạt', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleItemClick = (item) => {
    if (!item.isRead) {
      handleMarkReadItem(item._id);
    }
    const targetOrderId = item.metadata?.orderId || item.metadata?.orderCode;
    if (targetOrderId) {
      navigate(`/orders/${targetOrderId}`);
    } else if (item.link && item.link.includes('code=')) {
      navigate(`/orders/${item.link.split('code=')[1]}`);
    } else if (item.link) {
      navigate(item.link);
    } else {
      navigate('/orders');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <NotificationHeader
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
        onRefresh={fetchNotifications}
        isProcessing={isProcessing || loading}
      />

      {/* Stats Summary Cards */}
      <NotificationStats
        notifications={notifications}
        stats={stats}
        totalItems={pagination.total}
        unreadCount={unreadCount}
      />

      {/* Batch Action Bar */}
      <NotificationBatchBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onMarkReadSelected={handleMarkReadSelected}
        onDeleteSelected={handleDeleteSelected}
        isProcessing={isProcessing}
      />

      {/* Filter Controls */}
      <NotificationFilters
        statusFilter={statusFilter}
        onStatusChange={(newStatus) => {
          setStatusFilter(newStatus);
          setPage(1);
        }}
        typeFilter={typeFilter}
        onTypeChange={(newType) => {
          setTypeFilter(newType);
          setPage(1);
        }}
        search={search}
        onSearchChange={(newSearch) => {
          setSearch(newSearch);
          setPage(1);
        }}
      />

      {/* Table / List */}
      <NotificationTable
        notifications={notifications}
        selectedIds={selectedIds}
        loading={loading}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onItemClick={handleItemClick}
        onDeleteItem={handleDeleteItem}
        onMarkReadItem={handleMarkReadItem}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pt-2">
          <DataTablePagination
            page={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
