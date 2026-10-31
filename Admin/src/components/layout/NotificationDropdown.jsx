import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight, Inbox } from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { getSocket } from '@/services/socket.service';
import { toast } from '@/providers/ToastProvider';
import { playNotificationSound } from '@/utils/notificationAudio';
import NotificationDropdownItem from './NotificationDropdownItem';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'orders', label: 'Đơn hàng' },
  { id: 'system', label: 'Kho & Hệ thống' },
];

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ limit: 30 });
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[NotificationDropdown] Lỗi tải thông báo:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Realtime Socket.io listener
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
    };

    socket.on('notification:new', handleNew);
    return () => socket.off('notification:new', handleNew);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (_) {}
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {}
  };

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      handleMarkSingleRead(notif._id);
    }
    setOpen(false);
    const targetOrderId = notif.metadata?.orderId || notif.metadata?.orderCode;
    if (targetOrderId) {
      navigate(`/orders/${targetOrderId}`);
    } else if (notif.link && notif.link.includes('code=')) {
      navigate(`/orders/${notif.link.split('code=')[1]}`);
    } else if (notif.link) {
      navigate(notif.link);
    } else {
      navigate('/orders');
    }
  };

  const filteredList = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread') return !n.isRead;
      if (activeTab === 'orders') return n.type === 'ORDER_NEW' || n.type === 'ORDER_CANCELLED' || n.type === 'ORDER_STATUS';
      if (activeTab === 'system') return n.type === 'STOCK_LOW' || n.type === 'SYSTEM';
      return true;
    });
  }, [notifications, activeTab]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) fetchNotifications();
        }}
        className="size-8.5 flex items-center justify-center rounded-[6px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-[0.98] cursor-pointer relative"
        title="Thông báo hệ thống"
        aria-label="Thông báo hệ thống"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono tabular-nums leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-[410px] rounded-[6px] border border-border bg-card shadow-sm z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-[4px] bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10.5px] font-bold font-mono tabular-nums">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer transition active:scale-[0.98]"
              >
                <CheckCheck size={13} />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1 p-1.5 border-b border-border bg-muted/10 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[11px] h-6.5 px-2.5 rounded-[4px] font-medium shrink-0 transition active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? 'bg-background text-foreground font-bold border border-border shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {loading && notifications.length === 0 ? (
              <div className="p-2 space-y-2">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="p-3 flex items-start gap-3 animate-pulse">
                    <div className="size-8 rounded-[6px] bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-muted rounded-[4px] w-1/4" />
                      <div className="h-3 bg-muted rounded-[4px] w-3/4" />
                      <div className="h-2.5 bg-muted rounded-[4px] w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="size-10 rounded-[6px] bg-muted/50 flex items-center justify-center text-muted-foreground/50 mb-2">
                  <Inbox size={20} />
                </div>
                <p className="text-xs font-semibold text-foreground">Bạn đã xem hết thông báo!</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Không có thông báo mới nào thuộc danh mục này.
                </p>
              </div>
            ) : (
              filteredList.map((item) => (
                <NotificationDropdownItem
                  key={item._id}
                  item={item}
                  onClick={handleItemClick}
                  onMarkRead={handleMarkSingleRead}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-border bg-muted/20 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5 cursor-pointer py-0.5 transition active:scale-[0.98]"
            >
              <span>Xem toàn bộ thông báo trong trang quản lý</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
