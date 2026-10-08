'use client';

import React, { useState, useRef } from 'react';

export default function ProductDescription({ product }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);

  const rawDescription = product?.description || '';

  if (!rawDescription) {
    return (
      <div className="rounded-[6px] border border-slate-200 bg-white p-5 text-sm text-slate-500 text-center">
        Chưa có mô tả chi tiết cho sản phẩm này.
      </div>
    );
  }

  return (
    <div className="rounded-[6px] border border-slate-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
      {/* Tiêu đề mục */}
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
          ĐẶC ĐIỂM NỔI BẬT & ĐÁNH GIÁ CHI TIẾT
        </h2>
      </div>

      {/* Khung nội dung có khả năng co giãn */}
      <div className="relative">
        <div
          ref={contentRef}
          className={`product-content text-slate-700 leading-relaxed transition-all duration-300 ${
            !isExpanded ? 'max-h-[480px] overflow-hidden' : 'max-h-none'
          }`}
          dangerouslySetInnerHTML={{ __html: rawDescription }}
        />

        {/* Mặt nạ làm mờ trắng ở chân nội dung khi chưa mở rộng */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Nút bấm Xem thêm / Thu gọn */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-6 py-2 rounded-[6px] border border-red-600 bg-white text-red-600 hover:bg-red-50 text-xs sm:text-sm font-bold transition-colors cursor-pointer active:scale-[0.98]"
        >
          {isExpanded ? 'Thu gọn nội dung [^]' : 'Xem thêm bài viết chi tiết [v]'}
        </button>
      </div>
    </div>
  );
}
