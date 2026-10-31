'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import { toast } from '@/components/ui/toast';
import LoginNoticeBanner from '@/components/auth/LoginNoticeBanner';
import LoginLockoutAlert from '@/components/auth/LoginLockoutAlert';
import AuthSocialButtons from '@/components/auth/AuthSocialButtons';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [unlockTime, setUnlockTime] = useState('');

  useEffect(() => {
    const handleReset = () => setLoading(false);
    window.addEventListener('pageshow', handleReset);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') handleReset();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleReset);
    return () => {
      window.removeEventListener('pageshow', handleReset);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleReset);
    };
  }, []);

  useEffect(() => {
    if (lockCountdown <= 0) {
      if (isLocked) {
        setIsLocked(false);
        setLoginError(null);
      }
      return;
    }
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLocked(false);
          setLoginError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockCountdown, isLocked]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m > 0 ? `${m} phút ` : ''}${s < 10 ? '0' : ''}${s} giây`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (loginError && !isLocked) setLoginError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setLoginError(null);

    try {
      const anonId = anonymousId || getOrCreateAnonymousId();
      const res = await authService.login({
        ...formData,
        rememberMe,
        anonymousId: anonId,
      });

      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Đăng nhập thành công!');

      if (res.data.cartMigrated) {
        useCartStore.getState().fetchCart();
      }

      router.push('/');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.isLocked) {
        setIsLocked(true);
        setLockCountdown(errData.lockoutSeconds || 900);
        setUnlockTime(
          errData.lockUntil
            ? new Date(errData.lockUntil).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : ''
        );
        setLoginError(
          errData.message ||
            'Tài khoản tạm thời bị khóa do nhập sai mật khẩu nhiều lần.'
        );
      } else if (errData?.remainingAttempts !== undefined) {
        setLoginError(
          `${errData.message || 'Mật khẩu không chính xác.'} Bạn còn ${errData.remainingAttempts} lần thử.`
        );
      } else {
        setLoginError(
          errData?.message ||
            err.message ||
            'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
        );
      }
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

        <LoginLockoutAlert
          loginError={loginError}
          isLocked={isLocked}
          lockCountdown={lockCountdown}
          unlockTime={unlockTime}
          formatCountdown={formatCountdown}
        />

        <CardContent className="p-0 space-y-4">
          <form onSubmit={handleSubmit} method="POST" className="space-y-4">
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

            <div className="space-y-1.5">
              <Label htmlFor="loginPassword">
                Mật khẩu <span className="text-accent">*</span>
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
                className="text-xs font-semibold text-brand hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading || isLocked}
              className="w-full h-10 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-[6px] shadow-xs active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin mr-2" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : isLocked ? (
                <span className="font-mono tabular-nums">Tạm khóa ({formatCountdown(lockCountdown)})</span>
              ) : (
                <span>Đăng nhập</span>
              )}
            </Button>
          </form>

          <AuthSocialButtons googleText="signin_with" />

          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-bold text-brand hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
