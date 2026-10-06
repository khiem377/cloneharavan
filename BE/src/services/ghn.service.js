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


// Bảng ánh xạ 63 tỉnh thành sang 34 tỉnh thành mới theo chuẩn GHN v3 (developer.ghn.vn/vi/docs/master-data/get-province-new)
const LEGACY_TO_V3_PROVINCE_MAP = {
  'bạc liêu': { id: 1000022, name: 'Cà Mau' },
  'cà mau': { id: 1000022, name: 'Cà Mau' },
  'bà rịa - vũng tàu': { id: 1000001, name: 'Hồ Chí Minh' },
  'bà rịa vũng tàu': { id: 1000001, name: 'Hồ Chí Minh' },
  'bình dương': { id: 1000001, name: 'Hồ Chí Minh' },
  'hồ chí minh': { id: 1000001, name: 'Hồ Chí Minh' },
  'thừa thiên huế': { id: 1000002, name: 'Huế' },
  'thừa thiên - huế': { id: 1000002, name: 'Huế' },
  'huế': { id: 1000002, name: 'Huế' },
  'quảng nam': { id: 1000003, name: 'Đà Nẵng' },
  'đà nẵng': { id: 1000003, name: 'Đà Nẵng' },
  'hải dương': { id: 1000004, name: 'Hải Phòng' },
  'hải phòng': { id: 1000004, name: 'Hải Phòng' },
  'hậu giang': { id: 1000005, name: 'Cần Thơ' },
  'sóc trăng': { id: 1000005, name: 'Cần Thơ' },
  'cần thơ': { id: 1000005, name: 'Cần Thơ' },
  'bình phước': { id: 1000006, name: 'Đồng Nai' },
  'bình thuận': { id: 1000006, name: 'Đồng Nai' },
  'đồng nai': { id: 1000006, name: 'Đồng Nai' },
  'ninh thuận': { id: 1000008, name: 'Khánh Hòa' },
  'khánh hòa': { id: 1000008, name: 'Khánh Hòa' },
  'đắk nông': { id: 1000010, name: 'Đắk Lắk' },
  'đắk lắk': { id: 1000010, name: 'Đắk Lắk' },
  'kon tum': { id: 1000007, name: 'Gia Lai' },
  'gia lai': { id: 1000007, name: 'Gia Lai' },
  'bến tre': { id: 1000011, name: 'Vĩnh Long' },
  'trà vinh': { id: 1000011, name: 'Vĩnh Long' },
  'vĩnh long': { id: 1000011, name: 'Vĩnh Long' },
  'tiền giang': { id: 1000012, name: 'Đồng Tháp' },
  'long an': { id: 1000012, name: 'Đồng Tháp' },
  'đồng tháp': { id: 1000012, name: 'Đồng Tháp' },
  'kiên giang': { id: 1000013, name: 'An Giang' },
  'an giang': { id: 1000013, name: 'An Giang' },
  'bắc kạn': { id: 1000020, name: 'Thái Nguyên' },
  'thái nguyên': { id: 1000020, name: 'Thái Nguyên' },
  'bắc giang': { id: 1000021, name: 'Bắc Ninh' },
  'bắc ninh': { id: 1000021, name: 'Bắc Ninh' },
  'hà nam': { id: 1000016, name: 'Ninh Bình' },
  'nam định': { id: 1000016, name: 'Ninh Bình' },
  'ninh bình': { id: 1000016, name: 'Ninh Bình' },
  'thái bình': { id: 1000023, name: 'Hưng Yên' },
  'hưng yên': { id: 1000023, name: 'Hưng Yên' },
  'hòa bình': { id: 1000015, name: 'Phú Thọ' },
  'vĩnh phúc': { id: 1000015, name: 'Phú Thọ' },
  'phú thọ': { id: 1000015, name: 'Phú Thọ' },
  'yên bái': { id: 1000024, name: 'Lào Cai' },
  'lào cai': { id: 1000024, name: 'Lào Cai' },
  'hà giang': { id: 1000014, name: 'Tuyên Quang' },
  'tuyên quang': { id: 1000014, name: 'Tuyên Quang' },
  'quảng bình': { id: 1000017, name: 'Quảng Trị' },
  'quảng trị': { id: 1000017, name: 'Quảng Trị' },
  'bình định': { id: 1000019, name: 'Quảng Ngãi' },
  'phú yên': { id: 1000019, name: 'Quảng Ngãi' },
  'quảng ngãi': { id: 1000019, name: 'Quảng Ngãi' },
  'lạng sơn': { id: 1000033, name: 'Lạng Sơn' },
  'cao bằng': { id: 1000032, name: 'Cao Bằng' },
  'nghệ an': { id: 1000031, name: 'Nghệ An' },
  'thanh hóa': { id: 1000030, name: 'Thanh Hóa' },
  'hà tĩnh': { id: 1000029, name: 'Hà Tĩnh' },
  'quảng ninh': { id: 1000028, name: 'Quảng Ninh' },
  'sơn la': { id: 1000027, name: 'Sơn La' },
  'điện biên': { id: 1000026, name: 'Điện Biên' },
  'lai châu': { id: 1000025, name: 'Lai Châu' },
  'tây ninh': { id: 1000018, name: 'Tây Ninh' },
  'lâm đồng': { id: 1000009, name: 'Lâm Đồng' },
  'hà nội': { id: 1000000, name: 'Hà Nội' },
};

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

  // 1. Địa chỉ 3 cấp trước sáp nhập (chuẩn GHN legacy)
  const preMergerParts = [cleanDetail, ward, district, province].filter(Boolean);
  const preMergerFullAddress = preMergerParts.join(', ');

  // 2. Tra cứu tỉnh thành & phường xã mới theo API GHN v3
  const pLower = province.toLowerCase().trim().replace(/^(tỉnh|tp|thành phố|t\.)\s+/i, '').trim();
  const matchedV3 = LEGACY_TO_V3_PROVINCE_MAP[pLower] || { id: null, name: province };

  let newWardName = ward;
  let isWardFound = false;

  if (matchedV3.id) {
    try {
      const v3Wards = await getNewWards(matchedV3.id);
      if (Array.isArray(v3Wards) && v3Wards.length > 0) {
        const cleanW = ward.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/i, '').trim();
        const found = v3Wards.find(
          (w) =>
            w.name?.toLowerCase().includes(cleanW) ||
            w.extension_names?.some((e) => e.toLowerCase().includes(cleanW))
        );
        if (found) {
          newWardName = found.name;
          isWardFound = true;
        }
      }
    } catch (err) {
      console.warn('[GHN Service] Tra cứu v3 ward lỗi:', err.message);
    }
  }

  const isProvChanged = matchedV3.name.toLowerCase() !== province.toLowerCase().replace(/^(tỉnh|tp|thành phố|t\.)\s+/i, '').trim();
  const isMerged = isProvChanged || isWardFound;

  const provDisplay =
    matchedV3.name.startsWith('TP') || matchedV3.name.startsWith('Thành phố') || matchedV3.name.startsWith('Tỉnh')
      ? matchedV3.name
      : matchedV3.name === 'Hà Nội' || matchedV3.name === 'Hồ Chí Minh' || matchedV3.name === 'Đà Nẵng' || matchedV3.name === 'Hải Phòng' || matchedV3.name === 'Cần Thơ' || matchedV3.name === 'Huế'
      ? `TP. ${matchedV3.name}`
      : `Tỉnh ${matchedV3.name}`;

  const postMergerFullAddress = [cleanDetail, newWardName, provDisplay].filter(Boolean).join(', ');

  return {
    isMerged,
    isNameChanged: isMerged,
    oldWard: ward,
    newWard: newWardName,
    district,
    oldProvince: province,
    province: provDisplay,
    newProvince: matchedV3.name,
    wardCode,
    districtId,
    provinceId,
    source: 'Giao Hàng Nhanh API (v3)',
    changeDescription: isMerged
      ? `Chuẩn hóa theo danh mục bưu chính GHN v3: "${newWardName}, ${provDisplay}"`
      : 'Chuẩn hóa định danh bưu chính GHN',
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
