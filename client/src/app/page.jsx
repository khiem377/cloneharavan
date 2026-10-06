import React from 'react';
import HomeHeroBannerSlider from '@/components/home/HomeHeroBannerSlider';
import HomeCategoryShortcuts from '@/components/home/HomeCategoryShortcuts';
import HomeServiceAndCoupons from '@/components/home/HomeServiceAndCoupons';
import HomeFlashSaleSection from '@/components/home/HomeFlashSaleSection';
import HomeTrendingAndNewArrivals from '@/components/home/HomeTrendingAndNewArrivals';
import HomeBrandMarquee from '@/components/home/HomeBrandMarquee';
import HomeCategoryShowcase from '@/components/home/HomeCategoryShowcase';
import HomeRecommendationFeed from '@/components/home/HomeRecommendationFeed';
import HomeTechNews from '@/components/home/HomeTechNews';
import HomeNewsletterBanner from '@/components/home/HomeNewsletterBanner';
import ScrollReveal from '@/components/common/ScrollReveal';

import flashSaleService from '@/services/flashSale.service';
import couponService from '@/services/coupon.service';
import brandServerService from '@/services/brand.server.service';
import productServerService from '@/services/product.server.service';
import categoryService from '@/services/category.service';
import recommendationServerService from '@/services/recommendation.server.service';
import blogService from '@/services/blog.service';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    activeSale, 
    coupons, 
    brands, 
    categoriesTree, 
    recommendations,
    trendingProds,
    newArrivalProds,
    hotProds,
    featuredBlogRes,
    latestBlogRes
  ] = await Promise.all([
    flashSaleService.getServerActiveFlashSale(),
    couponService.getServerActiveCoupons(10),
    brandServerService.getBrands(),
    categoryService.getServerCategoryTree(),
    recommendationServerService.getPersonalized(10),
    recommendationServerService.getTrending(10),
    productServerService.getProducts({ sort: 'createdAt', sortOrder: 'desc', limit: 10 }),
    productServerService.getProducts({ isHot: true, limit: 10 }),
    blogService.getServerBlogPosts({ sort: 'views', limit: 1 }),
    blogService.getServerBlogPosts({ sort: 'newest', limit: 5 }),
  ]);

  const finalTrendingProds = Array.isArray(trendingProds) && trendingProds.length >= 5
    ? trendingProds
    : Array.isArray(hotProds) && hotProds.length > 0 ? hotProds : newArrivalProds;

  const featuredPost = Array.isArray(featuredBlogRes?.data) && featuredBlogRes.data.length > 0
    ? featuredBlogRes.data[0]
    : null;
  const latestPosts = Array.isArray(latestBlogRes?.data) ? latestBlogRes.data : [];

  // 1. Showcase Ngành Hàng 1: Tivi, Loa, Dàn Karaoke
  const tvCategory = (categoriesTree || []).find((c) => {
    const text = `${c.name} ${c.slug}`.toLowerCase();
    return text.includes('tivi') || text.includes('tv') || text.includes('karaoke') || text.includes('âm thanh');
  }) || categoriesTree?.[0] || null;

  // 2. Showcase Ngành Hàng 2: Laptop, Điện Thoại hoặc Gia Dụng
  const secondCategory = (categoriesTree || []).find((c) => {
    const text = `${c.name} ${c.slug}`.toLowerCase();
    const isNotTv = !text.includes('tivi') && !text.includes('tv') && !text.includes('karaoke');
    return isNotTv && (text.includes('laptop') || text.includes('máy tính') || text.includes('điện thoại') || text.includes('tủ lạnh') || text.includes('gia dụng'));
  }) || categoriesTree?.[1] || null;

  // Lấy 10 sản phẩm thật cho 2 showcase từ DB (2 hàng x 5 cột)
  const [tvProducts, secondProducts] = await Promise.all([
    tvCategory
      ? productServerService.getProducts({ category: tvCategory.slug, limit: 10 })
      : productServerService.getProducts({ limit: 10 }),
    secondCategory
      ? productServerService.getProducts({ category: secondCategory.slug, limit: 10 })
      : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12 overflow-x-hidden">
      {/* 1. Hero Banner Slider (Tỷ lệ vàng, 2 Banner Phụ) */}
      <HomeHeroBannerSlider />

      {/* 2. Dải Phím Tắt Danh Mục Nổi Bật (24x24 Monochrome Icons từ DB) */}
      <ScrollReveal immediate={true}>
        <HomeCategoryShortcuts categories={categoriesTree} />
      </ScrollReveal>

      {/* 3. Flash Sale Section (Giá sốc có hạn, Đồng hồ đếm ngược, Thanh tiến độ) */}
      <ScrollReveal immediate={true}>
        <HomeFlashSaleSection initialData={activeSale} />
      </ScrollReveal>

      {/* 4. SẢN PHẨM HOT TREND & HÀNG MỚI VỀ (Chuẩn CellphoneS 2 Tabs Liền Mạch #609afa) */}
      <ScrollReveal immediate={true}>
        <HomeTrendingAndNewArrivals 
          trendingProducts={finalTrendingProds}
          newArrivalProducts={newArrivalProds}
          categories={categoriesTree}
        />
      </ScrollReveal>

      {/* 5. Dịch vụ & Voucher dạng vé (SVG Punch Holes, Không Icon thừa) */}
      <ScrollReveal immediate={true}>
        <HomeServiceAndCoupons initialCoupons={coupons} />
      </ScrollReveal>

      {/* 6. Showcase Ngành Hàng 1: Tivi, Loa & Âm Thanh Giải Trí (Banner Dọc Trái + Brand Pills + Sub-tabs) */}
      {tvCategory && (
        <ScrollReveal>
          <HomeCategoryShowcase
            category={tvCategory}
            initialProducts={tvProducts}
            brands={brands}
          />
        </ScrollReveal>
      )}

      {/* 7. Showcase Ngành Hàng 2: Laptop & Máy Tính Đời Mới (Banner Dọc Trái + Brand Pills + Sub-tabs) */}
      {secondCategory && (
        <ScrollReveal>
          <HomeCategoryShowcase
            category={secondCategory}
            initialProducts={secondProducts}
            brands={brands}
          />
        </ScrollReveal>
      )}

      {/* 8. Dải cuộn thương hiệu chính hãng (Marquee 1 dòng) */}
      <ScrollReveal>
        <HomeBrandMarquee initialBrands={brands} />
      </ScrollReveal>

      {/* 9. Khối Gợi Ý Thông Minh (AI Recommendation Engine, 10 sản phẩm gọn gàng) */}
      <ScrollReveal>
        <HomeRecommendationFeed initialProducts={recommendations} />
      </ScrollReveal>

      {/* 10. Tin Tức & Đánh Giá Công Nghệ (1 Bài Nổi Bật Nhiều View Nhất + 4 Bài Viết Mới Chuẩn GearVN/CellphoneS) */}
      {(featuredPost || latestPosts.length > 0) && (
        <ScrollReveal>
          <HomeTechNews 
            featuredPost={featuredPost}
            latestPosts={latestPosts}
          />
        </ScrollReveal>
      )}

      {/* 11. Bản Tin Ưu Đãi Thành Viên & 4 Cam Kết Vàng Dịch Vụ */}
      <ScrollReveal>
        <HomeNewsletterBanner />
      </ScrollReveal>
    </div>
  );
}
