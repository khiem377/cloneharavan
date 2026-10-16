const axios = require('axios');

// Cache tra cứu GeoIP theo IP để tránh gọi liên tục
const geoCache = new Map();

const formatCityName = (city = '', region = '') => {
  const raw = `${city} ${region}`.toLowerCase();
  if (raw.includes('ho chi minh') || raw.includes('hồ chí minh')) return 'Hồ Chí Minh';
  if (raw.includes('hanoi') || raw.includes('ha noi') || raw.includes('hà nội')) return 'Hà Nội';
  if (raw.includes('da nang') || raw.includes('đà nẵng')) return 'Đà Nẵng';
  if (raw.includes('can tho') || raw.includes('cần thơ')) return 'Cần Thơ';
  if (raw.includes('hai phong') || raw.includes('hải phòng')) return 'Hải Phòng';
  if (raw.includes('bien hoa') || raw.includes('biên hòa') || raw.includes('dong nai') || raw.includes('đồng nai')) return 'Đồng Nai';
  if (raw.includes('binh duong') || raw.includes('bình dương') || raw.includes('thu dau mot')) return 'Bình Dương';
  if (raw.includes('hue') || raw.includes('thừa thiên')) return 'Huế';
  if (raw.includes('nha trang') || raw.includes('khánh hòa')) return 'Nha Trang';
  if (raw.includes('vung tau') || raw.includes('vũng tàu')) return 'Vũng Tàu';
  return city || region || 'Việt Nam';
};

const formatCountry = (c = '') => {
  if (!c || c.toLowerCase() === 'vietnam' || c.toLowerCase() === 'viet nam') return 'Việt Nam';
  return c;
};

const lookupGeoLocation = async (ip) => {
  if (!ip) return 'Hồ Chí Minh, Việt Nam';

  const cleanIp = ip.replace('::ffff:', '').trim();

  const isPrivateOrLocal =
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'localhost' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('172.16.');

  if (isPrivateOrLocal) {
    if (geoCache.has('__local_public_ip__')) {
      return geoCache.get('__local_public_ip__');
    }
    try {
      // Khi phát triển ở localhost / mạng nội bộ, tra cứu IP ngoại mạng (WAN) thực tế của máy
      const res = await axios.get(
        'http://ip-api.com/json/?fields=status,country,city,regionName',
        { timeout: 2500 }
      );
      if (res.data && res.data.status === 'success') {
        const city = formatCityName(res.data.city, res.data.regionName);
        const country = formatCountry(res.data.country);
        const loc = `${city}, ${country}`;
        geoCache.set('__local_public_ip__', loc);
        geoCache.set(cleanIp, loc);
        return loc;
      }
    } catch (err) {}
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
      const city = formatCityName(res.data.city, res.data.regionName);
      const country = formatCountry(res.data.country);
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
  if (geoCache.has(cleanIp)) {
    location = geoCache.get(cleanIp);
  } else if (geoCache.has('__local_public_ip__')) {
    location = geoCache.get('__local_public_ip__');
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

