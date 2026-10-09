import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { getDefaultRedirectPath } from '@/utils/permissionUtils';
import { Button } from '@/components/ui/button';

export default function AdminAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const hasHandledRef = useRef(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (hasHandledRef.current) return;
      hasHandledRef.current = true;
      // 1. Kiểm tra nếu có token truyền trực tiếp từ client callback
      const directToken = searchParams.get('token');
      const directRefreshToken = searchParams.get('refreshToken');

      if (directToken) {
        try {
          // Lưu token tạm thời và gọi getMe để lấy profile user
          setAuth({
            user: null,
            accessToken: directToken,
            refreshToken: directRefreshToken || null,
          });

          const { data } = await authService.getMe();
          const user = data.data.user;

          if (user.role === 'user') {
            setStatus('error');
            setErrorMessage('Tài khoản của bạn không có quyền truy cập trang quản trị!');
            return;
          }

          setAuth({
            user,
            accessToken: directToken,
            refreshToken: directRefreshToken || null,
          });

          setStatus('success');
          toast.success('Đăng nhập thành công!');
          const targetPath = getDefaultRedirectPath(user);
          setTimeout(() => navigate(targetPath, { replace: true }), 500);
          return;
        } catch (err) {
          setStatus('error');
          setErrorMessage('Phiên xác thực không hợp lệ. Vui lòng đăng nhập lại!');
          return;
        }
      }

      // 2. Nếu có authorization code trực tiếp từ Zalo hoặc TikTok
      const code = searchParams.get('code');
      const state = searchParams.get('state') || '';
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      const isZalo = window.location.pathname.includes('zalo') || state.includes('zalo');
      const providerName = isZalo ? 'Zalo' : 'TikTok';
      const actionParam = searchParams.get('action');
      const savedAction =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(isZalo ? 'zalo_action' : 'tiktok_action')
          : null;
      const action =
        actionParam === 'link' ||
        state.startsWith('link_') ||
        (savedAction === 'link' && !state.startsWith(isZalo ? 'zalo_' : 'tiktok_'))
          ? 'link'
          : 'login';

      if (error) {
        setStatus('error');
        setErrorMessage(
          errorDescription ||
          (error === 'access_denied'
            ? `Bạn đã từ chối cấp quyền ${providerName}.`
            : `Lỗi xác thực ${providerName}: ${error}`)
        );
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('Không tìm thấy thông tin xác thực từ nhà cung cấp.');
        return;
      }

      try {
        let resData;

        if (action === 'link') {
          // Xử lý Liên kết tài khoản vào hồ sơ hiện tại
          if (isZalo) {
            const redirectUri = `${window.location.origin}/auth/zalo/callback?action=link`;
            let codeVerifier = null;
            if (typeof window !== 'undefined') {
              codeVerifier = sessionStorage.getItem('zalo_code_verifier');
              sessionStorage.removeItem('zalo_code_verifier');
              sessionStorage.removeItem('zalo_action');
            }
            const res = await authService.linkZalo(code, redirectUri, codeVerifier);
            resData = res.data;
          } else {
            const redirectUri = `${window.location.origin}/auth/tiktok/callback?action=link`;
            let codeVerifier = null;
            if (typeof window !== 'undefined') {
              codeVerifier = sessionStorage.getItem('tiktok_code_verifier');
              sessionStorage.removeItem('tiktok_code_verifier');
              sessionStorage.removeItem('tiktok_action');
            }
            const res = await authService.linkTikTok(code, redirectUri, codeVerifier);
            resData = res.data;
          }

          setStatus('success');
          toast.success(resData.message || `Liên kết ${providerName} thành công!`);
          setTimeout(() => navigate('/profile', { replace: true }), 500);
          return;
        }

        // Xử lý Đăng nhập thông thường
        if (isZalo) {
          const redirectUri =
            import.meta.env.VITE_ZALO_REDIRECT_URI ||
            `${window.location.origin}/auth/zalo/callback`;

          let codeVerifier = null;
          if (typeof window !== 'undefined') {
            codeVerifier = sessionStorage.getItem('zalo_code_verifier');
            sessionStorage.removeItem('zalo_code_verifier');
          }

          const res = await authService.zaloLogin(code, redirectUri, codeVerifier);
          resData = res.data;
        } else {
          const redirectUri =
            import.meta.env.VITE_TIKTOK_REDIRECT_URI ||
            `${window.location.origin}/auth/tiktok/callback`;

          let codeVerifier = null;
          if (typeof window !== 'undefined') {
            codeVerifier = sessionStorage.getItem('tiktok_code_verifier');
            sessionStorage.removeItem('tiktok_code_verifier');
          }

          const res = await authService.tiktokLogin(code, redirectUri, codeVerifier);
          resData = res.data;
        }

        const user = resData.data.user;

        if (user.role === 'user') {
          setStatus('error');
          setErrorMessage(`Tài khoản ${providerName} này không có quyền truy cập trang quản trị!`);
          return;
        }

        setAuth({
          user,
          accessToken: resData.data.accessToken,
          refreshToken: resData.data.refreshToken,
        });

        setStatus('success');
        toast.success(resData.message || `Đăng nhập ${providerName} thành công!`);

        const targetPath = getDefaultRedirectPath(user);
        setTimeout(() => navigate(targetPath, { replace: true }), 500);
      } catch (err) {
        setStatus('error');
        const msg =
          err.response?.data?.message ||
          err.message ||
          `Xác thực ${providerName} thất bại. Vui lòng thử lại!`;
        setErrorMessage(msg);
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('zalo_action');
          sessionStorage.removeItem('tiktok_action');
        }
      }
    };

    handleAuthCallback();
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[400px] rounded-[6px] border border-border bg-card p-6 shadow-xs text-card-foreground text-center space-y-4">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-muted border border-border">
          {status === 'processing' && <Loader2 className="w-6 h-6 text-foreground animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          {status === 'error' && <AlertCircle className="w-6 h-6 text-destructive" />}
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            {status === 'processing' && 'Đang xác thực tài khoản quản trị...'}
            {status === 'success' && 'Xác thực thành công!'}
            {status === 'error' && 'Đăng nhập không thành công'}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {status === 'processing' && 'Hệ thống đang kiểm tra quyền quản trị của bạn, vui lòng đợi trong giây lát.'}
            {status === 'success' && 'Đang chuyển hướng vào bảng điều khiển quản trị...'}
            {status === 'error' && errorMessage}
          </p>
        </div>

        {status === 'error' && (
          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full h-9 rounded-[6px] text-xs font-semibold"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Quay lại Đăng nhập
            </Button>
          </div>
        )}

        {status === 'processing' && (
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 w-full rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
