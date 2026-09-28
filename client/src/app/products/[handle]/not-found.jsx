import React from 'react';
import Link from 'next/link';
import { PackageX, Home, Search } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50/60">
      <div className="max-w-md w-full bg-white rounded-[6px] border border-slate-200 p-8 text-center shadow-xs flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-[6px] bg-red-50 text-red-600 flex items-center justify-center">
          <PackageX size={32} />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Sản phẩm bạn đang tìm kiếm có thể đã ngừng kinh doanh, đổi tên hoặc đường dẫn không chính xác.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-[6px] bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition-colors active:scale-[0.98] shadow-xs"
          >
            <Home size={15} />
            <span>Về trang chủ</span>
          </Link>
          <Link
            href="/search"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-[6px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors active:scale-[0.98]"
          >
            <Search size={15} />
            <span>Tìm kiếm sản phẩm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
