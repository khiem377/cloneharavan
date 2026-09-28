'use client';

import React, { useState, useMemo } from 'react';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductPromotions from './ProductPromotions';
import ProductTrustBadges from './ProductTrustBadges';
import ProductSpecsSummary from './ProductSpecsSummary';
import ProductDescription from './ProductDescription';
import ProductRecommendationsSection from './ProductRecommendationsSection';
import ProductReviewsAndComments from './ProductReviewsAndComments';
import StickyPurchaseBar from './StickyPurchaseBar';

export default function ProductDetailClient({
  product,
  variants = [],
  deals = null,
  upsellData = null,
  similarProducts = [],
  personalizedProducts = [],
  frequentlyBought = [],
}) {
  const initialVariant = useMemo(() => {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    // Ưu tiên variant thực có attributes hoặc displayName khác 'Mặc định'
    const realVariant = variants.find(
      (v) =>
        (Array.isArray(v.attributes) && v.attributes.length > 0) ||
        (v.displayName && v.displayName !== 'Mặc định')
    );
    if (realVariant) return realVariant;
    return variants.find((v) => v.isDefault) || variants[0] || null;
  }, [variants]);

  const [selectedVariant, setSelectedVariant] = useState(initialVariant);

  const isFlashSale = Boolean(
    product.isFlashSale && (product.flashSale?.flashSalePrice || product.flashSalePrice)
  );
  const activeSalePrice = isFlashSale
    ? (product.flashSale?.flashSalePrice || product.flashSalePrice)
    : selectedVariant?.salePrice !== undefined && selectedVariant?.salePrice !== null && selectedVariant.salePrice > 0
    ? selectedVariant.salePrice
    : product.salePrice || product.cachedSalePrice || 0;

  const activeRegularPrice = isFlashSale && (product.flashSale?.originalPrice || product.flashSaleOriginalPrice)
    ? (product.flashSale?.originalPrice || product.flashSaleOriginalPrice)
    : selectedVariant?.price !== undefined && selectedVariant?.price !== null && selectedVariant.price > 0
    ? selectedVariant.price
    : product.price || product.cachedPrice || 0;

  const hasDiscount = activeSalePrice > 0 && activeRegularPrice > activeSalePrice;
  const discountPercent = hasDiscount
    ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
    : 0;

  const currentDisplayPrice = activeSalePrice > 0 ? activeSalePrice : activeRegularPrice;

  return (
    <div className="min-h-[100dvh] bg-slate-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* BREADCRUMB */}
        <ProductBreadcrumbs product={product} />

        {/* KHUNG CHÍNH (MAIN PRODUCT STAGE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-[6px] border border-slate-200 p-4 sm:p-6 mb-6">
          {/* CỘT TRÁI (5/12): GALLERY HOVER ZOOM & TRUST BADGES */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <ProductGallery
              product={product}
              selectedVariant={selectedVariant}
              discountPercent={discountPercent}
              isFlashSale={isFlashSale}
            />

            <ProductTrustBadges />
          </div>

          {/* CỘT PHẢI (7/12): THÔNG TIN GIÁ, BIẾN THỂ, UPSELL, ƯU ĐÃI & NÚT MUA */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <ProductInfo
              product={product}
              variants={variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              deals={deals}
            />

            {/* KHUYẾN MÃI THẬT & COUPONS THỰC TẾ CHO SẢN PHẨM NÀY */}
            <ProductPromotions
              deals={deals}
              currentPrice={currentDisplayPrice}
            />
          </div>
        </div>

        {/* KHỐI NỘI DUNG DƯỚI (MÔ TẢ CHI TIẾT & SPECS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* CỘT TRÁI (8/12): BÀI VIẾT ĐÁNH GIÁ CHI TIẾT & BÌNH LUẬN FEED FACEBOOK */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <ProductDescription product={product} />

            {/* FEED ĐÁNH GIÁ & BÌNH LUẬN KIỂU FACEBOOK TRỰC TIẾP TRÊN TRANG (KHÔNG DÙNG DRAWER) */}
            <ProductReviewsAndComments
              productId={product._id || product.id}
              productName={product.name}
            />
          </div>

          {/* CỘT PHẢI (4/12): THÔNG SỐ KỸ THUẬT */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <ProductSpecsSummary
              product={product}
              selectedVariant={selectedVariant}
            />
          </div>
        </div>

        {/* CỤM GỢI Ý ĐA TẦNG (CÁ NHÂN HÓA SVD + CÙNG LOẠI + MUA KÈM) */}
        <ProductRecommendationsSection
          similarProducts={similarProducts}
          personalizedProducts={personalizedProducts}
          frequentlyBought={frequentlyBought}
        />
      </div>

      {/* THANH MUA HÀNG GHIM ĐÁY */}
      <StickyPurchaseBar
        product={product}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}
