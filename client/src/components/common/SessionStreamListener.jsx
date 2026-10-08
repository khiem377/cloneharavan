'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ShieldAlert, ArrowRight, Home, PhoneCall } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const SYNC_CHANNEL_NAME = 'haravan_session_sync';
const REDIRECT_COUNTDOWN_SECONDS = 5;

export default function SessionStreamListener() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [blockedNotice, setBlockedNotice] = useState(null);
  const [countdown, setCountdown] = useState(REDIRECT_COUNTDOWN_SECONDS);
  const [eventTimestamp, setEventTimestamp] = useState('');
  const isKickedRef = useRef(false);

  // Kích hoạt giao diện Force Logout & xóa toàn bộ phiên đăng nhập
  const triggerForceLogout = useCallback(
    (reason) => {
      if (isKickedRef.current) return;
      isKickedRef.current = true;

      const fallbackMsg =
        'Tài khoản của bạn đã bị vô hiệu hóa bởi Quản trị viên hệ thống.';
      const finalMsg = reason || fallbackMsg;

      // 1. Xóa sạch dữ liệu auth trong local state/storage
      clearAuth();

      // 2. Đồng bộ phát tín hiệu tới tất cả các tab khác đang mở trên trình duyệt
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
          bc.postMessage({ type: 'FORCE_LOGOUT', reason: finalMsg });
          bc.close();
        } catch (_) {}
      }

      // 3. Đánh dấu thời điểm xảy ra sự kiện
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const dateStr = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      setEventTimestamp(`${timeStr} · ${dateStr}`);

      // 4. Hiển thị modal thông báo khóa tài khoản
      setBlockedNotice(finalMsg);
    },
    [clearAuth]
  );

  // Đếm ngược tự động chuyển hướng về trang đăng nhập
  useEffect(() => {
    if (!blockedNotice) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/login?reason=blocked';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedNotice]);

  // 1. Lắng nghe sự kiện custom từ Axios Interceptor (khi bất kỳ API nào gặp 403 deactivated)
  useEffect(() => {
    const handleCustomLogout = (event) => {
      triggerForceLogout(event.detail?.reason);
    };
    window.addEventListener('session:force_logout', handleCustomLogout);
    return () => {
      window.removeEventListener('session:force_logout', handleCustomLogout);
    };
  }, [triggerForceLogout]);

  // 2. Lắng nghe tín hiệu đồng bộ giữa các tabs trình duyệt (BroadcastChannel)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data?.type === 'FORCE_LOGOUT') {
        triggerForceLogout(event.data.reason);
      }
    };
    return () => {
      try {
        bc.close();
      } catch (_) {}
    };
  }, [triggerForceLogout]);

  // 3. Kênh realtime SSE (Server-Sent Events) đẩy tín hiệu tức thì khi tài khoản bị khóa
  useEffect(() => {
    if (!accessToken && !refreshToken) return;
    if (typeof window === 'undefined') return;

    const backendHost =
      process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:5000/api/v1';

    const params = new URLSearchParams();
    if (accessToken) params.set('token', accessToken);
    if (refreshToken) params.set('refreshToken', refreshToken);

    const sseUrl = `${backendHost}/auth/session-stream?${params.toString()}`;
    let es = null;

    try {
      es = new EventSource(sseUrl, { withCredentials: true });

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'FORCE_LOGOUT') {
            if (es) es.close();
            triggerForceLogout(data.reason);
          } else if (data.type === 'UNAUTHORIZED') {
            if (es) es.close();
          }
        } catch (_) {}
      };

      es.onerror = () => {
        // Đóng ngay kết nối khi gặp lỗi (ví dụ token hết hạn) để chống loop retry
        if (es) {
          try {
            es.close();
          } catch (_) {}
        }
      };
    } catch (_) {}

    return () => {
      if (es) {
        try {
          es.close();
        } catch (_) {}
      }
    };
  }, [accessToken, refreshToken, triggerForceLogout]);

  if (!blockedNotice) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/65 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[440px] rounded-[6px] border border-slate-200 bg-white shadow-sm overflow-hidden text-left flex flex-col">
        {/* Thanh đếm lùi thanh mảnh trên đỉnh */}
        <div className="h-1 w-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-slate-900 transition-all duration-1000 ease-linear"
            style={{
              width: `${(countdown / REDIRECT_COUNTDOWN_SECONDS) * 100}%`,
            }}
          />
        </div>

        {/* Nội dung chính */}
        <div className="p-6 flex flex-col gap-4">
          {/* Header kỹ thuật sắc nét */}
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-[6px] bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  Cảnh báo bảo mật
                </span>
                <span className="inline-block size-1.5 rounded-full bg-red-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Tài khoản của bạn vừa bị khóa
              </h3>
            </div>
          </div>

          {/* Mô tả */}
          <p className="text-xs text-slate-600 leading-relaxed">
            Quản trị viên đã khóa tài khoản này. Bạn đã bị đăng xuất khỏi tất cả thiết bị để bảo vệ tài khoản.
          </p>

          {/* Danh sách kỹ thuật phẳng (Flat Technical List - KHÔNG Card lồng Card) */}
          <div className="border-y border-slate-100 divide-y divide-slate-100 text-xs py-1">
            <div className="flex items-center justify-between py-2 text-slate-600">
              <span className="text-slate-400">Trạng thái:</span>
              <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-[4px] border border-red-200">
                Đã khóa
              </span>
            </div>
            <div className="flex items-center justify-between py-2 text-slate-600">
              <span className="text-slate-400">Ảnh hưởng:</span>
              <span className="font-medium text-slate-800">
                Tất cả thiết bị đang đăng nhập
              </span>
            </div>
            {eventTimestamp && (
              <div className="flex items-center justify-between py-2 text-slate-600">
                <span className="text-slate-400">Thời điểm ghi nhận:</span>
                <span className="font-mono text-slate-700">{eventTimestamp}</span>
              </div>
            )}
            <div className="py-2.5 text-slate-700">
              <span className="text-slate-400 block text-[11px] mb-1">
                Lý do từ Quản trị viên:
              </span>
              <p className="text-xs text-slate-900 font-medium leading-relaxed">
                {blockedNotice}
              </p>
            </div>
          </div>

          {/* Thông tin hỗ trợ */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Cần hỗ trợ mở khóa?</span>
            <div className="flex items-center gap-3">
              <a
                href="tel:19001000"
                className="font-medium text-slate-800 hover:text-red-600 hover:underline flex items-center gap-1"
              >
                <PhoneCall size={11} />
                1900 1000
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="mailto:hotro@shop.com"
                className="font-medium text-slate-800 hover:text-red-600 hover:underline"
              >
                hotro@shop.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50/60 p-4 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Tự động chuyển sau <span className="font-bold text-slate-900">{countdown} giây</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="h-8 px-3 rounded-[6px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              <Home size={13} />
              Trang chủ
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/login?reason=blocked';
              }}
              className="h-8 px-3.5 rounded-[6px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              Đăng nhập lại
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
