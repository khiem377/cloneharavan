'use client';

import { useState, useMemo, useEffect } from 'react';

export function isDefaultVariantName(name) {
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
}

export function getVariantLabel(v) {
  if (!v) return '';
  if (Array.isArray(v.attributes) && v.attributes.length > 0) {
    const validAttrs = v.attributes.filter((a) => !isDefaultVariantName(a.value));
    if (validAttrs.length > 0) {
      return validAttrs.map((a) => a.value).join(' - ');
    }
  }
  if (v.displayName && !isDefaultVariantName(v.displayName)) return v.displayName;
  if (v.title && !isDefaultVariantName(v.title)) return v.title;
  if (v.name && !isDefaultVariantName(v.name)) return v.name;
  return '';
}

export function useProductVariants({
  product,
  variants = [],
  selectedVariant,
  onSelectVariant,
  deals = null,
  quantity = 1,
}) {
  const realVariants = useMemo(() => {
    if (!Array.isArray(variants) || variants.length <= 1) return [];
    return variants.filter((v) => Boolean(getVariantLabel(v)));
  }, [variants]);

  const attributeGroups = useMemo(() => {
    const validVariants = (variants || []).filter(
      (v) => !v.isDefault || (Array.isArray(v.attributes) && v.attributes.length > 0)
    );

    if (validVariants.length <= 1 && (!product.options || product.options.length === 0)) {
      return [];
    }

    const groupMap = new Map();

    if (Array.isArray(product.options) && product.options.length > 0) {
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
            group.values.set(attr.value, {
              value: attr.value,
              colorCode: attr.colorCode || '',
            });
          }
        });
      }
    });

    return Array.from(groupMap.values()).map((g) => ({
      name: g.name,
      type: g.type,
      values: Array.from(g.values.values()),
    }));
  }, [product.options, variants]);

  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    if (!selectedVariant || !Array.isArray(selectedVariant.attributes)) return;
    const initialMap = {};
    selectedVariant.attributes.forEach((attr) => {
      if (attr.name && attr.value && !isDefaultVariantName(attr.value)) {
        initialMap[attr.name] = attr.value;
      }
    });
    if (Object.keys(initialMap).length > 0) {
      setSelectedAttributes(initialMap);
    }
  }, [selectedVariant?._id]);

  const handleSelectAttributeValue = (attrName, attrValue) => {
    const nextAttrs = { ...selectedAttributes, [attrName]: attrValue };
    setSelectedAttributes(nextAttrs);

    if (!Array.isArray(variants) || variants.length === 0) return;

    let matched = variants.find((v) => {
      if (!Array.isArray(v.attributes)) return false;
      return Object.entries(nextAttrs).every(([name, val]) =>
        v.attributes.some((a) => a.name === name && a.value === val)
      );
    });

    if (!matched) {
      matched = variants.find((v) => {
        if (!Array.isArray(v.attributes)) return false;
        return v.attributes.some((a) => a.name === attrName && a.value === attrValue);
      });
    }

    if (matched && onSelectVariant) {
      onSelectVariant(matched);
    }
  };

  const checkValueStatus = (groupName, value) => {
    if (!Array.isArray(variants) || variants.length === 0) {
      return { exists: true, inStock: true, variant: null };
    }

    const testAttrs = { ...selectedAttributes, [groupName]: value };
    let candidate = variants.find((v) => {
      if (!Array.isArray(v.attributes)) return false;
      return Object.entries(testAttrs).every(([name, val]) =>
        v.attributes.some((a) => a.name === name && a.value === val)
      );
    });

    if (!candidate) {
      candidate = variants.find((v) => {
        if (!Array.isArray(v.attributes)) return false;
        return v.attributes.some((a) => a.name === groupName && a.value === value);
      });
    }

    if (!candidate) {
      return { exists: false, inStock: false, variant: null };
    }

    const avail = Math.max(0, (Number(candidate.stock) || 0) - (Number(candidate.allocated) || 0));
    return {
      exists: true,
      inStock: avail > 0,
      variant: candidate,
    };
  };

  const formatVariantPriceDiff = (diff) => {
    if (!diff || Math.abs(diff) < 1000) return '';
    const sign = diff > 0 ? '+' : '-';
    const abs = Math.abs(diff);
    if (abs >= 1000000) {
      const tr = (abs / 1000000).toFixed(1);
      const cleanTr = tr.endsWith('.0') ? parseInt(tr, 10) : tr;
      if (cleanTr === 0 || cleanTr === '0') return '';
      return `(${sign}${cleanTr}Tr)`;
    }
    const k = Math.round(abs / 1000);
    return k <= 0 ? '' : `(${sign}${k}k)`;
  };

  const flashSaleDeal = deals?.flashSale || null;
  const flashSaleItems = deals?.flashSaleItems || [];
  const isFlashSale = Boolean(deals?.isFlashSale && flashSaleDeal?.price > 0);

  const matchedFsItem = useMemo(() => {
    if (!isFlashSale || !flashSaleItems.length) return flashSaleDeal;
    if (!selectedVariant) return flashSaleDeal;
    const vId = selectedVariant._id?.toString();
    const byVariant = flashSaleItems.find((i) => i.variantId && i.variantId === vId);
    if (byVariant) return byVariant;
    const noVariant = flashSaleItems.find((i) => !i.variantId);
    return noVariant || flashSaleDeal;
  }, [isFlashSale, flashSaleItems, selectedVariant, flashSaleDeal]);

  const activeSalePrice =
    isFlashSale && matchedFsItem?.price > 0
      ? matchedFsItem.price
      : selectedVariant?.salePrice !== undefined && selectedVariant?.salePrice !== null && selectedVariant.salePrice > 0
      ? selectedVariant.salePrice
      : product.salePrice || product.cachedSalePrice || 0;

  const activeRegularPrice =
    isFlashSale && matchedFsItem?.originalPrice
      ? matchedFsItem.originalPrice
      : selectedVariant?.price !== undefined && selectedVariant?.price !== null && selectedVariant.price > 0
      ? selectedVariant.price
      : product.price || product.cachedPrice || 0;

  const hasDiscount = activeSalePrice > 0 && activeRegularPrice > activeSalePrice;
  const currentBasePrice = activeSalePrice > 0 ? activeSalePrice : activeRegularPrice;
  const originalPrice = hasDiscount ? activeRegularPrice : 0;
  const discountPercent = hasDiscount
    ? Math.round(((activeRegularPrice - activeSalePrice) / activeRegularPrice) * 100)
    : 0;
  const savingsAmount = hasDiscount ? activeRegularPrice - activeSalePrice : 0;

  const getPriceDifferenceLabel = (attrName, attrValue) => {
    const status = checkValueStatus(attrName, attrValue);
    if (!status.exists || !status.variant) return '';
    const targetPrice = status.variant.salePrice > 0 ? status.variant.salePrice : status.variant.price;
    return formatVariantPriceDiff(targetPrice - (currentBasePrice || 0));
  };

  const activeVariant =
    selectedVariant ||
    (Array.isArray(variants) && variants.length > 0
      ? variants.find((v) => v.isDefault) || variants[0]
      : null);

  const getAvail = (stock, allocated) => Math.max(0, (Number(stock) || 0) - (Number(allocated) || 0));
  const currentStock = activeVariant
    ? getAvail(activeVariant.stock, activeVariant.allocated)
    : getAvail(product.stock, product.allocated);

  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= 5;
  const finalTotalPrice = currentBasePrice * quantity;

  const primaryGift = !isFlashSale && deals?.giftPrograms?.length > 0 ? deals.giftPrograms[0] : null;
  const triggerQty = primaryGift?.triggerQty || 0;
  const isGiftUnlocked = primaryGift && quantity >= triggerQty;
  const giftProductNames =
    primaryGift?.giftType === 'same_product'
      ? 'Sản phẩm cùng loại'
      : primaryGift?.giftProducts?.map((p) => p.productId?.name || 'Quà tặng kèm').join(', ') || 'Quà tặng kèm';

  return {
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
  };
}
