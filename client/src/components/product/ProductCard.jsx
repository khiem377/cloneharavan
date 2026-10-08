'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, ArrowLeftRight, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useQuickViewStore from '@/store/quickViewStore';
import useCompareStore from '@/store/compareStore';
import trackingService from '@/services/tracking.service';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='6' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export default function ProductCard({ product, onProductClick }) {
  const router = useRouter();
  const { openQuickView } = useQuickViewStore();
  const { addProduct, isCompared } = useCompareStore();

  if (!product) return null;

  const thumb1 =
    (typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url) ||
    product.images?.[0]?.url ||
    product.brand?.logo?.url ||
    FALLBACK_IMAGE;

  let thumb2 = '';
  if (Array.isArray(product.images) && product.images.length > 0) {
    const candidate = product.images.find((img) => {
      const u = img?.url || (typeof img === 'string' ? img : '');
      return u && u !== thumb1 && (u.startsWith('http://') || u.startsWith('https://'));
    });
    if (candidate) {
      thumb2 = candidate.url || (typeof candidate === 'string' ? candidate : '');
    } else if (product.images[1]) {
      const u = product.images[1].url || (typeof product.images[1] === 'string' ? product.images[1] : '');
      if (u && (u.startsWith('http://') || u.startsWith('https://'))) {
        thumb2 = u;
      }
    }
  }

  const isFlashSale = Boolean(
    product.isFlashSale ||
    (product.flashSalePrice && product.flashSalePrice > 0)
  );
  const flashSalePrice = product.flashSalePrice || 0;

  const salePrice = isFlashSale && flashSalePrice > 0
    ? flashSalePrice
    : (product.salePrice || product.cachedSalePrice || 0);

  const regularPrice = (isFlashSale && product.flashSaleOriginalPrice)
    ? product.flashSaleOriginalPrice
    : (product.price || product.cachedPrice || 0);

  const hasDiscount = salePrice > 0 && regularPrice > salePrice;
  const displayPrice = salePrice > 0 ? salePrice : regularPrice;
  const originalPrice = hasDiscount ? regularPrice : 0;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  const extractTags = () => {
    const tags = [];
    const nameLower = (product.name || '').toLowerCase();

    const screenSizes = product.extractedAttributes?.['Kích thước màn hình'] || [];
    if (screenSizes.length > 0) {
      screenSizes.slice(0, 2).forEach((s) => tags.push(s));
    } else {
      const match = product.name?.match(
        /\b(32|40|42|43|48|50|55|58|60|65|70|75|77|85|86|98)\s*(?:["”]|inch\b)/i
      );
      if (match) {
        tags.push(`${match[1]}"`);
      } else {
        const modelMatch = product.name?.match(
          /\b(?:[A-Z]{1,4}|KD-|XR-)?(32|40|42|43|48|50|55|58|60|65|70|75|77|85|86|98)[A-Z0-9-]{3,}\b/i
        );
        if (modelMatch) {
          tags.push(`${modelMatch[1]}"`);
        }
      }
    }

    if (nameLower.includes('8k')) tags.push('8K UHD');
    else if (nameLower.includes('4k')) tags.push('4K UHD');
    else if (nameLower.includes('full hd') || nameLower.includes('fhd')) tags.push('Full HD');

    if (nameLower.includes('qled')) tags.push('QLED');
    else if (nameLower.includes('oled')) tags.push('OLED');
    else if (nameLower.includes('nanocell')) tags.push('NanoCell');

    if (nameLower.includes('inverter')) tags.push('Inverter');
    return tags.slice(0, 2);
  };

  const tags = extractTags();
  const compared = isCompared(product._id || product.id);

  const handleCardClick = () => {
    onProductClick?.(product);
    const pId = product._id || product.id;
    if (pId) {
      trackingService.recordInteraction({
        productId: pId,
        interactionType: 'view',
        context: { source: 'product_card_click' },
      });
    }
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pId = product._id || product.id;
    if (pId) {
      trackingService.recordInteraction({
        productId: pId,
        interactionType: 'product_detail',
        context: { source: 'quick_view' },
      });
    }
    openQuickView({
      ...product,
      isFlashSale,
      flashSalePrice: isFlashSale ? flashSalePrice : undefined,
      flashSaleOriginalPrice: isFlashSale ? regularPrice : undefined,
    });
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pId = product._id || product.id;
    if (pId) {
      trackingService.recordInteraction({
        productId: pId,
        interactionType: 'compare_add',
        context: { source: 'compare_btn' },
      });
    }
    addProduct(product);
  };

  return (
    <div className="relative h-full group flex flex-col flex-1">
      <Link
        href={`/products/${product.slug || product._id}`}
        className="flex flex-col flex-1 h-full"
        onClick={handleCardClick}
      >
        <Card className="flex-1 flex flex-col hover:border-slate-400 transition-colors duration-150 p-2.5 sm:p-3 relative overflow-hidden bg-white rounded-[6px] border border-slate-200">
          {/* Top Badge: Pure text flat badges */}
          <div className="w-full aspect-square bg-white rounded-[4px] overflow-hidden flex items-center justify-center p-2 mb-2 relative">
            <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1 items-start">
              {isFlashSale && (
                <Badge variant="default" className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                  FLASH SALE
                </Badge>
              )}
              {product.isHot && !isFlashSale && (
                <Badge variant="default" className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-amber-600 text-white uppercase">
                  HOT
                </Badge>
              )}
              {product.isFeatured && !product.isHot && !isFlashSale && (
                <Badge variant="default" className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-slate-800 text-white uppercase">
                  NỔI BẬT
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="default" className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-red-600 text-white font-mono">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {/* Floating Action Icons on Hover */}
            <div className="absolute right-1.5 top-1.5 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Button
                type="button"
                variant="outline"
                size="icon"
                data-no-progress="true"
                onClick={handleQuickViewClick}
                className="size-7 rounded-[4px] bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer p-0 shadow-none"
                title="Xem nhanh"
                aria-label={`Xem nhanh sản phẩm ${product.name || ''}`}
              >
                <Eye size={13} />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                data-no-progress="true"
                onClick={handleCompareClick}
                className={`size-7 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer p-0 shadow-none ${
                  compared
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 hover:bg-slate-900 hover:text-white text-slate-700'
                }`}
                title={compared ? 'Đã thêm so sánh' : 'So sánh'}
                aria-label={compared ? `Đã thêm ${product.name || ''} vào so sánh` : `Thêm ${product.name || ''} vào so sánh`}
              >
                {compared ? <Check size={13} /> : <ArrowLeftRight size={13} />}
              </Button>
            </div>

            {/* Images */}
            {thumb2 ? (
              <>
                <img
                  src={thumb1}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-200 group-hover:opacity-0"
                  loading="lazy"
                />
                <img
                  src={thumb2}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="absolute inset-0 w-full h-full object-contain p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  loading="lazy"
                />
              </>
            ) : (
              <img
                src={thumb1}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-contain p-2"
                loading="lazy"
              />
            )}

            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10">
                <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] border border-slate-700">
                  Tạm hết hàng
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  if (product.brand?.name) {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/collections/${product.brand.slug || product.brand.name.toLowerCase()}`);
                  }
                }}
                className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 transition-colors truncate ${
                  product.brand?.name
                    ? 'text-slate-400 hover:text-slate-900 cursor-pointer w-fit'
                    : 'text-transparent select-none'
                }`}
              >
                {product.brand?.name || '—'}
              </span>

              <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug h-8">
                {product.name}
              </h3>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 text-slate-600 text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto pt-2 border-t border-slate-100">
              {originalPrice > 0 && (
                <span className="text-[11px] text-slate-400 line-through font-mono tabular-nums block">
                  {originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}

              <div className="flex items-baseline justify-between gap-1 mt-0.5">
                {displayPrice > 0 ? (
                  <span className="text-sm font-bold text-red-600 font-mono tabular-nums">
                    {displayPrice.toLocaleString('vi-VN')}₫
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">
                    Liên hệ
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
