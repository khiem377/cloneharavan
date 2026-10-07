import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Fingerprint,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';
import { getDefaultRedirectPath } from '@/utils/permissionUtils';
import { loginWithPasskey, isPasskeySupported, formatPasskeyError } from '@/utils/passkeyUtils';
import MascotAdminWelcome from '@/components/ui/MascotAdminWelcome';
import GoogleAdminLoginButton from '@/components/auth/GoogleAdminLoginButton';
import TikTokAdminLoginButton from '@/components/auth/TikTokAdminLoginButton';
import ZaloAdminLoginButton from '@/components/auth/ZaloAdminLoginButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const setAuth = useAuthStore((s) => s.setAuth);

  // States
  // mode: 'password' (default) | 'otp_request' (enter email) | 'otp_verify' (verify 6 digits)
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // OTP 6 digits
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Loading & Countdown states
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [devOtpHint, setDevOtpHint] = useState('');

  // Countdown Timer Effect
  useEffect(() => {
    let timer;
    if (mode === 'otp_verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, countdown]);

  // Focus first OTP input when mode becomes 'otp_verify'
  useEffect(() => {
    if (mode === 'otp_verify') {
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [mode]);

  // Handle successful login
  const handleAuthSuccess = (userData, tokenData, message) => {
    if (userData.role === 'user') {
      toast.error('Tài khoản của bạn không có quyền truy cập trang quản trị!');
      return;
    }

    setAuth({
      user: userData,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
    });

    toast.success(message || 'Đăng nhập thành công!');
    const targetPath = getDefaultRedirectPath(userData);
    navigate(targetPath, { replace: true });
  };

  // 1. DEFAULT: Email + Password Login
  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Vui lòng nhập email quản trị!');
      return;
    }
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu!');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await authService.login({
        email: cleanEmail,
        password,
        rememberMe,
      });
      handleAuthSuccess(data.data.user, data.data, data.message);
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.message ??
        'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu!';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Request OTP and switch to OTP verify mode
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Vui lòng nhập địa chỉ email quản trị!');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await authService.requestAdminOtp(cleanEmail);
      if (data.data?.otp) {
        setDevOtpHint(data.data.otp);
      }
      setCountdown(60);
      setOtpValues(['', '', '', '', '', '']);
      setMode('otp_verify');
      toast.success(data.message || 'Mã xác thực đã được gửi tới email của bạn!');
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.message ??
        'Email không tồn tại hoặc tài khoản không có quyền truy cập trang quản trị!';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. OTP Inputs Handlers
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otpValues];
      newOtp[index] = '';
      setOtpValues(newOtp);
      return;
    }

    const digit = cleaned[cleaned.length - 1];
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);

    // Auto focus next box
    if (index < 5 && digit) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits are entered
    const completeOtp = newOtp.join('');
    if (completeOtp.length === 6) {
      handleVerifyOtpDirect(completeOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtpValues(newOtp);

    const focusIdx = Math.min(digits.length, 5);
    otpInputRefs.current[focusIdx]?.focus();

    if (digits.length >= 6) {
      handleVerifyOtpDirect(digits.slice(0, 6).join(''));
    }
  };

  // 4. Verify OTP Direct
  const handleVerifyOtpDirect = async (codeToVerify) => {
    const fullOtp = codeToVerify || otpValues.join('');
    if (fullOtp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số mã xác thực!');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await authService.verifyAdminOtp(
        email.trim().toLowerCase(),
        fullOtp,
        rememberMe
      );
      handleAuthSuccess(data.data.user, data.data, data.message);
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.message ??
        'Mã xác thực không chính xác hoặc đã hết hạn!';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const { data } = await authService.resendAdminOtp(email.trim().toLowerCase());
      setCountdown(60);
      setOtpValues(['', '', '', '', '', '']);
      if (data.data?.otp) {
        setDevOtpHint(data.data.otp);
      }
      toast.success(data.message || 'Đã gửi lại mã xác thực mới vào email của bạn!');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Gửi lại mã xác thực thất bại!';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. PASSKEY WEBAUTHN LOGIN FLOW
  const handlePasskeyLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Vui lòng nhập địa chỉ email quản trị trước khi dùng Passkey!');
      return;
    }

    if (!isPasskeySupported()) {
      toast.error('Thiết bị hoặc trình duyệt của bạn chưa hỗ trợ Passkey / WebAuthn.');
      return;
    }

    setIsPasskeyLoading(true);
    try {
      // 1. Get options from server
      const { data: optRes } = await authService.getPasskeyLoginOptions(cleanEmail);
      const options = optRes.data;

      // 2. Prompt browser / Windows Hello / Touch ID
      toast.info('Vui lòng quét vân tay / Face ID / Khóa bảo mật trên thiết bị...');
      const passkeyResult = await loginWithPasskey(options);

      // 3. Verify assertion with server
      const { data: verifyRes } = await authService.verifyPasskeyLogin({
        email: cleanEmail,
        ...passkeyResult,
        rememberMe,
      });

      handleAuthSuccess(verifyRes.data.user, verifyRes.data, verifyRes.message);
    } catch (err) {
      console.error('Passkey login error:', err);
      const msg = formatPasskeyError(err);
      toast.error(msg);
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4 py-8 antialiased selection:bg-primary selection:text-primary-foreground font-sans">
      <div className="w-full max-w-[400px] flex flex-col gap-4">
        {/* Animated Mascot Header */}
        <div className="flex flex-col items-center text-center -mb-1">
          <MascotAdminWelcome size={175} />
          <div className="flex flex-col gap-0.5 mt-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Hệ thống Quản trị OMS</h1>
            <p className="text-xs text-muted-foreground">
              Đăng nhập để quản lý đơn hàng, kho và sản phẩm
            </p>
          </div>
        </div>

        {/* Card Container */}
        <div className="rounded-[6px] border border-border bg-card p-6 shadow-xs text-card-foreground">
          {/* Reason Alerts */}
          {reason === 'session_expired' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.</span>
            </div>
          )}

          {reason === 'blocked' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>Tài khoản đã bị khóa hoặc phiên truy cập bị thu hồi.</span>
            </div>
          )}

          {reason === 'no_admin_access' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>Tài khoản không có quyền truy cập vào bảng điều khiển quản trị.</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 1: DEFAULT LOGIN FORM (EMAIL + PASSWORD)            */}
          {/* ======================================================== */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4" noValidate>
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Email quản trị</span>
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    autoFocus
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
                className="mt-1 h-10 w-full rounded-[6px] font-semibold text-sm shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
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

              {/* Quick Passkey Login Button */}
              <Button
                type="button"
                variant="outline"
                disabled={isPasskeyLoading}
                onClick={handlePasskeyLogin}
                className="h-9 w-full rounded-[6px] border-border text-xs font-medium text-foreground hover:bg-accent transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {isPasskeyLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Fingerprint className="size-4 text-primary" />
                )}
                <span>Đăng nhập bằng Passkey (Vân tay / Face ID)</span>
              </Button>

              {/* OTP Passwordless Link */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => setMode('otp_request')}
                  disabled={isLoading}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Mail className="size-3.5" />
                  <span>Đăng nhập không cần mật khẩu qua mã OTP Email</span>
                </button>
              </div>

              {/* Social Login Section */}
              <div className="relative my-1 flex items-center">
                <div className="flex-grow border-t border-border" />
                <span className="shrink-0 mx-3 text-xs text-muted-foreground font-medium">
                  Hoặc đăng nhập với
                </span>
                <div className="flex-grow border-t border-border" />
              </div>

              <div className="flex flex-col gap-2">
                <GoogleAdminLoginButton />
                <TikTokAdminLoginButton />
                <ZaloAdminLoginButton />
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* MODE 2: NHẬP EMAIL ĐỂ NHẬN MÃ OTP (OTP REQUEST)          */}
          {/* ======================================================== */}
          {mode === 'otp_request' && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4" noValidate>
              {/* Header with Back Button */}
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <button
                  type="button"
                  onClick={() => setMode('password')}
                  className="size-7 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer active:scale-[0.95]"
                  aria-label="Quay lại đăng nhập mật khẩu"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Đăng nhập qua mã OTP
                </h2>
              </div>

              {/* Subtitle */}
              {/* <p className="text-xs text-muted-foreground leading-relaxed">
                Nhập địa chỉ email quản trị của bạn để nhận mã xác thực 6 chữ số dùng để đăng nhập.
              </p> */}

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

              {/* Alternative Auth Methods */}
              <div className="relative my-1 flex items-center">
                <div className="flex-grow border-t border-border" />
                <span className="shrink-0 mx-2 text-[11px] text-muted-foreground font-medium">
                  Hoặc lựa chọn
                </span>
                <div className="flex-grow border-t border-border" />
              </div>

              <div className="flex flex-col gap-2">
                {/* Passkey Login Trigger */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPasskeyLoading}
                  onClick={handlePasskeyLogin}
                  className="h-9 w-full rounded-[6px] border-border text-xs font-medium text-foreground hover:bg-accent transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPasskeyLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Fingerprint className="size-4 text-primary" />
                  )}
                  <span>Đăng nhập bằng Passkey</span>
                </Button>

                {/* Return to Password Login */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode('password')}
                  className="h-9 w-full rounded-[6px] text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="size-3.5" />
                  <span>Quay lại đăng nhập bằng mật khẩu</span>
                </Button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* MODE 3: NHẬP MÃ XÁC THỰC 6 SỐ (OTP VERIFY)                */}
          {/* ======================================================== */}
          {mode === 'otp_verify' && (
            <div className="flex flex-col gap-4">
              {/* Header with Back Button */}
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <button
                  type="button"
                  onClick={() => setMode('otp_request')}
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
                    onClick={() => setMode('otp_request')}
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
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
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
                      onClick={handleResendOtp}
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
                onClick={() => handleVerifyOtpDirect()}
                disabled={isLoading || otpValues.join('').length !== 6}
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

              {/* Alternative Auth Methods */}
              <div className="relative my-1 flex items-center">
                <div className="flex-grow border-t border-border" />
                <span className="shrink-0 mx-2 text-[11px] text-muted-foreground font-medium">
                  Hoặc lựa chọn
                </span>
                <div className="flex-grow border-t border-border" />
              </div>

              <div className="flex flex-col gap-2">
                {/* Passkey Login Trigger */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPasskeyLoading}
                  onClick={handlePasskeyLogin}
                  className="h-9 w-full rounded-[6px] border-border text-xs font-medium text-foreground hover:bg-accent transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPasskeyLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Fingerprint className="size-4 text-primary" />
                  )}
                  <span>Đăng nhập bằng Passkey</span>
                </Button>

                {/* Return to Password Login */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode('password')}
                  className="h-9 w-full rounded-[6px] text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="size-3.5" />
                  <span>Quay lại đăng nhập bằng mật khẩu</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
