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
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/toast';
import { confirm } from '../ui/confirm-dialog';
import authService from '@/services/auth.service';

export default function SessionsModal({
  open,
  onOpenChange,
  sessions = [],
  onRefreshSessions,
}) {
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
      console.error('Lỗi khi làm mới phiên đăng nhập:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (sessions && sessions.length > 0) {
        setInternalSessions(sessions);
      }
      fetchSessionData();
    }
  }, [open]);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setInternalSessions(sessions);
    }
  }, [sessions]);

  if (!open) return null;

  const handleLogoutSession = async (sessionId) => {
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

  // Icon thiết bị phẳng, tối giản
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

  // Định dạng thời gian thân thiện chuẩn F8: "Hoạt động 12 giây trước", "Hoạt động 5 phút trước"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-[6px] border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-slate-900">Phiên đăng nhập</h3>
            <p className="text-xs text-slate-500">
              Bạn đang sử dụng {activeSessionsList.length || 1} phiên đăng nhập trên các thiết bị.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={fetchSessionData}
              disabled={loading}
              title="Làm mới danh sách"
              className="w-7 h-7 rounded-[4px] border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition active:scale-[0.98]"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-[4px] border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition active:scale-[0.98]"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-3">
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
                      className="h-7 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-[6px] active:scale-[0.98] shrink-0"
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

        {/* Modal Footer */}
        {otherSessionsCount > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Có {otherSessionsCount} thiết bị khác đang kết nối
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogoutOthers}
              disabled={loggingOutOthers}
              className="h-8 px-3 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-slate-200 rounded-[6px] active:scale-[0.98]"
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
      </div>
    </div>
  );
}
