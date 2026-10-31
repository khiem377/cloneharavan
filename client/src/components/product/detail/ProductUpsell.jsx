'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function ProductUpsell({
  product,
  variants = [],
  selectedVariant,
  onSelectVariant,
  upsellData = null,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const currentPrice = useMemo(() => {
    const p = selectedVariant?.salePrice || selectedVariant?.price || product?.salePrice || product?.price || 0;
    return Number(p);
  }, [selectedVariant, product]);

  const currentVariantName = useMemo(() => {
    if (selectedVariant?.attributes?.length > 0) {
      return selectedVariant.attributes.map((a) => a.value).join(' - ');
    }
    if (selectedVariant?.displayName && selectedVariant.displayName !== 'Mặc định') {
      return selectedVariant.displayName;
    }
    return 'Cấu hình tiêu chuẩn';
  }, [selectedVariant]);

  const tier1Items = useMemo(() => {
    if (upsellData?.tier1 && Array.isArray(upsellData.tier1) && upsellData.tier1.length > 0) {
      return upsellData.tier1;
    }

    if (!Array.isArray(variants) || variants.length <= 1) return [];

    const currentVarId = selectedVariant?._id || selectedVariant?.id;
    return variants
      .filter((v) => {
        const vId = v._id || v.id;
        if (vId === currentVarId) return false;
        const vPrice = Number(v.salePrice || v.price || 0);
        return vPrice > currentPrice;
      })
      .map((v) => {
        const vPrice = Number(v.salePrice || v.price || 0);
        const validAttrs = v.attributes?.filter((a) => {
          const val = String(a.value || '').trim().toLowerCase();
          return !['mặc định', 'mac dinh', 'default', 'default title', 'tiêu chuẩn', 'tieu chuan'].includes(val);
        });
        const name =
          validAttrs?.length > 0
            ? validAttrs.map((a) => a.value).join(' - ')
            : v.displayName && !['mặc định', 'mac dinh', 'default', 'default title'].includes(String(v.displayName).toLowerCase().trim())
              ? v.displayName
              : 'Bản nâng cấp';
        return {
          variantId: v._id || v.id,
          variantObj: v,
          displayName: name,
          price: vPrice,
          priceDiff: vPrice - currentPrice,
          stock: v.stock || 0,
        };
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 4);
  }, [upsellData, variants, selectedVariant, currentPrice]);

  const tier2Items = useMemo(() => {
    if (upsellData?.tier2 && Array.isArray(upsellData.tier2) && upsellData.tier2.length > 0) {
      return upsellData.tier2.slice(0, 2);
    }
    return [];
  }, [upsellData]);

  if (tier1Items.length === 0 && tier2Items.length === 0) return null;

  const minDiff = tier1Items[0]?.priceDiff || 0;

  const handleSelectUpgrade = (item) => {
    if (item.variantObj) {
      onSelectVariant?.(item.variantObj);
    } else if (item.variantId) {
      const found = variants.find((v) => (v._id || v.id) === item.variantId);
      if (found) onSelectVariant?.(found);
    }
    setIsOpen(false);
  };

  return (
    <>
      <Card className="rounded-[6px] border-slate-200 bg-slate-50/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-none">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 uppercase tracking-wide">
              Gợi ý nâng cấp cấu hình
            </span>
            <Badge variant="outline" className="text-[10px] text-red-600 bg-red-50 border-red-200 px-1.5 py-0 font-bold">
              TIẾT KIỆM
            </Badge>
          </div>
          <span className="text-slate-600 mt-0.5 truncate">
            {tier1Items.length > 0
              ? `Có ${tier1Items.length} tùy chọn lớn hơn (chỉ thêm từ +${minDiff.toLocaleString('vi-VN')}₫)`
              : 'Có model cao cấp hơn phù hợp nhu cầu của bạn'}
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={() => setIsOpen(true)}
          className="h-8 px-3 rounded-[6px] bg-slate-900 hover:bg-black text-white font-bold text-xs shrink-0"
        >
          So sánh & Nâng cấp
        </Button>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] p-0 flex flex-col rounded-[6px] overflow-hidden">
          <DialogHeader className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
            <DialogTitle className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Gợi ý nâng cấp cấu hình & Lên đời
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Đang xem: <strong>{currentVariantName}</strong> • {currentPrice.toLocaleString('vi-VN')}₫
            </p>
          </DialogHeader>

          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
            {tier1Items.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1 block">
                  Nâng cấp tùy chọn lớn hơn trong cùng sản phẩm:
                </span>
                <div className="flex flex-col gap-2">
                  {tier1Items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-[6px] border border-slate-200 bg-white hover:border-red-400 transition-colors"
                    >
                      <div className="flex flex-col min-w-0 pr-3">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {item.displayName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="font-extrabold text-red-600 font-mono tabular-nums">
                            {item.price?.toLocaleString('vi-VN')}₫
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">
                            Chỉ bù thêm: <strong className="font-mono tabular-nums">+{item.priceDiff?.toLocaleString('vi-VN')}₫</strong>
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={() => handleSelectUpgrade(item)}
                        className="h-8 px-3 rounded-[6px] bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0"
                      >
                        Chọn nâng cấp
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tier2Items.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1 block">
                  Lên đời model cao cấp hơn:
                </span>
                <div className="flex flex-col gap-2">
                  {tier2Items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-[6px] border border-slate-200 bg-white hover:border-slate-400 transition-colors"
                    >
                      <div className="flex flex-col min-w-0 pr-3">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="font-extrabold text-red-600 font-mono tabular-nums">
                            {item.price?.toLocaleString('vi-VN')}₫
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-mono tabular-nums">
                            Bù thêm +{item.priceDiff?.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 rounded-[6px] border-slate-300 hover:border-slate-900 text-slate-800 font-bold text-xs shrink-0"
                      >
                        <Link href={`/products/${item.slug || item.productId}`}>
                          Xem sản phẩm
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 px-4 rounded-[6px] text-xs font-semibold"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
