// Base64URL string <-> ArrayBuffer / Uint8Array utilities for WebAuthn (Passkeys)

export function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlToBuffer(base64Url) {
  if (!base64Url) return new ArrayBuffer(0);
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function isPasskeySupported() {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

export async function loginWithPasskey(options) {
  if (!isPasskeySupported()) {
    throw new Error('Trình duyệt hoặc thiết bị của bạn không hỗ trợ Passkey / WebAuthn.');
  }

  const challengeBuffer = base64UrlToBuffer(options.challenge);
  const allowCredentials = (options.allowCredentials || []).map((cred) => ({
    type: 'public-key',
    id: base64UrlToBuffer(cred.id),
    transports: cred.transports,
  }));

  const publicKeyCredentialRequestOptions = {
    challenge: challengeBuffer,
    timeout: options.timeout || 60000,
    rpId: options.rpId || window.location.hostname,
    userVerification: options.userVerification || 'preferred',
    ...(allowCredentials.length > 0 ? { allowCredentials } : {}),
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  });

  if (!assertion) {
    throw new Error('Không nhận được thông tin xác thực từ Passkey.');
  }

  return {
    credentialId: bufferToBase64Url(assertion.rawId),
    rawId: bufferToBase64Url(assertion.rawId),
    clientDataJSON: bufferToBase64Url(assertion.response.clientDataJSON),
    authenticatorData: bufferToBase64Url(assertion.response.authenticatorData),
    signature: bufferToBase64Url(assertion.response.signature),
    userHandle: assertion.response.userHandle ? bufferToBase64Url(assertion.response.userHandle) : null,
  };
}

export async function registerPasskey(options) {
  if (!isPasskeySupported()) {
    throw new Error('Trình duyệt hoặc thiết bị của bạn không hỗ trợ Passkey / WebAuthn.');
  }

  const challengeBuffer = base64UrlToBuffer(options.challenge);
  const userIdBuffer = base64UrlToBuffer(options.user.id);
  const excludeCredentials = (options.excludeCredentials || []).map((cred) => ({
    type: 'public-key',
    id: base64UrlToBuffer(cred.id),
  }));

  const publicKeyCredentialCreationOptions = {
    challenge: challengeBuffer,
    rp: options.rp || { name: 'Haravan OMS', id: window.location.hostname },
    user: {
      id: userIdBuffer,
      name: options.user.name,
      displayName: options.user.displayName,
    },
    pubKeyCredParams: options.pubKeyCredParams || [
      { alg: -7, type: 'public-key' },
      { alg: -257, type: 'public-key' },
    ],
    timeout: options.timeout || 60000,
    attestation: options.attestation || 'none',
    excludeCredentials,
    authenticatorSelection: options.authenticatorSelection || {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  });

  if (!credential) {
    throw new Error('Không tạo được khóa Passkey.');
  }

  return {
    credentialId: bufferToBase64Url(credential.rawId),
    rawId: bufferToBase64Url(credential.rawId),
    clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
    attestationObject: bufferToBase64Url(credential.response.attestationObject),
  };
}

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

  if (errName === 'NotAllowedError' || errMsg.includes('timed out') || errMsg.includes('not allowed') || errMsg.includes('canceled') || errMsg.includes('cancelled')) {
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
