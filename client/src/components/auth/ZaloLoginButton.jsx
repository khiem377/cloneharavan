'use client';

import React, { useState, useEffect } from 'react';
import { toast } from '../ui/toast';
import { authService } from '../../services/auth.service';
import ZaloIcon from '../ui/ZaloIcon';

export default function ZaloLoginButton({ text = 'Tiếp tục với Zalo', redirectUrl = '/' }) {
  const [loading, setLoading] = useState(false);

  // Auto-reset loading state when user returns via Back button (BFCache), switches tabs, or regains window focus
  useEffect(() => {
    const handleReset = () => setLoading(false);

    window.addEventListener('pageshow', handleReset);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleReset();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleReset);

    return () => {
      window.removeEventListener('pageshow', handleReset);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleReset);
    };
  }, []);

  const handleZaloLogin = async () => {
    setLoading(true);

    // Safety fallback timeout to prevent infinite spinner if navigation is cancelled or blocked
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 4500);

    try {
      // Lưu redirectUrl vào sessionStorage để trang callback chuyển hướng sau khi login thành công
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zalo_redirect_url', redirectUrl);
      }

      // Tạo state token ngẫu nhiên để chống CSRF
      const stateToken = `zalo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zalo_oauth_state', stateToken);
        sessionStorage.removeItem('zalo_action');
      }

      const appId = process.env.NEXT_PUBLIC_ZALO_APP_ID;
      const redirectUri =
        process.env.NEXT_PUBLIC_ZALO_REDIRECT_URI ||
        `${window.location.origin}/auth/zalo/callback`;

      // Ưu tiên lấy URL từ backend
      try {
        const res = await authService.getZaloAuthUrl({
          state: stateToken,
          redirectUri,
        });

        if (res?.data?.url) {
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
        clearTimeout(safetyTimer);
        toast.error('Cấu hình NEXT_PUBLIC_ZALO_APP_ID chưa được thiết lập.');
        setLoading(false);
        return;
      }

      // Fallback: Direct PKCE OAuth URL builder
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const array = new Uint8Array(43);
      window.crypto.getRandomValues(array);
      let codeVerifier = '';
      for (let i = 0; i < 43; i++) {
        codeVerifier += chars[array[i] % chars.length];
      }
      sessionStorage.setItem('zalo_code_verifier', codeVerifier);

      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const hash = await window.crypto.subtle.digest('SHA-256', data);
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const authUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&code_challenge=${encodeURIComponent(codeChallenge)}&state=${encodeURIComponent(stateToken)}`;

      window.location.href = authUrl;
    } catch (err) {
      clearTimeout(safetyTimer);
      toast.error('Không thể kết nối đến máy chủ Zalo. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleZaloLogin}
      disabled={loading}
      className="w-full h-10 px-4 flex items-center justify-center gap-2 rounded-[6px] bg-[#0068ff] hover:bg-[#0057d9] text-white text-xs font-semibold border border-[#0068ff] shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 select-none"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Đang chuyển hướng...</span>
        </>
      ) : (
        <>
          {/* Authentic Vector Zalo Logo with Transparent Background */}
          <ZaloIcon className="h-4.5 w-auto shrink-0" color="white" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
