import { useState } from 'react';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';

export default function ZaloAdminLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleZaloAdminLogin = async () => {
    setLoading(true);
    try {
      // Đánh dấu state với tiền tố admin_ để khi callback tại client biết đường redirect về admin
      const stateToken = `admin_zalo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const appId = import.meta.env.VITE_ZALO_APP_ID;
      const redirectUri =
        import.meta.env.VITE_ZALO_REDIRECT_URI ||
        'http://localhost:3000/auth/zalo/callback';

      try {
        const { data } = await authService.getZaloAuthUrl({
          state: stateToken,
          redirectUri,
        });

        if (data?.data?.url) {
          if (data.data.codeVerifier && typeof window !== 'undefined') {
            sessionStorage.setItem('zalo_code_verifier', data.data.codeVerifier);
          }
          window.location.href = data.data.url;
          return;
        }
      } catch (beErr) {
        console.warn('Lấy URL Zalo từ BE thất bại, fallback sang frontend PKCE:', beErr);
      }

      if (!appId) {
        toast.error('Cấu hình VITE_ZALO_APP_ID chưa được thiết lập.');
        setLoading(false);
        return;
      }

      // Fallback: Direct PKCE OAuth URL builder
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const codeVerifier = Array.from(array, (dec) => dec.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('zalo_code_verifier', codeVerifier);

      const encoder = new TextEncoder();
      const encodedData = encoder.encode(codeVerifier);
      const hash = await window.crypto.subtle.digest('SHA-256', encodedData);
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const authUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&code_challenge=${encodeURIComponent(codeChallenge)}&state=${encodeURIComponent(stateToken)}`;

      window.location.href = authUrl;
    } catch (err) {
      toast.error('Không thể kết nối đến máy chủ Zalo. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleZaloAdminLogin}
      disabled={loading}
      className="w-full h-10 px-4 flex items-center justify-center gap-2.5 rounded-[6px] bg-[#0068ff] hover:bg-[#0057d9] text-white text-xs font-semibold border border-[#0068ff] shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 select-none"
    >
      {loading ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Đang chuyển hướng Zalo...</span>
        </>
      ) : (
        <>
          {/* Authentic Official Zalo Logo */}
          <img
            src="/images/logo-zalo.webp"
            alt="Zalo"
            className="w-5 h-5 object-contain shrink-0 rounded-[4px] bg-white p-0.5"
          />
          <span>Đăng nhập với Zalo</span>
        </>
      )}
    </button>
  );
}
