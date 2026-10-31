'use client';

import { useState, useEffect, useRef } from 'react';
import authService from '@/services/auth.service';
import { useToast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';
import { openCenteredPopup, waitForOAuthMessage } from '@/utils/oauthPopup';

export function useAccountOAuthLinking(userOrOptions) {
  const user = userOrOptions?.user || userOrOptions;
  const { toast } = useToast();
  const googleButtonHiddenRef = useRef(null);

  const [linkingProvider, setLinkingProvider] = useState(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState(null);
  const [loadingLinked, setLoadingLinked] = useState(false);

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
    } catch {
    } finally {
      setLoadingLinked(false);
    }
  };

  useEffect(() => {
    fetchLinkedAccounts();
  }, [user]);

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
              toast.error(err.response?.data?.message || 'Liên kết tài khoản Google thất bại.');
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
      } catch {
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
      toast.error('Đang kết nối dịch vụ Google, vui lòng thử lại sau!');
    }
  };

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
      let authUrl = null;

      try {
        const res = await authService.getZaloAuthUrl({ state: stateToken, redirectUri });
        if (res.data?.url) {
          if (res.data.codeVerifier && typeof window !== 'undefined') {
            sessionStorage.setItem('zalo_code_verifier', res.data.codeVerifier);
          }
          authUrl = res.data.url;
        }
      } catch {
      }

      if (!authUrl) {
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

        authUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&code_challenge=${encodeURIComponent(codeChallenge)}&state=${encodeURIComponent(stateToken)}`;
      }

      const popup = openCenteredPopup(authUrl, 'Link Zalo', 680, 820);
      if (popup) {
        try {
          await waitForOAuthMessage(popup, { provider: 'zalo', timeout: 180000 });
          toast.success('Liên kết tài khoản Zalo thành công!');
          await fetchLinkedAccounts();
        } catch (popupErr) {
          if (popupErr.message !== 'POPUP_CLOSED') {
            toast.error(popupErr.message || 'Liên kết Zalo thất bại');
          }
        } finally {
          setLinkingProvider(null);
        }
      } else {
        window.location.href = authUrl;
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ Zalo.');
      setLinkingProvider(null);
    }
  };

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

      const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || 'sbawe8bhj9r8km52mp';
      let authUrl = null;

      try {
        const res = await authService.getTikTokAuthUrl({ state: stateToken, redirectUri });
        if (res?.data?.url) {
          if (res.data.codeVerifier && typeof window !== 'undefined') {
            sessionStorage.setItem('tiktok_code_verifier', res.data.codeVerifier);
          }
          authUrl = res.data.url;
        }
      } catch {
      }

      if (!authUrl) {
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
        authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${encodeURIComponent(
          scope
        )}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&state=${encodeURIComponent(stateToken)}&code_challenge=${codeChallenge}&code_challenge_method=S256&disable_auto_auth=1`;
      }

      const popup = openCenteredPopup(authUrl, 'Link TikTok', 680, 820);
      if (popup) {
        try {
          await waitForOAuthMessage(popup, { provider: 'tiktok', timeout: 180000 });
          toast.success('Liên kết tài khoản TikTok thành công!');
          await fetchLinkedAccounts();
        } catch (popupErr) {
          if (popupErr.message !== 'POPUP_CLOSED') {
            toast.error(popupErr.message || 'Liên kết TikTok thất bại');
          }
        } finally {
          setLinkingProvider(null);
        }
      } else {
        window.location.href = authUrl;
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ TikTok.');
      setLinkingProvider(null);
    }
  };

  const handleUnlinkSocial = async (provider) => {
    const providerName = provider === 'google' ? 'Google' : provider === 'zalo' ? 'Zalo' : 'TikTok';
    const isConfirmed = await confirm({
      title: `Hủy liên kết ${providerName}?`,
      description: `Bạn có chắc chắn muốn hủy liên kết tài khoản ${providerName}?`,
      confirmText: 'Hủy liên kết',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return;

    setUnlinkingProvider(provider);
    try {
      const res = await authService.unlinkSocial(provider);
      toast.success(res?.message || `Đã hủy liên kết ${providerName} thành công`);
      setLinkedAccounts((prev) => ({
        ...prev,
        [provider]: { isLinked: false, id: null },
      }));
      fetchLinkedAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || `Không thể hủy liên kết ${providerName}`);
    } finally {
      setUnlinkingProvider(null);
    }
  };

  return {
    googleButtonHiddenRef,
    linkedAccounts,
    linkingProvider,
    unlinkingProvider,
    loadingLinked,
    handleStartGoogleLink,
    handleStartZaloLink,
    handleStartTikTokLink,
    handleUnlinkSocial,
    handleLinkGoogle: handleStartGoogleLink,
    handleLinkZalo: handleStartZaloLink,
    handleLinkTikTok: handleStartTikTokLink,
    handleUnlink: handleUnlinkSocial,
  };
}
