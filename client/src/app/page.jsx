import React from 'react';
import HomeHeroBannerSlider from '@/components/home/HomeHeroBannerSlider';
import HomeFlashSaleSection from '@/components/home/HomeFlashSaleSection';
import flashSaleService from '@/services/flashSale.service';

export default async function HomePage() {
  const activeSale = await flashSaleService.getServerActiveFlashSale();

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Hero Banner Slider (Chỉ có ở trang chủ) */}
      <HomeHeroBannerSlider />

      {/* Flash Sale Section (Phong Vũ Inspired) */}
      <HomeFlashSaleSection initialData={activeSale} />
    </main>
  );
}
