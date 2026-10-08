const axios = require('axios');

const cache = {
  provinces: null,
  districtsByProvince: new Map(),
  wardsByDistrict: new Map(),
  newProvinces: null,
  newWardsByProvince: new Map(),
};

const getGhnHeaders = () => {
  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Token'] = token;
    headers['token'] = token;
  }
  if (shopId) {
    headers['ShopId'] = Number(shopId);
  }
  return headers;
};

const getBaseUrl = () => {
  return process.env.GHN_API_URL || 'https://online-gateway.ghn.vn/shiip/public-api';
};

const getProvinces = async () => {
  if (cache.provinces && cache.provinces.length > 0) {
    return cache.provinces;
  }

  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
  if (!token) {
    console.warn('[GHN Service] Chưa cấu hình GHN_API_TOKEN trong .env');
    return [];
  }

  try {
    const res = await axios.get(`${getBaseUrl()}/master-data/province`, {
      headers: getGhnHeaders(),
      timeout: 10000,
    });

    if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
      const provinces = res.data.data.map((p) => ({
        ProvinceID: p.ProvinceID,
        ProvinceName: p.ProvinceName,
        Code: p.Code,
        ExtensionName: p.ExtensionName || [],
      }));
      provinces.sort((a, b) => a.ProvinceName.localeCompare(b.ProvinceName, 'vi'));
      cache.provinces = provinces;
      return provinces;
    }
    return [];
  } catch (err) {
    console.error('[GHN Service] Lỗi gọi API Tỉnh/Thành từ GHN:', err.response?.data || err.message);
    return [];
  }
};


const getDistricts = async (provinceId) => {
  const pid = Number(provinceId);
  if (!pid) return [];

  if (cache.districtsByProvince.has(pid)) {
    return cache.districtsByProvince.get(pid);
  }

  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
  if (!token) return [];

  try {
    const res = await axios.post(
      `${getBaseUrl()}/master-data/district`,
      { province_id: pid },
      {
        headers: getGhnHeaders(),
        timeout: 10000,
      }
    );

    if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
      const districts = res.data.data.map((d) => ({
        DistrictID: d.DistrictID,
        ProvinceID: d.ProvinceID,
        DistrictName: d.DistrictName,
        Code: d.Code,
        ExtensionName: d.ExtensionName || [],
      }));
      districts.sort((a, b) => a.DistrictName.localeCompare(b.DistrictName, 'vi'));
      cache.districtsByProvince.set(pid, districts);
      return districts;
    }
    return [];
  } catch (err) {
    console.error(`[GHN Service] Lỗi gọi API Quận/Huyện cho tỉnh ${pid} từ GHN:`, err.response?.data || err.message);
    return [];
  }
};


const getWards = async (districtId) => {
  const did = Number(districtId);
  if (!did) return [];

  if (cache.wardsByDistrict.has(did)) {
    return cache.wardsByDistrict.get(did);
  }

  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
  if (!token) return [];

  try {
    const res = await axios.post(
      `${getBaseUrl()}/master-data/ward?district_id=${did}`,
      { district_id: did },
      {
        headers: getGhnHeaders(),
        timeout: 10000,
      }
    );

    if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
      const wards = res.data.data.map((w) => ({
        WardCode: String(w.WardCode),
        DistrictID: w.DistrictID,
        WardName: w.WardName,
        NameExtension: w.NameExtension || [],
      }));
      wards.sort((a, b) => a.WardName.localeCompare(b.WardName, 'vi'));
      cache.wardsByDistrict.set(did, wards);
      return wards;
    }
    return [];
  } catch (err) {
    console.error(`[GHN Service] Lỗi gọi API Phường/Xã cho quận ${did} từ GHN:`, err.response?.data || err.message);
    return [];
  }
};


const getNewProvinces = async () => {
  if (cache.newProvinces && cache.newProvinces.length > 0) {
    return cache.newProvinces;
  }

  try {
    const res = await axios.get(
      `${getBaseUrl()}/v3/master-data/province/all?offset=0&limit=200`,
      {
        headers: getGhnHeaders(),
        timeout: 10000,
      }
    );

    if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
      cache.newProvinces = res.data.data;
      return res.data.data;
    }
  } catch (err) {
    console.warn('[GHN Service] v3/master-data/province/all:', err.response?.data || err.message);
  }

  return [];
};


const getNewWards = async (provinceId) => {
  const pid = Number(provinceId);
  if (!pid) return [];

  if (cache.newWardsByProvince.has(pid)) {
    return cache.newWardsByProvince.get(pid);
  }

  try {
    const res = await axios.get(
      `${getBaseUrl()}/v3/master-data/ward/all-by-province-id?province_id=${pid}&offset=0&limit=200`,
      {
        headers: getGhnHeaders(),
        timeout: 10000,
      }
    );

    if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
      cache.newWardsByProvince.set(pid, res.data.data);
      return res.data.data;
    }
  } catch (err) {
    console.warn(`[GHN Service] v3/master-data/ward for province ${pid}:`, err.response?.data || err.message);
  }

  return [];
};


