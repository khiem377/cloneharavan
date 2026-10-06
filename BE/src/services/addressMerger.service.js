/**
 * BỘ DỮ LIỆU ĐỊA GIỚI HÀNH CHÍNH VIỆT NAM SAU SÁP NHẬP (CHUẨN GEOVINA & NGHỊ QUYẾT QUỐC HỘI 2025 - 2026)
 * - Tỉnh Bà Rịa - Vũng Tàu, Bình Dương, Đồng Nai -> Sáp nhập vào Vùng Đô thị TP. Hồ Chí Minh
 * - TP. Hồ Chí Minh: Nghị quyết số 1685/NQ-UBTVQH15
 * - Hà Nội: Nghị quyết số 1656/NQ-UBTVQH15
 * - Đà Nẵng (+ Quảng Nam), Hải Phòng (+ Hải Dương)...
 */

const normalize = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const MERGER_DATABASE = [
  // =========================================================================
  // 1. TỈNH BÀ RỊA - VŨNG TÀU (SÁP NHẬP VÀO TP. HỒ CHÍ MINH - CHUẨN GEOVINA)
  // =========================================================================
  // Huyện Châu Đức
  {
    province: 'bariavungtau',
    district: 'chauduc',
    oldWards: ['bauchinh', 'langlon', 'kimlong', 'bau chinh', 'lang lon', 'kim long'],
    newWard: 'Xã Kim Long',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
    notes: 'Sáp nhập từ Bàu Chinh, Láng Lớn, Kim Long vào TP. Hồ Chí Minh',
  },
  {
    province: 'bariavungtau',
    district: 'chauduc',
    oldWards: ['ngaigiao', 'ngai giao'],
    newWard: 'Xã Ngãi Giao',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },
  {
    province: 'bariavungtau',
    district: 'chauduc',
    oldWards: ['xuanson', 'sonbinh', 'xuan son', 'son binh'],
    newWard: 'Xã Xuân Sơn',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },
  {
    province: 'bariavungtau',
    district: 'chauduc',
    oldWards: ['binhgia', 'binhtrung', 'binh gia', 'binh trung'],
    newWard: 'Xã Bình Giã',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },
  {
    province: 'bariavungtau',
    district: 'chauduc',
    oldWards: ['nghiathanh', 'dabac', 'suoinghe', 'nghia thanh', 'da bac', 'suoi nghe'],
    newWard: 'Xã Nghĩa Thành',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },
  {
    province: 'bariavungtau',
    district: 'chauduc',
    oldWards: ['cubi', 'xabang', 'quangthanh', 'cu bi', 'xa bang', 'quang thanh'],
    newWard: 'Xã Châu Đức',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },

  // Thành phố Vũng Tàu -> Sáp nhập vào TP. Hồ Chí Minh
  {
    province: 'bariavungtau',
    district: 'vungtau',
    oldWards: ['phuong1', 'phuong2', 'phuong3', 'phuong4', 'phuong5', 'phuong7', 'phuong8', 'phuong9', 'phuong10', 'phuong11', 'phuong12', 'thangnhat', 'thangnhi', 'thangtam', 'nguyenaninh', 'rachdua', 'longson'],
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },

  // Thành phố Bà Rịa -> Sáp nhập vào TP. Hồ Chí Minh
  {
    province: 'bariavungtau',
    district: 'baria',
    oldWards: ['phuoctrung', 'phuochiep', 'phuocnguyen', 'phuochoa', 'longtoan', 'longtam', 'longhuong', 'kimdinh', 'tanhuong', 'hoalong'],
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },

  // Thị xã Phú Mỹ -> Sáp nhập vào TP. Hồ Chí Minh
  {
    province: 'bariavungtau',
    district: 'phumy',
    oldWards: ['phumy', 'hacdich', 'myxuan', 'phuochoa', 'tanphuoc', 'chauspha', 'songxoai', 'tanhung', 'tanhoa'],
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },

  // Huyện Long Điền & Đất Đỏ -> TP. Hồ Chí Minh
  {
    province: 'bariavungtau',
    district: 'longdien',
    oldWards: ['longdien', 'longhai', 'anngai', 'annhut', 'phuochung', 'phuoctinh', 'tamphuoc'],
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },
  {
    province: 'bariavungtau',
    district: 'datdo',
    oldWards: ['datdo', 'phuochai', 'longtan', 'longmy', 'phuochoidatdo', 'langdai'],
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },

  // Huyện Côn Đảo -> Đặc khu Côn Đảo, TP. Hồ Chí Minh
  {
    province: 'bariavungtau',
    district: 'condao',
    oldWards: ['condao', 'huyencondao'],
    newWard: 'Đặc khu Côn Đảo',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Quy hoạch sáp nhập 34 tỉnh thành 2026',
  },

  // ==========================================
  // 2. TP. HỒ CHÍ MINH (NQ 1685/NQ-UBTVQH15)
  // ==========================================
  // Quận Bình Tân
  {
    province: 'hochiminh',
    district: 'binhtan',
    oldWards: ['binhtridongb', 'anlaca', 'anlac', 'binh tri dong b', 'an lac a', 'an lac'],
    newWard: 'Phường An Lạc',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Nghị quyết số 1685/NQ-UBTVQH15',
    notes: 'Sáp nhập từ 3 phường cũ: Bình Trị Đông B, An Lạc A, An Lạc',
  },
  {
    province: 'hochiminh',
    district: 'binhtan',
    oldWards: ['binhhunghoab', 'binhtridonga', 'tantao', 'binh hung hoa b', 'binh tri dong a', 'tan tao'],
    newWard: 'Phường Bình Tân',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Nghị quyết số 1685/NQ-UBTVQH15',
  },
  {
    province: 'hochiminh',
    district: 'binhtan',
    oldWards: ['tantaoa', 'tankien', 'tan tao a', 'tan kien'],
    newWard: 'Phường Tân Tạo',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'binhtan',
    oldWards: ['binhhunghoa', 'sonky', 'binhhunghoaa', 'binh hung hoa', 'son ky', 'binh hung hoa a'],
    newWard: 'Phường Bình Hưng Hòa',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'binhtan',
    oldWards: ['binhtridong', 'binh tri dong'],
    newWard: 'Phường Bình Trị Đông',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận 1
  {
    province: 'hochiminh',
    district: 'quan1',
    oldWards: ['bennghe', 'dakao', 'nguyenthaibinh', 'ben nghe', 'da kao', 'nguyen thai binh'],
    newWard: 'Phường Sài Gòn',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Nghị quyết số 1685/NQ-UBTVQH15',
  },
  {
    province: 'hochiminh',
    district: 'quan1',
    oldWards: ['benthanh', 'phamngulao', 'cauonglanh', 'ben thanh', 'pham ngu lao', 'cau ong lanh'],
    newWard: 'Phường Bến Thành',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan1',
    oldWards: ['caukho', 'cogiang', 'cau kho', 'co giang'],
    newWard: 'Phường Cầu Kho',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan1',
    oldWards: ['tandinh', 'tan dinh'],
    newWard: 'Phường Tân Định',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận 3
  {
    province: 'hochiminh',
    district: 'quan3',
    oldWards: ['phuong1', 'phuong2', 'phuong3', 'phuong4', 'phuong5', '1', '2', '3', '4', '5', 'banco'],
    newWard: 'Phường Bàn Cờ',
    newProvince: 'TP. Hồ Chí Minh',
    resolution: 'Nghị quyết số 1685/NQ-UBTVQH15',
    notes: 'Sáp nhập từ các Phường 1, 2, 3, 4, 5',
  },
  {
    province: 'hochiminh',
    district: 'quan3',
    oldWards: ['phuong9', 'phuong10', '9', '10'],
    newWard: 'Phường 9',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan3',
    oldWards: ['phuong11', 'phuong12', '11', '12'],
    newWard: 'Phường 11',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan3',
    oldWards: ['phuong6', 'phuong7', 'phuong8', '6', '7', '8', 'vothisau'],
    newWard: 'Phường Võ Thị Sáu',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận 4
  {
    province: 'hochiminh',
    district: 'quan4',
    oldWards: ['phuong6', 'phuong9', '6', '9'],
    newWard: 'Phường 9',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan4',
    oldWards: ['phuong12', 'phuong13', '12', '13'],
    newWard: 'Phường 13',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan4',
    oldWards: ['phuong1', 'phuong2', 'phuong3', 'phuong4', '1', '2', '3', '4', 'xomchieu'],
    newWard: 'Phường Xóm Chiếu',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận 5
  {
    province: 'hochiminh',
    district: 'quan5',
    oldWards: ['phuong2', 'phuong3', '2', '3'],
    newWard: 'Phường 2',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan5',
    oldWards: ['phuong5', 'phuong6', '5', '6'],
    newWard: 'Phường 5',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan5',
    oldWards: ['phuong7', 'phuong8', '7', '8'],
    newWard: 'Phường 7',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan5',
    oldWards: ['phuong11', 'phuong12', '11', '12'],
    newWard: 'Phường 11',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan5',
    oldWards: ['phuong1', 'phuong4', '1', '4', 'choquan'],
    newWard: 'Phường Chợ Quán',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận 6
  {
    province: 'hochiminh',
    district: 'quan6',
    oldWards: ['phuong2', 'phuong6', '2', '6'],
    newWard: 'Phường 2',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan6',
    oldWards: ['phuong1', 'phuong3', 'phuong4', '1', '3', '4'],
    newWard: 'Phường 1',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan6',
    oldWards: ['phuong13', 'phuong14', '13', '14'],
    newWard: 'Phường 13',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận 8
  {
    province: 'hochiminh',
    district: 'quan8',
    oldWards: ['phuong1', 'phuong2', 'phuong3', '1', '2', '3', 'rachong'],
    newWard: 'Phường Rạch Ông',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan8',
    oldWards: ['phuong8', 'phuong9', 'phuong10', '8', '9', '10', 'hungphu'],
    newWard: 'Phường Hưng Phú',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan8',
    oldWards: ['phuong11', 'phuong12', 'phuong13', '11', '12', '13', 'xomcui'],
    newWard: 'Phường Xóm Củi',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận 10
  {
    province: 'hochiminh',
    district: 'quan10',
    oldWards: ['phuong5', 'phuong6', '5', '6'],
    newWard: 'Phường 5',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan10',
    oldWards: ['phuong7', 'phuong8', '7', '8'],
    newWard: 'Phường 7',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận 11
  {
    province: 'hochiminh',
    district: 'quan11',
    oldWards: ['phuong1', 'phuong2', '1', '2'],
    newWard: 'Phường 1',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan11',
    oldWards: ['phuong8', 'phuong9', '8', '9'],
    newWard: 'Phường 8',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'quan11',
    oldWards: ['phuong11', 'phuong12', '11', '12'],
    newWard: 'Phường 11',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận Bình Thạnh
  {
    province: 'hochiminh',
    district: 'binhthanh',
    oldWards: ['phuong1', 'phuong3', '1', '3'],
    newWard: 'Phường 1',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'binhthanh',
    oldWards: ['phuong11', 'phuong13', '11', '13'],
    newWard: 'Phường 11',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'binhthanh',
    oldWards: ['phuong21', 'phuong22', '21', '22'],
    newWard: 'Phường 21',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận Phú Nhuận
  {
    province: 'hochiminh',
    district: 'phunhuan',
    oldWards: ['phuong11', 'phuong12', '11', '12'],
    newWard: 'Phường 11',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'phunhuan',
    oldWards: ['phuong13', 'phuong14', '13', '14'],
    newWard: 'Phường 13',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // Quận Gò Vấp
  {
    province: 'hochiminh',
    district: 'govap',
    oldWards: ['phuong1', 'phuong4', '1', '4'],
    newWard: 'Phường 1',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'govap',
    oldWards: ['phuong8', 'phuong9', '8', '9'],
    newWard: 'Phường 8',
    newProvince: 'TP. Hồ Chí Minh',
  },
  {
    province: 'hochiminh',
    district: 'govap',
    oldWards: ['phuong14', 'phuong15', '14', '15'],
    newWard: 'Phường 14',
    newProvince: 'TP. Hồ Chí Minh',
  },

  // ==========================================
  // 3. HÀ NỘI (NQ 1656/NQ-UBTVQH15)
  // ==========================================
  {
    province: 'hanoi',
    district: 'dongda',
    oldWards: ['khamthien', 'trungphung', 'kham thien', 'trung phung'],
    newWard: 'Phường Khâm Thiên',
    newProvince: 'TP. Hà Nội',
    resolution: 'Nghị quyết số 1656/NQ-UBTVQH15',
  },
  {
    province: 'hanoi',
    district: 'dongda',
    oldWards: ['quoctugiam', 'vanmieu', 'quoc tu giam', 'van mieu'],
    newWard: 'Phường Văn Miếu - Quốc Tử Giám',
    newProvince: 'TP. Hà Nội',
  },
  {
    province: 'hanoi',
    district: 'dongda',
    oldWards: ['phuonglien', 'trungtu', 'phuong lien', 'trung tu'],
    newWard: 'Phường Phương Liên - Trung Tự',
    newProvince: 'TP. Hà Nội',
  },
  {
    province: 'hanoi',
    district: 'haibatrung',
    oldWards: ['dongmac', 'dongnhan', 'dong mac', 'dong nhan'],
    newWard: 'Phường Đồng Nhân',
    newProvince: 'TP. Hà Nội',
  },
  {
    province: 'hanoi',
    district: 'haibatrung',
    oldWards: ['cauden', 'thanhnhan', 'bachkhoa', 'cau den', 'thanh nhan', 'bach khoa'],
    newWard: 'Phường Bách Khoa',
    newProvince: 'TP. Hà Nội',
  },
];

const formatFullProvince = (province = '') => {
  const p = province.trim();
  if (!p) return '';
  const lower = p.toLowerCase();
  if (lower.includes('bà rịa') || lower.includes('vũng tàu') || lower.includes('ba ria') || lower.includes('vung tau')) {
    return 'TP. Hồ Chí Minh';
  }
  if (lower.includes('hồ chí minh') || lower.includes('ho chi minh')) return 'TP. Hồ Chí Minh';
  if (lower.includes('hà nội') || lower.includes('ha noi')) return 'TP. Hà Nội';
  if (lower.includes('đà nẵng') || lower.includes('da nang')) return 'TP. Đà Nẵng';
  if (lower.includes('hải phòng') || lower.includes('hai phong')) return 'TP. Hải Phòng';
  if (lower.includes('cần thơ') || lower.includes('can tho')) return 'TP. Cần Thơ';
  if (p.startsWith('Tỉnh') || p.startsWith('TP') || p.startsWith('Thành phố')) return p;
  return `Tỉnh ${p}`;
};

/**
 * Tra cứu phân tích chuyển đổi địa giới hành chính chuẩn GeoVina & Nghị quyết Quốc Hội
 */
const lookupAdministrativeMerger = ({
  province = '',
  district = '',
  ward = '',
  detailAddress = '',
}) => {
  if (!province && !ward) {
    return null;
  }

  const normProvince = normalize(province);
  const normDistrict = normalize(district);
  const normWard = normalize(ward);
  const provDisplay = formatFullProvince(province);
  const detailPart = detailAddress ? `${detailAddress.trim()}, ` : '';

  const matchedRule = MERGER_DATABASE.find((rule) => {
    const ruleProv = normalize(rule.province);
    const matchProv = normProvince.includes(ruleProv) || ruleProv.includes(normProvince);
    if (!matchProv) return false;

    if (rule.district && normDistrict) {
      const ruleDist = normalize(rule.district);
      const matchDist = normDistrict.includes(ruleDist) || ruleDist.includes(normDistrict);
      if (!matchDist) return false;
    }

    if (rule.oldWards && rule.oldWards.length > 0) {
      return rule.oldWards.some((w) => {
        const nw = normalize(w);
        return normWard.includes(nw) || nw.includes(normWard);
      });
    }

    return true;
  });

  if (matchedRule) {
    const newWardName = matchedRule.newWard || ward;
    const targetProv = matchedRule.newProvince || provDisplay;
    const isNameChanged =
      normalize(newWardName) !== normWard ||
      normalize(targetProv) !== normProvince;

    return {
      isMerged: true,
      isNameChanged,
      oldWard: ward,
      newWard: newWardName,
      province: targetProv,
      source: 'GeoVina & NQ Quốc Hội 2025 - 2026',
      resolution: matchedRule.resolution || 'Nghị quyết số 1685/NQ-UBTVQH15',
      notes: matchedRule.notes,
      changeDescription: isNameChanged
        ? `Sáp nhập "${ward}${district ? `, ${district}` : ''}" thành "${newWardName}, ${targetProv}"`
        : `Đơn vị hành chính chuẩn hóa "${newWardName}, ${targetProv}"`,
      postMergerFullAddress: `${detailPart}${newWardName}, ${targetProv}`,
    };
  }

  return {
    isMerged: false,
    isNameChanged: false,
    oldWard: ward,
    newWard: ward,
    province: provDisplay,
    source: 'Mô hình 2 cấp chuẩn hóa (GSO)',
    changeDescription: 'Địa giới hành chính chuẩn hóa (2 cấp)',
    postMergerFullAddress: `${detailPart}${ward}, ${provDisplay}`,
  };
};

module.exports = {
  lookupAdministrativeMerger,
  normalize,
  formatFullProvince,
};
