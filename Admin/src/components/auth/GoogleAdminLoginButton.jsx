import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { getDefaultRedirectPath } from '@/utils/permissionUtils';

export default function GoogleAdminLoginButton() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const buttonContainerRef = useRef(null);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '157603556653-7m14fg5988tq3rp7fprk3e7gastt8iv7.apps.googleusercontent.com';

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      toast.error('Không nhận được mã xác thực từ Google');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.googleLogin(response.credential);
      const user = data.data.user;

      if (user.role === 'user') {
        toast.error('Tài khoản của bạn không có quyền truy cập trang quản trị!');
        return;
      }

      setAuth({
        user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      toast.success(data.message || 'Đăng nhập Google thành công!');

      const targetPath = getDefaultRedirectPath(user);
      navigate(targetPath, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.message ??
        'Đăng nhập Google thất bại. Vui lòng kiểm tra lại quyền quản trị!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const existingScript = document.getElementById('google-gsi-client');

    const initGsi = () => {
      if (window.google?.accounts?.id && buttonContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          buttonContainerRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonContainerRef.current.offsetWidth || 350,
            locale: 'vi',
          });
        } catch (e) {
          console.error('Lỗi khởi tạo Google Sign-In Admin:', e);
        }
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGsi();
      };
      document.body.appendChild(script);
    } else {
      if (window.google?.accounts?.id) {
        initGsi();
      } else {
        existingScript.addEventListener('load', initGsi);
      }
    }

    const handleResize = () => {
      if (window.google?.accounts?.id && buttonContainerRef.current) {
        try {
          buttonContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonContainerRef.current.offsetWidth || 350,
            locale: 'vi',
          });
        } catch (e) {}
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [clientId]);

  return (
    <div className="w-full flex flex-col items-center">
      {loading && (
        <div className="mb-2 text-xs text-primary font-medium flex items-center gap-1.5 animate-pulse">
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Đang xác thực tài khoản Google...</span>
        </div>
      )}
      <div
        ref={buttonContainerRef}
        className="w-full flex justify-center min-h-[44px] overflow-hidden rounded-[6px]"
      />
    </div>
  );
}