/**
 * Chuẩn hóa chuỗi tiếng Việt để so khớp (bỏ dấu, lowercase, bỏ khoảng trắng thừa)
 */
const normalizeVnString = (str = '') => {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Loại bỏ tiền tố hành chính (Tỉnh, TP, Thành phố, Quận, Huyện, Thị xã, Phường, Xã, Thị trấn...)
 */
const cleanAdminPrefix = (name = '') => {
  return String(name || '')
    .replace(/^(tỉnh|tp\.|tp|thành phố|thị xã|tx\.|quận|q\.|huyện|h\.|phường|p\.|xã|x\.|thị trấn|tt\.)\s+/i, '')
    .trim();
};

/**
 * Cache kết quả tra cứu TraDiaChi để tối ưu tốc độ & tiết kiệm request
 */
const traDiaChiCache = new Map();

/**
 * Tra cứu địa chỉ bưu chính chuẩn Quốc Gia (GSO & NQ 202/2025/QH15 qua TraDiaChi) kết hợp GHN v3
 * - Tự động đối soát chuyển đổi Phường/Xã sáp nhập mới và cũ
 * - Chuẩn hóa địa chỉ 2 cấp & 3 cấp
 * - Fallback an toàn về GHN Master Data nếu mạng/timeout
 */
const lookupGhnPostMergerAddress = async ({
  province = '',
  district = '',
  ward = '',
  detailAddress = '',
  wardCode = '',
  districtId = '',
  provinceId = '',
}) => {
  if (!province && !ward) {
    return {
      isMerged: false,
      newWard: ward,
      district,
      province,
      source: 'Giao Hàng Nhanh (GHN v3)',
      preMergerFullAddress: detailAddress || '',
      postMergerFullAddress: detailAddress || '',
    };
  }

  const cleanDetail = detailAddress ? detailAddress.trim() : '';

  // 1. Địa chỉ 3 cấp truyền thống (chuẩn GHN legacy)
  const preMergerParts = [cleanDetail, ward, district, province].filter(Boolean);
  const preMergerFullAddress = preMergerParts.join(', ');

  // 2. Tra cứu qua API TraDiaChi (Tổng cục Thống kê & Nghị quyết 202/2025/QH15)
  const cacheKey = preMergerFullAddress.toLowerCase();
  let tdcResult = traDiaChiCache.get(cacheKey) || null;

  if (!tdcResult && preMergerFullAddress.length >= 3) {
    try {
      const tdcRes = await axios.post(
        'https://tradiachi.com/v1/address/normalize',
        { address: preMergerFullAddress },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 3500,
        }
      );

      if (tdcRes.data && tdcRes.data.data?.address) {
        tdcResult = tdcRes.data.data.address;
        traDiaChiCache.set(cacheKey, tdcResult);
      }
    } catch (tdcErr) {
      console.warn('[TraDiaChi API] Normalize fallback to GHN v3:', tdcErr.response?.data?.message || tdcErr.message);
    }
  }

  // Nếu TraDiaChi trả về kết quả thành công
  if (tdcResult && tdcResult.ward?.name) {
    const tdcNewWard = tdcResult.ward.name;
    const tdcNewProvince = tdcResult.province?.name || province;
    const tdcOldWard = tdcResult.historical?.oldWard?.name || ward;
    const tdcOldDistrict = tdcResult.historical?.oldDistrict?.name || district;
    const tdcOldProvince = tdcResult.historical?.oldProvince?.name || province;

    // Tìm v3ProvinceId tương ứng từ GHN v3 Master Data
    let matchedV3Province = null;
    try {
      const v3Provinces = await getNewProvinces();
      if (Array.isArray(v3Provinces) && v3Provinces.length > 0) {
        const normTdcProv = normalizeVnString(cleanAdminPrefix(tdcNewProvince));
        matchedV3Province = v3Provinces.find((p) => {
          const pNorm = normalizeVnString(cleanAdminPrefix(p.name));
          if (pNorm === normTdcProv) return true;
          if (Array.isArray(p.extension_names)) {
            return p.extension_names.some((ext) => normalizeVnString(cleanAdminPrefix(ext)) === normTdcProv);
          }
          return false;
        });
      }
    } catch (_) {}

    const normTarget = normalizeVnString(tdcNewProvince);
    const isDirectCity = ['ha noi', 'ho chi minh', 'da nang', 'hai phong', 'can tho', 'hue'].includes(normTarget);
    let provDisplay = tdcNewProvince;
    if (!/^(tỉnh|tp\.|tp|thành phố)\s+/i.test(provDisplay)) {
      provDisplay = isDirectCity ? `TP. ${tdcNewProvince}` : `Tỉnh ${tdcNewProvince}`;
    }

    const postMergerParts = [cleanDetail, tdcNewWard, provDisplay].filter(Boolean);
    const postMergerFullAddress = postMergerParts.join(', ');

    const isNameChanged =
      normalizeVnString(cleanAdminPrefix(tdcNewWard)) !== normalizeVnString(cleanAdminPrefix(ward));

    return {
      isMerged: true,
      isNameChanged,
      oldWard: tdcOldWard,
      newWard: tdcNewWard,
      district: tdcOldDistrict || district,
      oldProvince: tdcOldProvince || province,
      province: provDisplay,
      newProvince: tdcNewProvince,
      v3ProvinceId: matchedV3Province?._id || null,
      wardCode,
      districtId,
      provinceId,
      confidence: tdcResult.confidence?.level || 'exact',
      source: 'Tổng cục Thống kê (GSO) & Nghị quyết Quốc hội (TraDiaChi API)',
      changeDescription: isNameChanged
        ? `Sắp xếp đơn vị hành chính 2025: ${ward}${district ? ` (${district})` : ''} ➔ ${tdcNewWard}, ${provDisplay}`
        : `Chuẩn hóa mô hình bưu chính 2 cấp: "${tdcNewWard}, ${provDisplay}"`,
      preMergerFullAddress,
      postMergerFullAddress,
    };
  }

  // 3. Fallback: Tra cứu đối soát từ API GHN v3
  let matchedV3Province = null;
  const cleanProv = cleanAdminPrefix(province);
  const normProv = normalizeVnString(cleanProv);

  try {
    const v3Provinces = await getNewProvinces();
    if (Array.isArray(v3Provinces) && v3Provinces.length > 0) {
      matchedV3Province = v3Provinces.find((p) => {
        const pClean = cleanAdminPrefix(p.name);
        const pNorm = normalizeVnString(pClean);
        if (pNorm === normProv) return true;
        if (Array.isArray(p.extension_names)) {
          return p.extension_names.some((ext) => normalizeVnString(cleanAdminPrefix(ext)) === normProv);
        }
        return false;
      });
    }
  } catch (provErr) {
    console.warn('[GHN Service] Tra cứu v3 province error:', provErr.message);
  }

  const targetProvinceName = matchedV3Province?.name || cleanProv || province;
  const targetProvinceId = matchedV3Province?._id || null;

  let newWardName = ward;
  let isWardFound = false;

  if (targetProvinceId) {
    try {
      const v3Wards = await getNewWards(targetProvinceId);
      if (Array.isArray(v3Wards) && v3Wards.length > 0) {
        const cleanW = cleanAdminPrefix(ward);
        const normW = normalizeVnString(cleanW);

        let foundWard = v3Wards.find((w) => {
          const wClean = cleanAdminPrefix(w.name);
          const wNorm = normalizeVnString(wClean);
          if (wNorm === normW) return true;
          if (Array.isArray(w.extension_names)) {
            return w.extension_names.some((ext) => normalizeVnString(cleanAdminPrefix(ext)) === normW);
          }
          return false;
        });

        if (!foundWard && normW.length >= 2) {
          foundWard = v3Wards.find((w) => {
            const wNorm = normalizeVnString(w.name);
            return wNorm.includes(normW);
          });
        }

        if (foundWard) {
          newWardName = foundWard.name;
          isWardFound = true;
        }
      }
    } catch (wardErr) {
      console.warn('[GHN Service] Tra cứu v3 ward error:', wardErr.message);
    }
  }

  const normTarget = normalizeVnString(targetProvinceName);
  const isDirectCity = ['ha noi', 'ho chi minh', 'da nang', 'hai phong', 'can tho', 'hue'].includes(normTarget);

  let provDisplay = targetProvinceName;
  if (!/^(tỉnh|tp\.|tp|thành phố)\s+/i.test(provDisplay)) {
    provDisplay = isDirectCity ? `TP. ${targetProvinceName}` : `Tỉnh ${targetProvinceName}`;
  }

  const postMergerParts = [cleanDetail, newWardName, provDisplay].filter(Boolean);
  const postMergerFullAddress = postMergerParts.join(', ');

  return {
    isMerged: true,
    isNameChanged: isWardFound,
    oldWard: ward,
    newWard: newWardName,
    district,
    oldProvince: province,
    province: provDisplay,
    newProvince: targetProvinceName,
    v3ProvinceId: targetProvinceId,
    wardCode,
    districtId,
    provinceId,
    source: 'Giao Hàng Nhanh API (v3)',
    changeDescription: isWardFound
      ? `Định danh bưu chính chuẩn GHN v3: "${newWardName}, ${provDisplay}"`
      : `Định danh mô hình 2 cấp GHN: "${newWardName}, ${provDisplay}"`,
    preMergerFullAddress,
    postMergerFullAddress,
  };
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getNewProvinces,
  getNewWards,
  lookupGhnPostMergerAddress,
};
