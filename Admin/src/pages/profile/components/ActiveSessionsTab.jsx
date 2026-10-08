import { useState, useEffect } from 'react';
import { Laptop, Smartphone, Tablet, Clock, RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';
import { cn } from '@/lib/utils';

/**
 * Active Login Sessions & Devices Tab
 */
export default function ActiveSessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loggingOutSessionId, setLoggingOutSessionId] = useState(null);
  const [loggingOutOthers, setLoggingOutOthers] = useState(false);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await authService.getSessions();
      setSessions(res.data?.data?.sessions || res.data?.sessions || []);
    } catch (err) {
      console.error('Lỗi lấy phiên đăng nhập Admin:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleLogoutSession = async (sessionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này?')) return;
    setLoggingOutSessionId(sessionId);
    try {
      await authService.logoutSession(sessionId);
      toast.success('Đã đăng xuất khỏi thiết bị');
      setSessions((p) => p.filter((s) => s.sessionId !== sessionId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng xuất thiết bị');
    } finally {
      setLoggingOutSessionId(null);
    }
  };

  const handleLogoutOtherSessions = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác?')) return;
    setLoggingOutOthers(true);
    try {
      await authService.logoutOtherSessions();
      toast.success('Đã đăng xuất khỏi tất cả các thiết bị khác');
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đăng xuất thiết bị khác');
    } finally {
      setLoggingOutOthers(false);
    }
  };

  return (
    <Card className="rounded-[6px] border border-border bg-card shadow-xs">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Laptop className="size-5 text-primary" />
              <span>Phiên đăng nhập & Thiết bị hoạt động</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Kiểm tra và quản lý các thiết bị đang đăng nhập vào bảng điều khiển quản trị viên.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchSessions}
              disabled={loadingSessions}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-[6px] cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw size={13} className={loadingSessions ? 'animate-spin' : ''} />
            </Button>

            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogoutOtherSessions}
                disabled={loggingOutOthers}
                className="h-8 px-3 text-xs text-destructive hover:bg-destructive/10 border-border rounded-[6px] active:scale-[0.98] cursor-pointer"
              >
                {loggingOutOthers ? (
                  <Loader2 size={12} className="animate-spin mr-1.5" />
                ) : (
                  <LogOut size={12} className="mr-1.5" />
                )}
                Đăng xuất thiết bị khác ({sessions.filter((s) => !s.isCurrent).length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loadingSessions ? (
          <div className="flex items-center justify-center p-8 text-xs text-muted-foreground font-mono">
            <Loader2 size={16} className="animate-spin mr-2" /> Đang tải danh sách thiết bị...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Không có phiên đăng nhập nào
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((session, index) => {
              const isCurrent = session.isCurrent;
              return (
                <div
                  key={session.sessionId || index}
                  className={cn(
                    'p-4 flex items-center justify-between gap-4 transition-colors',
                    isCurrent ? 'bg-primary/5' : 'hover:bg-muted/20'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'size-9 rounded-[6px] border flex items-center justify-center shrink-0',
                        isCurrent
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-muted border-border text-muted-foreground'
                      )}
                    >
                      {session.deviceType === 'mobile' ? (
                        <Smartphone size={16} />
                      ) : session.deviceType === 'tablet' ? (
                        <Tablet size={16} />
                      ) : (
                        <Laptop size={16} />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-xs text-foreground truncate">
                          {session.deviceName || `${session.os} (${session.browser})`}
                        </h4>
                        {isCurrent ? (
                          <Badge
                            variant="outline"
                            className="rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono shrink-0"
                          >
                            Phiên hiện tại
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {session.browser || 'Trình duyệt Web'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono flex-wrap">
                        <span className="tabular-nums">IP: {session.ip || '127.0.0.1'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-sans">
                          <Clock size={11} className="text-muted-foreground" />
                          {isCurrent
                            ? 'Đang hoạt động'
                            : session.lastActiveAt
                            ? new Date(session.lastActiveAt).toLocaleString('vi-VN')
                            : 'Vừa xong'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogoutSession(session.sessionId)}
                      disabled={loggingOutSessionId === session.sessionId}
                      className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border rounded-[6px] active:scale-[0.98] shrink-0 cursor-pointer"
                    >
                      {loggingOutSessionId === session.sessionId ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          <LogOut size={12} className="mr-1" />
                          Đăng xuất
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
