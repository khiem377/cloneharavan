'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, ArrowLeftRight, Check, Flame, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import useQuickViewStore from '@/store/quickViewStore';
import useCompareStore from '@/store/compareStore';

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' rx='8' fill='%23f8fafc'/%3E%3Crect x='30' y='35' width='60' height='45' rx='4' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpolyline points='48 80 40 90 80 90 72 80' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export default function ProductCard({ product }) {
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
      return u && u !== thumb1;
    });
    if (candidate) {
      thumb2 = candidate.url || (typeof candidate === 'string' ? candidate : '');
    } else if (product.images[1]) {
      thumb2 =
        product.images[1].url ||
        (typeof product.images[1] === 'string' ? product.images[1] : '');
    }
  }

  const salePrice = product.salePrice || product.cachedSalePrice || 0;
  const regularPrice = product.price || product.cachedPrice || 0;

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
    return tags.slice(0, 3);
  };

  const tags = extractTags();
  const compared = isCompared(product._id || product.id);

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct(product);
  };

  return (
    <div className="relative h-full group">
      <Link
        href={`/products/${product.slug || product._id}`}
        className="block h-full"
      >
        <Card className="h-full flex flex-col hover:border-gray-300 hover:shadow-md transition-all duration-200 p-2.5 sm:p-3 relative overflow-hidden bg-white rounded-lg">
          {/* Top Badge: HOT, NỔI BẬT or Giảm giá */}
          <div className="w-full aspect-square bg-white rounded-md overflow-hidden flex items-center justify-center p-2 mb-2 relative">
            <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1 items-start">
              {product.isHot && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e30019] text-white shadow-xs">
                  <Flame size={10} className="fill-current" />
                  HOT
                </span>
              )}
              {product.isFeatured && !product.isHot && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                  <Star size={10} className="fill-current" />
                  NỔI BẬT
                </span>
              )}
              {hasDiscount && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e30019] text-white shadow-xs">
                  -{discountPercent}%
                </span>
              )}
            </div>


            {/* Floating Action Icons on Hover */}
            <div className="absolute right-2 top-2 z-20 flex flex-col gap-1.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
              {/* Quick View Button */}
              <button
                type="button"
                onClick={handleQuickViewClick}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#e30019] text-gray-700 hover:text-white shadow-md flex items-center justify-center transition cursor-pointer"
                title="Xem nhanh sản phẩm"
              >
                <Eye size={15} />
              </button>

              {/* Compare Button */}
              <button
                type="button"
                onClick={handleCompareClick}
                className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition cursor-pointer ${compared
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-[#e30019] text-gray-700 hover:text-white'
                  }`}
                title={compared ? 'Đã thêm so sánh' : 'So sánh sản phẩm'}
              >
                {compared ? <Check size={14} /> : <ArrowLeftRight size={14} />}
              </button>
            </div>

            {/* Images with Swap Effect */}
            {thumb2 ? (
              <>
                <img
                  src={thumb1}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-300 group-hover:opacity-0"
                  loading="lazy"
                />
                <img
                  src={thumb2}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="absolute inset-0 w-full h-full object-contain p-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
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
                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            )}

            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                <Badge
                  variant="secondary"
                  className="bg-gray-900 text-white text-[10px] font-semibold rounded"
                >
                  Tạm hết hàng
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              {product.brand?.name && (
                <Link
                  href={`/collections/${product.brand.slug || product.brand.name.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-semibold text-gray-400 hover:text-[#e30019] uppercase tracking-wide block mb-0.5 transition-colors cursor-pointer w-fit"
                >
                  {product.brand.name}
                </Link>
              )}

              <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#e30019] transition-colors leading-snug">
                {product.name}
              </h3>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {tags.map((t, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="px-1.5 py-0.5 text-gray-600 rounded text-[10px] font-medium"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                {originalPrice > 0 && (
                  <span className="text-xs text-gray-400 line-through">
                    {originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-1 mt-0.5">
                {displayPrice > 0 ? (
                  <span className="text-sm sm:text-base font-bold text-[#e30019]">
                    {displayPrice.toLocaleString('vi-VN')}₫
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-500">
                    Liên hệ
                  </span>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                {/* <span className="truncate">Tặng gói Clip TV 12 tháng & BH tận nhà</span> */}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
