import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { getDefaultRedirectPath } from '@/utils/permissionUtils';
import {
  loginWithPasskey,
  isPasskeySupported,
  formatPasskeyError,
  getPasskeyPromptMessage,
} from '@/utils/passkeyUtils';

const STORAGE_SAVED_EMAIL = 'admin_saved_email';

/**
 * Custom Hook encapsulating Admin Authentication State & Handlers
 */
export function useAdminAuthFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const setAuth = useAuthStore((s) => s.setAuth);

  // Auth Mode: 'password' | 'otp_request' | 'otp_verify'
  const [mode, setMode] = useState('password');

  // Form fields
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_SAVED_EMAIL) || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP 6 digits
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Loading & Countdown
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [devOtpHint, setDevOtpHint] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (mode === 'otp_verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, countdown]);

  // Auto-reset loading states when returning via Back button (BFCache) or window focus
  useEffect(() => {
    const handleReset = () => {
      setIsLoading(false);
      setIsPasskeyLoading(false);
    };

    window.addEventListener('pageshow', handleReset);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsLoading(false);
        setIsPasskeyLoading(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleReset);

    return () => {
      window.removeEventListener('pageshow', handleReset);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleReset);
    };
  }, []);

  // Focus first OTP input when mode becomes 'otp_verify'
  useEffect(() => {
    if (mode === 'otp_verify') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [mode]);

  // Handle successful login
  const handleAuthSuccess = useCallback(
    (userData, tokenData, message) => {
      if (userData.role === 'user') {
        toast.error('Tài khoản của bạn không có quyền truy cập trang quản trị!');
        return;
      }

      // Save email for quick next login
      try {
        if (email.trim()) {
          localStorage.setItem(STORAGE_SAVED_EMAIL, email.trim().toLowerCase());
        }
      } catch {
        // ignore
      }

      setAuth({
        user: userData,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
      });

      toast.success(message || 'Đăng nhập thành công!');
      const targetPath = getDefaultRedirectPath(userData);
      navigate(targetPath, { replace: true });
    },
    [navigate, setAuth, email]
  );

  // 1. Password Login
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

  // 2. Request OTP
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

  // 3. Verify OTP Direct
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

  // 4. OTP Input Key & Change Handlers
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

  // 6. Passkey Login Flow
  const handlePasskeyLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Vui lòng nhập địa chỉ email quản trị trước khi xác thực!');
      return;
    }

    if (!isPasskeySupported()) {
      toast.error('Thiết bị hoặc trình duyệt của bạn chưa hỗ trợ Passkey / WebAuthn.');
      return;
    }

    setIsPasskeyLoading(true);
    try {
      const { data: optRes } = await authService.getPasskeyLoginOptions(cleanEmail);
      const options = optRes.data;

      const promptMsg = await getPasskeyPromptMessage('login');
      toast.info(promptMsg);
      const passkeyResult = await loginWithPasskey(options);

      const { data: verifyRes } = await authService.verifyPasskeyLogin({
        email: cleanEmail,
        response: passkeyResult,
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

  return {
    reason,
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    showPass,
    setShowPass,
    rememberMe,
    setRememberMe,
    otpValues,
    setOtpValues,
    otpInputRefs,
    isLoading,
    isPasskeyLoading,
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
  };
}
