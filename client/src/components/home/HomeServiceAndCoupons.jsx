'use client';

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, Info } from 'lucide-react';

// ─── 4 BESPOKE, ULTRA-DETAILED, SHARP MODERN BLACK ICONS ───
const SERVICE_FEATURES = [
  {
    id: 'express-delivery',
    title: 'Giao hỏa tốc',
    desc: 'Nội thành TP. HCM trong 4h',
    svgIcon: (
      <svg className="w-8 h-8 text-black" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Forward supersonic speed streaks */}
        <path d="M1.5 11H7M1 18H5M1.5 25H7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        {/* Aerodynamic supersonic stealth craft body */}
        <path
          d="M8 8.5C8 7.12 9.12 6 10.5 6H21C22.1 6 23.1 6.5 23.8 7.4L30 14.5C30.6 15.2 31 16.1 31 17V24.5C31 25.88 29.88 27 28.5 27H26"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 12.5V27H10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        {/* Slanted stealth cockpit windshield with reflection */}
        <path d="M20 8.5H22.5L27.5 14.5H20V8.5Z" fill="currentColor" />
        <path d="M23 9.5L26.5 13.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        {/* Mag-lev turbine wheel 1 with concentric rings */}
        <circle cx="14" cy="26.5" r="4" fill="currentColor" />
        <circle cx="14" cy="26.5" r="2" fill="white" />
        <circle cx="14" cy="26.5" r="0.8" fill="currentColor" />
        {/* Mag-lev turbine wheel 2 with concentric rings */}
        <circle cx="23.5" cy="26.5" r="4" fill="currentColor" />
        <circle cx="23.5" cy="26.5" r="2" fill="white" />
        <circle cx="23.5" cy="26.5" r="0.8" fill="currentColor" />
        {/* Supersonic lightning blade piercing cargo hull */}
        <path
          d="M16 10.5L13 15.5H18L15 21"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'free-return',
    title: 'Đổi trả miễn phí',
    desc: 'Trong vòng 30 ngày miễn phí',
    svgIcon: (
      <svg className="w-8 h-8 text-black" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Upper continuous orbit arc with arrow */}
        <path d="M29 13.5C28 7.5 23 3 17 3C10.2 3 4.5 8.2 4 15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M24 14H29.5V8.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Lower continuous orbit arc with arrow */}
        <path d="M7 22.5C8 28.5 13 33 19 33C25.8 33 31.5 27.8 32 21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M12 22H6.5V27.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Central multifaceted shield guarantee seal */}
        <path d="M18 9L24.5 12V18C24.5 22.5 18 25.5 18 25.5C18 25.5 11.5 22.5 11.5 18V12L18 9Z" fill="currentColor" />
        {/* Sharp victory checkmark inside seal */}
        <path d="M15 17.5L17 19.5L21.5 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Orbiting security star */}
        <path d="M31 5V9M29 7H33" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'support-247',
    title: 'Hỗ trợ 24/7',
    desc: 'Hỗ trợ khách hàng 24/7',
    svgIcon: (
      <svg className="w-8 h-8 text-black" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dual architectural headband arch with tension cushion */}
        <path d="M5.5 17C5.5 9.8 11.1 4 18 4C24.9 4 30.5 9.8 30.5 17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M11 6C13.1 5 15.5 4.5 18 4.5C20.5 4.5 22.9 5 25 6" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        {/* Precision CNC earcups with acoustic bevels */}
        <rect x="3" y="15" width="6" height="11" rx="3" fill="currentColor" />
        <rect x="27" y="15" width="6" height="11" rx="3" fill="currentColor" />
        <circle cx="6" cy="20.5" r="1.2" fill="white" />
        <circle cx="30" cy="20.5" r="1.2" fill="white" />
        {/* Boom microphone with glowing tip */}
        <path d="M29 23V26.5C29 28.5 27.5 30 25.5 30H20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="17.5" cy="30" r="2" fill="currentColor" />
        <circle cx="17.5" cy="30" r="0.8" fill="white" />
        {/* Dynamic soundwave equalizer (5 precision bars) */}
        <path d="M12.5 17V22M15.2 14V25M18 11V28M20.8 14V25M23.5 17V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'hot-deals',
    title: 'Deal hot bùng nổ',
    desc: 'Flash sale giảm giá cực sốc',
    svgIcon: (
      <svg className="w-8 h-8 text-black" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Multi-layered faceted geometric flame */}
        <path
          d="M18 2C18 2 22 7 20.5 12C24 9.5 27.5 12 27.5 17.5C27.5 24.5 22 29.5 15.5 29.5C9 29.5 5 24.5 5 18C5 12.5 9 7.5 9 7.5C9 7.5 12 10.5 13.5 10.5C15.8 10.5 18 2 18 2Z"
          fill="currentColor"
        />
        {/* Sharp negative space lightning bolt */}
        <path
          d="M17.5 10.5L13 17.5H19L15 25"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Celestial 8-point diamond starburst at top right */}
        <path d="M30 2V9M26.5 5.5H33.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M27.5 3L32.5 8M32.5 3L27.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="32" cy="14" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

// Fallback coupons matching exact DB schema
const FALLBACK_COUPONS = [
  {
    _id: 'c1',
    name: 'Mã Chào Bạn Mới',
    code: 'KHACHMOI50',
    type: 'fixed',
    value: 50000,
    minOrderValue: 200000,
    maxDiscount: null,
    description: 'Giảm 50K cho đơn hàng từ 200K dành riêng cho khách hàng mới',
    endDate: '2026-12-31T23:59:59.999Z',
  },
  {
    _id: 'c2',
    name: 'Giảm 15% Đơn Công Nghệ',
    code: 'SALE15',
    type: 'percent',
    value: 15,
    minOrderValue: 500000,
    maxDiscount: 150000,
    description: 'Giảm 15% cho đơn hàng có giá trị tối thiểu 500K (Tối đa 150K)',
    endDate: '2026-12-31T23:59:59.999Z',
  },
  {
    _id: 'c3',
    name: 'Siêu Giảm Giá 30%',
    code: 'EGA30',
    type: 'percent',
    value: 30,
    minOrderValue: 1500000,
    maxDiscount: 300000,
    description: 'Giảm 30% cho đơn hàng giá trị tối thiểu 1.500K (Tối đa 300K)',
    endDate: '2026-12-31T23:59:59.999Z',
  },
  {
    _id: 'c4',
    name: 'Miễn Phí Vận Chuyển',
    code: 'FSHIP',
    type: 'fixed',
    value: 35000,
    minOrderValue: 0,
    maxDiscount: null,
    description: 'Miễn phí vận chuyển toàn quốc cho mọi đơn hàng không điều kiện',
    endDate: '2026-12-31T23:59:59.999Z',
  },
  {
    _id: 'c5',
    name: 'Đại Tiệc Điện Máy VIP',
    code: 'VIP1TR',
    type: 'fixed',
    value: 1000000,
    minOrderValue: 10000000,
    maxDiscount: null,
    description: 'Giảm ngay 1.000.000đ cho đơn hàng giá trị tối thiểu 10 triệu',
    endDate: '2026-12-31T23:59:59.999Z',
  },
  {
    _id: 'c6',
    name: 'Tri Ân Khách Hàng',
    code: 'TRIAN10',
    type: 'percent',
    value: 10,
    minOrderValue: 0,
    maxDiscount: null,
    description: 'Giảm 10% toàn bộ đơn hàng, không giới hạn đơn tối thiểu, không trần giảm',
    endDate: '2026-12-31T23:59:59.999Z',
  },
];

export default function HomeServiceAndCoupons({ initialCoupons = [] }) {
  const coupons = initialCoupons && initialCoupons.length > 0 ? initialCoupons : FALLBACK_COUPONS;
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {SERVICE_FEATURES.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-3.5 group cursor-default ${idx > 1 ? 'pt-3 sm:pt-0' : ''
                } ${idx > 0 ? 'sm:pl-6' : ''}`}
            >
              {/* Tech-Luxury Icon Box with Sharp Hover Elevation */}
              <div className="shrink-0 size-13 rounded-2xl bg-slate-100/90 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-2xs">
                {item.svgIcon}
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

      {/* ─── HOVER FLOATING TOOLTIP (Hiển thị nổi cố định, không bị che khuất) ─── */}
      {hoveredTooltip && (
        <div
          style={{ top: hoveredTooltip.top, left: hoveredTooltip.left }}
          className="fixed z-50 w-52 p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-xs text-white text-[10px] leading-relaxed shadow-xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <p className="font-bold text-amber-300 text-[11px] mb-0.5">
            {hoveredTooltip.name}
          </p>
          <p className="text-slate-200">
            {hoveredTooltip.summary}
          </p>
          <p className="text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
            * Không áp dụng đồng thời với Flash Sale
          </p>
        </div>
      )}
    </section>
  );
}
