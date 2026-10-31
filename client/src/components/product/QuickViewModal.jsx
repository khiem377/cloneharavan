'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useQuickViewStore from '@/store/quickViewStore';
import QuickViewGallery from './quick-view/QuickViewGallery';
import QuickViewDetails from './quick-view/QuickViewDetails';
import { useQuickViewVariants, getVariantLabel } from './quick-view/useQuickViewVariants';

export const QuickViewModal = () => {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    images,
    activeImageIdx,
    setActiveImageIdx,
    variantSelectedImage,
    setVariantSelectedImage,
    currentImage,
    displayPrice,
    originalPrice,
    hasDiscount,
    discountPercent,
    isFlashSale,
    variantError,
    groupTitle,
    attributeGroups,
    displayVariants,
    selectedAttributes,
    selectedVariant,
    checkValueStatus,
    handleSelectAttributeValue,
    handleSelectVariant,
    quantity,
    setQuantity,
    handleBuyNow,
    handleAddToCart,
    isAddingToCart,
    handleCompareClick,
    compared,
  } = useQuickViewVariants({ product, isOpen, closeQuickView });

  useEffect(() => {
    if (isOpen && product) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, product]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
      closeQuickView();
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isRendered) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isRendered]);

  const brandName = product?.brand?.name || 'Chính hãng';
  const brandSlug = product?.brand?.slug || (product?.brand?.name ? product.brand.name.toLowerCase() : '');

  if (!isRendered || !product) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      <div
        className={`relative w-full max-w-3xl lg:max-w-4xl z-10 my-auto ${
          isVisible ? 'animate-ega-scale-in' : 'animate-ega-scale-out'
        }`}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleClose}
          className="absolute -top-10 sm:-top-11 right-0 w-8 h-8 rounded-full border border-white text-white bg-black/40 hover:bg-[#e30019] hover:border-[#e30019] transition-all duration-300 active:scale-90 z-30"
          aria-label="Đóng xem nhanh"
        >
          <X size={16} strokeWidth={2.2} />
        </Button>

        <div className="relative bg-white rounded-[6px] shadow-lg border border-slate-200 w-full max-h-[88vh] overflow-y-auto no-scrollbar">
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <QuickViewGallery
              product={product}
              currentImage={currentImage}
              images={images}
              activeImageIdx={activeImageIdx}
              variantSelectedImage={variantSelectedImage}
              onSelectImage={(idx) => {
                setActiveImageIdx(idx);
                setVariantSelectedImage(null);
              }}
            />

            <QuickViewDetails
              product={product}
              brandName={brandName}
              brandSlug={brandSlug}
              displayPrice={displayPrice}
              originalPrice={originalPrice}
              hasDiscount={hasDiscount}
              discountPercent={discountPercent}
              isFlashSale={isFlashSale}
              variantError={variantError}
              groupTitle={groupTitle}
              attributeGroups={attributeGroups}
              displayVariants={displayVariants}
              selectedAttributes={selectedAttributes}
              selectedVariant={selectedVariant}
              checkValueStatus={checkValueStatus}
              handleSelectAttributeValue={handleSelectAttributeValue}
              handleSelectVariant={handleSelectVariant}
              getVariantLabel={getVariantLabel}
              quantity={quantity}
              setQuantity={setQuantity}
              handleBuyNow={handleBuyNow}
              handleAddToCart={handleAddToCart}
              isAddingToCart={isAddingToCart}
              handleCompareClick={handleCompareClick}
              compared={compared}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
