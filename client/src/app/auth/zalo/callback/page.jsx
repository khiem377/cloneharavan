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

function ZaloCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();

  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processZaloCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      const action =
        searchParams.get('action') ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('zalo_action') : null);
      const isLinkAction = action === 'link' || state?.includes('link');
      const isAdminState = state?.startsWith('admin_') || state?.includes('admin');

      if (error) {
        setStatus('error');
        setErrorMessage(
          errorDescription ||
          (error === 'access_denied'
            ? 'Bạn đã từ chối cấp quyền truy cập tài khoản Zalo.'
            : `Lỗi xác thực từ Zalo: ${error}`)
        );
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('Không tìm thấy mã xác thực (authorization code) từ Zalo.');
        return;
      }

      try {
        let codeVerifier = null;
        if (typeof window !== 'undefined') {
          codeVerifier = sessionStorage.getItem('zalo_code_verifier');
          sessionStorage.removeItem('zalo_code_verifier');
          sessionStorage.removeItem('zalo_action');
        }

        if (isLinkAction) {
          if (isAdminState) {
            const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173';
            window.location.href = `${adminBaseUrl}/auth/zalo/callback?action=link&code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
            return;
          }

          const redirectUri = `${window.location.origin}/auth/zalo/callback?action=link`;
          const res = await authService.linkZalo({
            code,
            redirectUri,
            codeVerifier,
          });

          if (res.success || res.status === 'success' || res.data) {
            setStatus('success');
            toast.success(res.message || 'Liên kết tài khoản Zalo thành công!');
            setTimeout(() => {
              window.location.href = '/tai-khoan?tab=security';
            }, 800);
            return;
          } else {
            setStatus('error');
            setErrorMessage(res.message || 'Liên kết tài khoản Zalo không thành công.');
            return;
          }
        }

        const sessionId = anonymousId || getOrCreateAnonymousId();
        const redirectUri =
          process.env.NEXT_PUBLIC_ZALO_REDIRECT_URI ||
          `${window.location.origin}/auth/zalo/callback`;

        const res = await authService.zaloLogin({
          code,
          redirectUri,
          codeVerifier,
          sessionId,
          isAdminRequest: isAdminState,
        });

        if ((res.success || res.status === 'success') && res.data) {
          setStatus('success');
          toast.success('Đăng nhập Zalo thành công!');

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
            const savedRedirect = sessionStorage.getItem('zalo_redirect_url');
            if (savedRedirect) {
              targetRedirect = savedRedirect;
              sessionStorage.removeItem('zalo_redirect_url');
            }
          }

          setTimeout(() => {
            window.location.href = targetRedirect;
          }, 800);
        } else {
          setStatus('error');
          setErrorMessage(res.message || 'Xác thực tài khoản Zalo không thành công.');
        }
      } catch (err) {
        setStatus('error');
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Đăng nhập Zalo thất bại. Vui lòng thử lại sau!';
        setErrorMessage(msg);
      }
    };

    processZaloCallback();
  }, [searchParams, setAuth, anonymousId, getOrCreateAnonymousId, router]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-[420px] p-6 sm:p-8 space-y-5 rounded-[6px] border border-slate-200 shadow-xs">
        <CardHeader className="p-0 pb-2 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 border border-blue-200">
            {status === 'processing' && (
              <Loader2 className="w-6 h-6 text-[#0068ff] animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-6 h-6 text-[#e30019]" />
            )}
          </div>

          <CardTitle className="text-lg font-bold text-slate-900">
            {status === 'processing' && 'Đang xác thực Zalo...'}
            {status === 'success' && 'Đăng nhập thành công!'}
            {status === 'error' && 'Đăng nhập Zalo thất bại'}
          </CardTitle>

          <CardDescription className="text-xs text-slate-500 mt-1">
            {status === 'processing' &&
              'Hệ thống đang đồng bộ thông tin tài khoản Zalo của bạn, vui lòng đợi trong giây lát.'}
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
              <div className="bg-[#0068ff] h-1.5 w-full rounded-full animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ZaloCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50">
          <Card className="w-full max-w-[420px] p-8 text-center rounded-[6px] border border-slate-200">
            <Loader2 className="w-8 h-8 text-[#0068ff] animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Đang khởi tạo phiên xác thực Zalo...</p>
          </Card>
        </div>
      }
    >
      <ZaloCallbackContent />
    </Suspense>
  );
}
