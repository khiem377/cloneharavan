'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { toast } from '../../../../components/ui/toast';
import { authService } from '../../../../services/auth.service';
import useAuthStore from '../../../../store/authStore';

function TikTokCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();

  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processTikTokCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      const action =
        searchParams.get('action') ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('tiktok_action') : null);
      const isLinkAction = action === 'link' || state?.includes('link');
      const isAdminState = state?.startsWith('admin_') || state?.includes('admin');

      if (error) {
        setStatus('error');
        setErrorMessage(
          errorDescription ||
          (error === 'access_denied'
            ? 'Bạn đã từ chối cấp quyền đăng nhập bằng tài khoản TikTok.'
            : `Lỗi xác thực từ TikTok: ${error}`)
        );
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('Không tìm thấy mã xác thực (authorization code) từ TikTok.');
        return;
      }

      try {
        let codeVerifier = null;
        if (typeof window !== 'undefined') {
          codeVerifier = sessionStorage.getItem('tiktok_code_verifier');
          sessionStorage.removeItem('tiktok_code_verifier');
          sessionStorage.removeItem('tiktok_action');
        }

        if (isLinkAction) {
          if (isAdminState) {
            const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173';
            window.location.href = `${adminBaseUrl}/auth/tiktok/callback?action=link&code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
            return;
          }

          const redirectUri = `${window.location.origin}/auth/tiktok/callback?action=link`;
          const res = await authService.linkTikTok({
            code,
            redirectUri,
            codeVerifier,
          });

          if (res.success || res.status === 'success' || res.data) {
            setStatus('success');
            toast.success(res.message || 'Liên kết tài khoản TikTok thành công!');
            setTimeout(() => {
              window.location.href = '/tai-khoan?tab=security';
            }, 800);
            return;
          } else {
            setStatus('error');
            setErrorMessage(res.message || 'Liên kết tài khoản TikTok không thành công.');
            return;
          }
        }

        const sessionId = anonymousId || getOrCreateAnonymousId();
        const redirectUri =
          process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI ||
          `${window.location.origin}/auth/tiktok/callback`;

        const res = await authService.tiktokLogin({
          code,
          redirectUri,
          codeVerifier,
          sessionId,
          isAdminRequest: isAdminState,
        });

        if ((res.success || res.status === 'success') && res.data) {
          setStatus('success');
          toast.success('Đăng nhập TikTok thành công!');

          if (isAdminState) {
            // Chuyển hướng về Admin Dashboard
            const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173';
            const { accessToken, refreshToken } = res.data;
            setTimeout(() => {
              window.location.href = `${adminBaseUrl}/auth/callback?token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken || '')}`;
            }, 600);
            return;
          }

          setAuth({
            user: res.data.user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          });

          // Lấy URL cần chuyển hướng lại
          let targetRedirect = '/';
          if (typeof window !== 'undefined') {
            const savedRedirect = sessionStorage.getItem('tiktok_redirect_url');
            if (savedRedirect) {
              targetRedirect = savedRedirect;
              sessionStorage.removeItem('tiktok_redirect_url');
            }
          }

          setTimeout(() => {
            window.location.href = targetRedirect;
          }, 800);
        } else {
          setStatus('error');
          setErrorMessage(res.message || 'Xác thực tài khoản TikTok không thành công.');
        }
      } catch (err) {
        setStatus('error');
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Đăng nhập TikTok thất bại. Vui lòng thử lại sau!';
        setErrorMessage(msg);
      }
    };

    processTikTokCallback();
  }, [searchParams, setAuth, anonymousId, getOrCreateAnonymousId, router]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-[420px] p-6 sm:p-8 space-y-5 rounded-[6px] border border-slate-200 shadow-xs">
        <CardHeader className="p-0 pb-2 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 border border-slate-200">
            {status === 'processing' && (
              <Loader2 className="w-6 h-6 text-slate-800 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-6 h-6 text-[#e30019]" />
            )}
          </div>

          <CardTitle className="text-lg font-bold text-slate-900">
            {status === 'processing' && 'Đang xác thực TikTok...'}
            {status === 'success' && 'Đăng nhập thành công!'}
            {status === 'error' && 'Đăng nhập TikTok thất bại'}
          </CardTitle>

          <CardDescription className="text-xs text-slate-500 mt-1">
            {status === 'processing' &&
              'Hệ thống đang đồng bộ thông tin tài khoản TikTok của bạn, vui lòng đợi trong giây lát.'}
            {status === 'success' &&
              'Hệ thống đang chuyển hướng bạn về trang mua sắm...'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-2 space-y-3">
          {status === 'error' && (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                asChild
                className="w-full h-10 bg-[#e30019] hover:bg-[#c40015] text-white font-semibold text-xs rounded-[6px] shadow-xs active:scale-[0.98] transition cursor-pointer"
              >
                <Link href="/login">
                  <ArrowLeft size={14} className="mr-1.5" />
                  Quay lại trang Đăng nhập
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-[6px] active:scale-[0.98] transition cursor-pointer"
              >
                <Link href="/">Về trang chủ</Link>
              </Button>
            </div>
          )}

          {status === 'processing' && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-slate-900 h-1.5 w-full rounded-full animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TikTokCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50">
          <Card className="w-full max-w-[420px] p-8 text-center rounded-[6px] border border-slate-200">
            <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Đang khởi tạo phiên xác thực...</p>
          </Card>
        </div>
      }
    >
      <TikTokCallbackContent />
    </Suspense>
  );
}
