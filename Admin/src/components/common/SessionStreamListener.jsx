import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';

export default function SessionStreamListener() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [blockedNotice, setBlockedNotice] = useState(null);

  useEffect(() => {
    const handleForceLogout = (e) => {
      useAuthStore.getState().clearAuth();
      setBlockedNotice(e.detail?.reason || 'Tài khoản quản trị của bạn đã bị khóa. Toàn bộ phiên đăng nhập đã bị hủy.');
      setTimeout(() => {
        window.location.href = '/login?reason=blocked';
      }, 3500);
    };

    window.addEventListener('session:force_logout', handleForceLogout);
    return () => window.removeEventListener('session:force_logout', handleForceLogout);
  }, []);

  useEffect(() => {
    if ((!accessToken && !refreshToken) || typeof window === 'undefined') return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const params = new URLSearchParams();
    if (accessToken) params.set('token', accessToken);
    if (refreshToken) params.set('refreshToken', refreshToken);

    let es = null;
    try {
      es = new EventSource(`${baseUrl}/auth/session-stream?${params.toString()}`);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'FORCE_LOGOUT') {
            if (es) es.close();
            useAuthStore.getState().clearAuth();
            setBlockedNotice(data.reason || 'Tài khoản quản trị của bạn đã bị khóa. Toàn bộ phiên đăng nhập đã bị hủy.');
            setTimeout(() => {
              window.location.href = '/login?reason=blocked';
            }, 3500);
          }
        } catch (_) {
          // Heartbeat or other event
        }
      };

      es.onerror = () => {
        // Tránh loop spam nếu kết nối bị từ chối
      };
    } catch (_) {}

    return () => {
      if (es) es.close();
    };
  }, [accessToken, refreshToken]);

  if (!blockedNotice) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-[6px] border border-red-500/30 bg-card p-6 shadow-xl text-center flex flex-col items-center gap-3">
        <div className="size-12 rounded-[6px] bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-xl">
          ✕
        </div>
        <h3 className="text-base font-bold text-foreground">Phiên làm việc đã bị hủy</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{blockedNotice}</p>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground/80">
          <div className="size-3.5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          <span>Đang chuyển hướng về trang đăng nhập...</span>
        </div>
        <button
          onClick={() => {
            window.location.href = '/login?reason=blocked';
          }}
          className="mt-2 w-full h-9 rounded-[6px] bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all active:scale-[0.98]"
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
