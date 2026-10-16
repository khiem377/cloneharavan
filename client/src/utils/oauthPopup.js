/**
 * Tiện ích hỗ trợ luồng OAuth Popup (tương tự Shopee, Google, Spotify, Canva)
 */

export function openCenteredPopup(url, title = 'OAuth Login', width = 680, height = 820) {
  if (typeof window === 'undefined') return null;

  // Trên Mobile, không nên mở Popup window (window.open) vì:
  // 1. Trình duyệt Mobile (Safari/Chrome) hay chặn popup window.open hoặc mở tab mới làm đứt liên kết postMessage.
  // 2. Chuyển hướng trực tiếp (window.location.href) giúp iOS và Android kích hoạt Universal Links / App Links để mở trực tiếp Zalo App / TikTok App 1 chạm cực kỳ mượt mà.
  const isMobile =
    typeof navigator !== 'undefined' &&
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth > 0 && window.innerWidth < 768));

  if (isMobile) {
    return null;
  }

  // Tính toán vị trí tâm màn hình chính xác trên Desktop (hỗ trợ cả multi-monitor)
  const screenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const screenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const windowWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
  const windowHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;

  const left = screenLeft + (windowWidth - width) / 2;
  const top = screenTop + (windowHeight - height) / 2;

  try {
    const popup = window.open(
      url,
      title,
      `width=${width},height=${height},top=${Math.max(0, top)},left=${Math.max(0, left)},scrollbars=yes,status=yes,resizable=yes,location=yes,toolbar=no,menubar=no`
    );

    if (popup && popup.focus) {
      popup.focus();
    }

    return popup;
  } catch (err) {
    console.error('Không thể mở popup OAuth:', err);
    return null;
  }
}

/**
 * Lắng nghe kết quả xác thực từ Popup thông qua postMessage
 * @param {Window} popupWindow - Cửa sổ popup vừa mở
 * @param {Object} options - Tùy chọn timeout và provider
 * @returns {Promise<Object>}
 */
export function waitForOAuthMessage(popupWindow, options = {}) {
  const { timeout = 120000, provider = null } = options;

  return new Promise((resolve, reject) => {
    let checkClosedInterval = null;
    let timeoutTimer = null;

    const cleanup = () => {
      if (checkClosedInterval) clearInterval(checkClosedInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      window.removeEventListener('message', messageHandler);
    };

    const messageHandler = (event) => {
      // Chỉ chấp nhận message từ cùng origin
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'OAUTH_AUTH_SUCCESS') {
        if (!provider || data.provider === provider) {
          cleanup();
          try {
            if (popupWindow && !popupWindow.closed) {
              popupWindow.close();
            }
          } catch (_) {}
          resolve(data);
        }
      } else if (data.type === 'OAUTH_AUTH_ERROR') {
        if (!provider || data.provider === provider) {
          cleanup();
          try {
            if (popupWindow && !popupWindow.closed) {
              popupWindow.close();
            }
          } catch (_) {}
          reject(new Error(data.message || 'Xác thực thất bại'));
        }
      }
    };

    window.addEventListener('message', messageHandler);

    // Kiểm tra nếu người dùng chủ động đóng cửa sổ popup
    if (popupWindow) {
      checkClosedInterval = setInterval(() => {
        try {
          if (popupWindow.closed) {
            cleanup();
            reject(new Error('POPUP_CLOSED'));
          }
        } catch (_) {}
      }, 500);
    }

    // Timeout an toàn
    timeoutTimer = setTimeout(() => {
      cleanup();
      reject(new Error('TIMEOUT'));
    }, timeout);
  });
}
