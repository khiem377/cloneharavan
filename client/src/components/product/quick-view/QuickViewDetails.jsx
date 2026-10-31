'use client';

import React from 'react';
import Link from 'next/link';
import {
  Check,
  ArrowLeftRight,
  Plus,
  Minus,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QuickViewVariantOptions from './QuickViewVariantOptions';

export default function QuickViewDetails({
  product,
  brandName,
  brandSlug,
  displayPrice,
  originalPrice,
  hasDiscount,
  discountPercent,
  isFlashSale,
  variantError,
  groupTitle,
  attributeGroups = [],
  displayVariants = [],
  selectedAttributes = {},
  selectedVariant,
  checkValueStatus,
  handleSelectAttributeValue,
  handleSelectVariant,
  getVariantLabel,
  quantity,
  setQuantity,
  handleBuyNow,
  handleAddToCart,
  isAddingToCart,
  handleCompareClick,
  compared,
  onClose,
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {product?.name}
        </h2>

        <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            {product?.brand?.logo?.url ? (
              <Link
                href={`/search?brand=${encodeURIComponent(brandSlug || product?.brand?._id || brandName)}`}
                onClick={onClose}
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
                    onClick={onClose}
                    className="font-bold text-slate-900 hover:text-red-600 transition-colors"
                  >
                    {brandName}
                  </Link>
                ) : (
                  <strong className="text-slate-800">{brandName}</strong>
                )}
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCompareClick}
            className={`h-7 px-2 text-xs font-semibold gap-1 ${
              compared ? 'text-emerald-600 hover:text-emerald-700' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <ArrowLeftRight size={13} />
            <span>{compared ? 'Đã thêm so sánh' : 'So sánh'}</span>
          </Button>
        </div>
      </div>

      <Card className={`rounded-[6px] border shadow-none ${isFlashSale ? 'bg-red-50/70 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
        <CardContent className="p-3 flex items-baseline gap-2.5 flex-wrap">
          <span className="text-2xl font-black text-red-600 font-mono tabular-nums">
            {displayPrice > 0 ? `${displayPrice.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}
          </span>
          {originalPrice > 0 && (
            <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
              {originalPrice.toLocaleString('vi-VN')} ₫
            </span>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="bg-red-600 text-white text-xs font-bold font-mono tabular-nums">
              -{discountPercent}%
            </Badge>
          )}
          {isFlashSale && (
            <Badge variant="default" className="ml-auto bg-red-600 text-white text-[11px] font-black uppercase tracking-wider gap-1">
              <Zap size={11} className="fill-white" />
              <span>Giá Flash Sale</span>
            </Badge>
          )}
        </CardContent>
      </Card>

      {variantError && (
        <Alert variant="destructive" className="p-2.5">
          <AlertCircle size={15} />
          <AlertDescription className="text-xs font-semibold">
            Vui lòng chọn {groupTitle} trước khi thêm vào giỏ hàng hoặc mua ngay!
          </AlertDescription>
        </Alert>
      )}

      <QuickViewVariantOptions
        attributeGroups={attributeGroups}
        displayVariants={displayVariants}
        selectedAttributes={selectedAttributes}
        selectedVariant={selectedVariant}
        checkValueStatus={checkValueStatus}
        handleSelectAttributeValue={handleSelectAttributeValue}
        handleSelectVariant={handleSelectVariant}
        getVariantLabel={getVariantLabel}
        groupTitle={groupTitle}
        variantError={variantError}
      />

      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Số lượng:</span>
          <div className="flex items-center border border-slate-200 rounded-[6px] overflow-hidden bg-white shadow-2xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-none text-slate-500 hover:bg-slate-100"
              aria-label="Giảm số lượng"
            >
              <Minus size={13} />
            </Button>
            <span className="w-9 text-center text-xs font-bold text-slate-900 font-mono tabular-nums">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 rounded-none text-slate-500 hover:bg-slate-100"
              aria-label="Tăng số lượng"
            >
              <Plus size={13} />
            </Button>
          </div>
        </div>

        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold gap-1">
          <Check size={13} className="text-emerald-600 stroke-[2.5]" />
          <span>Sẵn trong kho</span>
        </Badge>
      </div>

      <div className="space-y-2 pt-2">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={handleBuyNow}
          className="w-full bg-[#e30019] hover:bg-[#c70016] text-white font-bold text-xs h-10 shadow-xs active:scale-[0.98]"
        >
          <span>MUA NGAY</span>
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="h-9 border-slate-300 hover:border-slate-400 font-bold text-xs gap-1.5"
          >
            {isAddingToCart ? (
              <>
                <Loader2 size={13} className="animate-spin text-slate-700" />
                <span>Đang thêm...</span>
              </>
            ) : (
              <span>Thêm vào giỏ</span>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleAddToCart}
            className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
          >
            Trả góp 0%
          </Button>
        </div>
      </div>

      <Alert variant="warning" className="p-3">
        <ShieldCheck size={16} className="text-amber-600" />
        <AlertDescription className="text-xs text-amber-900 leading-relaxed">
          <strong>Quà tặng độc quyền:</strong> Tặng gói truyền hình CLIP TV Gia đình 12 tháng trị giá 600.000₫. Miễn phí công lắp đặt tại nhà.
        </AlertDescription>
      </Alert>
    </div>
  );
}
