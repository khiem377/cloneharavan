import React from 'react';

/**
 * Component mô phỏng huy hiệu Google reCAPTCHA v2 chuẩn 100% như Sapo (Ảnh 4)
 */
export default function RecaptchaBadge() {
  return (
    <div className="bg-white rounded-[3px] border border-[#d3d3d3] p-2.5 flex items-center justify-between gap-3 mb-2.5 shadow-xs select-none">
      {/* KHỐI BÊN TRÁI: CHECKBOX XANH LÁ + TEXT XÁC NHẬN CON NGƯỜI */}
      <div className="flex items-center gap-2.5">
        <div className="w-[22px] h-[22px] rounded-[2px] border border-[#c1c1c1] bg-white flex items-center justify-center shrink-0 shadow-inner">
          <svg
            className="w-3.5 h-3.5 text-[#00a862]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-[12px] font-normal text-[#222] font-sans">
          Tôi không phải là người máy
        </span>
      </div>

      {/* KHỐI BÊN PHẢI: LOGO GOOGLE RECAPTCHA CHUẨN VECTOR */}
      <div className="flex flex-col items-center justify-center shrink-0 pl-1 border-l border-slate-100">
        <svg
          className="w-6 h-6"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cánh cung xanh dương đậm */}
          <path
            d="M32 8C18.75 8 8 18.75 8 32c0 3.8 0.9 7.4 2.5 10.6l6.3-3.6C15.6 36.6 15 34.4 15 32c0-9.4 7.6-17 17-17 3.4 0 6.5 1 9.1 2.7l4.9-4.9C42.4 10.2 37.5 8 32 8z"
            fill="#1A73E8"
          />
          {/* Cánh cung xanh nhạt */}
          <path
            d="M53.4 21.4l-6.3 3.6c1.2 2.2 1.8 4.6 1.8 7 0 9.4-7.6 17-17 17-3.4 0-6.5-1-9.1-2.7l-4.9 4.9C21.6 53.8 26.5 56 32 56c13.25 0 24-10.75 24-24 0-3.8-0.9-7.4-2.6-10.6z"
            fill="#4285F4"
          />
          {/* Mũi tên xanh nhạt trên */}
          <path d="M22 28.5L12.5 19 3 28.5h19z" fill="#4285F4" />
          {/* Mũi tên xám/xanh dưới */}
          <path d="M42 35.5L51.5 45 61 35.5H42z" fill="#1A73E8" />
        </svg>
        <span className="text-[8px] font-bold text-[#555] tracking-tight uppercase leading-none mt-0.5">
          reCAPTCHA
        </span>
        <div className="flex items-center gap-0.5 text-[6px] text-[#777] leading-none mt-0.5">
          <span>Bảo mật</span>
          <span>-</span>
          <span>Điều khoản</span>
        </div>
      </div>
    </div>
  );
}
