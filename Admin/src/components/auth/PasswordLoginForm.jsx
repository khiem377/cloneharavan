import React from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasskeyLoginButton from './PasskeyLoginButton';
import GoogleAdminLoginButton from './GoogleAdminLoginButton';
import TikTokAdminLoginButton from './TikTokAdminLoginButton';
import ZaloAdminLoginButton from './ZaloAdminLoginButton';

/**
 * Standard Admin Login Form
 * Clean, modern layout with Password authentication, 1-click Passkey / Device biometrics, OTP fallback and Social SSO.
 */
export default function PasswordLoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPass,
  setShowPass,
  isLoading,
  isPasskeyLoading,
  onSubmit,
  onPasskeyLogin,
  onSwitchToOtp,
}) {
  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            Email quản trị
          </label>
          <div className="relative">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              className="h-10 w-full rounded-[6px] border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring font-sans"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Mật khẩu</label>
          </div>
          <div className="relative">
            <Input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-10 w-full rounded-[6px] border border-input bg-background pl-9 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring font-sans"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Submit Primary Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="mt-1 h-10 w-full rounded-[6px] font-semibold text-xs shadow-xs transition-transform active:scale-[0.98] cursor-pointer bg-foreground text-background hover:bg-foreground/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <span>Đăng nhập hệ thống</span>
          )}
        </Button>

        {/* Passkey / Device Security Button */}
        <PasskeyLoginButton
          isLoading={isPasskeyLoading}
          onClick={onPasskeyLogin}
          disabled={isLoading}
        />
      </form>

      {/* OTP Passwordless Link */}
      <div className="text-center pt-0.5">
        <button
          type="button"
          onClick={onSwitchToOtp}
          disabled={isLoading}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline font-medium cursor-pointer inline-flex items-center gap-1.5"
        >
          <Mail className="size-3.5" />
          <span>Đăng nhập không cần mật khẩu qua mã OTP Email</span>
        </button>
      </div>

      {/* Social Login Divider */}
      <div className="relative my-1 flex items-center">
        <div className="flex-grow border-t border-border" />
        <span className="shrink-0 mx-3 text-xs text-muted-foreground font-medium">
          Hoặc đăng nhập với
        </span>
        <div className="flex-grow border-t border-border" />
      </div>

      {/* Social Buttons */}
      <div className="flex flex-col gap-2">
        <GoogleAdminLoginButton />
        <TikTokAdminLoginButton />
        <ZaloAdminLoginButton />
      </div>
    </div>
  );
}
