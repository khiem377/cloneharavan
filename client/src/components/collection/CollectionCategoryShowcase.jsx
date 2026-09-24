'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  Tv,
  Refrigerator,
  UtensilsCrossed,
  Smartphone,
  Palette,
  HeartPulse,
} from 'lucide-react';

const CATEGORIES = [
  {
    title: 'Sản phẩm Hot',
    handle: 'san-pham-hot',
    icon: Flame,
    color: '#e30019',
    bgColor: 'bg-red-50',
  },
  {
    title: 'Thiết bị giải trí',
    handle: 'tivi',
    icon: Tv,
    color: '#2563eb',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Thiết bị điện lạnh',
    handle: 'tu-lanh',
    icon: Refrigerator,
    color: '#0284c7',
    bgColor: 'bg-sky-50',
  },
  {
    title: 'Gia dụng nhà bếp',
    handle: 'gia-dung',
    icon: UtensilsCrossed,
    color: '#ea580c',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Thiết bị di động',
    handle: 'dien-thoai',
    icon: Smartphone,
    color: '#7c3aed',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Gia dụng sắc màu',
    handle: 'gia-dung-sac-mau',
    icon: Palette,
    color: '#db2777',
    bgColor: 'bg-pink-50',
  },
  {
    title: 'Gia dụng sức khỏe',
    handle: 'gia-dung-suc-khoe',
    icon: HeartPulse,
    color: '#059669',
    bgColor: 'bg-emerald-50',
  },
];

export default function CollectionCategoryShowcase() {
  return (
    <section className="mt-12 mb-8">
      {/* Centered Title like EGA Điện Máy */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e2b69] tracking-tight">
          Danh mục sản phẩm
        </h2>
        <div className="w-16 h-1 bg-[#e30019] mx-auto mt-2 rounded-full" />
      </div>

      {/* Circular Category Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          return (
            <Link
              key={cat.handle}
              href={`/collections/${cat.handle}`}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Gold Ring Circular Frame */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-linear-to-b from-amber-300 via-amber-400 to-amber-600 shadow-md group-hover:shadow-lg group-hover:scale-108 transition-transform duration-200">
                <div className={`w-full h-full rounded-full ${cat.bgColor} flex items-center justify-center border-2 border-white shadow-inner`}>
                  <IconComp size={24} style={{ color: cat.color }} className="group-hover:scale-110 transition-transform" />
                </div>
              </div>

              {/* Title */}
              <span className="mt-2 text-xs sm:text-[13px] font-semibold text-gray-800 group-hover:text-[#e30019] transition-colors leading-tight line-clamp-2 max-w-[90px]">
                {cat.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
