import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
} from '@simplewebauthn/browser';

/**
 * Detect client platform & biometric / platform authenticator capabilities
 */
export async function getPasskeyDeviceInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua) && !isIOS;
  const isAndroid = /Android/i.test(ua);
  const isWindows = /Windows/i.test(ua);

  let hasPlatformAuth = false;
  if (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      hasPlatformAuth = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      hasPlatformAuth = false;
    }
  }

  let deviceType = 'desktop';
  let deviceName = 'Thiết bị';
  let authType = 'Khóa bảo mật / Trình duyệt';

  if (isIOS) {
    deviceType = 'ios';
    deviceName = 'iPhone / iPad';
    authType = 'Face ID / Touch ID';
  } else if (isMac) {
    deviceType = 'mac';
    deviceName = 'MacBook / Mac';
    authType = hasPlatformAuth ? 'Touch ID / Mật khẩu Mac' : 'Trình duyệt / Khóa bảo mật';
  } else if (isAndroid) {
    deviceType = 'android';
    deviceName = 'Thiết bị Android';
    authType = 'Vân tay / Mở khóa màn hình';
  } else if (isWindows) {
    deviceType = 'windows';
    deviceName = 'Máy tính Windows';
    authType = hasPlatformAuth ? 'Windows Hello (PIN/Vân tay) / Google' : 'Google Password Manager / Trình duyệt';
  }

  return {
    isIOS,
    isMac,
    isAndroid,
    isWindows,
    hasPlatformAuth,
    deviceType,
    deviceName,
    authType,
  };
}

/**
 * Return dynamic, device-tailored prompt message for toast notifications
 * @param {'login' | 'register'} mode
 */
export async function getPasskeyPromptMessage(mode = 'login') {
  const info = await getPasskeyDeviceInfo();
  const isRegister = mode === 'register';

  if (info.isIOS) {
    return isRegister
      ? 'Vui lòng xác nhận Face ID / Touch ID trên iPhone/iPad để tạo Passkey...'
      : 'Vui lòng quét Face ID / Touch ID trên iPhone/iPad để đăng nhập...';
  }

  if (info.isMac) {
    return isRegister
      ? 'Vui lòng chạm Touch ID hoặc nhập mật khẩu máy Mac để tạo Passkey...'
      : 'Vui lòng chạm Touch ID hoặc nhập mật khẩu máy Mac để đăng nhập...';
  }

  if (info.isAndroid) {
    return isRegister
      ? 'Vui lòng quét vân tay hoặc mở khóa màn hình điện thoại để tạo Passkey...'
      : 'Vui lòng quét vân tay hoặc mở khóa màn hình điện thoại để đăng nhập...';
  }

  if (info.isWindows) {
    if (info.hasPlatformAuth) {
      return isRegister
        ? 'Vui lòng xác thực mã PIN / Windows Hello hoặc chọn Google trên máy tính...'
        : 'Vui lòng xác thực mã PIN / Windows Hello hoặc chọn Google để đăng nhập...';
    }
    return isRegister
      ? 'Vui lòng bấm "Tạo / Tiếp tục" trên popup Google hoặc trình duyệt...'
      : 'Vui lòng bấm xác nhận trên popup Google hoặc trình duyệt để đăng nhập...';
  }

  return isRegister
    ? 'Vui lòng xác nhận trên hộp thoại bảo mật của trình duyệt để tạo Passkey...'
    : 'Vui lòng xác thực trên hộp thoại bảo mật của trình duyệt để đăng nhập...';
}

/**
 * Check if the browser / platform environment supports WebAuthn / Passkeys
 */
export function isPasskeySupported() {
  return browserSupportsWebAuthn();
}

/**
 * Check if the browser supports WebAuthn Autofill / Conditional UI
 */
export function isPasskeyAutofillSupported() {
  return typeof browserSupportsWebAuthnAutofill === 'function' && browserSupportsWebAuthnAutofill();
}

/**
 * Prompt browser authentication ceremony using @simplewebauthn/browser
 * @param {PublicKeyCredentialRequestOptionsJSON} options
 */
export async function loginWithPasskey(options) {
  if (!isPasskeySupported()) {
    throw new Error('Trình duyệt hoặc thiết bị của bạn không hỗ trợ Passkey / WebAuthn.');
  }

  const authResponse = await startAuthentication({
    optionsJSON: options,
  });

  if (!authResponse) {
    throw new Error('Không nhận được thông tin xác thực từ Passkey.');
  }

  return authResponse;
}

/**
 * Prompt browser registration ceremony using @simplewebauthn/browser
 * @param {PublicKeyCredentialCreationOptionsJSON} options
 */
export async function registerPasskey(options) {
  if (!isPasskeySupported()) {
    throw new Error('Trình duyệt hoặc thiết bị của bạn không hỗ trợ Passkey / WebAuthn.');
  }

  const regResponse = await startRegistration({
    optionsJSON: options,
  });

  if (!regResponse) {
    throw new Error('Không tạo được khóa Passkey.');
  }

  return regResponse;
}

/**
 * Format WebAuthn and network errors into clear, friendly Vietnamese messages
 * @param {Error|DOMException|any} err
 */
export function formatPasskeyError(err) {
  if (!err) return 'Đã xảy ra lỗi không xác định khi xác thực Passkey.';

  // 1. Check BE API response message first
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  // 2. DOMException Name / Message matching for WebAuthn
  const errName = err.name || '';
  const errMsg = (err.message || '').toLowerCase();

  if (errName === 'InvalidStateError' || errMsg.includes('already registered') || errMsg.includes('contains one of the credentials')) {
    return 'Thiết bị bảo mật hoặc Passkey này đã được liên kết với tài khoản từ trước.';
  }

  if (errName === 'NotAllowedError' || errMsg.includes('timed out') || errMsg.includes('not allowed') || errMsg.includes('canceled') || errMsg.includes('cancelled') || errMsg.includes('abort')) {
    return 'Bạn đã hủy thao tác hoặc phiên xác thực bảo mật đã hết thời gian chờ.';
  }

  if (errName === 'NotSupportedError' || errMsg.includes('not supported')) {
    return 'Trình duyệt hoặc hệ điều hành của bạn chưa hỗ trợ tính năng bảo mật Passkey này.';
  }

  if (errName === 'AbortError' || errMsg.includes('aborted')) {
    return 'Thao tác xác thực bảo mật đã bị hủy bỏ.';
  }

  if (errName === 'SecurityError' || errMsg.includes('security')) {
    return 'Lỗi bảo mật khi xác thực Passkey. Vui lòng kiểm tra chứng chỉ HTTPS hoặc miền hợp lệ.';
  }

  if (errName === 'ConstraintError' || errMsg.includes('constraint')) {
    return 'Thiết bị bảo mật không đáp ứng tiêu chuẩn phần cứng yêu cầu.';
  }

  if (errName === 'UnknownError') {
    return 'Đã xảy ra lỗi không xác định từ phần cứng xác thực bảo mật.';
  }

  // 3. Fallback if err.message exists and is already Vietnamese
  if (err.message && /[\u00C0-\u1EF9]/.test(err.message)) {
    return err.message;
  }

  return 'Xác thực Passkey không thành công. Vui lòng thử lại!';
}
