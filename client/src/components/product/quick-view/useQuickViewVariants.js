'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import useQuickViewStore from '@/store/quickViewStore';
import useCompareStore from '@/store/compareStore';
import useCartStore from '@/store/cartStore';
import { toast } from '@/components/ui/toast';

export const isDefaultVariantName = (name) => {
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

export const getVariantLabel = (v) => {
  if (!v) return '';
  if (v.attributes && v.attributes.length > 0) {
    const validAttrs = v.attributes.filter((a) => !isDefaultVariantName(a.value));
    if (validAttrs.length > 0) return validAttrs.map((a) => a.value).join(' - ');
  }
  if (v.displayName && !isDefaultVariantName(v.displayName)) {
    if (v.displayName.includes(' - ')) return v.displayName.split(' - ').pop().trim();
    return v.displayName;
  }
  if (v.title && !isDefaultVariantName(v.title)) return v.title;
  if (v.name && !isDefaultVariantName(v.name)) return v.name;
  return '';
};

export const getVariantImage = (v) => {
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

export function useQuickViewVariants({ product, isOpen, closeQuickView }) {
  const router = useRouter();
  const { addProduct, isCompared } = useCompareStore();
  const { addToCart } = useCartStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [variantSelectedImage, setVariantSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variantsList, setVariantsList] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [variantError, setVariantError] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) return;

    if (typeof product === 'string') {
      api
        .get(`/products/${product}`)
        .then((res) => {
          const fetched = res.data?.data || res.data;
          if (fetched && (fetched._id || fetched.id)) {
            useQuickViewStore.getState().openQuickView(fetched);
          }
        })
        .catch(() => {});
      return;
    }

    setActiveImageIdx(0);
    setVariantSelectedImage(null);
    setQuantity(1);
    setVariantError(false);

    const initialVars = Array.isArray(product.variants) ? product.variants : [];
    setVariantsList(initialVars);

    const realVars = initialVars.filter((v) => Boolean(getVariantLabel(v)));
    const hasMulti = realVars.length > 1 || (product.options?.[0]?.values?.length > 1);

    if (hasMulti) {
      setSelectedVariant(null);
    } else {
      setSelectedVariant(initialVars[0] || null);
    }

    const productId = product._id || product.id || product.slug;
    if (productId) {
      if (!product.options || product.options.length === 0 || !product.images || product.images.length === 0) {
        api
          .get(`/products/${productId}`)
          .then((res) => {
            const fullProd = res.data?.data || res.data;
            if (fullProd && fullProd.name) {
              useQuickViewStore.getState().openQuickView({
                ...fullProd,
                isFlashSale: product.isFlashSale,
                flashSalePrice: product.flashSalePrice,
                flashSaleOriginalPrice: product.flashSaleOriginalPrice,
              });
            }
          })
          .catch(() => {});
      }

      api
        .get(`/products/${productId}/variants`)
        .then((res) => {
          const fetched = res.data?.data || res.data || [];
          if (Array.isArray(fetched) && fetched.length > 0) {
            setVariantsList(fetched);
            const realFetched = fetched.filter((v) => Boolean(getVariantLabel(v)));
            if (realFetched.length <= 1) setSelectedVariant(fetched[0]);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, product]);

  const images = useMemo(() => {
    const list = [];
    const getUrl = (img) => {
      if (!img) return '';
      if (typeof img === 'string') return img.trim();
      if (img.url && typeof img.url === 'string') return img.url.trim();
      if (img.secure_url && typeof img.secure_url === 'string') return img.secure_url.trim();
      return '';
    };

    const thumb = getUrl(product?.thumbnail);
    if (thumb) list.push(thumb);

    if (Array.isArray(product?.images)) {
      product.images.forEach((img) => {
        const u = getUrl(img);
        if (u && !list.includes(u)) list.push(u);
      });
    }

    if (Array.isArray(variantsList)) {
      variantsList.forEach((v) => {
        const u = getUrl(v.thumbnail || v.image);
        if (u && !list.includes(u)) list.push(u);
      });
    }

    return list.length > 0 ? list : ['/logo-shop.jpg'];
  }, [product, variantsList]);

  const currentImage = variantSelectedImage || images[activeImageIdx] || images[0];
  const isFlashSale = Boolean(product?.isFlashSale && product?.flashSalePrice > 0);

  const activeSalePrice = isFlashSale
    ? product?.flashSalePrice
    : selectedVariant?.salePrice !== undefined && selectedVariant?.salePrice !== null && selectedVariant.salePrice > 0
    ? selectedVariant.salePrice
    : product?.salePrice || product?.cachedSalePrice || 0;

  const activeRegularPrice = isFlashSale && product?.flashSaleOriginalPrice
    ? product?.flashSaleOriginalPrice
    : selectedVariant?.price !== undefined && selectedVariant?.price !== null && selectedVariant.price > 0
    ? selectedVariant.price
    : product?.price || product?.cachedPrice || 0;

  const hasDiscount = activeSalePrice > 0 && activeRegularPrice > activeSalePrice;
  const displayPrice = activeSalePrice > 0 ? activeSalePrice : activeRegularPrice;
  const originalPrice = hasDiscount ? activeRegularPrice : 0;
  const discountPercent = hasDiscount
    ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
    : 0;

  const attributeGroups = useMemo(() => {
    if (!product) return [];
    const validVariants = (variantsList || []).filter(
      (v) => !v.isDefault || (Array.isArray(v.attributes) && v.attributes.length > 0)
    );
    if (validVariants.length <= 1 && (!product?.options || product?.options?.length === 0)) return [];

    const groupMap = new Map();
    if (Array.isArray(product?.options) && product?.options?.length > 0) {
      product.options.forEach((opt) => {
        if (opt.name && Array.isArray(opt.values) && opt.values.length > 0) {
          const valMap = new Map();
          opt.values.forEach((v) => {
            if (v && v.value && !isDefaultVariantName(v.value)) {
              valMap.set(v.value, { value: v.value, colorCode: v.colorCode || '' });
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
            group.values.set(attr.value, { value: attr.value, colorCode: attr.colorCode || '' });
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
        groups.push({ name: group.name, type: group.type, values: valuesArray });
      }
    });
    return groups;
  }, [variantsList, product?.options]);

  const selectedAttributes = useMemo(() => {
    const map = {};
    if (selectedVariant && Array.isArray(selectedVariant.attributes)) {
      selectedVariant.attributes.forEach((attr) => {
        if (attr.name && attr.value) map[attr.name] = attr.value;
      });
    }
    return map;
  }, [selectedVariant]);

  const realVariants = variantsList.filter((v) => Boolean(getVariantLabel(v)));
  const displayVariants = realVariants.length > 1 ? realVariants : [];
  const groupTitle = displayVariants[0]?.attributes?.[0]?.name || product?.options?.[0]?.name || 'Màu sắc / Phiên bản';
  const hasMultipleVariants = attributeGroups.length > 0 || displayVariants.length > 1 || Boolean(product?.options?.[0]?.values?.length > 1);

  const handleSelectVariant = (v) => {
    setSelectedVariant(v);
    setVariantError(false);
    const varImg = getVariantImage(v);
    if (varImg) {
      setVariantSelectedImage(varImg);
      const imgIdx = images.indexOf(varImg);
      if (imgIdx >= 0) setActiveImageIdx(imgIdx);
    } else {
      setVariantSelectedImage(null);
      setActiveImageIdx(0);
    }
  };

  const handleSelectAttributeValue = (attrName, attrValue) => {
    const nextAttrs = { ...selectedAttributes, [attrName]: attrValue };
    const validVariants = (variantsList || []).filter(
      (v) => !v.isDefault || (Array.isArray(v.attributes) && v.attributes.length > 0)
    );

    const exactMatch = validVariants.find((v) => {
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

    if (bestMatch) handleSelectVariant(bestMatch);
  };

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

    if (matched.length === 0) return { exists: false, inStock: false, variant: null };
    const availStock = matched.reduce((sum, v) => sum + Math.max(0, (Number(v.stock) || 0) - (Number(v.allocated) || 0)), 0);
    return { exists: true, inStock: availStock > 0, variant: matched[0] };
  };

  const handleAddToCart = async () => {
    if (hasMultipleVariants && !selectedVariant) {
      setVariantError(true);
      toast(`Vui lòng chọn ${groupTitle} trước khi thêm vào giỏ hàng!`, { type: 'warning' });
      return;
    }
    if (isAddingToCart) return;
    setIsAddingToCart(true);

    const payload = {
      productId: product?._id || product?.id,
      variantId: selectedVariant?._id || selectedVariant?.id,
      sku: selectedVariant?.sku,
      quantity,
    };
    await addToCart(payload);
    setIsAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (hasMultipleVariants && !selectedVariant) {
      setVariantError(true);
      toast(`Vui lòng chọn ${groupTitle} trước khi mua hàng!`, { type: 'warning' });
      return;
    }
    const payload = {
      productId: product?._id || product?.id,
      variantId: selectedVariant?._id || selectedVariant?.id,
      sku: selectedVariant?.sku,
      quantity,
    };
    await addToCart(payload, { isBuyNow: true });
    closeQuickView();
    router.push('/checkout');
  };

  const handleCompareClick = () => {
    if (product) addProduct(product);
  };

  const compared = isCompared(product?._id || product?.id);

  return {
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
  };
}
