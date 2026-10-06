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


const lookupGhnPostMergerAddress = async ({
  province = '',
  district = '',
  ward = '',
  detailAddress = '',
}) => {
  if (!province && !ward) {
    return {
      isMerged: false,
      newWard: ward,
      province,
      postMergerFullAddress: detailAddress ? `${detailAddress}, ${province}` : province,
    };
  }

  const cleanDetail = detailAddress ? detailAddress.trim() : '';


  let targetProvinceName = province;
  const pLower = province.toLowerCase();

  if (
    pLower.includes('bà rịa') ||
    pLower.includes('vũng tàu') ||
    pLower.includes('ba ria') ||
    pLower.includes('vung tau') ||
    pLower.includes('bình dương') ||
    pLower.includes('binh duong') ||
    pLower.includes('đồng nai') ||
    pLower.includes('dong nai') ||
    pLower.includes('hồ chí minh') ||
    pLower.includes('ho chi minh')
  ) {
    targetProvinceName = 'Hồ Chí Minh';
  } else if (
    pLower.includes('bắc ninh') ||
    pLower.includes('hưng yên') ||
    pLower.includes('hà nam') ||
    pLower.includes('vĩnh phúc') ||
    pLower.includes('hà nội') ||
    pLower.includes('ha noi')
  ) {
    targetProvinceName = 'Hà Nội';
  } else if (pLower.includes('quảng nam') || pLower.includes('đà nẵng') || pLower.includes('da nang')) {
    targetProvinceName = 'Đà Nẵng';
  } else if (pLower.includes('hải dương') || pLower.includes('hải phòng') || pLower.includes('hai phong')) {
    targetProvinceName = 'Hải Phòng';
  }


  let newWardName = ward;
  let isWardChanged = false;
  let wardMergeNotes = '';

  const cleanWard = ward.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/i, '').trim();


  const GHN_V3_MERGE_MAPPING = {
    'binh tri dong b': 'Phường An Lạc',
    'binhtridongb': 'Phường An Lạc',
    'an lac a': 'Phường An Lạc',
    'anlaca': 'Phường An Lạc',
    'an lac': 'Phường An Lạc',
    'bau chinh': 'Xã Kim Long',
    'bauchinh': 'Xã Kim Long',
    'lang lon': 'Xã Kim Long',
    'langlon': 'Xã Kim Long',
    'kim long': 'Xã Kim Long',
    'ngai giao': 'Xã Ngãi Giao',
    'ngaigiao': 'Xã Ngãi Giao',
    'ben nghe': 'Phường Sài Gòn',
    'bennghe': 'Phường Sài Gòn',
    'da kao': 'Phường Sài Gòn',
    'dakao': 'Phường Sài Gòn',
    'nguyen thai binh': 'Phường Sài Gòn',
    'nguyenthaibinh': 'Phường Sài Gòn',
    'ben thanh': 'Phường Bến Thành',
    'benthanh': 'Phường Bến Thành',
    'pham ngu lao': 'Phường Bến Thành',
    'phamngulao': 'Phường Bến Thành',
    'cau ong lanh': 'Phường Bến Thành',
    'cauonglanh': 'Phường Bến Thành',
    'kham thien': 'Phường Khâm Thiên',
    'khamthien': 'Phường Khâm Thiên',
    'trung phung': 'Phường Khâm Thiên',
    'trungphung': 'Phường Khâm Thiên',
  };

  const normKey = cleanWard
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();

  if (GHN_V3_MERGE_MAPPING[normKey]) {
    newWardName = GHN_V3_MERGE_MAPPING[normKey];
    isWardChanged = true;
    wardMergeNotes = `Sáp nhập từ "${ward}" sang "${newWardName}" (Chuẩn GHN v3)`;
  }

  const isProvChanged = targetProvinceName.toLowerCase() !== province.toLowerCase();
  const isOverallChanged = isWardChanged || isProvChanged;

  const provDisplay =
    targetProvinceName.startsWith('Tỉnh') || targetProvinceName.startsWith('TP') || targetProvinceName.startsWith('Thành phố')
      ? targetProvinceName
      : `TP. ${targetProvinceName}`;

  return {
    isMerged: isOverallChanged,
    isNameChanged: isOverallChanged,
    oldWard: ward,
    newWard: newWardName,
    province: provDisplay,
    source: 'Giao Hàng Nhanh (GHN v3)',
    changeDescription: isOverallChanged
      ? (wardMergeNotes || `Chuyển đổi theo GHN: "${newWardName}, ${provDisplay}"`)
      : '',
    postMergerFullAddress: `${cleanDetail ? `${cleanDetail}, ` : ''}${newWardName}, ${provDisplay}`,
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
