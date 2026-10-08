import React from 'react';
import { ArrowLeft, Mail, CheckCircle2, RefreshCw, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PasskeyLoginButton from './PasskeyLoginButton';

/**
 * 6-Digit OTP Verification Form View
 * @param {Object} props
 * @param {string} props.email - Target email for OTP
 * @param {string[]} props.otpValues - Array of 6 single-digit strings
 * @param {React.MutableRefObject<HTMLInputElement[]>} props.otpInputRefs - Refs to the 6 inputs
 * @param {(index: number, val: string) => void} props.onOtpChange - Change handler
 * @param {(index: number, e: React.KeyboardEvent) => void} props.onOtpKeyDown - Keydown handler
 * @param {(e: React.ClipboardEvent) => void} props.onOtpPaste - Paste handler
 * @param {number} props.countdown - Countdown seconds remaining
 * @param {string} props.devOtpHint - Local development OTP code hint
 * @param {boolean} props.isLoading - Verification loading state
 * @param {boolean} props.isPasskeyLoading - Passkey loading state
 * @param {() => void} props.onVerifyOtp - Direct verify trigger
 * @param {() => void} props.onResendOtp - Resend OTP trigger
 * @param {() => void} props.onPasskeyLogin - Passkey ceremony trigger
 * @param {() => void} props.onChangeEmail - Switch back to OTP request mode
 * @param {() => void} props.onBackToPassword - Switch back to password mode
 */
export default function OtpVerifyForm({
  email,
  otpValues,
  otpInputRefs,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  countdown,
  devOtpHint,
  isLoading,
  isPasskeyLoading,
  onVerifyOtp,
  onResendOtp,
  onPasskeyLogin,
  onChangeEmail,
  onBackToPassword,
}) {
  const isComplete = otpValues.join('').length === 6;

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-2 pb-1 border-b border-border/60">
        <button
          type="button"
          onClick={onChangeEmail}
          className="size-7 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer active:scale-[0.95]"
          aria-label="Quay lại nhập email"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h2 className="text-base font-bold text-foreground tracking-tight">
          Nhập mã xác thực
        </h2>
      </div>

      {/* Subtitle with current email */}
      <div className="text-xs text-muted-foreground flex flex-col gap-1">
        <span>Vui lòng nhập mã xác thực đã được gửi qua email</span>
        <div className="flex items-center justify-between bg-muted/40 px-2.5 py-1.5 rounded-[4px] border border-border/60">
          <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
            <Mail className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={onChangeEmail}
            className="text-[11px] font-semibold text-primary hover:underline shrink-0 cursor-pointer ml-2"
          >
            Thay đổi
          </button>
        </div>
      </div>

      {/* Dev Hint in local development */}
      {devOtpHint && (
        <div className="flex items-center gap-1.5 rounded-[4px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span>
            Mã OTP thử nghiệm: <strong className="font-mono">{devOtpHint}</strong>
          </span>
        </div>
      )}

      {/* 6-box OTP inputs */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 my-1">
        {otpValues.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              if (otpInputRefs?.current) {
                otpInputRefs.current[idx] = el;
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => onOtpChange(idx, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(idx, e)}
            onPaste={onOtpPaste}
            className={cn(
              'h-12 w-full max-w-[48px] rounded-[6px] border border-input bg-background text-center text-lg font-bold font-mono tabular-nums text-foreground outline-none transition-all focus:border-ring focus:ring-1 focus:ring-ring select-all',
              digit && 'border-primary/80 bg-primary/5'
            )}
          />
        ))}
      </div>

      {/* Resend OTP text & countdown */}
      <div className="text-center text-xs text-muted-foreground">
        {countdown > 0 ? (
          <span>
            Chưa nhận được mã xác thực? Gửi lại sau{' '}
            <strong className="text-foreground font-mono tabular-nums">
              {countdown}s
            </strong>
          </span>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <span>Chưa nhận được mã xác thực?</span>
            <button
              type="button"
              onClick={onResendOtp}
              disabled={isLoading}
              className="font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <RefreshCw className={cn('size-3', isLoading && 'animate-spin')} />
              <span>Gửi lại mã xác thực</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Button: Tiếp tục */}
      <Button
        type="button"
        onClick={() => onVerifyOtp()}
        disabled={isLoading || !isComplete}
        className="mt-1 h-10 w-full rounded-[6px] font-semibold text-sm shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            <span>Đang xác thực mã...</span>
          </>
        ) : (
          <span>Tiếp tục</span>
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
    </div>
  );
}
