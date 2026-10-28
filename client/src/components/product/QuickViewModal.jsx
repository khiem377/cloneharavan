'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  X,
  Check,
  ArrowLeftRight,
  Plus,
  Minus,
  ShieldCheck,
  Flame,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import useQuickViewStore from '@/store/quickViewStore';
import useCompareStore from '@/store/compareStore';
import useCartStore from '@/store/cartStore';
import { toast } from '@/components/ui/toast';
import { resolveDisplayColor } from '@/utils/colorResolver';

export const QuickViewModal = () => {
  const router = useRouter();
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const { addProduct, isCompared } = useCompareStore();
  const { addToCart } = useCartStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [variantSelectedImage, setVariantSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variantsList, setVariantsList] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptionVal, setSelectedOptionVal] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [variantError, setVariantError] = useState(false);

  // Animation states for smooth sliding and scaling
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Lấy ảnh của biến thể nếu có
  const getVariantImage = (v) => {
    if (!v) return null;
    if (typeof v.image === 'string' && v.image) return v.image;
    if (v.image?.url) return v.image.url;
    if (typeof v.thumbnail === 'string' && v.thumbnail) return v.thumbnail;
    if (v.thumbnail?.url) return v.thumbnail.url;
    if (Array.isArray(v.images) && v.images.length > 0) {
      const first = v.images[0];
      if (typeof first === 'string' && first) return first;
      if (first?.url) return first.url;
    }
    return null;
  };

  const isDefaultVariantName = (name) => {
    if (!name) return true;
    const lower = String(name).trim().toLowerCase();
    return (
      lower === 'mặc định' ||
      lower === 'mac dinh' ||
      lower === 'default' ||
      lower === 'default title' ||
      lower === 'tiêu chuẩn' ||
      lower === 'tieu chuan'
    );
  };

  const getVariantLabel = (v) => {
    if (!v) return '';
    if (v.attributes && v.attributes.length > 0) {
      const validAttrs = v.attributes.filter((a) => !isDefaultVariantName(a.value));
      if (validAttrs.length > 0) {
        return validAttrs.map((a) => a.value).join(' - ');
      }
    }
    if (v.displayName && !isDefaultVariantName(v.displayName)) {
      if (v.displayName.includes(' - ')) {
        return v.displayName.split(' - ').pop().trim();
      }
      return v.displayName;
    }
    if (v.title && !isDefaultVariantName(v.title)) return v.title;
    if (v.name && !isDefaultVariantName(v.name)) return v.name;
    return '';
  };

  useEffect(() => {
    if (isOpen && product) {
      setIsRendered(true);
      setActiveImageIdx(0);
      setVariantSelectedImage(null);
      setQuantity(1);
      setVariantError(false);

      // Pre-seed variants if passed with product
      const initialVars = Array.isArray(product.variants) ? product.variants : [];
      setVariantsList(initialVars);

      // Xác định xem sản phẩm có nhiều biến thể thực sự hay không
      const realVars = initialVars.filter((v) => Boolean(getVariantLabel(v)));
      const hasMulti =
        realVars.length > 1 || (product.options?.[0]?.values?.length > 1);

      if (hasMulti) {
        // KHÔNG TỰ ĐỘNG CHỌN SẴN BIẾN THỂ (để người dùng tự chọn)
        setSelectedVariant(null);
        setSelectedOptionVal('');
      } else {
        // Sản phẩm đơn (chỉ có 1 biến thể mặc định)
        setSelectedVariant(initialVars[0] || null);
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
              const realFetched = fetched.filter((v) => Boolean(getVariantLabel(v)));
              if (realFetched.length <= 1) {
                // Chỉ tự gán nếu là sản phẩm đơn
                setSelectedVariant(fetched[0]);
              }
            }
          })
          .catch(() => { });
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

  // Danh sách hình ảnh của sản phẩm chủ thể
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

  // Ảnh hiển thị chính: Nếu biến thể có ảnh -> hiển thị ảnh biến thể; nếu không có -> hiển thị ảnh mặc định của chủ thể
  const currentImage = variantSelectedImage || images[activeImageIdx] || images[0];

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

  // Phân tích các nhóm thuộc tính độc lập (Màu sắc, Dung lượng, Kích thước...)
  const attributeGroups = useMemo(() => {
    const validVariants = (variantsList || []).filter(
      (v) => !v.isDefault || (Array.isArray(v.attributes) && v.attributes.length > 0)
    );

    if (validVariants.length <= 1 && (!product.options || product.options.length === 0)) {
      return [];
    }

    const groupMap = new Map();

    // 1. Nạp từ product.options cấu hình sẵn nếu có
    if (Array.isArray(product.options) && product.options.length > 0) {
      product.options.forEach((opt) => {
        if (opt.name && Array.isArray(opt.values) && opt.values.length > 0) {
          const valMap = new Map();
          opt.values.forEach((v) => {
            if (v && v.value && !isDefaultVariantName(v.value)) {
              valMap.set(v.value, {
                value: v.value,
                colorCode: v.colorCode || '',
              });
            }
          });
          if (valMap.size > 0) {
            groupMap.set(opt.name, {
              name: opt.name,
              type: opt.type || (opt.name.toLowerCase().includes('màu') ? 'color' : 'text'),
              values: valMap,
            });
          }
        }
      });
    }

    // 2. Tự động đồng bộ từ variant.attributes thực tế của sản phẩm
    validVariants.forEach((v) => {
      if (Array.isArray(v.attributes)) {
        v.attributes.forEach((attr) => {
          if (!attr.name || !attr.value || isDefaultVariantName(attr.value)) return;

          let group = groupMap.get(attr.name);
          if (!group) {
            group = {
              name: attr.name,
              type: attr.colorCode || attr.name.toLowerCase().includes('màu') ? 'color' : 'text',
              values: new Map(),
            };
            groupMap.set(attr.name, group);
          }

          if (!group.values.has(attr.value)) {
            group.values.set(attr.value, {
              value: attr.value,
              colorCode: attr.colorCode || '',
            });
          } else if (attr.colorCode && !group.values.get(attr.value).colorCode) {
            group.values.get(attr.value).colorCode = attr.colorCode;
          }
        });
      }
    });

    const groups = [];
    groupMap.forEach((group) => {
      const valuesArray = Array.from(group.values.values());
      if (valuesArray.length > 0) {
        groups.push({
          name: group.name,
          type: group.type,
          values: valuesArray,
        });
      }
    });

    return groups;
  }, [variantsList, product.options]);

  // Bộ thuộc tính hiện tại đang chọn
  const selectedAttributes = useMemo(() => {
    const map = {};
    if (selectedVariant && Array.isArray(selectedVariant.attributes)) {
      selectedVariant.attributes.forEach((attr) => {
        if (attr.name && attr.value) {
          map[attr.name] = attr.value;
        }
      });
    }
    return map;
  }, [selectedVariant]);

  // Determine variant group title and items to render
  const realVariants = variantsList.filter((v) => {
    const label = getVariantLabel(v);
    return Boolean(label);
  });
  const displayVariants = realVariants.length > 1 ? realVariants : [];

  const groupTitle =
    displayVariants[0]?.attributes?.[0]?.name ||
    product.options?.[0]?.name ||
    'Màu sắc / Phiên bản';

  const hasMultipleVariants =
    attributeGroups.length > 0 ||
    displayVariants.length > 1 ||
    Boolean(product.options?.[0]?.values?.length > 1);

  // Xử lý khi chọn một biến thể
  const handleSelectVariant = (v) => {
    setSelectedVariant(v);
    setVariantError(false);

    // Đổi ảnh theo lựa chọn biến thể:
    const varImg = getVariantImage(v);
    if (varImg) {
      setVariantSelectedImage(varImg);
      const imgIdx = images.indexOf(varImg);
      if (imgIdx >= 0) {
        setActiveImageIdx(imgIdx);
      }
    } else {
      setVariantSelectedImage(null);
      setActiveImageIdx(0);
    }
  };

  // Tìm và kích hoạt biến thể khớp với lựa chọn thuộc tính mới trong Quick View
  const handleSelectAttributeValue = (attrName, attrValue) => {
    const nextAttrs = { ...selectedAttributes, [attrName]: attrValue };
    const validVariants = (variantsList || []).filter(
      (v) => !v.isDefault || (Array.isArray(v.attributes) && v.attributes.length > 0)
    );

    // Ưu tiên 1: Khớp hoàn toàn tất cả các thuộc tính
    let exactMatch = validVariants.find((v) => {
      if (!Array.isArray(v.attributes) || v.attributes.length === 0) return false;
      return Object.entries(nextAttrs).every(([name, val]) => {
        const found = v.attributes.find((a) => a.name === name);
        return found && found.value === val;
      });
    });

    if (exactMatch) {
      handleSelectVariant(exactMatch);
      return;
    }

    // Ưu tiên 2: Khớp thuộc tính vừa click và khớp nhiều thuộc tính khác nhất
    let bestMatch = null;
    let maxScore = -1;

    validVariants.forEach((v) => {
      if (!Array.isArray(v.attributes)) return;
      const hasClicked = v.attributes.some((a) => a.name === attrName && a.value === attrValue);
      if (!hasClicked) return;

      let score = 0;
      v.attributes.forEach((a) => {
        if (nextAttrs[a.name] === a.value) score += 1;
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = v;
      }
    });

    if (bestMatch) {
      handleSelectVariant(bestMatch);
    }
  };

  // Helper kiểm tra trạng thái tồn kho của từng giá trị thuộc tính khi kết hợp với các thuộc tính đang chọn
  const checkValueStatus = (attrName, attrValue) => {
    const validVariants = (variantsList || []).filter(
      (v) => !v.isDefault || (Array.isArray(v.attributes) && v.attributes.length > 0)
    );

    const matched = validVariants.filter((v) => {
      if (!Array.isArray(v.attributes)) return false;
      const hasThis = v.attributes.some((a) => a.name === attrName && a.value === attrValue);
      if (!hasThis) return false;

      const otherAttrs = Object.entries(selectedAttributes).filter(([k]) => k !== attrName);
      if (otherAttrs.length === 0) return true;

      return otherAttrs.every(([k, vVal]) => {
        const matchOther = v.attributes.find((a) => a.name === k);
        return matchOther && matchOther.value === vVal;
      });
    });

    if (matched.length === 0) {
      return { exists: false, inStock: false, variant: null };
    }

    const availStock = matched.reduce((sum, v) => {
      const s = Math.max(0, (Number(v.stock) || 0) - (Number(v.allocated) || 0));
      return sum + s;
    }, 0);

    return {
      exists: true,
      inStock: availStock > 0,
      variant: matched[0],
    };
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    // Nếu sản phẩm có nhiều biến thể mà người dùng CHƯA chọn
    if (hasMultipleVariants && !selectedVariant) {
      setVariantError(true);
      toast(`Vui lòng chọn ${groupTitle} trước khi thêm vào giỏ hàng!`, {
        type: 'warning',
      });
      return;
    }

    if (isAddingToCart) return;
    setIsAddingToCart(true);

    const payload = {
      productId: product._id || product.id,
      variantId: selectedVariant?._id || selectedVariant?.id,
      sku: selectedVariant?.sku,
      quantity,
    };

    const res = await addToCart(payload);
    setIsAddingToCart(false);

    // Thành công: global AddToCartSuccessHud trong cartStore tự động kích hoạt
  };

  // Mua ngay
  const handleBuyNow = async () => {
    // Nếu sản phẩm có nhiều biến thể mà người dùng CHƯA chọn
    if (hasMultipleVariants && !selectedVariant) {
      setVariantError(true);
      toast(`Vui lòng chọn ${groupTitle} trước khi mua hàng!`, {
        type: 'warning',
      });
      return;
    }

    const payload = {
      productId: product._id || product.id,
      variantId: selectedVariant?._id || selectedVariant?.id,
      sku: selectedVariant?.sku,
      quantity,
    };
    await addToCart(payload, { isBuyNow: true });
    closeQuickView();
    router.push('/checkout');
  };

  const handleCompareClick = () => {
    addProduct(product);
  };

  const compared = isCompared(product._id || product.id);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
          className={`relative bg-white rounded-[6px] shadow-lg border border-slate-200 w-full max-h-[88vh] overflow-y-auto no-scrollbar ${isVisible ? 'animate-ega-scale-in' : 'animate-ega-scale-out'
            }`}
        >
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* ============ LEFT: GALLERY ============ */}
            <div className="space-y-3">
              {/* Main Preview */}
              <div className="relative aspect-4/3 sm:aspect-square w-full bg-white rounded-[6px] border border-slate-200 flex items-center justify-center overflow-hidden p-3">
                {product.isHot && (
                  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#e30019] text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                    <Flame size={12} className="fill-current" />
                    SẢN PHẨM HOT
                  </span>
                )}
                {product.isFeatured && !product.isHot && (
                  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                    <Star size={12} className="fill-current" />
                    SẢN PHẨM NỔI BẬT
                  </span>
                )}

                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/logo-shop.jpg';
                  }}
                />
              </div>

              {/* Thumbnail Carousel */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIdx(idx);
                        setVariantSelectedImage(null);
                      }}
                      className={`w-14 h-14 rounded-[6px] border p-1 bg-white shrink-0 transition cursor-pointer overflow-hidden ${activeImageIdx === idx && !variantSelectedImage
                          ? 'border-[#e30019] ring-2 ring-[#e30019]/20'
                          : 'border-slate-200 hover:border-slate-400'
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
                    {product.brand?.logo?.url ? (
                      <Link
                        href={`/search?brand=${encodeURIComponent(brandSlug || product.brand?._id || brandName)}`}
                        onClick={handleClose}
                        title={`Thương hiệu: ${brandName}`}
                        className="inline-flex items-center hover:opacity-85 transition-opacity"
                      >
                        <img
                          src={product.brand.logo.url}
                          alt={brandName}
                          className="h-5 max-w-[64px] object-contain inline-block border border-slate-200 rounded-[4px] px-1 bg-white hover:border-slate-300"
                        />
                      </Link>
                    ) : (
                      <span>
                        Thương hiệu:{' '}
                        {brandSlug ? (
                          <Link
                            href={`/search?brand=${encodeURIComponent(brandSlug || brandName)}`}
                            onClick={handleClose}
                            className="font-bold text-gray-900 hover:text-[#e30019] transition-colors cursor-pointer"
                          >
                            {brandName}
                          </Link>
                        ) : (
                          <strong className="text-gray-800">{brandName}</strong>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Compare Link */}
                  <button
                    type="button"
                    onClick={handleCompareClick}
                    className={`flex items-center gap-1 text-xs font-semibold cursor-pointer transition ${compared ? 'text-emerald-600' : 'text-blue-600 hover:text-blue-700'
                      }`}
                  >
                    <ArrowLeftRight size={13} />
                    <span>{compared ? 'Đã thêm so sánh' : 'So sánh'}</span>
                  </button>
                </div>
              </div>

              {/* Price Box */}
              <div className={`p-3 rounded-[6px] flex items-baseline gap-2.5 flex-wrap ${isFlashSale ? 'bg-red-50/70 border border-red-200' : 'bg-slate-50 border border-slate-200'}`}>
                <span className="text-2xl font-black text-[#e30019] font-mono tabular-nums">
                  {displayPrice > 0 ? `${displayPrice.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}
                </span>
                {originalPrice > 0 && (
                  <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                    {originalPrice.toLocaleString('vi-VN')} ₫
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-1.5 py-0.5 rounded-[4px] bg-[#e30019] text-white text-xs font-bold font-mono">
                    -{discountPercent}%
                  </span>
                )}
                {isFlashSale && (
                  <span className="ml-auto px-2 py-0.5 rounded-[4px] text-[11px] font-black uppercase text-white bg-red-600 shadow-2xs">
                    Giá Flash Sale
                  </span>
                )}
              </div>

              {/* Cảnh báo yêu cầu chọn phân loại khi người dùng chưa chọn */}
              {variantError && (
                <div className="p-2 sm:p-2.5 rounded-[6px] bg-red-50 border border-red-300 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle size={15} className="shrink-0 text-red-600" />
                  <span>Vui lòng chọn {groupTitle} trước khi thêm vào giỏ hàng hoặc mua ngay!</span>
                </div>
              )}

              {/* Variant Selectors (Phân nhóm đa thuộc tính: Màu sắc, Dung lượng, Kích thước...) */}
              {attributeGroups.length > 0 ? (
                <div className={`space-y-3 pt-1 p-2 rounded-[6px] transition-all ${variantError ? 'bg-red-50/40 border border-red-200 ring-1 ring-red-200' : ''}`}>
                  {attributeGroups.map((group) => {
                    const isColorGroup = group.type === 'color' || group.name.toLowerCase().includes('màu');
                    const selectedVal = selectedAttributes[group.name] || '';

                    return (
                      <div key={group.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                          <span>{group.name}:</span>
                          {selectedVal ? (
                            <span className="text-slate-500 font-normal">
                              Đã chọn: <strong className="text-red-600">{selectedVal}</strong>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal text-[11px]">Chưa chọn</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {group.values.map((item) => {
                            const isSelected = selectedVal === item.value;
                            const status = checkValueStatus(group.name, item.value);
                            const isUnavailable = !status.exists;
                            const isOutOfStockItem = status.exists && !status.inStock;

                            return (
                              <button
                                key={item.value}
                                type="button"
                                disabled={isUnavailable}
                                onClick={() => handleSelectAttributeValue(group.name, item.value)}
                                className={`min-w-16 px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-all select-none active:scale-[0.98] flex items-center gap-1.5 ${isSelected
                                    ? 'border-2 border-red-600 text-red-600 bg-red-50/30 font-bold shadow-2xs ring-1 ring-red-600/30'
                                    : isUnavailable
                                      ? 'border border-dashed border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                      : isOutOfStockItem
                                        ? 'border border-slate-200 bg-slate-50 text-slate-400 line-through cursor-pointer'
                                        : 'border border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:text-slate-900 cursor-pointer shadow-2xs'
                                  }`}
                              >
                                {isColorGroup && (
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border shrink-0 ${isSelected ? 'border-red-600 scale-110 shadow-2xs' : 'border-slate-300'
                                      }`}
                                    style={{
                                      backgroundColor: resolveDisplayColor(
                                        item.colorCode,
                                        item.value
                                      ),
                                    }}
                                  />
                                )}
                                <span>{item.value}</span>
                                {isOutOfStockItem && !isSelected && (
                                  <span className="text-[9px] text-red-500 font-normal no-underline ml-0.5">
                                    (Hết)
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : displayVariants.length > 1 ? (
                <div className={`space-y-1.5 pt-1 p-2 rounded-[6px] transition-all ${variantError ? 'bg-red-50/40 border border-red-200 ring-1 ring-red-200' : ''}`}>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>{groupTitle}:</span>
                    {selectedVariant && (
                      <span className="text-slate-500 font-normal">
                        Đã chọn: <strong className="text-slate-900">{getVariantLabel(selectedVariant)}</strong>
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {displayVariants.map((v, i) => {
                      const isSelected =
                        Boolean(selectedVariant) &&
                        ((selectedVariant?._id && selectedVariant._id === v._id) ||
                          (selectedVariant?.sku && selectedVariant.sku === v.sku));
                      const label = getVariantLabel(v);
                      return (
                        <button
                          key={v._id || v.sku || i}
                          type="button"
                          onClick={() => handleSelectVariant(v)}
                          className={`min-w-16 px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-all cursor-pointer active:scale-[0.98] ${isSelected
                              ? 'border-2 border-red-600 text-red-600 bg-red-50/20 font-bold shadow-2xs ring-1 ring-red-600/30'
                              : 'border border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:text-slate-900'
                            }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Quantity and Stock */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Số lượng:</span>
                  <div className="flex items-center border border-slate-200 rounded-[6px] overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer active:scale-95"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-slate-900 font-mono tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer active:scale-95"
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
                  disabled={isAddingToCart}
                  className="w-full py-2.5 bg-[#e30019] hover:bg-[#c40015] disabled:opacity-80 disabled:cursor-not-allowed text-white font-bold text-xs rounded-[6px] shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-white" />
                      <span>Đang thêm vào giỏ...</span>
                    </>
                  ) : (
                    <span>Thêm vào giỏ hàng</span>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="py-2 border border-[#e30019] text-[#e30019] hover:bg-red-50 text-center font-bold text-xs rounded-[6px] transition active:scale-[0.98] cursor-pointer"
                  >
                    Mua ngay
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-center font-bold text-xs rounded-[6px] transition cursor-pointer active:scale-[0.98]"
                  >
                    Trả góp 0%
                  </button>
                </div>
              </div>

              {/* Incentive / Promotion Box */}
              <div className="p-3 rounded-[6px] bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Quà tặng độc quyền:</strong> Tặng gói truyền hình CLIP TV Gia đình 12 tháng trị giá 600.000₫. Miễn phí công lắp đặt tại nhà.
                </span>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
