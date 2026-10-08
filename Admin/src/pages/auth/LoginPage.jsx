import React from 'react';
import { useAdminAuthFlow } from '@/hooks/useAdminAuthFlow';
import MascotAdminWelcome from '@/components/ui/MascotAdminWelcome';
import AuthReasonAlert from '@/components/auth/AuthReasonAlert';
import PasswordLoginForm from '@/components/auth/PasswordLoginForm';
import OtpRequestForm from '@/components/auth/OtpRequestForm';
import OtpVerifyForm from '@/components/auth/OtpVerifyForm';

export default function LoginPage() {
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
    handlePasswordSubmit,
    handleRequestOtp,
    handleVerifyOtpDirect,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleResendOtp,
    handlePasskeyLogin,
  } = useAdminAuthFlow();

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
          <AuthReasonAlert reason={reason} />

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
