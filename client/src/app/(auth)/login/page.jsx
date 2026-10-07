'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  AlertTriangle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Separator } from '../../../components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert';
import { authService } from '../../../services/auth.service';
import useAuthStore from '../../../store/authStore';
import { toast } from '../../../components/ui/toast';
import GoogleLoginButton from '../../../components/auth/GoogleLoginButton';
import TikTokLoginButton from '../../../components/auth/TikTokLoginButton';
import ZaloLoginButton from '../../../components/auth/ZaloLoginButton';

function LoginNoticeBanner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  if (reason === 'blocked') {
    return (
      <Alert variant="destructive" className="mb-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className="font-bold text-xs">
          Tài khoản đã bị tạm khóa hoặc phiên làm việc đã bị thu hồi
        </AlertTitle>
        <AlertDescription className="text-[11px] mt-1 leading-relaxed">
          Hệ thống đã cưỡng chế thu hồi phiên đăng nhập theo lệnh của Quản trị viên. Nếu cần khiếu nại hoặc mở lại tài khoản, vui lòng liên hệ Hotline{' '}
          <a href="tel:19001000" className="font-bold underline">
            1900 1000
          </a>{' '}
          hoặc email{' '}
          <a href="mailto:hotro@shop.com" className="font-bold underline">
            hotro@shop.com
          </a>.
        </AlertDescription>
      </Alert>
    );
  }

  if (reason === 'session_expired') {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-bold text-xs">
          Phiên đăng nhập đã hết hạn
        </AlertTitle>
        <AlertDescription className="text-[11px] mt-1">
          Vui lòng đăng nhập lại để tiếp tục sử dụng các dịch vụ của hệ thống.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const sessionId = anonymousId || getOrCreateAnonymousId();
      const res = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
        sessionId,
        rememberMe,
      });

      if ((res.success || res.status === 'success') && res.data) {
        setAuth({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        toast.success('Đăng nhập thành công!');
        window.location.href = '/';
      } else {
        toast.error(res.message || 'Đăng nhập không thành công');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-[420px] p-6 sm:p-8 space-y-5 animate-fadeIn">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-xl font-bold text-slate-900">
            Đăng nhập tài khoản
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Nhập email và mật khẩu để tiếp tục mua sắm tại SHOP.
          </CardDescription>
        </CardHeader>

        <Suspense fallback={null}>
          <LoginNoticeBanner />
        </Suspense>

        <CardContent className="p-0 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="loginEmail">
                Email đăng nhập <span className="text-[#e30019]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="loginEmail"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="pl-9 pr-3 h-10 text-xs rounded-[6px]"
                />
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="loginPassword">
                Mật khẩu <span className="text-[#e30019]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-9 pr-10 h-10 text-xs rounded-[6px]"
                />
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#e30019] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#e30019] hover:bg-[#c40015] text-white font-bold text-xs rounded-[6px] shadow-xs active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin mr-2" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <Separator className="flex-1" />
            <span className="shrink-0 mx-3 text-xs text-slate-400 font-medium">
              Hoặc tiếp tục với
            </span>
            <Separator className="flex-1" />
          </div>

          <GoogleLoginButton text="signin_with" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <TikTokLoginButton text="TikTok" />
            <ZaloLoginButton text="Zalo" />
          </div>

          {/* Register Link */}
          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-bold text-[#e30019] hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
