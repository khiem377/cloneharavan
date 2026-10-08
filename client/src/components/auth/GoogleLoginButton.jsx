'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '../ui/toast';
import { authService } from '../../services/auth.service';
import useAuthStore from '../../store/authStore';

export default function GoogleLoginButton({ text = 'signin_with', redirectUrl = '/' }) {
  const router = useRouter();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonContainerRef = useRef(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '157603556653-7m14fg5988tq3rp7fprk3e7gastt8iv7.apps.googleusercontent.com';

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

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      toast.error('Không nhận được thông tin xác thực từ Google');
      return;
    }

    setLoading(true);
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    try {
      const sessionId = anonymousId || getOrCreateAnonymousId();
      const res = await authService.googleLogin({
        credential: response.credential,
        sessionId,
      });

      if ((res.success || res.status === 'success') && res.data) {
        setAuth({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        toast.success('Đăng nhập Google thành công!');
        window.location.href = redirectUrl;
      } else {
        toast.error(res.message || 'Đăng nhập Google không thành công');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Đăng nhập Google thất bại. Vui lòng thử lại!'
      );
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if script is already present
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

          // Clear previous render if any
          buttonContainerRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: text, // 'signin_with' | 'signup_with' | 'continue_with'
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonContainerRef.current.offsetWidth || 350,
            locale: 'vi',
          });

          setScriptLoaded(true);
        } catch (e) {
          console.error('Lỗi khởi tạo Google Sign-In:', e);
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
            text: text,
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
  }, [clientId, text]);

  return (
    <div className="w-full flex flex-col items-center">
      {loading && (
        <div className="mb-2 text-xs text-blue-600 font-medium flex items-center gap-1.5 animate-pulse">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
