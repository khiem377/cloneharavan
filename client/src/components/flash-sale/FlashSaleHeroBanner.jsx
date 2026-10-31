'use client';

import React from 'react';

export default function FlashSaleHeroBanner({
  bannerUrl,
  bannerAlt = 'Flash Sale Banner',
}) {
  if (!bannerUrl) return null;

  return (
    <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 mt-4 sm:mt-5">
      <div className="w-full rounded-[6px] overflow-hidden border border-slate-200 bg-white shadow-2xs">
        <img
          src={bannerUrl}
          alt={bannerAlt}
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}


