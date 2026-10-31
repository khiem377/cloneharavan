'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import ProductTitleAndMeta from './product-info/ProductTitleAndMeta';
import ProductPriceBox from './product-info/ProductPriceBox';
import ProductVariantSelector from './product-info/ProductVariantSelector';
import ProductQuantityAndBuy from './product-info/ProductQuantityAndBuy';
import { useProductVariants, getVariantLabel } from './product-info/useProductVariants';

export default function ProductInfo({
  product,
  dynamicProductName = '',
  variants = [],
  selectedVariant,
  onSelectVariant,
  deals = null,
}) {
  const router = useRouter();
  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [actionNotice, setActionNotice] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const {
    realVariants,
    attributeGroups,
    selectedAttributes,
    handleSelectAttributeValue,
    checkValueStatus,
    getPriceDifferenceLabel,
    formatVariantPriceDiff,
    flashSaleDeal,
    matchedFsItem,
    isFlashSale,
    currentBasePrice,
    hasDiscount,
    originalPrice,
    discountPercent,
    savingsAmount,
    activeVariant,
    currentStock,
    isOutOfStock,
    isLowStock,
    finalTotalPrice,
    primaryGift,
    triggerQty,
    isGiftUnlocked,
    giftProductNames,
  } = useProductVariants({
    product,
    variants,
    selectedVariant,
    onSelectVariant,
    deals,
    quantity,
  });

  const handleQtyChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => Math.min(prev + 1, currentStock || 99));
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = async (isBuyNow = false) => {
    if (isOutOfStock || isAddingToCart) return;
    setIsAddingToCart(true);
    setActionNotice(null);

    const payload = {
      productId: product._id || product.id,
      variantId: activeVariant?._id || activeVariant?.id,
      sku: activeVariant?.sku,
      quantity,
    };

    const res = await addToCart(payload, { isBuyNow });
    setIsAddingToCart(false);

    if (res?.success) {
      if (isBuyNow) router.push('/checkout');
    } else {
      setActionNotice({
        type: 'error',
        message: res?.message || 'Không thể thêm sản phẩm vào giỏ hàng',
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ProductTitleAndMeta
        brand={product.brand}
        dynamicProductName={dynamicProductName}
        productName={product.name}
        ratingsAverage={product.ratingsAverage ?? 0}
        ratingsQuantity={product.ratingsQuantity || 0}
        isOutOfStock={isOutOfStock}
        isLowStock={isLowStock}
        currentStock={currentStock}
      />

      <ProductPriceBox
        isFlashSale={isFlashSale}
        flashSaleDeal={flashSaleDeal}
        matchedFsItem={matchedFsItem}
        deals={deals}
        currentBasePrice={currentBasePrice}
        hasDiscount={hasDiscount}
        originalPrice={originalPrice}
        discountPercent={discountPercent}
        savingsAmount={savingsAmount}
      />

      <ProductVariantSelector
        attributeGroups={attributeGroups}
        displayVariants={realVariants.length > 1 ? realVariants : []}
        selectedAttributes={selectedAttributes}
        selectedVariant={selectedVariant}
        groupName={realVariants[0]?.attributes?.[0]?.name || product.options?.[0]?.name || 'Phiên bản'}
        selectedVariantLabel={getVariantLabel(selectedVariant) || (realVariants[0] ? getVariantLabel(realVariants[0]) : '')}
        currentBasePrice={currentBasePrice}
        checkValueStatus={checkValueStatus}
        getPriceDifferenceLabel={getPriceDifferenceLabel}
        formatVariantPriceDiff={formatVariantPriceDiff}
        onSelectAttributeValue={handleSelectAttributeValue}
        onSelectVariant={onSelectVariant}
      />

      <ProductQuantityAndBuy
        quantity={quantity}
        onQtyChange={handleQtyChange}
        currentStock={currentStock}
        isOutOfStock={isOutOfStock}
        isLowStock={isLowStock}
        primaryGift={primaryGift}
        isGiftUnlocked={isGiftUnlocked}
        triggerQty={triggerQty}
        giftProductNames={giftProductNames}
        isAddingToCart={isAddingToCart}
        onAddToCart={handleAddToCart}
        finalTotalPrice={finalTotalPrice}
        actionNotice={actionNotice}
      />
    </div>
  );
}
