import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useAdminAuthFlow } from '@/hooks/useAdminAuthFlow';
import MascotAdminWelcome from '@/components/ui/MascotAdminWelcome';
import AuthReasonAlert from '@/components/auth/AuthReasonAlert';
import PasswordLoginForm from '@/components/auth/PasswordLoginForm';
import OtpRequestForm from '@/components/auth/OtpRequestForm';
import OtpVerifyForm from '@/components/auth/OtpVerifyForm';

export default function LoginPage() {
  const location = useLocation();
  const authError = location.state?.authError || location.state?.error;
  const {
    reason,
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    showPass,
    setShowPass,
    isLoading,
    isPasskeyLoading,
    otpValues,
    setOtpValues,
    otpInputRefs,
    countdown,
    devOtpHint,
    loginError,
    isLocked,
    lockCountdown,
    unlockTime,
    handlePasswordSubmit,
    handleRequestOtp,
    handleVerifyOtpDirect,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleResendOtp,
    handlePasskeyLogin,
  } = useAdminAuthFlow();

  const formatCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4 py-8 antialiased selection:bg-primary selection:text-primary-foreground font-sans">
      <div className="w-full max-w-[420px] flex flex-col gap-4">
        {/* Animated Mascot Header */}
        <div className="flex flex-col items-center text-center -mb-1">
          <MascotAdminWelcome size={165} />
          <div className="flex flex-col gap-0.5 mt-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Hệ thống Quản trị OMS</h1>
            <p className="text-xs text-muted-foreground">
              Đăng nhập để quản lý đơn hàng, kho và sản phẩm
            </p>
          </div>
        </div>

        <div className="rounded-[6px] border border-border bg-card p-6 shadow-xs text-card-foreground">
          <AuthReasonAlert reason={reason} customMessage={authError} />

          {/* Account Lock or Failed Attempts Alert */}
          {loginError && (
            <div
              className={`mb-4 rounded-[6px] p-3 text-xs border ${
                isLocked
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isLocked ? (
                  <ShieldAlert className="size-4 shrink-0 text-destructive mt-0.5" />
                ) : (
                  <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                )}
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="font-semibold leading-relaxed">{loginError}</span>
                  {isLocked && (
                    <div className="flex flex-col gap-1 pt-1.5 border-t border-destructive/20 text-[11px]">
                      {lockCountdown > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Thời gian chờ mở khóa:</span>
                          <span className="font-mono font-bold text-xs tabular-nums bg-destructive/15 px-1.5 py-0.5 rounded-[4px]">
                            {formatCountdown(lockCountdown)}
                          </span>
                        </div>
                      )}
                      {unlockTime && (
                        <div className="flex items-center justify-between opacity-80">
                          <span>Thời điểm đăng nhập lại:</span>
                          <span className="font-mono font-semibold tabular-nums">
                            {unlockTime}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === 'password' && (
            <PasswordLoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPass={showPass}
              setShowPass={setShowPass}
              isLoading={isLoading}
              isPasskeyLoading={isPasskeyLoading}
              isLocked={isLocked}
              lockCountdown={lockCountdown}
              onSubmit={handlePasswordSubmit}
              onPasskeyLogin={handlePasskeyLogin}
              onSwitchToOtp={() => setMode('otp_request')}
            />
          )}

          {mode === 'otp_request' && (
            <OtpRequestForm
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              isPasskeyLoading={isPasskeyLoading}
              onSubmit={handleRequestOtp}
              onPasskeyLogin={handlePasskeyLogin}
              onBackToPassword={() => setMode('password')}
            />
          )}

          {mode === 'otp_verify' && (
            <OtpVerifyForm
              email={email}
              otpValues={otpValues}
              setOtpValues={setOtpValues}
              otpInputRefs={otpInputRefs}
              onOtpChange={handleOtpChange}
              onOtpKeyDown={handleOtpKeyDown}
              onOtpPaste={handleOtpPaste}
              countdown={countdown}
              devOtpHint={devOtpHint}
              isLoading={isLoading}
              isPasskeyLoading={isPasskeyLoading}
              onVerifyOtp={handleVerifyOtpDirect}
              onResendOtp={handleResendOtp}
              onPasskeyLogin={handlePasskeyLogin}
              onChangeEmail={() => setMode('otp_request')}
              onBackToPassword={() => setMode('password')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
