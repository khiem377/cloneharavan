import React from 'react';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasskeyLoginButton from './PasskeyLoginButton';

/**
 * OTP Request Form View (Enter admin email to receive 6-digit OTP)
 * @param {Object} props
 * @param {string} props.email - Current email value
 * @param {(val: string) => void} props.setEmail - Email change handler
 * @param {boolean} props.isLoading - Request OTP loading state
 * @param {boolean} props.isPasskeyLoading - Passkey login loading state
 * @param {(e: React.FormEvent) => void} props.onSubmit - Submit handler
 * @param {() => void} props.onPasskeyLogin - Passkey ceremony trigger
 * @param {() => void} props.onBackToPassword - Return to password mode
 */
export default function OtpRequestForm({
  email,
  setEmail,
  isLoading,
  isPasskeyLoading,
  onSubmit,
  onPasskeyLogin,
  onBackToPassword,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Header with Back Button */}
      <div className="flex items-center gap-2 pb-1 border-b border-border/60">
        <button
          type="button"
          onClick={onBackToPassword}
          className="size-7 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer active:scale-[0.95]"
          aria-label="Quay lại đăng nhập mật khẩu"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h2 className="text-base font-bold text-foreground tracking-tight">
          Đăng nhập qua mã OTP
        </h2>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">
          Email <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            autoFocus
            required
            className="h-10 w-full rounded-[6px] border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring font-sans"
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Submit Button: Gửi mã xác thực */}
      <Button
        type="submit"
        disabled={isLoading || !email.trim()}
        className="mt-1 h-10 w-full rounded-[6px] font-semibold text-sm shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            <span>Đang gửi mã...</span>
          </>
        ) : (
          <span>Gửi mã xác thực OTP</span>
        )}
      </Button>

      {/* Alternative Auth Methods Divider */}
      <div className="relative my-1 flex items-center">
        <div className="flex-grow border-t border-border" />
        <span className="shrink-0 mx-2 text-[11px] text-muted-foreground font-medium">
          Hoặc lựa chọn
        </span>
        <div className="flex-grow border-t border-border" />
      </div>

      {/* Alternative Action Buttons */}
      <div className="flex flex-col gap-2">
        <PasskeyLoginButton
          isLoading={isPasskeyLoading}
          onClick={onPasskeyLogin}
          disabled={isLoading}
        />

        <Button
          type="button"
          variant="ghost"
          onClick={onBackToPassword}
          className="h-9 w-full rounded-[6px] text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Lock className="size-3.5" />
          <span>Quay lại đăng nhập bằng mật khẩu</span>
        </Button>
      </div>
    </form>
  );
}
