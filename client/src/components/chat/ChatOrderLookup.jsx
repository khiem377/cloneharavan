'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PackageCheck, Search, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ChatOrderLookup({ onSelect }) {
  const [orderCode, setOrderCode] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = (e) => {
    e?.preventDefault();
    setError('');

    const cleanCode = orderCode.trim();
    if (!cleanCode) {
      setError('Vui lòng nhập mã đơn hàng của anh/chị.');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      // Giả lập kết quả tra cứu đơn hàng thực tế
      setSearchedOrder({
        code: cleanCode.toUpperCase(),
        contact: contactInfo.trim() || 'Tài khoản hiện tại',
        status: 'Đang xử lý & đóng gói',
        statusType: 'processing',
        estimateDelivery: '1 - 3 ngày làm việc',
        note: 'Đơn hàng đang được bộ phận kho chuẩn bị và bàn giao cho đơn vị vận chuyển.',
      });
    }, 400);
  };

  return (
    <div className="rounded-[6px] border border-slate-200 bg-white p-3.5 space-y-3 shadow-xs">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <PackageCheck className="size-4 text-[#284ea1]" />
        <span className="text-xs sm:text-[13px] font-bold text-slate-900">
          Tra cứu thông tin đơn hàng
        </span>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed">
        Anh/chị vui lòng nhập mã đơn hàng cùng số điện thoại hoặc email đặt hàng vào khung yêu cầu bên dưới:
      </p>

      {!searchedOrder ? (
        <form onSubmit={handleLookup} className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Mã đơn hàng <span className="text-[#e30019]">*</span>
            </label>
            <Input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="Nhập mã đơn hàng (Ví dụ: DH10023, ORD-89...)"
              className="text-xs h-9 rounded-[6px] border-slate-200 focus-visible:border-[#284ea1] focus-visible:ring-[#284ea1] font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Số điện thoại hoặc Email <span className="text-[#e30019]">*</span>
            </label>
            <Input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Nhập số điện thoại hoặc email trên đơn hàng"
              className="text-xs h-9 rounded-[6px] border-slate-200 focus-visible:border-[#284ea1] focus-visible:ring-[#284ea1]"
            />
          </div>

          {error && (
            <p className="text-[11px] text-[#e30019] flex items-center gap-1 font-medium">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <Button
            type="submit"
            disabled={isSearching}
            className="w-full bg-[#284ea1] hover:bg-[#1e3b82] text-white text-xs font-semibold py-2 px-4 rounded-[6px] transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs h-9 mt-1"
          >
            <Search className="size-3.5" />
            <span>{isSearching ? 'Đang kiểm tra...' : 'Tra cứu đơn hàng'}</span>
          </Button>
        </form>
      ) : (
        <div className="rounded-[6px] bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 font-mono">Mã đơn: {searchedOrder.code}</span>
            <span className="text-[10px] font-bold text-white bg-[#284ea1] px-2 py-0.5 rounded-[4px]">
              {searchedOrder.status}
            </span>
          </div>

          <div className="space-y-1 text-slate-600 text-[11px]">
            <p className="flex items-center gap-1">
              <Clock className="size-3 text-slate-400 shrink-0" />
              <span>Dự kiến giao: {searchedOrder.estimateDelivery}</span>
            </p>
            <p className="leading-snug text-slate-700 pt-0.5">
              {searchedOrder.note}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchedOrder(null);
                setOrderCode('');
              }}
              className="text-[11px] text-[#284ea1] hover:underline font-medium cursor-pointer"
            >
              Tra cứu đơn khác
            </button>
          </div>
        </div>
      )}

      {/* Liên kết trực tiếp trang Đơn hàng của tôi */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Đã đăng nhập tài khoản?</span>
        <Link
          href="/tai-khoan?tab=orders"
          onClick={onSelect}
          className="text-[11px] text-[#284ea1] font-semibold hover:underline inline-flex items-center gap-1"
        >
          <span>Xem tất cả đơn hàng</span>
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  );
}
