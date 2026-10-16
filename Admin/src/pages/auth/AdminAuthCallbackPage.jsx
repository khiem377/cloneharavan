import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { getDefaultRedirectPath } from '@/utils/permissionUtils';

const formatDisplayError = (rawError, provider = 'Zalo') => {
  if (!rawError) return `Đăng nhập ${provider} thất bại. Vui lòng thử lại!`;
  const errStr = typeof rawError === 'string' ? rawError : JSON.stringify(rawError);
  const lower = errStr.toLowerCase();

  if (lower.includes('code verifier') || lower.includes('invalid code verifier') || lower.includes('pkce')) {
    return 'Phiên xác thực bảo mật đã hết hạn hoặc không hợp lệ. Vui lòng quay lại và bấm Đăng nhập lại!';
  }
  if (lower.includes('invalid_grant') || lower.includes('code has expired') || lower.includes('expired') || lower.includes('used') || lower.includes('invalid authorization code')) {
    return 'Mã xác thực đã hết hạn hoặc đã được sử dụng. Vui lòng thực hiện đăng nhập lại!';
  }
  if (lower.includes('access_denied') || lower.includes('cancel') || lower.includes('user_denied')) {
    return `Bạn đã từ chối hoặc hủy cấp quyền đăng nhập với ${provider}.`;
  }
  if (lower.includes('redirect_uri') || lower.includes('redirect uri')) {
    return 'Địa chỉ chuyển hướng xác thực không khớp với hệ thống. Vui lòng thử lại!';
  }
  if (lower.includes('invalid_client') || lower.includes('app_id') || lower.includes('app secret')) {
    return 'Thông tin ứng dụng xác thực chưa chính xác. Vui lòng liên hệ quản trị viên!';
  }
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(errStr)) {
    return errStr;
  }
  return `Đăng nhập ${provider} không thành công do phiên xác thực bị gián đoạn. Vui lòng thử lại!`;
};

export default function AdminAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const hasHandledRef = useRef(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (hasHandledRef.current) return;
      hasHandledRef.current = true;

      const directToken = searchParams.get('token');
      const directRefreshToken = searchParams.get('refreshToken');

      const isZalo = window.location.pathname.includes('zalo') || searchParams.get('state')?.includes('zalo');
      const providerName = isZalo ? 'Zalo' : 'TikTok';
      const actionParam = searchParams.get('action');
      const savedAction =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(isZalo ? 'zalo_action' : 'tiktok_action')
          : null;
      const action =
        actionParam === 'link' ||
        searchParams.get('state')?.startsWith('link_') ||
        (savedAction === 'link' && !searchParams.get('state')?.startsWith(isZalo ? 'zalo_' : 'tiktok_'))
          ? 'link'
          : 'login';

      const redirectToError = (msg) => {
        toast.error(msg);
        if (action === 'link') {
          navigate('/profile', { replace: true, state: { authError: msg } });
        } else {
          navigate('/login', { replace: true, state: { authError: msg } });
        }
      };

      if (directToken) {
        try {
          setAuth({
            user: null,
            accessToken: directToken,
            refreshToken: directRefreshToken || null,
          });

          const { data } = await authService.getMe();
          const user = data.data.user;

          if (user.role === 'user') {
            redirectToError('Tài khoản của bạn là tài khoản Khách hàng, không có quyền truy cập trang quản trị!');
            return;
          }

          setAuth({
            user,
            accessToken: directToken,
            refreshToken: directRefreshToken || null,
          });

          toast.success('Đăng nhập thành công!');
          const targetPath = getDefaultRedirectPath(user);
          navigate(targetPath, { replace: true });
          return;
        } catch (err) {
          redirectToError('Phiên xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!');
          return;
        }
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state') || '';
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        redirectToError(formatDisplayError(errorDescription || error, providerName));
        return;
      }

      if (!code) {
        redirectToError('Không tìm thấy thông tin xác thực từ nhà cung cấp.');
        return;
      }

      try {
        let resData;

        if (action === 'link') {
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

          toast.success(resData.message || `Liên kết ${providerName} thành công!`);
          navigate('/profile', { replace: true });
          return;
        }

        // Đăng nhập thông thường
        if (isZalo) {
          const redirectUri =
            searchParams.get('redirect_uri') ||
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
            searchParams.get('redirect_uri') ||
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
          redirectToError(`Tài khoản ${providerName} của bạn là tài khoản Khách hàng, không có quyền truy cập trang quản trị shop!`);
          return;
        }

        setAuth({
          user,
          accessToken: resData.data.accessToken,
          refreshToken: resData.data.refreshToken,
        });

        toast.success(resData.message || `Đăng nhập ${providerName} thành công!`);
        const targetPath = getDefaultRedirectPath(user);
        navigate(targetPath, { replace: true });
      } catch (err) {
        const rawMsg =
          err.response?.data?.message ||
          err.message ||
          `Xác thực ${providerName} thất bại. Vui lòng thử lại!`;
        redirectToError(formatDisplayError(rawMsg, providerName));
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
      <div className="w-full max-w-[340px] rounded-[6px] border border-border bg-card p-6 shadow-xs text-card-foreground text-center space-y-3">
        <Loader2 className="size-6 text-foreground animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-medium">
          Đang xác thực thông tin đăng nhập...
        </p>
      </div>
    </div>
  );
}
