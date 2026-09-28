'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Dialog } from '@/components/ui/dialog';

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

  // 1. Tier 1 Upsell: Nâng cấp trong cùng dòng sản phẩm
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
        const name =
          v.attributes?.length > 0
            ? v.attributes.map((a) => a.value).join(' - ')
            : v.displayName || v.sku || 'Bản cao hơn';
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

  // 2. Tier 2 Upsell: Lên đời model cao cấp hơn
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
      {/* THANH GỢI Ý NHỎ GỌN, TINH TẾ (KHÔNG CÒN NGUYÊN KHỐI THÔ XANH) */}
      <div className="rounded-[6px] border border-slate-200 bg-slate-50/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 uppercase tracking-wide">
              Gợi ý nâng cấp cấu hình
            </span>
            <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-[4px] font-bold">
              TIẾT KIỆM
            </span>
          </div>
          <span className="text-slate-600 mt-0.5 truncate">
            {tier1Items.length > 0
              ? `Có ${tier1Items.length} tùy chọn lớn hơn (chỉ thêm từ +${minDiff.toLocaleString('vi-VN')}₫)`
              : 'Có model cao cấp hơn phù hợp nhu cầu của bạn'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-[6px] bg-slate-900 hover:bg-black text-white font-bold text-xs shrink-0 cursor-pointer active:scale-[0.98] transition-colors"
        >
          [So sánh & Nâng cấp]
        </button>
      </div>

      {/* POPUP / MODAL CHI TIẾT NÂNG CẤP CẤU HÌNH (CHUẨN THẨM MỸ, KHÔNG ICON, KHÔNG EMOJI) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                Gợi ý nâng cấp cấu hình & Lên đời
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đang xem: <strong>{currentVariantName}</strong> • {currentPrice.toLocaleString('vi-VN')}₫
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-[4px] border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer active:scale-[0.98]"
              aria-label="Đóng"
            >
              Đóng [X]
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
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
                          <span className="font-extrabold text-red-600">
                            {item.price?.toLocaleString('vi-VN')}₫
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">
                            Chỉ bù thêm: <strong>+{item.priceDiff?.toLocaleString('vi-VN')}₫</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectUpgrade(item)}
                        className="px-4 py-2 rounded-[6px] bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer active:scale-[0.98]"
                      >
                        Chọn nâng cấp
                      </button>
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
                          <span className="font-extrabold text-red-600">
                            {item.price?.toLocaleString('vi-VN')}₫
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">
                            Bù thêm +{item.priceDiff?.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/products/${item.slug || item.productId}`}
                        className="px-4 py-2 rounded-[6px] border border-slate-300 hover:border-slate-900 text-slate-800 font-bold text-xs transition-colors shrink-0 active:scale-[0.98]"
                      >
                        Xem sản phẩm
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 rounded-[6px] bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer active:scale-[0.98]"
            >
              Đóng
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
