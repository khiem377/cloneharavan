'use client';

import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  {
    title: 'Smart Tivi',
    handle: 'smart-tv',
    image: '/images/categories/tivi.jpg?v=3',
  },
  {
    title: 'Tủ lạnh',
    handle: 'tu-lanh',
    image: '/images/categories/tu-lanh.jpg?v=3',
  },
  {
    title: 'Máy giặt & Sấy',
    handle: 'may-giat-may-say',
    image: '/images/categories/may-giat.jpg?v=3',
  },
  {
    title: 'Loa & Âm thanh',
    handle: 'loa-am-thanh',
    image: '/images/categories/loa-am-thanh.jpg?v=3',
  },
  {
    title: 'Điều hòa làm mát',
    handle: 'may-lanh-dieu-hoa',
    image: '/images/categories/dieu-hoa.jpg?v=3',
  },
  {
    title: 'Gia dụng nhà bếp',
    handle: 'gia-dung-nha-bep',
    image: '/images/categories/gia-dung-bep.jpg?v=3',
  },
  {
    title: 'Gia dụng sắc màu',
    handle: 'gia-dung-sac-mau',
    image: '/images/categories/gia-dung-sac-mau.jpg?v=3',
  },
];

export default function CollectionCategoryShowcase() {
  return (
    <section className="mt-12 mb-8">
      {/* Title */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Danh mục sản phẩm
        </h2>
        <div className="w-12 h-1 bg-[#e30019] mx-auto mt-2 rounded-full" />
      </div>

      {/* Modern Product Image Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.handle}
            href={`/collections/${cat.handle}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            {/* Elegant Rounded Image Card Container with real photo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 border border-slate-200 shadow-2xs group-hover:shadow-md group-hover:border-[#e30019]/60 group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center overflow-hidden">
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-contain rounded-xl group-hover:scale-108 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Title */}
            <span className="mt-2.5 text-xs sm:text-[13px] font-semibold text-slate-800 group-hover:text-[#e30019] transition-colors text-center line-clamp-2 max-w-[100px] leading-tight">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
