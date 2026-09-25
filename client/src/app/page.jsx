import React from 'react';
import HomeHeroBannerSlider from '@/components/home/HomeHeroBannerSlider';
import HomeServiceAndCoupons from '@/components/home/HomeServiceAndCoupons';
import HomeFlashSaleSection from '@/components/home/HomeFlashSaleSection';
import flashSaleService from '@/services/flashSale.service';
import couponService from '@/services/coupon.service';

export default async function HomePage() {
  const [activeSale, coupons] = await Promise.all([
    flashSaleService.getServerActiveFlashSale(),
    couponService.getServerActiveCoupons(10),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Hero Banner Slider (Chỉ có ở trang chủ) */}
      <HomeHeroBannerSlider />

      {/* Dịch vụ & Voucher dạng vé (Custom SVGs & Ticket Punch Holes) */}
      <HomeServiceAndCoupons initialCoupons={coupons} />

      {/* Flash Sale Section (Phong Vũ Inspired) */}
      <HomeFlashSaleSection initialData={activeSale} />
    </main>
  );
}

