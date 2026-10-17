const axios = require('axios');
const Warehouse = require('../models/warehouse.model');

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

/**
 * Tính phí vận chuyển thực tế từ GHN API
 * - Lấy fromDistrictId từ Warehouse mặc định (nếu không truyền)
 * - Gọi trực tiếp GHN /v2/shipping-order/fee
 * - Nếu GHN trả về phí thực tế: isEstimated = false, source = 'GHN'
 * - Nếu GHN lỗi / timeout: isEstimated = true, ghi rõ lỗi, không giả mạo phí GHN thật
 */
const calculateShippingFee = async ({
  toDistrictId,
  toWardCode,
  fromDistrictId = null,
  weight = 500,
  length = 20,
  width = 15,
  height = 10,
  insuranceValue = 0,
  allowEstimatedFallback = true,
} = {}) => {
  const toDid = Number(toDistrictId);
  const toWcode = String(toWardCode || '').trim();

  if (!toDid || !toWcode) {
    return {
      success: false,
      fee: null,
      isEstimated: false,
      source: 'VALIDATION_ERROR',
      message: 'Thiếu thông tin địa chỉ nhận hàng: toDistrictId và toWardCode là bắt buộc để tính phí vận chuyển',
    };
  }

  // 1. Xác định quận/huyện kho gửi hàng
  let finalFromDistrictId = fromDistrictId ? Number(fromDistrictId) : null;
  let warehouseName = '';

  if (!finalFromDistrictId) {
    try {
      const defaultWarehouse = await Warehouse.findOne({ isDefault: true, status: 'active' }).lean();
      if (defaultWarehouse && defaultWarehouse.address?.districtId) {
        finalFromDistrictId = defaultWarehouse.address.districtId;
        warehouseName = defaultWarehouse.name;
      } else {
        const anyActiveWarehouse = await Warehouse.findOne({ status: 'active' }).lean();
        if (anyActiveWarehouse && anyActiveWarehouse.address?.districtId) {
          finalFromDistrictId = anyActiveWarehouse.address.districtId;
          warehouseName = anyActiveWarehouse.name;
        }
      }
    } catch (whErr) {
      console.warn('[GHN Service] Không thể truy vấn Warehouse mặc định:', whErr.message);
    }
  }

  // Fallback cấu hình kho từ .env nếu DB chưa có
  if (!finalFromDistrictId) {
    finalFromDistrictId = Number(process.env.GHN_FROM_DISTRICT_ID) || 1458; // 1458: Bình Tân HCM
  }

  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;

  if (!token) {
    if (allowEstimatedFallback) {
      return {
        success: true,
        fee: 30000,
        isEstimated: true,
        requiresConfirmation: true,
        source: 'ESTIMATED_FALLBACK',
        message: 'Chưa cấu hình GHN_API_TOKEN. Phí vận chuyển 30,000đ là phí ước tính tạm thời.',
        fromDistrictId: finalFromDistrictId,
        toDistrictId: toDid,
        toWardCode: toWcode,
      };
    }
    return {
      success: false,
      fee: null,
      isEstimated: true,
      source: 'CONFIG_MISSING',
      message: 'Chưa cấu hình GHN API Token',
    };
  }

  // 2. Chuẩn bị payload gọi GHN
  const sanitizedWeight = Math.max(100, Math.min(Number(weight) || 500, 50000));
  const sanitizedInsurance = Math.max(0, Math.min(Number(insuranceValue) || 0, 5000000));

  const payload = {
    from_district_id: finalFromDistrictId,
    service_type_id: 2, // Gói chuẩn E-Commerce
    to_district_id: toDid,
    to_ward_code: toWcode,
    height: Math.max(1, Number(height) || 10),
    length: Math.max(1, Number(length) || 20),
    width: Math.max(1, Number(width) || 15),
    weight: sanitizedWeight,
    insurance_value: sanitizedInsurance,
  };

  try {
    const res = await axios.post(`${getBaseUrl()}/v2/shipping-order/fee`, payload, {
      headers: getGhnHeaders(),
      timeout: 8000,
    });

    if (res.data && res.data.code === 200 && res.data.data) {
      const ghnData = res.data.data;
      return {
        success: true,
        fee: ghnData.service_fee !== undefined ? ghnData.service_fee : (ghnData.total || 0),
        serviceFee: ghnData.service_fee || 0,
        insuranceFee: 0,
        isEstimated: false,
        source: 'GHN',
        fromDistrictId: finalFromDistrictId,
        warehouseName,
        toDistrictId: toDid,
        toWardCode: toWcode,
        message: 'Tính cước vận chuyển GHN thành công',
      };
    }

    throw new Error(res.data?.message || 'GHN không trả về phí vận chuyển hợp lệ');
  } catch (err) {
    const ghnErrMsg = err.response?.data?.message || err.message;
    console.warn(`[GHN Service] Lỗi tính cước GHN từ district ${finalFromDistrictId} tới ${toDid}:`, ghnErrMsg);

    if (allowEstimatedFallback) {
      // Ước tính cước tạm thời nhưng BẮT BUỘC gắn cờ isEstimated: true và thông báo rõ ràng
      const isSameDistrict = finalFromDistrictId === toDid;
      const estimatedFee = isSameDistrict ? 22000 : 35000;

      return {
        success: true,
        fee: estimatedFee,
        isEstimated: true,
        requiresConfirmation: true,
        source: 'ESTIMATED_FALLBACK',
        fromDistrictId: finalFromDistrictId,
        toDistrictId: toDid,
        toWardCode: toWcode,
        ghnError: ghnErrMsg,
        message: `Không thể kết nối cước GHN thời gian thực (${ghnErrMsg}). Phí hiển thị là cước ước tính tạm thời (${estimatedFee.toLocaleString('vi-VN')} đ), vui lòng thử lại trước khi hoàn tất đơn.`,
      };
    }

    return {
      success: false,
      fee: null,
      isEstimated: true,
      source: 'GHN_ERROR',
      fromDistrictId: finalFromDistrictId,
      toDistrictId: toDid,
      toWardCode: toWcode,
      error: ghnErrMsg,
      message: `Lỗi tính cước từ đơn vị vận chuyển GHN: ${ghnErrMsg}`,
    };
  }
};

