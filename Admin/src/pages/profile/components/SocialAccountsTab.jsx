import { useState, useEffect } from 'react';
import { ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';

/**
 * Social Accounts & OAuth Linking Tab
 */
export default function SocialAccountsTab() {
  const [linkedAccounts, setLinkedAccounts] = useState({});
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState(null);

  useEffect(() => {
    const fetchSocial = async () => {
      setLoadingSocial(true);
      try {
        const socialRes = await authService.getLinkedAccounts();
        setLinkedAccounts(socialRes.data?.data || socialRes.data || {});
      } catch (err) {
        console.error('Không thể tải trạng thái liên kết mạng xã hội:', err);
      } finally {
        setLoadingSocial(false);
      }
    };

    fetchSocial();
  }, []);

  const handleStartZaloLink = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/zalo/callback?action=link`;
      const res = await authService.getZaloAuthUrl({ redirectUri, state: 'admin_link_zalo' });
      const { url, codeVerifier, state } = res.data?.data || res.data;
      if (codeVerifier) sessionStorage.setItem('zalo_code_verifier', codeVerifier);
      if (state) sessionStorage.setItem('zalo_state', state);
      sessionStorage.setItem('zalo_action', 'link');
      window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể khởi tạo liên kết Zalo');
    }
  };

  const handleStartTikTokLink = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/tiktok/callback?action=link`;
      const res = await authService.getTikTokAuthUrl({ redirectUri, state: 'admin_link_tiktok' });
      const { url, codeVerifier, state } = res.data?.data || res.data;
      if (codeVerifier) sessionStorage.setItem('tiktok_code_verifier', codeVerifier);
      if (state) sessionStorage.setItem('tiktok_state', state);
      sessionStorage.setItem('tiktok_action', 'link');
      window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể khởi tạo liên kết TikTok');
    }
  };

  const handleUnlinkSocial = async (provider) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy liên kết tài khoản ${provider.toUpperCase()}?`)) return;

    setUnlinkingProvider(provider);
    try {
      await authService.unlinkSocial(provider);
      toast.success(`Đã hủy liên kết tài khoản ${provider.toUpperCase()}`);
      setLinkedAccounts((p) => ({
        ...p,
        [provider]: { isLinked: false, id: null },
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hủy liên kết thất bại');
    } finally {
      setUnlinkingProvider(null);
    }
  };

  return (
    <Card className="rounded-[6px] border border-border bg-card shadow-xs">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-bold text-foreground">Liên kết Mạng xã hội & OAuth</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Liên kết tài khoản Google, Zalo hoặc TikTok để đăng nhập nhanh chóng bằng 1 chạm mà không cần nhập mật khẩu.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {loadingSocial ? (
          <div className="flex items-center justify-center p-8 text-xs text-muted-foreground font-mono">
            <Loader2 size={16} className="animate-spin mr-2" /> Đang kiểm tra trạng thái liên kết...
          </div>
        ) : (
          <div className="space-y-3">
            {/* Google Card */}
            <div className="flex items-center justify-between p-4 rounded-[6px] border border-border bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[6px] bg-white border border-border flex items-center justify-center shadow-2xs shrink-0">
                  <svg className="size-5" viewBox="0 0 24 24">
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
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-foreground">Tài khoản Google</h4>
                    {linkedAccounts.google?.isLinked ? (
                      <Badge variant="outline" className="rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">
                        Đã kết nối
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-[4px] text-muted-foreground text-[10px] font-mono">
                        Chưa liên kết
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {linkedAccounts.google?.isLinked
                      ? `Google ID: ${linkedAccounts.google?.id || '—'}`
                      : ''}
                  </p>
                </div>
              </div>

              {linkedAccounts.google?.isLinked && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnlinkSocial('google')}
                  disabled={unlinkingProvider === 'google'}
                  className="h-8 rounded-[6px] text-xs text-destructive hover:bg-destructive/10 border-border active:scale-[0.98] cursor-pointer"
                >
                  {unlinkingProvider === 'google' ? (
                    <Loader2 size={12} className="animate-spin mr-1" />
                  ) : (
                    <Trash2 size={12} className="mr-1" />
                  )}
                  Hủy liên kết
                </Button>
              )}
            </div>

            {/* Zalo Card */}
            <div className="flex items-center justify-between p-4 rounded-[6px] border border-border bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[6px] bg-[#0068FF] flex items-center justify-center shrink-0 shadow-2xs p-1.5">
                  <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="7" fill="#FFFFFF" />
                    <path
                      d="M7 11h7.8v2.1l-5 6.6h5.3v2.3H6.9v-2.1l5-6.6H7V11zm9.3 4.8c0-1.7 1.1-2.8 2.7-2.8s2.7 1.1 2.7 2.8v4.2H20v-4.2c0-.6-.3-1-1-1s-1 .4-1 1v4.2h-1.7v-4.2zm6.6-4.8h1.7v10h-1.7V11zm2.8 4.8c0-1.7 1.1-2.8 2.7-2.8s2.7 1.1 2.7 2.8v4.2h-1.7v-4.2c0-.6-.3-1-1-1s-1 .4-1 1v4.2h-1.7v-4.2z"
                      fill="#0068FF"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-foreground">Tài khoản Zalo</h4>
                    {linkedAccounts.zalo?.isLinked ? (
                      <Badge variant="outline" className="rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">
                        Đã kết nối
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-[4px] text-muted-foreground text-[10px] font-mono">
                        Chưa liên kết
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {linkedAccounts.zalo?.isLinked
                      ? `Zalo ID: ${linkedAccounts.zalo?.id || '—'}`
                      : ''}
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
                  className="h-8 rounded-[6px] text-xs text-destructive hover:bg-destructive/10 border-border active:scale-[0.98] cursor-pointer"
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
                  className="h-8 rounded-[6px] text-xs text-[#0068FF] hover:bg-[#0068FF]/10 border-border active:scale-[0.98] cursor-pointer"
                >
                  <ExternalLink size={12} className="mr-1" />
                  Liên kết Zalo
                </Button>
              )}
            </div>

            {/* TikTok Card */}
            <div className="flex items-center justify-between p-4 rounded-[6px] border border-border bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-[6px] bg-black flex items-center justify-center shrink-0 shadow-2xs p-1.5">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-foreground">Tài khoản TikTok</h4>
                    {linkedAccounts.tiktok?.isLinked ? (
                      <Badge variant="outline" className="rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">
                        Đã kết nối
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-[4px] text-muted-foreground text-[10px] font-mono">
                        Chưa liên kết
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {linkedAccounts.tiktok?.isLinked
                      ? `TikTok ID: ${linkedAccounts.tiktok?.id || '—'}`
                      : ''}
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
                  className="h-8 rounded-[6px] text-xs text-destructive hover:bg-destructive/10 border-border active:scale-[0.98] cursor-pointer"
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
                  className="h-8 rounded-[6px] text-xs text-foreground hover:bg-accent border-border active:scale-[0.98] cursor-pointer"
                >
                  <ExternalLink size={12} className="mr-1" />
                  Liên kết TikTok
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
