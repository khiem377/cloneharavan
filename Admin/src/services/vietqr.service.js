/**
 * VietQR Banks Service
 * Docs: https://www.vietqr.io/danh-sach-api/api-danh-sach-ma-ngan-hang/
 * Endpoint: https://api.vietqr.io/v2/banks
 */
import axios from 'axios';

let cachedBanks = null;

// Danh sách các ngân hàng phổ biến nhất làm fallback dự phòng
const FALLBACK_BANKS = [
  { id: 17, name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', code: 'VCB', bin: '970436', shortName: 'Vietcombank', logo: 'https://api.vietqr.io/img/VCB.png' },
  { id: 21, name: 'Ngân hàng TMCP Quân Đội', code: 'MB', bin: '970422', shortName: 'MBBank', logo: 'https://api.vietqr.io/img/MB.png' },
  { id: 2, name: 'Ngân hàng TMCP Kỹ Thương Việt Nam', code: 'TCB', bin: '970407', shortName: 'Techcombank', logo: 'https://api.vietqr.io/img/TCB.png' },
  { id: 1, name: 'Ngân hàng TMCP Công Thương Việt Nam', code: 'ICB', bin: '970415', shortName: 'VietinBank', logo: 'https://api.vietqr.io/img/ICB.png' },
  { id: 4, name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', code: 'BIDV', bin: '970418', shortName: 'BIDV', logo: 'https://api.vietqr.io/img/BIDV.png' },
  { id: 42, name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', code: 'VBA', bin: '970405', shortName: 'Agribank', logo: 'https://api.vietqr.io/img/VBA.png' },
  { id: 3, name: 'Ngân hàng TMCP Á Châu', code: 'ACB', bin: '970416', shortName: 'ACB', logo: 'https://api.vietqr.io/img/ACB.png' },
  { id: 26, name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', code: 'VPB', bin: '970432', shortName: 'VPBank', logo: 'https://api.vietqr.io/img/VPB.png' },
  { id: 38, name: 'Ngân hàng TMCP Tiên Phong', code: 'TPB', bin: '970423', shortName: 'TPBank', logo: 'https://api.vietqr.io/img/TPB.png' },
  { id: 22, name: 'Ngân hàng TMCP Sài Gòn Thương Tín', code: 'STB', bin: '970403', shortName: 'Sacombank', logo: 'https://api.vietqr.io/img/STB.png' },
  { id: 19, name: 'Ngân hàng TMCP Quốc tế Việt Nam', code: 'VIB', bin: '970441', shortName: 'VIB', logo: 'https://api.vietqr.io/img/VIB.png' },
  { id: 8, name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', code: 'HDB', bin: '970437', shortName: 'HDBank', logo: 'https://api.vietqr.io/img/HDB.png' },
  { id: 28, name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', code: 'SHB', bin: '970443', shortName: 'SHB', logo: 'https://api.vietqr.io/img/SHB.png' },
  { id: 20, name: 'Ngân hàng TMCP Hàng Hải', code: 'MSB', bin: '970426', shortName: 'MSB', logo: 'https://api.vietqr.io/img/MSB.png' },
  { id: 24, name: 'Ngân hàng TMCP Bưu Điện Liên Việt', code: 'LPB', bin: '970449', shortName: 'LPBank', logo: 'https://api.vietqr.io/img/LPB.png' },
  { id: 33, name: 'Ngân hàng TMCP Đông Nam Á', code: 'SEAB', bin: '970440', shortName: 'SeABank', logo: 'https://api.vietqr.io/img/SEAB.png' },
  { id: 23, name: 'Ngân hàng TMCP Phương Đông', code: 'OCB', bin: '970448', shortName: 'OCB', logo: 'https://api.vietqr.io/img/OCB.png' },
  { id: 52, name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', code: 'SHBVN', bin: '970424', shortName: 'ShinhanBank', logo: 'https://api.vietqr.io/img/SHBVN.png' },
];

export const vietqrService = {
  getBanks: async () => {
    if (cachedBanks && cachedBanks.length > 0) {
      return cachedBanks;
    }

    try {
      const res = await axios.get('https://api.vietqr.io/v2/banks', { timeout: 8000 });
      if (res.data?.code === '00' && Array.isArray(res.data?.data)) {
        cachedBanks = res.data.data;
        return cachedBanks;
      }
      return FALLBACK_BANKS;
    } catch (err) {
      console.warn('Lỗi tải danh sách ngân hàng từ VietQR, sử dụng danh sách dự phòng:', err);
      return FALLBACK_BANKS;
    }
  },
};

export default vietqrService;
