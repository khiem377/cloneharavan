'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '../../../../components/ui/toast';
import { authService } from '../../../../services/auth.service';
import useAuthStore from '../../../../store/authStore';

const formatDisplayError = (rawError, provider = 'TikTok') => {
  if (!rawError) return `Đăng nhập ${provider} thất bại. Vui lòng thử lại!`;
  const errStr = typeof rawError === 'string' ? rawError : JSON.stringify(rawError);
  const lower = errStr.toLowerCase();

  if (lower.includes('code verifier') || lower.includes('invalid code verifier') || lower.includes('pkce')) {
    return 'Phiên xác thực bảo mật đã hết hạn hoặc không khớp. Vui lòng quay lại trang đăng nhập và thử lại!';
  }
  if (lower.includes('invalid_grant') || lower.includes('code has expired') || lower.includes('expired') || lower.includes('used') || lower.includes('invalid authorization code')) {
    return 'Mã xác thực đã hết hạn hoặc đã được sử dụng. Vui lòng thực hiện đăng nhập lại!';
  }
  if (lower.includes('access_denied') || lower.includes('cancel') || lower.includes('user_denied')) {
    return `Bạn đã từ chối hoặc hủy cấp quyền đăng nhập với ${provider}.`;
  }
  if (lower.includes('redirect_uri') || lower.includes('redirect uri')) {
    return 'Địa chỉ chuyển hướng xác thực không hợp lệ. Vui lòng thử lại!';
  }
  if (lower.includes('invalid_client') || lower.includes('client_key') || lower.includes('client secret')) {
    return 'Thông tin ứng dụng xác thực chưa chính xác. Vui lòng liên hệ quản trị viên!';
  }
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(errStr)) {
    return errStr;
  }
  return `Đăng nhập ${provider} không thành công do phiên xác thực bị gián đoạn. Vui lòng thử lại!`;
};

function TikTokCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const processTikTokCallback = async () => {
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const actionParam = searchParams.get('action');
      const savedAction =
        typeof window !== 'undefined' ? sessionStorage.getItem('tiktok_action') : null;
      const isLinkAction =
        actionParam === 'link' ||
        state?.startsWith('link_') ||
        (savedAction === 'link' && !state?.startsWith('tiktok_'));
      const isAdminState = state?.startsWith('admin_') || state?.includes('admin');

      const notifyOpenerAndClose = (type, payload = null, message = null) => {
        if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(
              {
                type,
                provider: 'tiktok',
                isLink: isLinkAction,
                payload,
                message,
              },
              window.location.origin
            );
            window.close();
            return true;
          } catch (e) {
            console.warn('postMessage to opener failed:', e);
          }
        }
        return false;
      };

      const redirectToError = (msg) => {
        if (notifyOpenerAndClose('OAUTH_AUTH_ERROR', null, msg)) return;
        toast.error(msg);
        if (isLinkAction) {
          window.location.replace('/tai-khoan?tab=security');
        } else {
          window.location.replace('/login');
        }
      };

      if (error) {
        const errorMsg = formatDisplayError(errorDescription || error, 'TikTok');
        redirectToError(errorMsg);
        return;
      }

      if (!code) {
        redirectToError('Không tìm thấy mã xác thực (authorization code) từ TikTok.');
        return;
      }

      // Nếu đây là luồng từ Admin Dashboard (port 5173), chuyển tiếp ngay về Admin callback
      if (isAdminState) {
        const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173';
        window.location.href = `${adminBaseUrl}/auth/tiktok/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}${actionParam ? `&action=${actionParam}` : ''}`;
        return;
      }

      try {
        let codeVerifier = null;
        if (typeof window !== 'undefined') {
          codeVerifier = sessionStorage.getItem('tiktok_code_verifier');
        }

        if (isLinkAction) {
          const redirectUri = `${window.location.origin}/auth/tiktok/callback?action=link`;
          const res = await authService.linkTikTok({
            code,
            redirectUri,
            codeVerifier,
          });

          if (res.success || res.status === 'success' || res.data) {
            if (notifyOpenerAndClose('OAUTH_AUTH_SUCCESS', res.data || res)) return;

            toast.success(res.message || 'Liên kết tài khoản TikTok thành công!');
            window.location.replace('/tai-khoan?tab=security');
            return;
          } else {
            const errMsg = formatDisplayError(res.message || 'Liên kết tài khoản TikTok không thành công.', 'TikTok');
            redirectToError(errMsg);
            return;
          }
        }

        const sessionId = anonymousId || getOrCreateAnonymousId();
        const redirectUri =
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth/tiktok/callback`
            : (process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI || 'http://localhost:3000/auth/tiktok/callback');

        const res = await authService.tiktokLogin({
          code,
          redirectUri,
          codeVerifier,
          sessionId,
          isAdminRequest: false,
        });

        if ((res.success || res.status === 'success') && res.data) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('tiktok_code_verifier');
            sessionStorage.removeItem('tiktok_action');
          }

          if (notifyOpenerAndClose('OAUTH_AUTH_SUCCESS', res.data)) {
            return;
          }

          setAuth({
            user: res.data.user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          });

          let targetRedirect = '/';
          if (typeof window !== 'undefined') {
            const savedRedirect = sessionStorage.getItem('tiktok_redirect_url');
            if (savedRedirect) {
              targetRedirect = savedRedirect;
              sessionStorage.removeItem('tiktok_redirect_url');
            }
          }

          toast.success(res.message || 'Đăng nhập TikTok thành công!');
          router.replace(targetRedirect);
        } else {
          const errMsg = formatDisplayError(res.message || 'Xác thực tài khoản TikTok không thành công.', 'TikTok');
          redirectToError(errMsg);
        }
      } catch (err) {
        const rawMsg =
          err.response?.data?.message ||
          err.message ||
          'Đăng nhập TikTok thất bại. Vui lòng thử lại sau!';

        const msg = formatDisplayError(rawMsg, 'TikTok');
        redirectToError(msg);
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('tiktok_action');
        }
      }
    };

    processTikTokCallback();
  }, [searchParams, setAuth, anonymousId, getOrCreateAnonymousId]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-black animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang hoàn tất xác thực TikTok...</p>
      </div>
    </div>
  );
}

export default function TikTokCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-black animate-spin" />
        </div>
      }
    >
      <TikTokCallbackContent />
    </Suspense>
  );
}
