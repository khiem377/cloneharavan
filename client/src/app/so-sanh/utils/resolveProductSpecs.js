export function resolveProductSpecs(p) {
  const nameLower = (p.name || '').toLowerCase();
  const brandName = p.brand?.name || 'Chính hãng';
  const categoryName = p.categories?.[0]?.name || p.category?.name || 'Thiết bị điện máy';

  const inchMatch = (p.name || '').match(/\b(32|40|42|43|48|50|55|58|60|65|70|75|77|85|86|98)\s*(?:["”]|inch\b)/i);
  const screenSize = inchMatch ? `${inchMatch[1]} inch` : (p.variants?.[0]?.displayName || 'Tiêu chuẩn');

  const isTv = /\b(?:tivi|ti vi|tv|smart tv|qled|oled|nanocell)\b/i.test(nameLower);
  const isSpeaker = /\b(?:loa|soundbar|karaoke|amply|audio)\b/i.test(nameLower);

  let resolution = '4K Ultra HD (3840 x 2160)';
  if (nameLower.includes('8k')) resolution = '8K Ultra HD (7680 x 4320)';
  else if (nameLower.includes('full hd') || nameLower.includes('fhd')) resolution = 'Full HD (1920 x 1080)';
  else if (nameLower.includes('hd')) resolution = 'HD (1366 x 768)';

  let panelTech = 'LED Direct Backlight';
  if (nameLower.includes('qled')) panelTech = 'QLED Chấm lượng tử Quantum Dot';
  else if (nameLower.includes('oled')) panelTech = 'OLED Điểm ảnh tự phát sáng Pixel Dimming';
  else if (nameLower.includes('nanocell')) panelTech = 'NanoCell Tinh lọc màu sắc Nano Color';
  else if (nameLower.includes('mini led')) panelTech = 'Mini LED Kiểm soát ánh sáng đỉnh cao';

  let osName = 'Google TV đa nhiệm';
  if (brandName.toLowerCase().includes('samsung')) osName = 'Tizen OS mượt mà, trực quan';
  else if (brandName.toLowerCase().includes('lg')) osName = 'webOS 23 Smart TV thông minh';
  else if (brandName.toLowerCase().includes('sony')) osName = 'Google TV (Android 12) bản quyền';
  else if (brandName.toLowerCase().includes('tcl')) osName = 'Google TV giao diện thân thiện';

  let processor = 'Bộ xử lý hình ảnh AI 4K tối ưu hoá';
  if (brandName.toLowerCase().includes('samsung')) processor = 'Quantum Processor Lite 4K thông minh';
  else if (brandName.toLowerCase().includes('lg')) processor = 'Bộ xử lý AI α7 Gen5 4K';
  else if (brandName.toLowerCase().includes('sony')) processor = 'Bộ xử lý 4K X1™ nâng cấp hình ảnh';
  else if (brandName.toLowerCase().includes('tcl')) processor = 'AiPQ Engine thế hệ mới';

  let audioPower = '20W (2 kênh stereo)';
  if (nameLower.includes('3600w')) audioPower = '3600W PMPO cực đại';
  else if (nameLower.includes('1200w')) audioPower = '1200W PMPO';
  else if (nameLower.includes('1000w')) audioPower = '1000W PMPO';
  else if (nameLower.includes('350w')) audioPower = '350W PMPO';
  else if (nameLower.includes('100w')) audioPower = '100W RMS';
  else if (nameLower.includes('5.1') || nameLower.includes('soundbar')) audioPower = '400W (Hệ thống vòm 5.1 CH)';

  let audioTech = 'Dolby Audio, Âm thanh vòm vòm chuyển động';
  if (brandName.toLowerCase().includes('samsung')) audioTech = 'Object Tracking Sound (OTS Lite), Q-Symphony đồng bộ';
  else if (brandName.toLowerCase().includes('sony')) audioTech = 'Dolby Atmos, S-Force Front Surround, Clear Phase';
  else if (brandName.toLowerCase().includes('lg')) audioTech = 'AI Sound Pro (Virtual 5.1.2 Up-mix), Clear Voice Pro';

  return {
    overview: [
      { label: 'Loại sản phẩm', value: categoryName },
      { label: 'Hãng sản xuất (Brand)', value: brandName },
      { label: 'Xuất xứ & Phân phối', value: 'Chính hãng 100% (Nguyên seal)' },
      { label: 'Năm ra mắt', value: '2024' },
      { label: 'Nơi sản xuất', value: brandName === 'Sony' ? 'Malaysia' : brandName === 'Samsung' ? 'Việt Nam' : 'Thái Lan / Indonesia' },
      { label: 'Thời gian bảo hành', value: '24 tháng chính hãng (Kích hoạt bảo hành điện tử)' },
      { label: 'Tình trạng kho hàng', value: 'Còn hàng - Sẵn sàng giao ngay trong 2h' },
    ],
    display: isTv ? [
      { label: 'Kích thước màn hình', value: screenSize },
      { label: 'Đ度 phân giải', value: resolution },
      { label: 'Công nghệ màn hình', value: panelTech },
      { label: 'Tần số quét thực', value: nameLower.includes('120hz') ? '120Hz mượt mà' : '60Hz ổn định' },
      { label: 'Bộ xử lý hình ảnh', value: processor },
      { label: 'Công nghệ tăng cường dải màu', value: 'Quantum HDR, Tái hiện 100% dải màu DCI-P3' },
      { label: 'Nâng cấp độ phân giải', value: '4K Upscaling bằng trí tuệ nhân tạo AI' },
      { label: 'Góc nhìn & Chống chói', value: 'Wide Viewing Angle góc nhìn siêu rộng' },
    ] : [],
    audio: [
      { label: 'Tổng công suất loa', value: audioPower },
      { label: 'Hệ thống loa', value: isSpeaker ? 'Loa kéo di động / Soundbar đa hướng' : '2.0 Kênh tích hợp' },
      { label: 'Công nghệ âm thanh nổi bật', value: audioTech },
      { label: 'Tính năng tối ưu âm thanh', value: 'Tự động hiệu chỉnh âm lượng thích ứng với không gian' },
    ],
    smart: isTv ? [
      { label: 'Hệ điều hành', value: osName },
      { label: 'Điều khiển bằng giọng nói', value: 'Tìm kiếm giọng nói tiếng Việt rảnh tay (Hand-free Voice)' },
      { label: 'Trợ lý ảo tích hợp', value: 'Google Assistant / Bixby thông minh' },
      { label: 'Chiếu màn hình điện thoại', value: 'Hỗ trợ Apple AirPlay 2, Google Cast, Miracast' },
      { label: 'Ứng dụng giải trí sẵn có', value: 'Clip TV, YouTube, Netflix, VieON, FPT Play, TV360' },
      { label: 'Kết nối thiết bị thông minh', value: 'SmartThings / Apple HomeKit quản lý ngôi nhà' },
    ] : [],
    connectivity: [
      { label: 'Cổng HDMI', value: isTv ? '3 - 4 cổng HDMI 2.1 (hỗ trợ eARC)' : '1 cổng HDMI ARC' },
      { label: 'Cổng USB', value: isTv ? '2 cổng USB-A đa phương tiện' : '1 cổng USB phát nhạc' },
      { label: 'Cổng xuất âm thanh', value: 'Cổng quang học Optical Digital Audio Out' },
      { label: 'Kết nối Internet', value: 'Wi-Fi băng tần kép 2.4GHz / 5.0GHz, Cổng LAN RJ45' },
      { label: 'Kết nối không dây', value: 'Bluetooth 5.2 kết nối tai nghe, bàn phím, chuột' },
    ],
    design: [
      { label: 'Kiểu dáng thiết kế', value: 'Thiết kế không viền 3 cạnh tinh tế, tối giản sang trọng' },
      { label: 'Chất liệu viền', value: 'Kim loại sơn phủ tĩnh điện cao cấp' },
      { label: 'Chất liệu chân đế', value: 'Hợp kim nhôm đúc nguyên khối vững chắc' },
      { label: 'Chuẩn treo tường VESA', value: 'Hỗ trợ tất cả giá treo tường chuẩn VESA' },
    ],
    featuresHighlights: [
      {
        title: 'Kiểu dáng sang trọng, nâng tầm không gian sống',
        desc: `Sản phẩm ${p.name} sở hữu ngôn ngữ thiết kế viền mỏng thanh thoát, tôn lên vẻ hiện đại và đẳng cấp cho mọi không gian nội thất.`,
      },
      {
        title: 'Trải nghiệm nghe nhìn chuẩn rạp chiếu phim',
        desc: `Tích hợp các công nghệ xử lý hình ảnh và âm thanh thế hệ mới nhất, mang đến chất lượng khung hình rực rỡ và dải âm vòm sống động chân thực.`,
      },
      {
        title: 'Hệ sinh thái kết nối thông minh & tiện ích',
        desc: `Dễ dàng điều khiển bằng giọng nói tiếng Việt rảnh tay, chia sẻ nhanh nội dung từ smartphone và truy cập kho ứng dụng giải trí phong phú.`,
      },
    ],
  };
}
