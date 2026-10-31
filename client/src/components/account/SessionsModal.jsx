'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  LogOut,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';
import authService from '@/services/auth.service';

export default function SessionsModal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  sessions = [],
  onRefreshSessions,
  onRevokeSession,
  onRevokeAllOtherSessions,
}) {
  const isModalOpen = Boolean(isOpen !== undefined ? isOpen : open);
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const { toast } = useToast();
  const [internalSessions, setInternalSessions] = useState(sessions);
  const [loading, setLoading] = useState(false);
  const [loggingOutId, setLoggingOutId] = useState(null);
  const [loggingOutOthers, setLoggingOutOthers] = useState(false);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const data = await authService.getSessions();
      const list = Array.isArray(data) ? data : [];
      setInternalSessions(list);
      if (onRefreshSessions) await onRefreshSessions();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      if (sessions && sessions.length > 0) {
        setInternalSessions(sessions);
      }
      fetchSessionData();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setInternalSessions(sessions);
    }
  }, [sessions]);

  if (!isModalOpen) return null;

  const handleLogoutSession = async (sessionId) => {
    if (onRevokeSession) {
      await onRevokeSession(sessionId);
      await fetchSessionData();
      return;
    }
    const isConfirmed = await confirm({
      title: 'Đăng xuất thiết bị?',
      description: 'Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này?',
      confirmText: 'Đăng xuất',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    setLoggingOutId(sessionId);
    try {
      const res = await authService.logoutSession(sessionId);
      toast.success(res?.message || 'Đã đăng xuất thiết bị');
      await fetchSessionData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng xuất thiết bị');
    } finally {
      setLoggingOutId(null);
    }
  };

  const handleLogoutOthers = async () => {
    if (onRevokeAllOtherSessions) {
      await onRevokeAllOtherSessions();
      await fetchSessionData();
      return;
    }
    const isConfirmed = await confirm({
      title: 'Đăng xuất các thiết bị khác?',
      description:
        'Tất cả các phiên đăng nhập khác ngoại trừ thiết bị hiện tại sẽ bị hủy hiệu lực ngay lập tức.',
      confirmText: 'Đăng xuất tất cả',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    setLoggingOutOthers(true);
    try {
      const res = await authService.logoutOtherSessions();
      toast.success(res?.message || 'Đã đăng xuất các thiết bị khác thành công');
      await fetchSessionData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đăng xuất');
    } finally {
      setLoggingOutOthers(false);
    }
  };

  const getDeviceIcon = (deviceType = '', browser = '') => {
    const dt = (deviceType || '').toLowerCase();
    const br = (browser || '').toLowerCase();
    if (dt === 'mobile' || br.includes('mobile') || br.includes('iphone') || br.includes('android'))
      return <Smartphone size={16} className="text-slate-600" />;
    if (dt === 'tablet' || br.includes('ipad') || br.includes('tablet'))
      return <Tablet size={16} className="text-slate-600" />;
    if (dt === 'desktop' || br.includes('pc') || br.includes('windows') || br.includes('mac'))
      return <Laptop size={16} className="text-slate-600" />;
    return <Monitor size={16} className="text-slate-600" />;
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Vừa xong';
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 45) return 'Hoạt động vài giây trước';
    if (diffSec < 3600) return `Hoạt động ${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `Hoạt động ${Math.floor(diffSec / 3600)} giờ trước`;
    return `Hoạt động ${d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const activeSessionsList = internalSessions.length > 0 ? internalSessions : sessions;
  const otherSessionsCount = activeSessionsList.filter((s) => !s.isCurrent).length;

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-lg p-0 rounded-[6px] overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <DialogTitle className="text-sm font-bold text-slate-900">
              Phiên đăng nhập
            </DialogTitle>
            <p className="text-xs text-slate-500">
              Bạn đang sử dụng {activeSessionsList.length || 1} phiên đăng nhập trên các thiết bị.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={fetchSessionData}
            disabled={loading}
            title="Làm mới danh sách"
            className="rounded-[4px] border-slate-200"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </Button>
        </DialogHeader>

        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {loading && activeSessionsList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 size={18} className="animate-spin text-slate-500" />
              <span>Đang tải thông tin thiết bị...</span>
            </div>
          ) : activeSessionsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Không tìm thấy phiên đăng nhập nào
            </div>
          ) : (
            activeSessionsList.map((session, index) => {
              const isCurrent = session.isCurrent;
              return (
                <div
                  key={session.sessionId || index}
                  className={`p-3.5 rounded-[6px] border flex items-center justify-between gap-3.5 transition-colors ${
                    isCurrent
                      ? 'bg-emerald-50/20 border-emerald-200/80'
                      : 'bg-white border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-[6px] border flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-white border-emerald-200 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {getDeviceIcon(session.deviceType, session.browser)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {session.browser || 'Chrome'} • {session.os || 'Windows'}
                        </span>
                        {isCurrent && (
                          <Badge
                            variant="outline"
                            className="rounded-[4px] bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium shrink-0 px-1.5 py-0"
                          >
                            Hiện tại
                          </Badge>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span>{session.location || 'Hồ Chí Minh, Việt Nam'}</span>
                        <span>•</span>
                        <span>{isCurrent ? 'Đang hoạt động' : formatTimeAgo(session.lastActiveAt)}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                        {session.ip || '127.0.0.1'}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLogoutSession(session.sessionId)}
                      disabled={loggingOutId === session.sessionId}
                      className="h-7 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-[6px] shrink-0"
                    >
                      {loggingOutId === session.sessionId ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        'Đăng xuất'
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {otherSessionsCount > 0 && (
          <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Có {otherSessionsCount} thiết bị khác đang kết nối
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogoutOthers}
              disabled={loggingOutOthers}
              className="h-8 px-3 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-slate-200 rounded-[6px]"
            >
              {loggingOutOthers ? (
                <Loader2 size={12} className="animate-spin mr-1.5" />
              ) : (
                <LogOut size={12} className="mr-1.5" />
              )}
              Đăng xuất thiết bị khác
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
