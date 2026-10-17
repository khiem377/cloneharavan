import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';

export default function CheckoutFooterAndLanguageCard({
  footerContent = '',
  language = 'vi',
  onChangeFooter,
  onChangeLanguage,
}) {
  const [editingLang, setEditingLang] = useState(false);

  return (
    <div className="space-y-6">
      {/* 5. NỘI DUNG CHÂN TRANG THANH TOÁN */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-2">
        <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground">Nội dung chân trang thanh toán</h3>
        <textarea
          rows={3}
          value={footerContent || ''}
          onChange={(e) => onChangeFooter(e.target.value)}
          placeholder="Nhập nội dung"
          className="w-full text-[13px] p-2.5 rounded-[4px] border border-[#c4cdd5] dark:border-border bg-white dark:bg-background focus:outline-none focus:border-[#0088ff] text-[#212b36] dark:text-foreground placeholder-[#919eab] dark:placeholder-muted-foreground"
        />
        <p className="text-[12px] text-[#637381] dark:text-muted-foreground">
          Nội dung này chỉ hiển thị ở chân trang thanh toán và trang đặt hàng thành công.
        </p>
      </div>

      {/* 6. NGÔN NGỮ TRANG THANH TOÁN */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground">Ngôn ngữ trang thanh toán</h3>
          <button
            type="button"
            onClick={() => setEditingLang(!editingLang)}
            className="text-[12.5px] text-[#0088ff] dark:text-[#38bdf8] hover:underline font-medium inline-flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa</span>
          </button>
        </div>

        {editingLang ? (
          <div className="pt-1">
            <select
              value={language}
              onChange={(e) => {
                onChangeLanguage(e.target.value);
                setEditingLang(false);
              }}
              className="h-9 px-3 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[4px] bg-white dark:bg-background text-[#212b36] dark:text-foreground focus:border-[#0088ff] focus:outline-none"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English (Tiếng Anh)</option>
            </select>
          </div>
        ) : (
          <div className="text-[13px] text-[#212b36] dark:text-foreground">
            Ngôn ngữ đang sử dụng:{' '}
            <span className="font-semibold text-[#0088ff] dark:text-[#38bdf8]">
              {language === 'en' ? 'English' : 'Tiếng Việt'}
            </span>
          </div>
        )}
      </div>

      {/* TÌM HIỂU THÊM VỀ CẤU HÌNH TRANG THANH TOÁN */}
      <div className="text-center text-[12.5px] text-[#637381] dark:text-muted-foreground pt-1">
        Tìm hiểu thêm về{' '}
        <a
          href="#help-checkout"
          onClick={(e) => {
            e.preventDefault();
            alert('Trang hướng dẫn cấu hình trang thanh toán: Cung cấp đầy đủ các tùy chọn bước thanh toán, tài khoản khách hàng, trường dữ liệu địa chỉ và chính sách mua hàng.');
          }}
          className="text-[#0088ff] dark:text-[#38bdf8] hover:underline font-medium"
        >
          cấu hình trang thanh toán
        </a>
      </div>
    </div>
  );
}
