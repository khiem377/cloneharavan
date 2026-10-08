const axios = require('axios');

// Cache tra cứu GeoIP theo IP để tránh gọi liên tục
const geoCache = new Map();

/**
 * Tra cứu địa lý tỉnh thành, quốc gia từ IP
 */
const lookupGeoLocation = async (ip) => {
  if (!ip) return 'Việt Nam';
  
  const cleanIp = ip.replace('::ffff:', '').trim();
  
  if (
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'localhost' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('172.16.')
  ) {
    return 'Hồ Chí Minh, Việt Nam';
  }

  if (geoCache.has(cleanIp)) {
    return geoCache.get(cleanIp);
  }

  try {
    const res = await axios.get(
      `http://ip-api.com/json/${encodeURIComponent(cleanIp)}?fields=status,country,city,regionName`,
      { timeout: 2500 }
    );
    if (res.data && res.data.status === 'success') {
      const city = res.data.city || res.data.regionName || 'Hồ Chí Minh';
      const country = res.data.country || 'Việt Nam';
      const loc = `${city}, ${country}`;
      geoCache.set(cleanIp, loc);
      return loc;
    }
  } catch (err) {
    // Không chặn luồng nếu tra cứu ngoại mạng timeout
  }

  const fallback = 'Việt Nam';
  geoCache.set(cleanIp, fallback);
  return fallback;
};

/**
 * Helper phân tích User-Agent để lấy thông tin thiết bị, trình duyệt, hệ điều hành
 */
const parseDeviceInfo = (userAgent = '', ip = '127.0.0.1') => {
  const ua = userAgent || '';
  
  let browser = 'Chrome';
  let os = 'Windows';
  let deviceType = 'desktop';

  // Hệ điều hành (OS)
  if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = /ipad/i.test(ua) ? 'iPadOS' : 'iOS';
    deviceType = /ipad/i.test(ua) ? 'tablet' : 'mobile';
  } else if (/android/i.test(ua)) {
    os = 'Android';
    deviceType = 'mobile';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
    deviceType = 'desktop';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
    deviceType = 'desktop';
  }

  // Trình duyệt (Browser)
  if (/zalo/i.test(ua)) {
    browser = 'Zalo App';
  } else if (/tiktok|bytedance/i.test(ua)) {
    browser = 'TikTok App';
  } else if (/edg\//i.test(ua) || /edge\//i.test(ua)) {
    browser = 'Edge';
  } else if (/opr\//i.test(ua) || /opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/coc_coc_browser|coc_coc/i.test(ua)) {
    browser = 'Cốc Cốc';
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/safari/i.test(ua)) {
    browser = 'Safari';
  }

  // Tên hiển thị chuẩn F8: "Chrome • Windows", "Safari • iOS"
  const deviceName = `${browser} • ${os}`;

  // Chuẩn hóa IP
  let cleanIp = ip || '127.0.0.1';
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.replace('::ffff:', '');
  }
  if (cleanIp === '::1') {
    cleanIp = '127.0.0.1';
  }

  // Mặc định địa điểm
  let location = 'Hồ Chí Minh, Việt Nam';
  if (cleanIp && !cleanIp.includes('127.0.0.1') && cleanIp !== '::1') {
    location = geoCache.get(cleanIp) || 'Việt Nam';
  }

  return {
    deviceName,
    deviceType,
    browser,
    os,
    ip: cleanIp,
    location,
    userAgent: ua,
  };
};

module.exports = {
  parseDeviceInfo,
  lookupGeoLocation,
};

