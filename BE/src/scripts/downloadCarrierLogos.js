const fs = require('fs');
const path = require('path');
const axios = require('axios');

const targetDir = path.resolve(__dirname, '../../../Admin/public/images/carriers');

const CARRIER_URLS = {
  green_sm: 'https://cdn.haitrieu.com/wp-content/uploads/2023/04/Logo-Xanh-SM.png',
  vnpost: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VNPost.png',
  best_express: 'https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-BEST-Express.png',
  spx: 'https://cdn.haitrieu.com/wp-content/uploads/2023/08/Logo-SPX-Shopee-Xpress.png',
  ghn: 'https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png',
  ghtk: 'https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHTK-H.png',
  grab_express: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Grab-Express.png',
  viettelpost: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Viettel-Post.png',
  ahamove: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Ahamove.png',
  jt_express: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-JT-Express.png',
};

async function downloadCarrierLogos() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log('[downloadCarrierLogos] Đang tải các logo đơn vị vận chuyển về thư mục cục bộ:', targetDir);

  for (const [code, url] of Object.entries(CARRIER_URLS)) {
    const filePath = path.join(targetDir, `${code}.png`);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
      console.log(`[downloadCarrierLogos] ${code}.png đã tồn tại, bỏ qua.`);
      continue;
    }

    try {
      const resp = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://google.com',
        },
        timeout: 10000,
      });

      fs.writeFileSync(filePath, Buffer.from(resp.data));
      console.log(`[downloadCarrierLogos] ✓ Đã tải thành công ${code}.png (${resp.data.length} bytes)`);
    } catch (err) {
      console.warn(`[downloadCarrierLogos] ✗ Lỗi tải ${code} từ ${url}:`, err.message);
    }
  }

  console.log('[downloadCarrierLogos] Hoàn thành tải logo các hãng vận chuyển!');
}

module.exports = { downloadCarrierLogos };

if (require.main === module) {
  downloadCarrierLogos();
}
