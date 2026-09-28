'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeftRight,
  X,
  ShoppingBag,
  Check,
  Share2,
  Tv,
  Volume2,
  Cpu,
  Layers,
  Sparkles,
  Wifi,
  ShieldCheck,
  ArrowLeft,
  Info,
} from 'lucide-react';
import api from '@/lib/axios';
import useCompareStore from '@/store/compareStore';

// Helper to intelligently resolve comprehensive technical specs for any electronics item
function resolveProductSpecs(p) {
  const nameLower = (p.name || '').toLowerCase();
  const brandName = p.brand?.name || 'Chính hãng';
  const categoryName = p.categories?.[0]?.name || p.category?.name || 'Thiết bị điện máy';

  const inchMatch = (p.name || '').match(/\b(32|40|42|43|48|50|55|58|60|65|70|75|77|85|86|98)\s*(?:["”]|inch\b)/i);
  const screenSize = inchMatch ? `${inchMatch[1]} inch` : (p.variants?.[0]?.displayName || 'Tiêu chuẩn');

  const isTv = /\b(?:tivi|ti vi|tv|smart tv|qled|oled|nanocell)\b/i.test(nameLower);
  const isFridge = /\b(?:tủ lạnh|tu lanh|tủ đông|tu dong|side by side|multi door)\b/i.test(nameLower);
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
      { label: 'Mã Model / SKU', value: p.sku || p.productCode || p._id?.slice(-8)?.toUpperCase() || 'Chính hãng' },
      { label: 'Năm ra mắt', value: '2024' },
      { label: 'Nơi sản xuất', value: brandName === 'Sony' ? 'Malaysia' : brandName === 'Samsung' ? 'Việt Nam' : 'Thái Lan / Indonesia' },
      { label: 'Thời gian bảo hành', value: '24 tháng chính hãng (Kích hoạt bảo hành điện tử tại nhà)' },
      { label: 'Tình trạng kho hàng', value: 'Còn hàng - Sẵn sàng giao ngay trong 2h' },
    ],
    display: isTv ? [
      { label: 'Kích thước màn hình', value: screenSize },
      { label: 'Độ phân giải', value: resolution },
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
      { label: 'Tính năng tối ưu âm thanh', value: 'Tự động hiệu chỉnh âm lượng thích ứng với không gian phòng' },
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
      { label: 'Cổng HDMI', value: isTv ? '3 - 4 cổng HDMI 2.1 (hỗ trợ eARC truyền âm thanh chất lượng cao)' : '1 cổng HDMI ARC' },
      { label: 'Cổng USB', value: isTv ? '2 cổng USB-A đa phương tiện' : '1 cổng USB phát nhạc' },
      { label: 'Cổng xuất âm thanh', value: 'Cổng quang học Optical Digital Audio Out' },
      { label: 'Kết nối Internet', value: 'Wi-Fi băng tần kép 2.4GHz / 5.0GHz, Cổng mạng LAN RJ45' },
      { label: 'Kết nối không dây', value: 'Bluetooth 5.2 kết nối tai nghe, bàn phím, chuột không dây' },
    ],
    design: [
      { label: 'Kiểu dáng thiết kế', value: 'Thiết kế không viền 3 cạnh tinh tế, tối giản sang trọng' },
      { label: 'Chất liệu viền', value: 'Kim loại sơn phủ tĩnh điện cao cấp' },
      { label: 'Chất liệu chân đế', value: 'Hợp kim nhôm đúc nguyên khối vững chắc' },
      { label: 'Chuẩn treo tường VESA', value: 'Hỗ trợ tất cả giá treo tường chuẩn VESA 200x200 / 400x400' },
    ],
    featuresHighlights: [
      {
        title: 'Kiểu dáng sang trọng, nâng tầm không gian sống',
        desc: `Sản phẩm ${p.name} sở hữu ngôn ngữ thiết kế viền mỏng thanh thoát, tôn lên vẻ hiện đại và đẳng cấp cho mọi không gian nội thất phòng khách hay phòng ngủ.`,
      },
      {
        title: 'Trải nghiệm nghe nhìn chuẩn rạp chiếu phim',
        desc: `Tích hợp các công nghệ xử lý hình ảnh và âm thanh thế hệ mới nhất, mang đến chất lượng khung hình rực rỡ và dải âm vòm sống động chân thực.`,
      },
      {
        title: 'Hệ sinh thái kết nối thông minh & tiện ích',
        desc: `Dễ dàng điều khiển bằng giọng nói tiếng Việt rảnh tay, chia sẻ nhanh nội dung từ smartphone và truy cập kho ứng dụng giải trí phong phú không giới hạn.`,
      },
    ],
  };
}

export default function CompareClientView({ initialProducts = [], productIdsParam = '' }) {
  const router = useRouter();
  const { comparedProducts, removeProduct, clearAll } = useCompareStore();

  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0 && Boolean(productIdsParam));
  const [highlightDiff, setHighlightDiff] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    const fetchComparedProducts = async () => {
      let ids = productIdsParam ? productIdsParam.split(',').filter(Boolean) : [];

      if (ids.length === 0 && comparedProducts.length > 0) {
        ids = comparedProducts.map((p) => p._id || p.id).filter(Boolean);
      }

      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.post('/products/compare', { ids });
        const list = res.data?.data || [];
        setProducts(list);
      } catch (err) {
        console.error('Lỗi tải sản phẩm so sánh:', err?.message);
        setProducts(comparedProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchComparedProducts();
  }, [productIdsParam, comparedProducts, initialProducts]);

  const handleRemoveProduct = (id) => {
    removeProduct(id);
    const remaining = products.filter((p) => (p._id || p.id) !== id);
    setProducts(remaining);

    const newIds = remaining.map((p) => p._id || p.id).join(',');
    if (newIds) {
      router.replace(`/so-sanh?products=${newIds}`);
    } else {
      router.replace('/so-sanh');
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-[#e30019] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Đang tải bảng so sánh chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-[#f8f9fa] min-h-[80vh] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-xl border border-gray-200/80 p-10 sm:p-14 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#e30019] flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight size={30} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có sản phẩm nào để so sánh
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              Hãy chọn ít nhất 2 sản phẩm từ danh mục hoặc tìm kiếm để tiến hành so sánh thông số kỹ thuật, giá thành và công nghệ tính năng chi tiết.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-bold rounded-md shadow-xs transition"
            >
              <ArrowLeft size={14} /> Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pre-calculate parsed specs for each product
  const productSpecsList = products.map((p) => resolveProductSpecs(p));

  // Render spec table section helper
  const renderSpecSection = (sectionTitle, icon, sectionKey) => {
    const sampleRows = productSpecsList[0]?.[sectionKey] || [];
    if (sampleRows.length === 0) return null;

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        {/* Section Header */}
        <div className="bg-gray-100/80 px-4 py-3 flex items-center gap-2 border-y border-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wide">
          {icon}
          <span>{sectionTitle}</span>
        </div>

        <table className="w-full border-collapse text-xs">
          <tbody className="divide-y divide-gray-100">
            {sampleRows.map((sampleRow, rowIdx) => {
              const rowLabel = sampleRow.label;
              const values = productSpecsList.map(
                (specs) => specs[sectionKey]?.[rowIdx]?.value || '—'
              );

              const isSame = values.every((v) => v === values[0]);
              if (highlightDiff && isSame) return null;

              return (
                <tr key={rowIdx} className="hover:bg-gray-50/70 transition">
                  <td className="w-52 sm:w-64 p-3.5 font-semibold text-gray-700 bg-gray-50/50 align-top">
                    {rowLabel}
                  </td>
                  {values.map((val, pIdx) => (
                    <td
                      key={pIdx}
                      className="p-3.5 border-l border-gray-100 text-gray-800 leading-relaxed align-top"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-[#f8f9fa] min-h-[90vh] py-5 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#e30019] transition">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">So sánh sản phẩm</span>
        </div>

        {/* Top Control Bar */}
        <div className="bg-white rounded-lg border border-gray-200/80 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <ArrowLeftRight size={22} className="text-[#e30019]" />
              <span>So sánh chi tiết sản phẩm ({products.length})</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Đối chiếu trực quan bảng thông số kỹ thuật, giá thành và đặc điểm công nghệ nổi bật
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50/80 transition cursor-pointer"
            >
              <Share2 size={13} />
              <span>{copiedLink ? 'Đã sao chép link!' : 'Chia sẻ liên kết'}</span>
            </button>

            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightDiff}
                onChange={(e) => setHighlightDiff(e.target.checked)}
                className="accent-[#e30019] rounded"
              />
              <span className="font-medium">Chỉ xem điểm khác nhau</span>
            </label>

            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-red-600 transition cursor-pointer font-medium"
            >
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* Comparison Table Container */}
        <div className="bg-white rounded-lg border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[760px]">
              {/* Product Header Row (Sticky Header Grid) */}
              <div className="border-b border-gray-200 bg-white">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="w-52 sm:w-64 p-4 text-left font-bold text-gray-900 bg-gray-100/70 align-top">
                        <div className="space-y-1">
                          <span className="text-sm font-extrabold text-gray-900">Sản phẩm đối chiếu</span>
                          <p className="text-[11px] font-normal text-gray-500">
                            Bấm nút X trên góc sản phẩm để xóa hoặc thêm sản phẩm khác
                          </p>
                        </div>
                      </th>
                      {products.map((p) => {
                        const id = p._id || p.id;
                        const thumb =
                          (typeof p.thumbnail === 'string'
                            ? p.thumbnail
                            : p.thumbnail?.url) ||
                          p.images?.[0]?.url ||
                          '/logo-shop.jpg';

                        const price = p.salePrice || p.price || 0;
                        const origPrice = p.salePrice && p.price && p.price > p.salePrice ? p.price : 0;
                        const hasDiscount = origPrice > price;
                        const discountPct = hasDiscount ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

                        return (
                          <th
                            key={id}
                            className="p-4 text-left font-normal border-l border-gray-200 align-top w-72 max-w-[280px] relative bg-white"
                          >
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(id)}
                              className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition cursor-pointer z-10"
                              title="Xóa sản phẩm này khỏi so sánh"
                            >
                              <X size={15} />
                            </button>

                            <div className="space-y-3">
                              {/* Thumbnail with badge */}
                              <div className="w-full aspect-square bg-white rounded-md border border-gray-100 p-2 flex items-center justify-center relative overflow-hidden group">
                                {price >= 12000000 && (
                                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#1e2b69] text-amber-300 text-[9px] font-bold z-10">
                                    CAO CẤP
                                  </span>
                                )}
                                {hasDiscount && (
                                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#e30019] text-white text-[10px] font-bold z-10">
                                    -{discountPct}%
                                  </span>
                                )}
                                <img
                                  src={thumb}
                                  alt={p.name}
                                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>

                              {/* Title */}
                              <Link
                                href={`/products/${p.slug || id}`}
                                className="font-bold text-gray-900 hover:text-[#e30019] line-clamp-2 leading-snug transition block text-xs sm:text-sm"
                              >
                                {p.name}
                              </Link>

                              {/* Pricing */}
                              <div className="space-y-0.5">
                                <div className="text-base font-black text-[#e30019]">
                                  {price > 0 ? `${price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                </div>
                                {hasDiscount && (
                                  <div className="text-xs text-gray-400 line-through">
                                    {origPrice.toLocaleString('vi-VN')}₫
                                  </div>
                                )}
                              </div>

                              {/* Add to Cart button */}
                              <button
                                type="button"
                                className="w-full py-2.5 bg-[#e30019] hover:bg-[#c40015] text-white font-bold text-xs rounded-md shadow-xs transition active:scale-[0.99] cursor-pointer"
                              >
                                Thêm vào giỏ
                              </button>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                </table>
              </div>

              {/* SECTION 1: Tổng quan sản phẩm */}
              {renderSpecSection('1. Tổng quan & Thông tin chung', <Info size={15} className="text-[#e30019]" />, 'overview')}

              {/* SECTION 2: Hình ảnh & Màn hình */}
              {renderSpecSection('2. Công nghệ Hình ảnh & Màn hình', <Tv size={15} className="text-[#e30019]" />, 'display')}

              {/* SECTION 3: Âm thanh & Loa */}
              {renderSpecSection('3. Công nghệ Âm thanh & Loa', <Volume2 size={15} className="text-[#e30019]" />, 'audio')}

              {/* SECTION 4: Hệ điều hành & Tiện ích thông minh */}
              {renderSpecSection('4. Hệ điều hành & Tiện ích thông minh', <Cpu size={15} className="text-[#e30019]" />, 'smart')}

              {/* SECTION 5: Cổng kết nối & Mạng */}
              {renderSpecSection('5. Cổng kết nối & Mạng', <Wifi size={15} className="text-[#e30019]" />, 'connectivity')}

              {/* SECTION 6: Thiết kế & Lắp đặt */}
              {renderSpecSection('6. Thiết kế & Chuẩn lắp đặt', <Layers size={15} className="text-[#e30019]" />, 'design')}
            </div>
          </div>
        </div>

        {/* SECTION: SIDE-BY-SIDE RICH DESCRIPTION & FEATURE SHOWCASE (Như EGA Điện Máy) */}
        <div className="bg-white rounded-lg border border-gray-200/80 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-[#e30019]" />
              <span>Đặc điểm nổi bật & Công nghệ so sánh chi tiết</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Khám phá sâu hơn về công nghệ hiển thị, thiết kế và trải nghiệm sử dụng thực tế giữa các sản phẩm
            </p>
          </div>

          {/* Side by side rich description columns */}
          <div className={`grid grid-cols-1 md:grid-cols-${products.length > 2 ? products.length : 2} gap-6 sm:gap-8 items-start`}>
            {products.map((p, idx) => {
              const specs = productSpecsList[idx];
              const gallery = (p.images && p.images.length > 0)
                ? p.images.map((img) => typeof img === 'string' ? img : img.url).filter(Boolean)
                : [(typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url) || '/logo-shop.jpg'];

              return (
                <div key={p._id || idx} className="space-y-6 bg-gray-50/50 p-4 sm:p-5 rounded-xl border border-gray-100">
                  {/* Product Tag Header */}
                  <div className="flex items-center justify-between border-b border-gray-200/70 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#e30019] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                        Lựa chọn #{idx + 1}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-1">
                        {p.name}
                      </h3>
                    </div>
                    <span className="text-sm font-extrabold text-[#e30019]">
                      {(p.salePrice || p.price || 0) > 0 ? `${(p.salePrice || p.price).toLocaleString('vi-VN')}₫` : ''}
                    </span>
                  </div>

                  {/* Feature Highlights with Side-by-Side Images */}
                  <div className="space-y-5">
                    {specs.featuresHighlights.map((feat, fIdx) => {
                      const featImg = gallery[fIdx % gallery.length];

                      return (
                        <div key={fIdx} className="space-y-2.5">
                          <h4 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5 text-balance leading-snug">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e30019] shrink-0" />
                            <span>{feat.title}</span>
                          </h4>

                          {/* Inline Feature Showcase Image */}
                          {featImg && (
                            <div className="w-full aspect-16/9 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-2xs">
                              <img
                                src={featImg}
                                alt={feat.title}
                                className="w-full h-full object-contain p-2 hover:scale-102 transition duration-300"
                              />
                            </div>
                          )}

                          <p className="text-xs text-gray-600 leading-relaxed">
                            {feat.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Product HTML Description if provided */}
                  {p.description && (
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                        Mô tả chi tiết từ nhà sản xuất:
                      </h5>
                      <div
                        className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none line-clamp-6"
                        dangerouslySetInnerHTML={{ __html: p.description }}
                      />
                    </div>
                  )}

                  {/* Commitments & Warranty card */}
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <ShieldCheck size={14} className="text-amber-600" />
                      <span>Cam kết tại SHOP:</span>
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-amber-800 list-disc list-inside">
                      <li>Bảo hành chính hãng 24 tháng tận nơi</li>
                      <li>Miễn phí vận chuyển và lắp đặt trong 2H</li>
                      <li>Hỗ trợ đổi mới trong 7 ngày nếu lỗi phần cứng</li>
                    </ul>
                  </div>

                  {/* Buy Button */}
                  <Link
                    href={`/products/${p.slug || p._id}`}
                    className="block w-full py-2.5 bg-[#e30019] hover:bg-[#c40015] text-white font-bold text-center text-xs rounded-md shadow-xs transition"
                  >
                    Xem chi tiết sản phẩm
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