/**
 * Tự động phân giải ProvinceID, DistrictID, WardCode từ chuỗi văn bản Tỉnh, Quận, Phường
 */
const resolveAddressGhnCodes = async ({ province = '', district = '', ward = '' }) => {
  if (!province && !district && !ward) return null;

  try {
    const provs = await getProvinces();
    if (!Array.isArray(provs) || provs.length === 0) return null;

    const normProv = normalizeVnString(cleanAdminPrefix(province));
    let matchedP = provs.find((p) => {
      const pNorm = normalizeVnString(cleanAdminPrefix(p.ProvinceName));
      if (pNorm === normProv) return true;
      if (Array.isArray(p.NameExtension)) {
        return p.NameExtension.some((ext) => normalizeVnString(cleanAdminPrefix(ext)) === normProv);
      }
      return false;
    });

    if (!matchedP && normProv) {
      matchedP = provs.find((p) => {
        const pNorm = normalizeVnString(p.ProvinceName);
        return pNorm.includes(normProv) || normProv.includes(pNorm);
      });
    }

    if (!matchedP) return null;

    const pid = matchedP.ProvinceID;
    const dists = await getDistricts(pid);
    if (!Array.isArray(dists) || dists.length === 0) {
      return { provinceId: pid, provinceName: matchedP.ProvinceName, districtId: null, wardCode: null };
    }

    const normDist = normalizeVnString(cleanAdminPrefix(district));
    let matchedD = dists.find((d) => {
      const dNorm = normalizeVnString(cleanAdminPrefix(d.DistrictName));
      if (dNorm === normDist) return true;
      if (Array.isArray(d.NameExtension)) {
        return d.NameExtension.some((ext) => normalizeVnString(cleanAdminPrefix(ext)) === normDist);
      }
      return false;
    });

    if (!matchedD && normDist) {
      matchedD = dists.find((d) => {
        const dNorm = normalizeVnString(d.DistrictName);
        return dNorm.includes(normDist) || normDist.includes(dNorm);
      });
    }

    if (!matchedD) {
      return { provinceId: pid, provinceName: matchedP.ProvinceName, districtId: null, wardCode: null };
    }

    const did = matchedD.DistrictID;
    const wards = await getWards(did);
    if (!Array.isArray(wards) || wards.length === 0) {
      return {
        provinceId: pid,
        provinceName: matchedP.ProvinceName,
        districtId: did,
        districtName: matchedD.DistrictName,
        wardCode: null,
      };
    }

    const normWard = normalizeVnString(cleanAdminPrefix(ward));
    let matchedW = wards.find((w) => {
      const wNorm = normalizeVnString(cleanAdminPrefix(w.WardName));
      if (wNorm === normWard) return true;
      if (Array.isArray(w.NameExtension)) {
        return w.NameExtension.some((ext) => normalizeVnString(cleanAdminPrefix(ext)) === normWard);
      }
      return false;
    });

    if (!matchedW && normWard) {
      matchedW = wards.find((w) => {
        const wNorm = normalizeVnString(w.WardName);
        return wNorm.includes(normWard) || normWard.includes(wNorm);
      });
    }

    return {
      provinceId: pid,
      provinceName: matchedP.ProvinceName,
      districtId: did,
      districtName: matchedD.DistrictName,
      wardCode: matchedW ? String(matchedW.WardCode) : null,
      wardName: matchedW ? matchedW.WardName : null,
    };
  } catch (err) {
    console.warn('[GHN Service] resolveAddressGhnCodes error:', err.message);
    return null;
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getNewProvinces,
  getNewWards,
  lookupGhnPostMergerAddress,
  calculateShippingFee,
  resolveAddressGhnCodes,
};
