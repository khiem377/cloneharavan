'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Check, ArrowLeftRight, Plus, Minus, ShieldCheck, Flame, Star } from 'lucide-react';
import { api } from '@/lib/axios';
import useQuickViewStore from '@/store/quickViewStore';
import useCompareStore from '@/store/compareStore';

export const QuickViewModal = () => {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const { addProduct, isCompared } = useCompareStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variantsList, setVariantsList] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptionVal, setSelectedOptionVal] = useState('');
  const [addedToCartToast, setAddedToCartToast] = useState(false);

  // Animation states for smooth sliding and scaling
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setIsRendered(true);
      setActiveImageIdx(0);
      setQuantity(1);

      // Pre-seed variants if passed with product
      const initialVars = Array.isArray(product.variants) ? product.variants : [];
      setVariantsList(initialVars);
      const defaultVar = initialVars.find((v) => v.isDefault) || initialVars[0] || null;
      setSelectedVariant(defaultVar);

      if (product.options?.[0]?.values?.[0]) {
        setSelectedOptionVal(product.options[0].values[0]);
      } else {
        setSelectedOptionVal('');
      }

      // Fetch full variant list from backend to ensure real options are present
      const productId = product._id || product.id;
      if (productId) {
        api.get(`/products/${productId}/variants`)
          .then((res) => {
            const fetched = res.data?.data || res.data || [];
            if (Array.isArray(fetched) && fetched.length > 0) {
              setVariantsList(fetched);
              setSelectedVariant((prev) => {
                if (prev) {
                  const match = fetched.find((v) => (v._id || v.id) === (prev._id || prev.id));
                  if (match) return match;
                }
                return fetched.find((v) => v.isDefault) || fetched[0];
              });
            }
          })
          .catch(() => {});
      }

      // Trigger scale-in animation after mounting
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 20);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, product]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
      closeQuickView();
    }, 320);
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

  if (!isRendered || !product) return null;

  const images = [];
  if (product.thumbnail) {
    images.push(typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url);
  }
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url && !images.includes(url)) images.push(url);
    });
  }
  if (images.length === 0) {
    images.push('/logo-shop.jpg');
  }

  const currentImage = images[activeImageIdx] || images[0];

  // Dynamic pricing based on selected variant, with Flash Sale taking TOP priority
  const isFlashSale = !!(product.isFlashSale && product.flashSalePrice > 0);

  const activeSalePrice = isFlashSale
    ? product.flashSalePrice
    : selectedVariant?.salePrice !== undefined && selectedVariant?.salePrice !== null && selectedVariant.salePrice > 0
    ? selectedVariant.salePrice
    : product.salePrice || product.cachedSalePrice || 0;

  const activeRegularPrice = isFlashSale && product.flashSaleOriginalPrice
    ? product.flashSaleOriginalPrice
    : selectedVariant?.price !== undefined && selectedVariant?.price !== null && selectedVariant.price > 0
    ? selectedVariant.price
    : product.price || product.cachedPrice || 0;

  const hasDiscount = activeSalePrice > 0 && activeRegularPrice > activeSalePrice;
  const displayPrice = activeSalePrice > 0 ? activeSalePrice : activeRegularPrice;
  const originalPrice = hasDiscount ? activeRegularPrice : 0;
  const discountPercent = hasDiscount
    ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
    : 0;

  const brandName = product.brand?.name || 'Chính hãng';
  const brandSlug = product.brand?.slug || (product.brand?.name ? product.brand.name.toLowerCase() : '');
  const sku = selectedVariant?.sku || product.sku || product.productCode || product._id?.slice(-8)?.toUpperCase();

  const handleAddToCart = () => {
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2500);
  };

  const handleCompareClick = () => {
    addProduct(product);
  };

  const compared = isCompared(product._id || product.id);

  // Determine variant group title and items to render
  const realVariants = variantsList.filter((v) => !v.isDefault || (v.attributes && v.attributes.length > 0));
  const displayVariants = realVariants.length > 0 ? realVariants : variantsList.length > 1 ? variantsList : [];

  const groupTitle =
    displayVariants[0]?.attributes?.[0]?.name ||
    product.options?.[0]?.name ||
    'Kích thước';

  const getVariantLabel = (v) => {
    if (v.attributes && v.attributes.length > 0) {
      return v.attributes.map((a) => a.value).join(' - ');
    }
    if (v.displayName) {
      if (v.displayName.includes(' - ')) {
        return v.displayName.split(' - ').pop().trim();
      }
      return v.displayName;
    }
    if (v.title) return v.title;
    if (v.name) return v.name;
    return v.sku || 'Tùy chọn';
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 transition-opacity duration-300 ease-out backdrop-blur-xs ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      {/* Modal Wrapper */}
      <div className="relative w-full max-w-3xl lg:max-w-4xl z-10 my-auto">
        {/* Close Button above modal matching EGA Dien May */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute -top-10 sm:-top-11 right-0 w-8 h-8 rounded-full border border-white text-white hover:text-white hover:border-[#e30019] hover:bg-[#e30019] bg-transparent flex items-center justify-center transition-all duration-300 hover:rotate-180 active:scale-90 cursor-pointer shadow-md z-30"
          aria-label="Đóng xem nhanh"
          title="Đóng (ESC)"
        >
          <X size={17} strokeWidth={2.2} />
        </button>

        {/* Modal Card with EGA scale-in animation */}
        <div
          className={`relative bg-white rounded-xl shadow-2xl w-full max-h-[88vh] overflow-y-auto no-scrollbar ${
            isVisible ? 'animate-ega-scale-in' : 'animate-ega-scale-out'
          }`}
        >
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* ============ LEFT: GALLERY ============ */}
            <div className="space-y-3">
              {/* Main Preview */}
              <div className="relative aspect-4/3 sm:aspect-square w-full bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden p-3">
                {product.isHot && (
                  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e30019] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    <Flame size={12} className="fill-current" />
                    SẢN PHẨM HOT
                  </span>
                )}
                {product.isFeatured && !product.isHot && (
                  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    <Star size={12} className="fill-current" />
                    SẢN PHẨM NỔI BẬT
                  </span>
                )}

                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Thumbnail Carousel */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-md border p-1 bg-white shrink-0 transition cursor-pointer overflow-hidden ${
                        activeImageIdx === idx
                          ? 'border-[#e30019] ring-2 ring-[#e30019]/20'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ============ RIGHT: PRODUCT DETAILS ============ */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  {product.name}
                </h2>

                <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>
                      Thương hiệu:{' '}
                      {brandSlug ? (
                        <Link
                          href={`/collections/${brandSlug}`}
                          onClick={handleClose}
                          className="font-bold text-gray-900 hover:text-[#e30019] transition-colors cursor-pointer"
                        >
                          {brandName}
                        </Link>
                      ) : (
                        <strong className="text-gray-800">{brandName}</strong>
                      )}
                    </span>
                    <span>|</span>
                    <span>
                      Mã: <strong className="text-gray-800">{sku}</strong>
                    </span>
                  </div>

                  {/* Compare Link */}
                  <button
                    type="button"
                    onClick={handleCompareClick}
                    className={`flex items-center gap-1 text-xs font-semibold cursor-pointer transition ${
                      compared ? 'text-emerald-600' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    <ArrowLeftRight size={13} />
                    <span>{compared ? 'Đã thêm so sánh' : 'So sánh'}</span>
                  </button>
                </div>
              </div>

              {/* Price Box */}
              <div className={`p-3 rounded-lg flex items-baseline gap-2.5 flex-wrap ${isFlashSale ? 'bg-red-50/70 border border-red-200' : 'bg-gray-50 border border-gray-100'}`}>
                <span className="text-2xl font-black text-[#e30019]">
                  {displayPrice > 0 ? `${displayPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                </span>
                {originalPrice > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    {originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-1.5 py-0.5 rounded bg-[#e30019] text-white text-xs font-bold">
                    -{discountPercent}%
                  </span>
                )}
                {isFlashSale && (
                  <span className="ml-auto px-2 py-0.5 rounded text-[11px] font-black uppercase text-white bg-gradient-to-r from-red-600 to-amber-500 shadow-2xs">
                    Giá Flash Sale
                  </span>
                )}
              </div>

              {/* Variant Selectors matching EGA */}
              {displayVariants.length > 1 ? (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    {groupTitle}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {displayVariants.map((v, i) => {
                      const isSelected =
                        (selectedVariant?._id && selectedVariant._id === v._id) ||
                        (selectedVariant?.sku && selectedVariant.sku === v.sku) ||
                        (!selectedVariant && i === 0);
                      const label = getVariantLabel(v);
                      return (
                        <button
                          key={v._id || v.sku || i}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(v);
                            if (v.images?.[0]?.url) {
                              const imgIdx = images.indexOf(v.images[0].url);
                              if (imgIdx >= 0) setActiveImageIdx(imgIdx);
                            }
                          }}
                          className={`min-w-16 px-3.5 py-1.5 rounded-sm text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-blue-600 text-blue-600 bg-white font-semibold shadow-xs'
                              : 'border border-gray-300 text-gray-800 bg-white hover:border-gray-400 hover:text-black'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : product.options?.[0]?.values?.length > 1 ? (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    {product.options[0].name || 'Kích thước'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.options[0].values.map((val, i) => {
                      const isSelected =
                        selectedOptionVal === val || (!selectedOptionVal && i === 0);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedOptionVal(val)}
                          className={`min-w-16 px-3.5 py-1.5 rounded-sm text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-blue-600 text-blue-600 bg-white font-semibold shadow-xs'
                              : 'border border-gray-300 text-gray-800 bg-white hover:border-gray-400 hover:text-black'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Quantity and Stock */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">Số lượng:</span>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-9 text-center text-xs font-semibold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <Check size={15} />
                  <span>Sẵn trong kho</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-[#e30019] hover:bg-[#c40015] text-white font-bold text-sm rounded-md shadow-xs transition active:scale-[0.99] cursor-pointer"
                >
                  Thêm vào giỏ
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/checkout?productId=${product._id}&quantity=${quantity}`}
                    className="py-2.5 border border-[#e30019] text-[#e30019] hover:bg-red-50 text-center font-bold text-xs rounded-md transition"
                  >
                    Mua ngay
                  </Link>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-50 text-center font-bold text-xs rounded-md transition cursor-pointer"
                  >
                    Trả góp 0%
                  </button>
                </div>
              </div>

              {/* Incentive / Promotion Box */}
              <div className="p-3 rounded-md bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Quà tặng độc quyền:</strong> Tặng gói truyền hình CLIP TV Gia đình 12 tháng trị giá 600.000₫. Miễn phí công lắp đặt tại nhà.
                </span>
              </div>

              {addedToCartToast && (
                <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <Check size={15} />
                  <span>Đã thêm sản phẩm vào giỏ hàng thành công!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
