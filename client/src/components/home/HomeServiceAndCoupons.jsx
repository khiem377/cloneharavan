'use client';

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, Info } from 'lucide-react';
import Icon from '@/components/common/Icon';

const SERVICE_FEATURES = [
  {
    id: 'express-delivery',
    iconName: 'express-delivery',
    title: 'Giao hỏa tốc',
    desc: 'Nội thành TP. HCM trong 4h',
  },
  {
    id: 'free-return',
    iconName: 'free-return',
    title: 'Đổi trả miễn phí',
    desc: 'Trong vòng 30 ngày miễn phí',
  },
  {
    id: 'support-247',
    iconName: 'support-247',
    title: 'Hỗ trợ 24/7',
    desc: 'Hỗ trợ khách hàng 24/7',
  },
  {
    id: 'hot-deals',
    iconName: 'hot-deals',
    title: 'Deal hot bùng nổ',
    desc: 'Flash sale giảm giá cực sốc',
  },
];

export default function HomeServiceAndCoupons({ initialCoupons = [] }) {
  const coupons = initialCoupons;
  const [copiedCode, setCopiedCode] = useState(null);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  // ─── HIỆU ỨNG VUỐT CHUỘT NGANG (Horizontal Mouse Drag-to-Scroll) ───
  const scrollRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.35;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
      if (!isDragging) setIsDragging(true);
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  const handleCopy = (code) => {
    if (!code) return;

    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2000);
  };

  const handleConditionMouseEnter = (e, coupon) => {
    if (hasDraggedRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const summary =
      coupon.description ||
      (coupon.minOrderValue > 0
        ? `Giảm ${coupon.type === 'percent' ? coupon.value + '%' : (coupon.value / 1000) + 'K'} cho đơn từ ${(coupon.minOrderValue / 1000).toLocaleString('vi-VN')}K.`
        : `Giảm ${coupon.type === 'percent' ? coupon.value + '%' : (coupon.value / 1000) + 'K'} cho mọi đơn hàng.`);

    setHoveredTooltip({
      name: coupon.name,
      summary,
      top: rect.bottom + 6,
      left: Math.max(12, Math.min(rect.right - 190, window.innerWidth - 220)),
    });
  };

  const handleConditionMouseLeave = () => {
    setHoveredTooltip(null);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-5">
      {/* ─── ROW 1: 4 DỊCH VỤ VỚI ICON ĐEN ĐỘC QUYỀN, SẮC SẢO, CHI TIẾT ─── */}
      <div className="bg-white rounded-[6px] p-4 sm:p-5 border border-slate-200 mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {SERVICE_FEATURES.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 group cursor-default ${idx > 1 ? 'pt-3 sm:pt-0' : ''} ${idx > 0 ? 'sm:pl-6' : ''}`}
            >
              <div className="shrink-0 size-12 rounded-[6px] bg-slate-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-200">
                <Icon name={item.iconName} size={28} color="currentColor" />
              </div>

              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase group-hover:text-black transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ROW 2: TICKET VOUCHERS (BỐ CỤC CHUẨN GỌN GÀNG, KHÔNG THỪA THÃI, 2 VẾT CẮT KHUYẾT THẬT) ─── */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-4 bg-black rounded-full inline-block" />
              MÃ GIẢM GIÁ & VOUCHER ĐỘC QUYỀN
            </h2>
            {/* <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Vuốt chuột ngang để xem thêm mã • Rê chuột vào điều kiện để xem chi tiết
            </p> */}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Voucher trước"
              className="size-7 rounded-full bg-white border border-slate-200 hover:bg-slate-100 shadow-2xs flex items-center justify-center text-slate-800 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Voucher tiếp theo"
              className="size-7 rounded-full bg-white border border-slate-200 hover:bg-slate-100 shadow-2xs flex items-center justify-center text-slate-800 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ─── DRAGGABLE SCROLL CONTAINER (Vuốt chuột ngang mượt mà) ─── */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {coupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;

            return (
              <div
                key={coupon._id || coupon.code}
                className="shrink-0 w-[275px] sm:w-[285px] h-[106px] relative group hover:-translate-y-0.5 transition-transform duration-200"
              >
                {/* ─── NỀN VÉ SVG VỚI 2 VẾT CẮT KHUYẾT NỬA VÒNG TRÒN THẬT 100% ─── */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:drop-shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-all duration-200"
                  viewBox="0 0 285 106"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Đường viền và nền vé với 2 vết cắt khuyết hình tròn ở mép trên và mép dưới (X = 82) */}
                  <path
                    d="M 14 0 
                       L 73.5 0 
                       A 8.5 8.5 0 0 0 90.5 0 
                       L 271 0 
                       A 14 14 0 0 1 285 14 
                       L 285 92 
                       A 14 14 0 0 1 271 106 
                       L 90.5 106 
                       A 8.5 8.5 0 0 0 73.5 106 
                       L 14 106 
                       A 14 14 0 0 1 0 92 
                       L 0 14 
                       A 14 14 0 0 1 14 0 
                       Z"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1.2"
                  />
                  {/* Đường xé vé đứt nét ở giữa 2 vết khuyết */}
                  <line
                    x1="82"
                    y1="12"
                    x2="82"
                    y2="94"
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                </svg>

                {/* ─── NỘI DUNG VÉ NẰM TRÊN NỀN SVG (Z-10) ─── */}
                <div className="relative z-10 w-full h-full flex">
                  {/* CUỐNG VÉ TRÁI: Chỉ hiển thị Mã Code to rõ, gọn gàng đúng chuẩn */}
                  <div className="w-[82px] h-full p-2 flex items-center justify-center shrink-0">
                    <span className="font-mono font-black text-xs sm:text-[13px] text-slate-900 tracking-wider uppercase text-center break-all">
                      {coupon.code}
                    </span>
                  </div>

                  {/* THÂN VÉ PHẢI: Thông tin mô tả, điều kiện và nút Lưu mã */}
                  <div className="flex-1 h-full py-2.5 pr-3 pl-2.5 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Dòng mô tả ngắn gọn từ Database */}
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                        {coupon.description || coupon.name}
                      </p>

                      {/* Nút Điều kiện với Hover Tooltip */}
                      <div className="mt-1">
                        <button
                          type="button"
                          onMouseEnter={(e) => handleConditionMouseEnter(e, coupon)}
                          onMouseLeave={handleConditionMouseLeave}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-[10px] flex items-center gap-0.5 cursor-help"
                        >
                          <Info size={11} />
                          <span>Điều kiện</span>
                        </button>
                      </div>
                    </div>

                    {/* Dòng dưới: Hạn dùng bên trái & Nút Lưu mã bên phải */}
                    <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-slate-100/80">
                      <span className="text-slate-400 font-medium">
                        {formatDate(coupon.endDate)}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasDraggedRef.current) return;
                          handleCopy(coupon.code);
                        }}
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-black hover:text-white text-slate-800 border border-slate-200'
                          }`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={10} />
                            <span>Đã lưu</span>
                          </>
                        ) : (
                          <span>Lưu mã</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredTooltip && (
        <div
          style={{ top: hoveredTooltip.top, left: hoveredTooltip.left }}
          className="fixed z-50 w-52 p-3 rounded-[6px] bg-slate-900 text-white text-[10px] leading-relaxed shadow-sm border border-slate-700 pointer-events-none"
        >
          <p className="font-bold text-amber-300 text-[11px] mb-1">
            {hoveredTooltip.name}
          </p>
          <p className="text-slate-300">
            {hoveredTooltip.summary}
          </p>
          <p className="text-[9px] text-slate-500 mt-1 pt-1 border-t border-slate-700">
            * Không áp dụng đồng thời với Flash Sale
          </p>
        </div>
      )}
    </section>
  );
}
