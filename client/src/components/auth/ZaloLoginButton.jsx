'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/toast';
import { authService } from '@/services/auth.service';

export default function ZaloLoginButton({ text = 'Tiếp tục với Zalo', redirectUrl = '/' }) {
  const [loading, setLoading] = useState(false);

  const handleZaloLogin = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zalo_redirect_url', redirectUrl);
      }

      const stateToken = `zalo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zalo_oauth_state', stateToken);
      }

      const appId = process.env.NEXT_PUBLIC_ZALO_APP_ID;
      const redirectUri =
        process.env.NEXT_PUBLIC_ZALO_REDIRECT_URI ||
        `${window.location.origin}/auth/zalo/callback`;

      try {
        const res = await authService.getZaloAuthUrl({
          state: stateToken,
          redirectUri,
        });

        if (res.data?.url) {
          if (res.data.codeVerifier && typeof window !== 'undefined') {
            sessionStorage.setItem('zalo_code_verifier', res.data.codeVerifier);
          }
          window.location.href = res.data.url;
          return;
        }
      } catch (beErr) {
        console.warn('Lấy URL Zalo từ BE thất bại, fallback sang frontend PKCE builder:', beErr);
      }

      if (!appId) {
        toast.error('Cấu hình NEXT_PUBLIC_ZALO_APP_ID chưa được thiết lập.');
        setLoading(false);
        return;
      }

      // Fallback: Direct PKCE URL Generator
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
      onClick={handleZaloLogin}
      disabled={loading}
      className="w-full h-10 px-4 flex items-center justify-center gap-2.5 rounded-[6px] bg-[#0068ff] hover:bg-[#0057d9] text-white text-xs font-semibold border border-[#0068ff] shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 select-none"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Đang kết nối Zalo...</span>
        </>
      ) : (
        <>
          {/* Authentic Official Zalo Logo */}
          <img
            src="/images/logo-zalo.webp"
            alt="Zalo"
            className="w-5 h-5 object-contain shrink-0 rounded-[4px] bg-white p-0.5"
          />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
