import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import brandServerService from '@/services/brand.server.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Thương hiệu chính hãng — SHOP',
  description: 'Danh sách các đối tác thương hiệu phân phối chính hãng tại hệ thống SHOP.',
};

export default async function BrandsPage() {
  const brands = await brandServerService.getBrands();
  const validBrands = (brands || []).filter((b) => b && (b.name || b.slug));

  return (
    <div className="min-h-[100dvh] bg-slate-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">Thương hiệu chính hãng</span>
        </nav>

        {/* Page Title Header - Tối giản, chuyên nghiệp, không icon rườm rà */}
        <div className="bg-white rounded-[6px] border border-slate-200 p-5 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Thương hiệu đối tác chính hãng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cam kết 100% sản phẩm có nguồn gốc xuất xứ rõ ràng và chính sách bảo hành chính hãng
          </p>
        </div>

        {/* Brands Grid - Chuyển hướng trực tiếp sang /search?brand=... */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {validBrands.map((brand) => {
            const logoUrl = brand.logo?.url || (typeof brand.logo === 'string' ? brand.logo : '');
            const targetSlug = brand.slug || brand._id;

            return (
              <Link
                key={brand._id || targetSlug}
                href={`/search?brand=${encodeURIComponent(targetSlug)}`}
                className="group bg-white rounded-[6px] border border-slate-200 hover:border-slate-400 p-4 flex flex-col items-center justify-center gap-2 text-center transition-all duration-150 active:scale-[0.98]"
              >
                <div className="relative w-full h-12 flex items-center justify-center">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={brand.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 120px, 160px"
                      className="object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-800 uppercase">
                      {brand.name}
                    </span>
                  )}
                </div>

                <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 truncate">
                    {brand.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
