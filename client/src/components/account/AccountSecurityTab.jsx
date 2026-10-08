'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/toast';
import { confirm } from '../ui/confirm-dialog';
import PasswordModal from './PasswordModal';
import SessionsModal from './SessionsModal';
import authService from '@/services/auth.service';
import useAuthStore from '@/store/authStore';

export default function AccountSecurityTab({
  user,
  setUser,
  onRefreshProfile,
}) {
  const { toast } = useToast();
  const googleButtonHiddenRef = useRef(null);

  // Modal States
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isSetPasswordMode, setIsSetPasswordMode] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Linking / Unlinking States
  const [linkingProvider, setLinkingProvider] = useState(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState(null);
  const [loadingLinked, setLoadingLinked] = useState(false);

  // Linked Accounts State
  const isGoogleInitiallyLinked = Boolean(
    user?.googleId ||
    user?.authProvider === 'google' ||
    user?.isGoogleLinked ||
    (user?.email && user?.email.endsWith('@gmail.com') && (user?.authProvider === 'google' || user?.googleId))
  );

  const [linkedAccounts, setLinkedAccounts] = useState({
    google: {
      isLinked: isGoogleInitiallyLinked,
      id: user?.googleId || user?.googleEmail || (user?.authProvider === 'google' ? user?.email : null),
    },
    zalo: {
      isLinked: Boolean(user?.zaloId || user?.authProvider === 'zalo'),
      id: user?.zaloId || null,
    },
    tiktok: {
      isLinked: Boolean(user?.tiktokId || user?.authProvider === 'tiktok'),
      id: user?.tiktokId || null,
    },
  });

  // Fetch active sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await authService.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phiên đăng nhập:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch linked accounts from BE
  const fetchLinkedAccounts = async () => {
    setLoadingLinked(true);
    try {
      const data = await authService.getLinkedAccounts();
      if (data) {
        setLinkedAccounts({
          google: {
            isLinked: Boolean(data.google?.isLinked || isGoogleInitiallyLinked),
            id: data.google?.id || user?.googleId || null,
            email: data.google?.email || (user?.email?.includes('@') ? user?.email : null),
          },
          zalo: {
            isLinked: Boolean(data.zalo?.isLinked || user?.zaloId),
            id: data.zalo?.id || user?.zaloId || null,
            name: data.zalo?.name || user?.zaloName || (user?.authProvider === 'zalo' ? user?.fullName : null),
          },
          tiktok: {
            isLinked: Boolean(data.tiktok?.isLinked || user?.tiktokId),
            id: data.tiktok?.id || user?.tiktokId || null,
            username: data.tiktok?.username || user?.tiktokUsername || null,
            displayName: data.tiktok?.displayName || (user?.authProvider === 'tiktok' ? user?.fullName : null),
          },
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách tài khoản liên kết:', err);
    } finally {
      setLoadingLinked(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchLinkedAccounts();
  }, [user]);

  // Google GSI Init for In-Place Account Linking
  const initGoogleGsi = () => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '157603556653-7m14fg5988tq3rp7fprk3e7gastt8iv7.apps.googleusercontent.com';

    if (window.google?.accounts?.id && googleButtonHiddenRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response?.credential) {
              toast.error('Không nhận được mã xác thực từ Google');
              return;
            }
            setLinkingProvider('google');
            try {
              const res = await authService.linkGoogle(response.credential);
              toast.success(res?.message || 'Liên kết tài khoản Google thành công!');
              setLinkedAccounts((prev) => ({
                ...prev,
                google: { isLinked: true, id: user?.email || 'Đã kết nối' },
              }));
              fetchLinkedAccounts();
            } catch (err) {
              toast.error(
                err.response?.data?.message || 'Liên kết tài khoản Google thất bại. Vui lòng thử lại!'
              );
            } finally {
              setLinkingProvider(null);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        googleButtonHiddenRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonHiddenRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
        });
      } catch (e) {
        console.error('Lỗi khởi tạo Google Sign-In linking:', e);
      }
    }
  };

  useEffect(() => {
    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogleGsi;
      document.body.appendChild(script);
    } else {
      initGoogleGsi();
    }
  }, []);

  // 1. Google Link Handler
  const handleStartGoogleLink = () => {
    if (googleButtonHiddenRef.current) {
      const googleBtn = googleButtonHiddenRef.current.querySelector('div[role=button]');
      if (googleBtn) {
        googleBtn.click();
        return;
      }
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast.error('Đang kết nối dịch vụ Google, vui lòng thử lại sau giây lát!');
    }
  };

  // 2. Zalo Link Handler
  const handleStartZaloLink = async () => {
    setLinkingProvider('zalo');
    try {
      const redirectUri = `${window.location.origin}/auth/zalo/callback?action=link`;
      const stateToken = `link_zalo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zalo_action', 'link');
        sessionStorage.setItem('zalo_redirect_url', '/tai-khoan?tab=security');
        sessionStorage.setItem('zalo_oauth_state', stateToken);
      }

      const appId = process.env.NEXT_PUBLIC_ZALO_APP_ID;

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
        setLinkingProvider(null);
        return;
      }

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const array = new Uint8Array(43);
      window.crypto.getRandomValues(array);
      let codeVerifier = '';
      for (let i = 0; i < 43; i++) {
        codeVerifier += chars[array[i] % chars.length];
      }
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
      setLinkingProvider(null);
    }
  };

  // 3. TikTok Link Handler
  const handleStartTikTokLink = async () => {
    setLinkingProvider('tiktok');
    try {
      const redirectUri = `${window.location.origin}/auth/tiktok/callback?action=link`;
      const stateToken = `link_tiktok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tiktok_action', 'link');
        sessionStorage.setItem('tiktok_redirect_url', '/tai-khoan?tab=security');
        sessionStorage.setItem('tiktok_oauth_state', stateToken);
      }

      const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || 'awog7e9rw0fh0kso';

      try {
        const res = await authService.getTikTokAuthUrl({
          state: stateToken,
          redirectUri,
        });

        if (res?.data?.url) {
          if (res.data.codeVerifier && typeof window !== 'undefined') {
            sessionStorage.setItem('tiktok_code_verifier', res.data.codeVerifier);
          }
          window.location.href = res.data.url;
          return;
        }
      } catch (beErr) {
        console.warn('Lấy URL TikTok từ BE thất bại, fallback sang PKCE builder:', beErr);
      }

      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const codeVerifier = Array.from(array, (dec) => dec.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('tiktok_code_verifier', codeVerifier);

      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const hash = await window.crypto.subtle.digest('SHA-256', data);
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
      setLinkingProvider(null);
    }
  };

  // Xử lý mở Modal Mật khẩu
  const handleOpenPasswordModal = (isSet) => {
    setIsSetPasswordMode(isSet);
    setPasswordModalOpen(true);
  };

  // Xử lý sau khi đổi/tạo mật khẩu thành công
  const handlePasswordSuccess = async () => {
    if (onRefreshProfile) {
      await onRefreshProfile();
    } else {
      try {
        const res = await authService.getProfile();
        if (res?.data?.user) {
          useAuthStore.getState().setUser(res.data.user);
          if (setUser) setUser(res.data.user);
        }
      } catch (_) {}
    }
    fetchSessions();
  };

  // Hủy liên kết mạng xã hội
  const handleUnlinkSocial = async (provider) => {
    const providerName =
      provider === 'google' ? 'Google' : provider === 'zalo' ? 'Zalo' : 'TikTok';
    const isConfirmed = await confirm({
      title: `Hủy liên kết ${providerName}?`,
      description: `Bạn có chắc chắn muốn hủy liên kết tài khoản ${providerName} khỏi tài khoản của bạn?`,
      confirmText: 'Hủy liên kết',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    setUnlinkingProvider(provider);
    try {
      const res = await authService.unlinkSocial(provider);
      toast.success(res?.message || `Đã hủy liên kết tài khoản ${providerName} thành công`);
      setLinkedAccounts((prev) => ({
        ...prev,
        [provider]: { isLinked: false, id: null },
      }));
      fetchLinkedAccounts();
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Không thể hủy liên kết ${providerName}`
      );
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const hasPassword = user?.hasPassword !== false;

  return (
    <div className="space-y-8">
      {/* Hidden Google GSI Button for Triggering */}
      <div ref={googleButtonHiddenRef} className="hidden" aria-hidden="true" />

      {/* 1. KHỐI ĐĂNG NHẬP & KHÔI PHỤC (CHUẨN F8) */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-900">Đăng nhập & khôi phục</h2>
          <p className="text-xs text-slate-500">
            Quản lý mật khẩu và các phương thức khôi phục tài khoản của bạn.
          </p>
        </div>

        <Card className="rounded-[6px] border border-slate-200 bg-white overflow-hidden shadow-none divide-y divide-slate-100">
          {/* Row Mật khẩu */}
          <div
            onClick={() => handleOpenPasswordModal(!hasPassword)}
            className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-slate-900">
                {hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {hasPassword ? 'Mật khẩu đang hoạt động' : 'Chưa đổi mật khẩu'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {hasPassword ? 'Thay đổi' : 'Thiết lập'}
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2. KHỐI TÀI KHOẢN LIÊN KẾT (CHUẨN F8) */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-900">Tài khoản liên kết</h2>
          <p className="text-xs text-slate-500">
            Kết nối tài khoản mạng xã hội để đăng nhập nhanh hơn.
          </p>
        </div>

        <Card className="rounded-[6px] border border-slate-200 bg-white overflow-hidden shadow-none divide-y divide-slate-100">
          {/* Google Row */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-900">Google</h3>
                  {linkedAccounts.google?.isLinked ? (
                    <Badge variant="outline" className="rounded-[4px] bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-normal">
                      Đã liên kết
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-[4px] text-slate-400 border-slate-200 text-[10px] px-1.5 py-0 font-normal">
                      Chưa liên kết
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {linkedAccounts.google?.isLinked
                    ? linkedAccounts.google?.email || user?.email || (linkedAccounts.google?.id ? `ID: ${linkedAccounts.google.id}` : 'Đã kết nối')
                    : 'Chưa liên kết tài khoản Google'}
                </p>
              </div>
            </div>

            {linkedAccounts.google?.isLinked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUnlinkSocial('google')}
                disabled={unlinkingProvider === 'google'}
                className="h-7 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-[6px] active:scale-[0.98] shrink-0"
              >
                {unlinkingProvider === 'google' ? (
                  <Loader2 size={12} className="animate-spin mr-1" />
                ) : (
                  <Trash2 size={12} className="mr-1" />
                )}
                Hủy liên kết
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartGoogleLink}
                disabled={linkingProvider === 'google'}
                className="h-7 px-2.5 text-xs text-[#4285F4] hover:bg-blue-50 hover:border-blue-200 border-slate-200 rounded-[6px] active:scale-[0.98] shrink-0 font-medium"
              >
                {linkingProvider === 'google' ? (
                  <Loader2 size={12} className="animate-spin mr-1" />
                ) : (
                  <ExternalLink size={12} className="mr-1" />
                )}
                Liên kết Google
              </Button>
            )}
          </div>

          {/* Zalo Row */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center shrink-0 p-1">
                <img
                  src="/images/logo-zalo.webp"
                  alt="Zalo"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-900">Zalo</h3>
                  {linkedAccounts.zalo?.isLinked ? (
                    <Badge variant="outline" className="rounded-[4px] bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-normal">
                      Đã liên kết
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-[4px] text-slate-400 border-slate-200 text-[10px] px-1.5 py-0 font-normal">
                      Chưa liên kết
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {linkedAccounts.zalo?.isLinked ? (
                    <span>
                      {linkedAccounts.zalo?.name ? (
                        <>
                          <span className="font-medium text-slate-800">{linkedAccounts.zalo.name}</span>
                          {linkedAccounts.zalo?.id && (
                            <span className="text-slate-400 font-mono text-[10px] ml-1.5">
                              (ID: {linkedAccounts.zalo.id})
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-mono">{linkedAccounts.zalo?.id || 'Đã kết nối'}</span>
                      )}
                    </span>
                  ) : (
                    'Chưa liên kết tài khoản Zalo'
                  )}
                </p>
              </div>
            </div>

            {linkedAccounts.zalo?.isLinked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUnlinkSocial('zalo')}
                disabled={unlinkingProvider === 'zalo'}
                className="h-7 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-[6px] active:scale-[0.98] shrink-0"
              >
                {unlinkingProvider === 'zalo' ? (
                  <Loader2 size={12} className="animate-spin mr-1" />
                ) : (
                  <Trash2 size={12} className="mr-1" />
                )}
                Hủy liên kết
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartZaloLink}
                disabled={linkingProvider === 'zalo'}
                className="h-7 px-2.5 text-xs text-[#0068ff] hover:bg-blue-50 hover:border-blue-200 border-slate-200 rounded-[6px] active:scale-[0.98] shrink-0 font-medium"
              >
                {linkingProvider === 'zalo' ? (
                  <Loader2 size={12} className="animate-spin mr-1" />
                ) : (
                  <ExternalLink size={12} className="mr-1" />
                )}
                Liên kết Zalo
              </Button>
            )}
          </div>

          {/* TikTok Row */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[6px] bg-black flex items-center justify-center shrink-0 p-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.889 2.889 2.896 2.896 0 0 1-2.889-2.889 2.896 2.896 0 0 1 2.889-2.889c.328 0 .641.056.933.159V9.458a6.33 6.33 0 0 0-.933-.07 6.334 6.334 0 0 0-6.334 6.334 6.334 6.334 0 0 0 6.334 6.334 6.334 6.334 0 0 0 6.334-6.334V8.583a8.163 8.163 0 0 0 4.887 1.602V6.74a4.77 4.77 0 0 1-1.122-.054z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-900">TikTok</h3>
                  {linkedAccounts.tiktok?.isLinked ? (
                    <Badge variant="outline" className="rounded-[4px] bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-normal">
                      Đã liên kết
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-[4px] text-slate-400 border-slate-200 text-[10px] px-1.5 py-0 font-normal">
                      Chưa liên kết
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {linkedAccounts.tiktok?.isLinked ? (
                    <span>
                      {linkedAccounts.tiktok?.username ? (
                        <>
                          <span className="font-medium text-slate-800">
                            @{linkedAccounts.tiktok.username.replace(/^@/, '')}
                          </span>
                          {linkedAccounts.tiktok?.displayName &&
                            linkedAccounts.tiktok.displayName !== linkedAccounts.tiktok.username && (
                              <span className="text-slate-400 text-[10px] ml-1.5">
                                ({linkedAccounts.tiktok.displayName})
                              </span>
                            )}
                        </>
                      ) : linkedAccounts.tiktok?.displayName ? (
                        <>
                          <span className="font-medium text-slate-800">{linkedAccounts.tiktok.displayName}</span>
                          {linkedAccounts.tiktok?.id && (
                            <span className="text-slate-400 font-mono text-[10px] ml-1.5">
                              (ID: {linkedAccounts.tiktok.id})
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-mono">{linkedAccounts.tiktok?.id || 'Đã kết nối'}</span>
                      )}
                    </span>
                  ) : (
                    'Chưa liên kết tài khoản TikTok'
                  )}
                </p>
              </div>
            </div>

            {linkedAccounts.tiktok?.isLinked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUnlinkSocial('tiktok')}
                disabled={unlinkingProvider === 'tiktok'}
                className="h-7 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-[6px] active:scale-[0.98] shrink-0"
              >
                {unlinkingProvider === 'tiktok' ? (
                  <Loader2 size={12} className="animate-spin mr-1" />
                ) : (
                  <Trash2 size={12} className="mr-1" />
                )}
                Hủy liên kết
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartTikTokLink}
                disabled={linkingProvider === 'tiktok'}
                className="h-7 px-2.5 text-xs text-slate-800 hover:bg-slate-100 hover:border-slate-300 border-slate-200 rounded-[6px] active:scale-[0.98] shrink-0 font-medium"
              >
                {linkingProvider === 'tiktok' ? (
                  <Loader2 size={12} className="animate-spin mr-1" />
                ) : (
                  <ExternalLink size={12} className="mr-1" />
                )}
                Liên kết TikTok
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* 3. KHỐI KIỂM TRA BẢO MẬT & PHIÊN ĐĂNG NHẬP (CHUẨN F8) */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-900">Kiểm tra bảo mật</h2>
          <p className="text-xs text-slate-500">
            Quản lý phiên đăng nhập trên các thiết bị.
          </p>
        </div>

        <Card className="rounded-[6px] border border-slate-200 bg-white overflow-hidden shadow-none divide-y divide-slate-100">
          {/* Row Nơi bạn đã đăng nhập */}
          <div
            onClick={() => setSessionsModalOpen(true)}
            className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-slate-900">Nơi bạn đã đăng nhập</h3>
              <p className="text-[11px] text-slate-500">
                {sessions.length > 0 ? `${sessions.length} phiên đang hoạt động` : '1 phiên đang hoạt động'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Xem chi tiết
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* MODAL PHIÊN ĐĂNG NHẬP (CHUẨN F8) */}
      <SessionsModal
        open={sessionsModalOpen}
        onOpenChange={setSessionsModalOpen}
        sessions={sessions}
        onRefreshSessions={fetchSessions}
      />

      {/* MODAL ĐỔI / TẠO MẬT KHẨU (CHUẨN EVONDEV) */}
      <PasswordModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        isSetPassword={isSetPasswordMode}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
}
