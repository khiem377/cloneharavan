'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import ProductViewTracker from '@/components/common/ProductViewTracker';
import { recommendationService } from '@/services/recommendation.service';
import { getDynamicProductName } from '@/utils/productNameHelper';

export default function ProductDetailClient({
  product,
  variants = [],
  deals = null,
  upsellData = null,
  similarProducts = [],
  personalizedProducts = [],
  frequentlyBought = [],
}) {
  const [clientPersonalized, setClientPersonalized] = useState(personalizedProducts);

  useEffect(() => {
    let isMounted = true;
    const fetchPersonalized = async () => {
      try {
        const recs = await recommendationService.getPersonalized(12);
        if (isMounted && Array.isArray(recs) && recs.length > 0) {
          const currentId = (product._id || product.id)?.toString();
          const filtered = recs.filter((p) => (p._id || p.id)?.toString() !== currentId);
          if (filtered.length > 0) {
            setClientPersonalized(filtered);
          }
        }
      } catch (err) {}
    };
    fetchPersonalized();
    return () => {
      isMounted = false;
    };
  }, [product._id, product.id]);

  const initialVariant = useMemo(() => {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    const realVariant = variants.find(
      (v) =>
        (Array.isArray(v.attributes) && v.attributes.length > 0) ||
        (v.displayName && v.displayName !== 'Mặc định')
    );
    if (realVariant) return realVariant;
    return variants.find((v) => v.isDefault) || variants[0] || null;
  }, [variants]);

  const [selectedVariant, setSelectedVariant] = useState(initialVariant);

  const dynamicProductName = useMemo(
    () => getDynamicProductName(product, selectedVariant, variants),
    [product, selectedVariant, variants]
  );

  const flashSaleDeal = deals?.flashSale || null;
  const isFlashSale = Boolean(deals?.isFlashSale && flashSaleDeal?.price > 0);

  const activeSalePrice = isFlashSale
    ? flashSaleDeal.price
    : selectedVariant?.salePrice !== undefined && selectedVariant?.salePrice !== null && selectedVariant.salePrice > 0
    ? selectedVariant.salePrice
    : product.salePrice || product.cachedSalePrice || 0;

  const activeRegularPrice = isFlashSale && flashSaleDeal?.originalPrice
    ? flashSaleDeal.originalPrice
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
      <ProductViewTracker product={product} />
      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
        <ProductBreadcrumbs product={product} dynamicProductName={dynamicProductName} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 bg-white rounded-[6px] border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <ProductGallery
              product={product}
              variants={variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              discountPercent={discountPercent}
              isFlashSale={isFlashSale}
            />

            <ProductTrustBadges />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            <ProductInfo
              product={product}
              dynamicProductName={dynamicProductName}
              variants={variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              deals={deals}
            />

            <ProductPromotions
              deals={deals}
              product={product}
              currentPrice={currentDisplayPrice}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <ProductDescription product={product} />

            <ProductReviewsAndComments
              productId={product._id || product.id}
              productName={dynamicProductName || product.name}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <ProductSpecsSummary
              product={product}
              selectedVariant={selectedVariant}
            />
          </div>
        </div>

        <ProductRecommendationsSection
          similarProducts={similarProducts}
          personalizedProducts={clientPersonalized}
          frequentlyBought={frequentlyBought}
        />
      </div>

      <StickyPurchaseBar
        product={product}
        dynamicProductName={dynamicProductName}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}
