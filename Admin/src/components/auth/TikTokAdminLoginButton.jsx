import { useState } from 'react';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';

export default function TikTokAdminLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleTikTokAdminLogin = async () => {
    setLoading(true);
    try {
      // Đánh dấu state với tiền tố admin_ để khi callback tại client biết đường redirect về admin
      const stateToken = `admin_oauth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const clientKey =
        import.meta.env.VITE_TIKTOK_CLIENT_KEY ||
        'awog7e9rw0fh0kso';

      const redirectUri =
        import.meta.env.VITE_TIKTOK_REDIRECT_URI ||
        'http://localhost:3000/auth/tiktok/callback';

      try {
        const { data } = await authService.getTikTokAuthUrl({
          state: stateToken,
          redirectUri,
        });

        if (data?.data?.url) {
          if (data.data.codeVerifier && typeof window !== 'undefined') {
            sessionStorage.setItem('tiktok_code_verifier', data.data.codeVerifier);
          }
          window.location.href = data.data.url;
          return;
        }
      } catch (beErr) {
        console.warn('Lấy URL TikTok từ BE thất bại, fallback sang frontend PKCE:', beErr);
      }

      // Fallback: Direct PKCE OAuth URL builder
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const codeVerifier = Array.from(array, (dec) => dec.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('tiktok_code_verifier', codeVerifier);

      const encoder = new TextEncoder();
      const encodedData = encoder.encode(codeVerifier);
      const hash = await window.crypto.subtle.digest('SHA-256', encodedData);
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const scope = 'user.info.basic,user.info.profile';
      const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${encodeURIComponent(
        scope
      )}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&state=${encodeURIComponent(stateToken)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

      window.location.href = authUrl;
    } catch (err) {
      toast.error('Không thể kết nối đến máy chủ TikTok. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTikTokAdminLogin}
      disabled={loading}
      className="w-full h-10 px-4 flex items-center justify-center gap-2.5 rounded-[6px] bg-[#000000] hover:bg-[#111111] text-white text-xs font-semibold border border-black shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 select-none"
    >
      {loading ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Đang chuyển hướng TikTok...</span>
        </>
      ) : (
        <>
          {/* Authentic Multi-color TikTok Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19.321 5.562a5.122 5.122 0 0 1-3.414-1.297A5.19 5.19 0 0 1 14.48.973h-3.47v14.43c0 1.93-1.57 3.49-3.5 3.49-1.93 0-3.5-1.56-3.5-3.49 0-1.93 1.57-3.5 3.5-3.5.37 0 .73.06 1.06.17V8.53a6.974 6.974 0 0 0-1.06-.08C3.36 8.45 0 11.81 0 15.9c0 4.09 3.36 7.45 7.51 7.45 4.14 0 7.5-3.36 7.5-7.45V8.18a8.62 8.62 0 0 0 5.15 1.68V6.4a5.15 5.15 0 0 1-.839-.838z"
              fill="#FE2C55"
            />
            <path
              d="M18.482 4.724a5.122 5.122 0 0 1-3.414-1.297A5.19 5.19 0 0 1 13.64.135h-1.79v14.43c0 1.93-1.57 3.49-3.5 3.49a3.504 3.504 0 0 1-3.5-3.49c0-1.93 1.57-3.5 3.5-3.5.37 0 .73.06 1.06.17V7.69a6.974 6.974 0 0 0-1.06-.08C4.2 7.61.84 10.97.84 15.06c0 4.09 3.36 7.45 7.51 7.45 4.14 0 7.5-3.36 7.5-7.45V7.34a8.62 8.62 0 0 0 5.15 1.68V5.56a5.15 5.15 0 0 1-2.518-.836z"
              fill="#25F4EE"
            />
            <path
              d="M18.482 5.562a5.122 5.122 0 0 1-3.414-1.297A5.19 5.19 0 0 1 13.64.973h-2.63v14.43c0 1.93-1.57 3.49-3.5 3.49-1.93 0-3.5-1.56-3.5-3.49 0-1.93 1.57-3.5 3.5-3.5.37 0 .73.06 1.06.17V8.53a6.974 6.974 0 0 0-1.06-.08C4.2 8.45.84 11.81.84 15.9c0 4.09 3.36 7.45 7.51 7.45 4.14 0 7.5-3.36 7.5-7.45V8.18a8.62 8.62 0 0 0 5.15 1.68V6.4a5.15 5.15 0 0 1-1.678-.838z"
              fill="#FFFFFF"
            />
          </svg>
          <span>Quản trị viên đăng nhập với TikTok</span>
        </>
      )}
    </button>
  );
}
