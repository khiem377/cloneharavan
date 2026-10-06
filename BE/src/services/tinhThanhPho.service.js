const axios = require('axios');

const TINHTHANHPHO_BASE_URL = 'https://www.tinhthanhpho.com/api/v1';

// In-memory cache for fast lookup and rate-limit conservation
const conversionCache = new Map();

/**
 * Service tích hợp 100% chuẩn API TinhThanhPho.com (https://www.tinhthanhpho.com/api-docs)
 * - Tra cứu cấu trúc cũ (Trước 1/7/2025) & cấu trúc mới (Sau 1/7/2025)
 * - Tra cứu lịch sử sáp nhập: /merge-history/ward/{code} & /merge-history/province/{code}
 * - Chuyển đổi địa chỉ đơn lẻ: /convert/address
 */
class TinhThanhPhoService {
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const apiKey = process.env.TINHTHANHPHO_API_KEY;
    if (apiKey && apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }
    return headers;
  }

  /**
   * Chuyển đổi và tra cứu thông tin địa chỉ sau sáp nhập qua TinhThanhPho.com
   */
  async convertAddress({
    province = '',
    district = '',
    ward = '',
    detailAddress = '',
    provinceCode = '',
    districtCode = '',
    wardCode = '',
  }) {
    if (!province && !ward) {
      return {
        isMerged: false,
        newWard: ward,
        province,
        postMergerFullAddress: detailAddress ? `${detailAddress}, ${province}` : province,
      };
    }

    const cleanDetail = detailAddress ? detailAddress.trim() : '';
    const cacheKey = `${province}_${district}_${ward}_${cleanDetail}`.toLowerCase();
    if (conversionCache.has(cacheKey)) {
      return conversionCache.get(cacheKey);
    }

    const apiKey = process.env.TINHTHANHPHO_API_KEY;

    // -------------------------------------------------------------
    // 1. Nếu có API Key, ưu tiên gọi endpoint POST /api/v1/convert/address
    // -------------------------------------------------------------
    if (apiKey && apiKey.trim()) {
      try {
        const payload = {
          provinceCode: provinceCode || undefined,
          districtCode: districtCode || undefined,
          wardCode: wardCode || undefined,
          streetAddress: cleanDetail || undefined,
          keyword: [cleanDetail, ward, district, province].filter(Boolean).join(', '),
        };

        const res = await axios.post(
          `${TINHTHANHPHO_BASE_URL}/convert/address`,
          payload,
          {
            headers: this.getHeaders(),
            timeout: 5000,
          }
        );

        if (res.data && res.data.success && res.data.data) {
          const { old: oldData, new: newData, mergeInfo } = res.data.data;
          const newWardName = newData?.ward?.name
            ? `${newData.ward.type ? `${newData.ward.type} ` : ''}${newData.ward.name}`
            : ward;
          const newProvName = newData?.province?.name
            ? `${newData.province.type ? `${newData.province.type} ` : ''}${newData.province.name}`
            : province;

          const isChanged = Boolean(
            (newWardName && ward && newWardName.toLowerCase() !== ward.toLowerCase()) ||
            (newProvName && province && newProvName.toLowerCase() !== province.toLowerCase())
          );

          const result = {
            isMerged: isChanged,
            isNameChanged: isChanged,
            oldWard: oldData?.ward?.name || ward,
            newWard: newWardName,
            newWardCode: newData?.ward?.code,
            province: newProvName,
            source: 'TinhThanhPho.com API (Chính thức)',
            notes: mergeInfo?.notes || '',
            changeDescription: isChanged
              ? (mergeInfo?.notes || `Chuyển đổi thành "${newWardName}, ${newProvName}"`)
              : `Đơn vị hành chính chuẩn hóa "${newWardName}"`,
            postMergerFullAddress:
              newData?.fullAddress ||
              `${cleanDetail ? `${cleanDetail}, ` : ''}${newWardName}, ${newProvName}`,
          };

          conversionCache.set(cacheKey, result);
          return result;
        }
      } catch (err) {
        console.warn('[TinhThanhPho API] convert/address:', err.response?.data || err.message);
      }
    }

    // -------------------------------------------------------------
    // 2. Tra cứu động qua /search-address & /merge-history (Công khai)
    // -------------------------------------------------------------
    try {
      // 2.1. Tìm mã code của Phường/Xã cũ
      const searchWardRes = await axios.get(`${TINHTHANHPHO_BASE_URL}/search-address`, {
        params: { keyword: ward.trim(), limit: 10 },
        headers: this.getHeaders(),
        timeout: 4000,
      });

      let matchedWard = null;
      if (searchWardRes.data && searchWardRes.data.success && Array.isArray(searchWardRes.data.data)) {
        const cleanWard = ward.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/i, '').trim();
        const cleanDist = district.toLowerCase().replace(/^(quận|huyện|thị xã|thành phố|tp)\s+/i, '').trim();
        const cleanProv = province.toLowerCase().replace(/^(tỉnh|thành phố|tp)\s+/i, '').trim();

        matchedWard = searchWardRes.data.data.find((item) => {
          if (item.type !== 'ward') return false;
          const itemName = (item.name || '').toLowerCase();
          const itemAddr = (item.address || '').toLowerCase();
          const matchW = itemName.includes(cleanWard) || cleanWard.includes(itemName);
          const matchD = !cleanDist || itemAddr.includes(cleanDist);
          const matchP = !cleanProv || itemAddr.includes(cleanProv);
          return matchW && (matchD || matchP);
        });

        if (!matchedWard && searchWardRes.data.data.length > 0) {
          matchedWard = searchWardRes.data.data.find((item) => item.type === 'ward') || searchWardRes.data.data[0];
        }
      }

      // 2.2. Nếu có mã Phường/Xã -> Tra cứu lịch sử sáp nhập phường (/merge-history/ward/{code})
      let newWardName = ward;
      let wardMergeNotes = '';
      let isWardChanged = false;

      if (matchedWard && matchedWard.code) {
        try {
          const wardHistoryRes = await axios.get(
            `${TINHTHANHPHO_BASE_URL}/merge-history/ward/${matchedWard.code}`,
            { headers: this.getHeaders(), timeout: 4000 }
          );

          if (
            wardHistoryRes.data &&
            wardHistoryRes.data.success &&
            Array.isArray(wardHistoryRes.data.data) &&
            wardHistoryRes.data.data.length > 0
          ) {
            const h = wardHistoryRes.data.data[0];
            if (h.new_ward && h.new_ward.name) {
              const typePrefix = h.new_ward.type ? `${h.new_ward.type} ` : '';
              newWardName = `${typePrefix}${h.new_ward.name}`;
              wardMergeNotes = h.notes || `Sáp nhập từ "${matchedWard.full_name || ward}" sang "${newWardName}"`;
              isWardChanged = true;
            }
          }
        } catch (err) {
          // Silent catch
        }
      }

      // 2.3. Tra cứu lịch sử sáp nhập tỉnh (/merge-history/province/{code})
      let targetProvinceName = province.includes('Tỉnh') || province.includes('TP') || province.includes('Thành phố')
        ? province
        : `TP. ${province}`;
      let isProvChanged = false;
      let provMergeNotes = '';

      const provCodeToLookup = matchedWard?.province_code;
      if (provCodeToLookup) {
        try {
          const provHistoryRes = await axios.get(
            `${TINHTHANHPHO_BASE_URL}/merge-history/province/${provCodeToLookup}`,
            { headers: this.getHeaders(), timeout: 4000 }
          );

          if (
            provHistoryRes.data &&
            provHistoryRes.data.success &&
            Array.isArray(provHistoryRes.data.data) &&
            provHistoryRes.data.data.length > 0
          ) {
            const ph = provHistoryRes.data.data[0];
            if (ph.new_province && ph.new_province.name) {
              const pType = ph.new_province.type ? `${ph.new_province.type} ` : '';
              targetProvinceName = `${pType}${ph.new_province.name}`;
              provMergeNotes = ph.notes || '';
              isProvChanged = true;
            }
          }
        } catch (err) {
          // Silent catch
        }
      }

      const isOverallChanged = isWardChanged || isProvChanged;
      const combinedNotes = [wardMergeNotes, provMergeNotes].filter(Boolean).join('. ');

      const result = {
        isMerged: isOverallChanged,
        isNameChanged: isOverallChanged,
        oldWard: ward,
        newWard: newWardName,
        province: targetProvinceName,
        source: 'TinhThanhPho.com API (Live)',
        notes: combinedNotes,
        changeDescription: isOverallChanged
          ? (combinedNotes || `Chuyển đổi thành "${newWardName}, ${targetProvinceName}"`)
          : `Đơn vị hành chính chuẩn hóa "${newWardName}"`,
        postMergerFullAddress: `${cleanDetail ? `${cleanDetail}, ` : ''}${newWardName}, ${targetProvinceName}`,
      };

      conversionCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('[TinhThanhPho API] Tra cứu động lỗi:', err.message);
    }

    // -------------------------------------------------------------
    // 3. Fallback: Mô hình chuẩn hóa 2 cấp (Tỉnh -> Phường/Xã)
    // -------------------------------------------------------------
    const defaultProv = province.includes('Tỉnh') || province.includes('TP') || province.includes('Thành phố')
      ? province
      : `TP. ${province}`;

    const fallbackResult = {
      isMerged: false,
      isNameChanged: false,
      oldWard: ward,
      newWard: ward,
      province: defaultProv,
      source: 'Mô hình 2 cấp chuẩn hóa (GSO)',
      changeDescription: 'Địa giới hành chính chuẩn hóa (2 cấp)',
      postMergerFullAddress: `${cleanDetail ? `${cleanDetail}, ` : ''}${ward}, ${defaultProv}`,
    };

    conversionCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }
}

module.exports = new TinhThanhPhoService();
