'use client';

import React from 'react';
import Link from 'next/link';
import { PackageCheck, ShoppingBag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMarkdown from './ChatMarkdown';
import ChatProductCard from './ChatProductCard';
import ChatOrderLookup from './ChatOrderLookup';
import MascotBot from './MascotBot';

export default function ChatMessageItem({
  msg,
  loading,
  onSelectOrderTracking,
  onSelectOnlineShopping,
  onSelectProduct,
}) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start items-start'}`}>
      {/* Avatar của bot bên trái tin nhắn (hình tròn) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-900 shrink-0 self-start mt-0.5 shadow-2xs flex items-center justify-center">
          <MascotBot size={28} isWaving={false} />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bong bóng tin nhắn bo tròn 6px theo Design System */}
        <div
          className={`p-3 text-xs sm:text-[13px] leading-relaxed select-text shadow-xs ${
            isUser
              ? 'bg-[#284ea1] text-white rounded-[6px]'
              : 'bg-white text-slate-800 border border-slate-200/90 rounded-[6px] w-full'
          }`}
        >
          {/* Tin nhắn người dùng: chữ TRẮNG TUYỆT ĐỐI trên nền Navy, font rõ nét, dễ đọc */}
          {isUser ? (
            <div className="text-white text-xs sm:text-[13px] leading-relaxed select-text whitespace-pre-wrap font-medium">
              {msg.text}
            </div>
          ) : (
            <div className="relative">
              <ChatMarkdown text={msg.text} />
              {msg.streaming && msg.text && (
                <span className="inline-block w-1.5 h-3 bg-[#284ea1] ml-1 rounded-[2px] animate-pulse align-baseline" />
              )}
            </div>
          )}

          {/* Các lựa chọn dạng nút rounded-[6px] */}
          {msg.hasOptions && (
            <div className="mt-3.5 space-y-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onSelectOrderTracking}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-[6px] border border-slate-700 bg-white hover:bg-[#edf2fa] hover:border-[#284ea1] text-slate-900 hover:text-[#284ea1] text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-2xs h-auto"
              >
                <PackageCheck className="size-4 text-slate-700" />
                <span>Tra cứu đơn hàng của tôi</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onSelectOnlineShopping}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-[6px] border border-slate-700 bg-white hover:bg-[#edf2fa] hover:border-[#284ea1] text-slate-900 hover:text-[#284ea1] text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-2xs h-auto"
              >
                <ShoppingBag className="size-4 text-slate-700" />
                <span>Hỗ trợ mua hàng trực tuyến</span>
              </Button>
            </div>
          )}

          {/* Khung tra cứu đơn hàng trực tiếp trong tin nhắn bot */}
          {msg.showOrderLookup && (
            <div className="mt-3">
              <ChatOrderLookup onSelect={onSelectProduct} />
            </div>
          )}

          {/* Nút hành động trực tiếp nếu có */}
          {msg.actionLink && (
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <Link
                href={msg.actionLink.url}
                onClick={onSelectProduct}
                className="w-full"
              >
                <Button
                  type="button"
                  className="w-full bg-[#284ea1] hover:bg-[#1e3b82] text-white text-xs font-semibold py-2 px-4 rounded-[6px] transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs h-auto"
                >
                  <span>{msg.actionLink.text}</span>
                  <ExternalLink className="size-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Dòng ghi chú phụ nếu có */}
          {msg.secondaryText && (
            <p className="mt-2 text-slate-600 text-[11px] leading-relaxed">
              {msg.secondaryText}
            </p>
          )}

          {/* Hiệu ứng gõ chữ bot đang phản hồi khi chưa có ký tự nào */}
          {msg.streaming && !msg.text && (
            <div className="flex items-center gap-1.5 py-1 text-slate-500">
              <span className="w-1.5 h-1.5 bg-[#284ea1] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#284ea1] rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#284ea1] rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          )}
        </div>

        {/* 
          DANH SÁCH THẺ SẢN PHẨM:
          Chỉ hiển thị sau khi AI đã gõ xong toàn bộ tin nhắn để tạo cảm giác tự nhiên như người/AI tư vấn
        */}
        {!msg.streaming && msg.products && msg.products.length > 0 && (
          <div className="w-full space-y-2 mt-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-[11px] font-semibold text-slate-600 block px-1">
              Sản phẩm đề xuất:
            </span>
            {msg.products.map((prod) => (
              <ChatProductCard
                key={prod._id}
                product={prod}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}

        <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
      </div>
    </div>
  );
}
