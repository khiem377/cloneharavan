'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useQuickViewStore from '@/store/quickViewStore';
import useCompareStore from '@/store/compareStore';
import useCartStore from '@/store/cartStore';

export function useFlashSaleCard({ item, onAddToCartMock, onBuyNowMock }) {
  const router = useRouter();
  const { openQuickView } = useQuickViewStore();
  const { addProduct, isCompared } = useCompareStore();
  const { addToCart } = useCartStore();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const initialVariantsList = Array.isArray(item?.variantsList) && item.variantsList.length > 0
    ? item.variantsList
    : [item];

  const baseProduct = typeof item?.productId === 'object' ? item.productId : item?.product || {};
  const productId = baseProduct._id || baseProduct.id || item?.productId;

  const effectiveVariantsList = initialVariantsList;

  const currentItem = effectiveVariantsList[selectedVariantIdx] || effectiveVariantsList[0] || item;
  const product = typeof currentItem.productId === 'object' ? currentItem.productId : currentItem.product || baseProduct;
  const variant = typeof currentItem.variantId === 'object' ? currentItem.variantId : null;

  const isDefaultTitle = (t) => {
    if (!t) return true;
    const s = String(t).trim().toLowerCase();
    return ['mặc định', 'mac dinh', 'default', 'default title', 'tiêu chuẩn', 'tieu chuan'].includes(s);
  };

  const getVariantLabel = (vItem) => {
    if (!vItem) return '';
    const vObj = typeof vItem.variantId === 'object' ? vItem.variantId : (typeof vItem === 'object' && vItem.attributes ? vItem : null);
    if (vObj?.displayName && !isDefaultTitle(vObj.displayName)) {
      return vObj.displayName;
    }
    if (Array.isArray(vObj?.attributes) && vObj.attributes.length > 0) {
      const valid = vObj.attributes
        .filter((a) => a && !isDefaultTitle(a.value) && !isDefaultTitle(a.name))
        .map((a) => a.value)
        .join(' - ');
      if (valid) return valid;
    }
    return '';
  };

  const variantLabel = getVariantLabel(currentItem);

  const productName = product.name || currentItem.productName || 'Sản phẩm Flash Sale';
  const productSlug = product.slug || productId;

  const originalPrice = currentItem.originalPrice || product.price || 0;
  const flashSalePrice = currentItem.flashSalePrice || 0;
  const discountSavings = originalPrice > flashSalePrice ? originalPrice - flashSalePrice : 0;
  const discountPercent =
    currentItem.discountValue ||
    (originalPrice > flashSalePrice
      ? Math.round(((originalPrice - flashSalePrice) / originalPrice) * 100)
      : 0);

  const stockLimit = currentItem.stockLimit || 1;
  const soldInFlashSale = currentItem.soldInFlashSale || 0;
  const progressRatio = Math.min(100, Math.round((soldInFlashSale / stockLimit) * 100));

  const warehouseStock =
    typeof variant?.stock === 'number'
      ? variant.stock
      : typeof product.stock === 'number'
      ? product.stock
      : 999;
  const isOutOfWarehouse = warehouseStock <= 0;
  const isSoldOut = soldInFlashSale >= stockLimit || isOutOfWarehouse;

  const getValidUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') {
      const trimmed = img.trim();
      return trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('data:') ? trimmed : '';
    }
    if (typeof img === 'object') {
      if (typeof img.url === 'string' && img.url.trim()) return img.url.trim();
      if (typeof img.secure_url === 'string' && img.secure_url.trim()) return img.secure_url.trim();
    }
    return '';
  };

  const thumbnail =
    getValidUrl(variant?.thumbnail) ||
    getValidUrl(variant?.image) ||
    getValidUrl(product?.thumbnail) ||
    getValidUrl(product?.images?.[0]) ||
    getValidUrl(currentItem?.productImage) ||
    getValidUrl(item?.productImage) ||
    '';

  const compared = Boolean(productId && isCompared(productId));

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView({
      ...product,
      _id: product._id || productId,
      id: product._id || productId,
      name: productName,
      slug: productSlug,
      thumbnail: thumbnail || product.thumbnail,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : (thumbnail ? [thumbnail] : []),
      options: product.options || [],
      price: originalPrice,
      salePrice: flashSalePrice,
      originalPrice,
      isFlashSale: true,
      flashSalePrice,
      flashSaleOriginalPrice: originalPrice,
      variants: Array.isArray(effectiveVariantsList) && effectiveVariantsList.length > 1
        ? effectiveVariantsList.map((v) => (typeof v.variantId === 'object' ? v.variantId : v))
        : (variant ? [variant] : (Array.isArray(product.variants) ? product.variants : [])),
      currentVariant: variant,
    });
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct({
      _id: productId,
      id: productId,
      name: productName,
      slug: productSlug,
      thumbnail,
      price: originalPrice,
      salePrice: flashSalePrice,
      originalPrice,
    });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut || isAdding) return;

    const variantIdToUse = variant?._id || (typeof currentItem.variantId === 'string' ? currentItem.variantId : null);
    const hasMultipleVariants =
      effectiveVariantsList.length > 1 ||
      (product.options && product.options.length > 0);

    if (hasMultipleVariants && !variantIdToUse) {
      handleQuickViewClick(e);
      return;
    }

    setIsAdding(true);
    if (onAddToCartMock) {
      onAddToCartMock(item);
    }
    try {
      const variantSku = variant?.sku || currentItem.sku || '';
      await addToCart({
        productId: product?._id || productId,
        variantId: variantIdToUse,
        sku: variantSku,
        quantity: 1,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const variantIdToUse = variant?._id || (typeof currentItem.variantId === 'string' ? currentItem.variantId : null);
    const hasMultipleVariants =
      effectiveVariantsList.length > 1 ||
      (product.options && product.options.length > 0);

    if (hasMultipleVariants && !variantIdToUse) {
      handleQuickViewClick(e);
      return;
    }

    if (onBuyNowMock) {
      onBuyNowMock(item);
    }
    const variantSku = variant?.sku || currentItem.sku || '';
    await addToCart(
      {
        productId: product?._id || productId,
        variantId: variantIdToUse,
        sku: variantSku,
        quantity: 1,
      },
      { isBuyNow: true }
    );
    router.push('/checkout');
  };

  return {
    productId,
    product,
    productName,
    productSlug,
    thumbnail,
    originalPrice,
    flashSalePrice,
    discountSavings,
    discountPercent,
    stockLimit,
    soldInFlashSale,
    progressRatio,
    isOutOfWarehouse,
    isSoldOut,
    effectiveVariantsList,
    selectedVariantIdx,
    setSelectedVariantIdx,
    variantLabel,
    getVariantLabel,
    compared,
    isAdding,
    handleQuickViewClick,
    handleCompareClick,
    handleAddToCart,
    handleBuyNow,
  };
}
