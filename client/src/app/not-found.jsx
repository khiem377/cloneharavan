'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ShoppingBag, PhoneCall, Search, Sparkles } from 'lucide-react';
import { MascotNotFound } from '@/components/mascot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[6px] p-6 sm:p-10 text-center shadow-2xs flex flex-col items-center">
        
        {/* Animated 404 Mascot Anty Shopy Space Explorer */}
        <div className="my-1">
          <MascotNotFound size={320} />
        </div>

        {/* Status Badge */}
        <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2 bg-rose-50 text-rose-700 border-rose-200">
          <Sparkles size={13} />
          Mã lỗi 404 — Trang không tồn tại
        </Badge>

        {/* Headline */}
        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Rất tiếc! Chúng tôi không tìm thấy trang này
        </h1>
        
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
          Địa chỉ liên kết có thể đã bị thay đổi, xóa bỏ hoặc đường dẫn URL bạn nhập chưa chính xác.
        </p>

        {/* Search Bar on 404 Page (Dribbble Best Practice) */}
        <form onSubmit={handleSearch} className="mt-6 w-full max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm điện thoại, laptop, gia dụng..."
              className="pl-10 h-10 text-xs sm:text-sm"
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm h-10 px-4 shrink-0"
          >
            Tìm kiếm
          </Button>
        </form>

        {/* CTA Buttons */}
        <div className="mt-5 flex flex-row flex-wrap items-center justify-center gap-3 w-full">
          <Link href="/">
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 h-10 gap-2"
            >
              <ShoppingBag size={15} />
              <span>Khám phá sản phẩm</span>
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              className="bg-white text-slate-700 hover:bg-slate-50 border-slate-200 font-semibold text-sm px-5 h-10 gap-2"
            >
              <Home size={15} />
              <span>Trang chủ</span>
            </Button>
          </Link>
        </div>

        {/* Suggested Quick Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 w-full">
          <p className="text-xs text-slate-400 mb-2.5 font-medium">Từ khóa được tìm kiếm nhiều nhất:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/search?q=iPhone%2016"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-[6px] font-medium transition-colors"
            >
              iPhone 16 Pro Max
            </Link>
            <Link
              href="/search?q=MacBook%20Air"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-[6px] font-medium transition-colors"
            >
              MacBook Air M3
            </Link>
            <Link
              href="/search?q=Roborock"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-[6px] font-medium transition-colors"
            >
              Roborock Q Revo
            </Link>
            <Link
              href="/search?q=Apple%20Watch"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-[6px] font-medium transition-colors"
            >
              Apple Watch S10
            </Link>
          </div>
        </div>

        {/* Support Hotline */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <PhoneCall size={13} className="text-[#e11d48]" />
          <span>Tổng đài hỗ trợ kỹ thuật:</span>
          <a
            href="tel:099999998"
            className="font-bold text-slate-900 hover:text-[#e11d48] transition-colors tabular-nums font-mono"
          >
            099999998
          </a>
          <span className="text-slate-400">(8:00 - 21:30)</span>
        </div>

      </div>
    </div>
  );
}
