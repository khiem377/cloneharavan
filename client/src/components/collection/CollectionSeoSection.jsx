'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, ShieldCheck } from 'lucide-react';

export default function CollectionSeoSection({ title = 'sản phẩm' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200/90 p-5 sm:p-7 shadow-2xs mt-8 relative overflow-hidden">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-red-50 text-[#e30019] flex items-center justify-center shrink-0">
          <Sparkles size={16} />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
          Khám phá thế giới công nghệ sống động cùng các dòng {title} hiện đại
        </h2>
      </div>

      {/* Content wrapper with collapse */}
      <div
        className={`relative text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3 transition-all duration-300 ${
          isExpanded ? 'max-h-none' : 'max-h-36 overflow-hidden'
        }`}
      >
        <p>
          Mang cả thế giới giải trí và tiện nghi về ngôi nhà của bạn với những thiết bị {title} đỉnh cao.
          Từ các công nghệ hiển thị tiên tiến nhất như OLED, QLED, độ phân giải 4K, 8K cho đến các tính năng
          tiết kiệm năng lượng thông minh, mỗi sản phẩm đều được chế tác tỉ mỉ để đáp ứng trọn vẹn mọi nhu cầu sống hiện đại.
        </p>

        <h3 className="font-bold text-gray-900 text-xs sm:text-sm pt-1">
          Ưu điểm vượt trội khi mua sắm {title} tại SHOP:
        </h3>
        <ul className="list-disc list-inside space-y-1.5 pl-1 text-gray-600">
          <li>
            <strong className="text-gray-800">100% Sản phẩm chính hãng:</strong> Đầy đủ hóa đơn VAT, chứng nhận nguồn gốc xuất xứ CO/CQ từ các thương hiệu hàng đầu.
          </li>
          <li>
            <strong className="text-gray-800">Bảo hành chính hãng tận nhà:</strong> Đội ngũ kỹ thuật viên được đào tạo bài bản, hỗ trợ xử lý và kích hoạt bảo hành điện tử nhanh chóng.
          </li>
          <li>
            <strong className="text-gray-800">Giao hàng & Lắp đặt siêu tốc:</strong> Hỗ trợ giao nhanh trong vòng 2 giờ cho khu vực nội thành, miễn phí công lắp đặt cơ bản.
          </li>
          <li>
            <strong className="text-gray-800">Chính sách trả góp 0% linh hoạt:</strong> Thủ tục đơn giản qua thẻ tín dụng hoặc công ty tài chính, duyệt hồ sơ trong 15 phút.
          </li>
        </ul>

        <p>
          Dù bạn đang tìm kiếm thiết bị cho phòng khách sang trọng, phòng ngủ ấm cúng hay không gian làm việc chuyên nghiệp,
          SHOP luôn có những lựa chọn hoàn hảo với mức giá cạnh tranh nhất thị trường.
        </p>

        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-white via-white/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse Button */}
      <div className="pt-3 text-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e30019] hover:text-[#c40015] bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-full transition cursor-pointer"
        >
          <span>{isExpanded ? 'Thu gọn nội dung' : 'Xem thêm nội dung'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    </div>
  );
}
