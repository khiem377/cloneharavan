'use client';

import { useState, useEffect, useCallback } from 'react';
import authService from '@/services/auth.service';
import { useToast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';

export function useAccountSessions() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data = await authService.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (sessionId) => {
    const isConfirmed = await confirm({
      title: 'Đăng xuất thiết bị?',
      description: 'Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này?',
      confirmText: 'Đăng xuất',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return false;

    try {
      const res = await authService.logoutSession(sessionId);
      toast.success(res?.message || 'Đã đăng xuất thiết bị thành công');
      await fetchSessions();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng xuất thiết bị');
      return false;
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    const isConfirmed = await confirm({
      title: 'Đăng xuất các thiết bị khác?',
      description: 'Tất cả các phiên đăng nhập khác ngoại trừ thiết bị hiện tại sẽ bị hủy hiệu lực ngay lập tức.',
      confirmText: 'Đăng xuất tất cả',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return false;

    try {
      const res = await authService.logoutOtherSessions();
      toast.success(res?.message || 'Đã đăng xuất các thiết bị khác thành công');
      await fetchSessions();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đăng xuất');
      return false;
    }
  };

  return {
    sessions,
    loadingSessions,
    fetchSessions,
    handleRevokeSession,
    handleRevokeAllOtherSessions,
  };
}
