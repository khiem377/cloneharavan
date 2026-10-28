import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Package,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  Trash2,
} from '@/components/ui/Icons';
import { notificationService } from '@/services/notification.service';
import { getSocket } from '@/services/socket.service';
import { toast } from '@/providers/ToastProvider';

// Tạo âm thanh "Ting" tinh tế bằng Web Audio API
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Note A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // Note E6
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) {}
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 45) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  return `${Math.floor(diffSec / 86400)} ngày trước`;
};

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Tải danh sách thông báo và số lượng chưa đọc ban đầu
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ limit: 15 });
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Lỗi lấy thông báo:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 2. Lắng nghe Socket.io Realtime sự kiện notification:new
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      console.log('⚡ [NotificationDropdown] Nhận thông báo realtime:', newNotif);

      // Phát âm thanh Ting
      playNotificationSound();

      // Hiện toast thông báo nhỏ ở góc
      toast.info(newNotif.message || newNotif.title, {
        title: newNotif.title || 'Thông báo mới',
        description: newNotif.message ? undefined : undefined,
        duration: 6000,
      });

      // Cập nhật state realtime
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, []);

  // 3. Đánh dấu tất cả đã đọc
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (_) {}
  };

  // 4. Click vào một thông báo
  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (_) {}
    }

    setOpen(false);

    // Ưu tiên điều hướng thẳng vào trang chi tiết đơn hàng
    const targetOrderId = notif.metadata?.orderId || notif.metadata?.orderCode;
    if (targetOrderId) {
      navigate(`/orders/${targetOrderId}`);
    } else if (notif.link && notif.link.includes('code=')) {
      const code = notif.link.split('code=')[1];
      navigate(`/orders/${code}`);
    } else if (notif.link) {
      navigate(notif.link);
    } else {
      navigate('/orders');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_NEW':
        return <Package className="size-4 text-blue-600" />;
      case 'ORDER_CANCELLED':
        return <AlertCircle className="size-4 text-rose-500" />;
      case 'STOCK_LOW':
        return <AlertCircle className="size-4 text-amber-500" />;
      default:
        return <Bell className="size-4 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) fetchNotifications();
        }}
        className="size-8 flex items-center justify-center rounded-[6px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-[0.98] cursor-pointer relative"
        title="Thông báo"
        aria-label="Thông báo hệ thống"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono tabular-nums leading-none animate-in zoom-in-50 duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[6px] border border-border bg-card shadow-lg z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-[4px] bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10.5px] font-bold font-mono tabular-nums">
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="size-3" />
                <span>Đánh dấu tất cả là đã đọc</span>
              </button>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="size-7 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-foreground">Chưa có thông báo nào</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Các thông báo về đơn hàng và kho vận sẽ hiển thị tại đây theo thời gian thực.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 flex items-start gap-2.5 transition-colors cursor-pointer text-left hover:bg-muted/40 ${
                    !item.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="size-7 rounded-[4px] bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          !item.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/80'
                        }`}
                      >
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    <p className="text-[11.5px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 mt-1 font-mono tabular-nums">
                      <Clock className="size-2.5" />
                      <span>{formatTimeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
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
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
            >
              <span>Xem tất cả thông báo</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
