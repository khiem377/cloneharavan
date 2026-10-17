import React, { useMemo } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function CheckoutOrderItemsList({
  items = [],
  gifts = [],
  loadingPreview = false,
  formatPrice,
}) {
  // Phân chia sản phẩm: Combo riêng, Sản phẩm lẻ riêng
  const { singleItems, comboGroups } = useMemo(() => {
    const singles = [];
    const combos = {};

    items.forEach((item) => {
      const isCombo = Boolean(item.isComboItem || item.comboName || item.comboId);
      if (isCombo) {
        const key = item.comboId || item.comboName || 'default_combo';
        if (!combos[key]) {
          combos[key] = {
            comboName: item.comboName || 'Gói Combo Ưu Đãi',
            items: [],
          };
        }
        combos[key].items.push(item);
      } else {
        singles.push(item);
      }
    });

    return {
      singleItems: singles,
      comboGroups: Object.values(combos),
    };
  }, [items]);

  if (items.length === 0 && gifts.length === 0) {
    if (loadingPreview) {
      return (
        <div className="py-6 space-y-2.5 animate-pulse">
          <div className="h-12 bg-slate-100 rounded-[6px]" />
          <div className="h-12 bg-slate-100 rounded-[6px]" />
        </div>
      );
    }
    return (
      <div className="py-6 text-center text-xs text-slate-500 space-y-2">
        <p>Chưa có sản phẩm nào trong đơn hàng</p>
        <Link
          href="/collections/all"
          className="inline-block text-xs font-semibold text-[#0088ff] hover:underline cursor-pointer"
        >
          Tiếp tục mua hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto pr-1 mb-4 space-y-3 divide-y divide-slate-100">
      {/* 1. KHỐI CÁC GÓI COMBO RIÊNG BIỆT */}
      {comboGroups.map((group, gIdx) => (
        <div key={`combo-${gIdx}`} className="pt-2 first:pt-0">
          <div className="p-2.5 rounded-[6px] border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
              <span>Gói combo: {group.comboName}</span>
              <span className="text-[10px] font-normal text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                Mua trọn bộ
              </span>
            </div>

            <div className="divide-y divide-emerald-100/80">
              {group.items.map((item, idx) => {
                const orig = item.originalPrice || 0;
                const current = item.unitPrice || item.priceAtAdded || item.comboPrice || 0;
                const hasDiscount = orig > current && current > 0;
                const title = item.productName || item.name || item.productId?.name || item.displayName || 'Sản phẩm';
                const variant = item.variantName || item.displayName || '';
                const img = item.thumbnail || item.image || item.productId?.thumbnail?.url || '';

                return (
                  <div key={item._id || idx} className="py-2 first:pt-0 last:pb-0 flex items-center gap-2.5 text-xs">
                    <div className="w-12 h-12 rounded-[4px] border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                      {img ? (
                        <img src={img} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-slate-400">Ảnh SP</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 leading-snug line-clamp-1">
                        {title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {variant && !['mặc định', 'default'].includes(variant.toLowerCase()) && (
                          <span className="font-sans text-slate-600 mr-1.5">{variant} |</span>
                        )}
                        <span>SL: x{item.quantity}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {hasDiscount && (
                        <div className="text-[10px] text-slate-400 line-through font-mono">
                          {formatPrice(orig * item.quantity)}
                        </div>
                      )}
                      <div className="font-mono font-bold text-emerald-800 tabular-nums">
                        {formatPrice(item.subtotal || current * item.quantity)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* 2. KHỐI CÁC SẢN PHẨM LẺ */}
      {singleItems.length > 0 && (
        <div className="pt-2 first:pt-0 space-y-2">
          {singleItems.map((item, idx) => {
            const orig = item.originalPrice || 0;
            const current = item.unitPrice || item.priceAtAdded || 0;
            const hasDiscount = orig > current && current > 0;
            const title = item.productName || item.name || item.productId?.name || item.displayName || 'Sản phẩm';
            const variant = item.variantName || item.displayName || '';
            const img = item.thumbnail || item.image || item.productId?.thumbnail?.url || '';

            return (
              <div key={item._id || idx} className="flex items-center gap-3 text-xs py-1.5">
                <div className="w-14 h-14 rounded-[4px] border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-400">Ảnh SP</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 leading-snug line-clamp-2">
                    {title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {variant && !['mặc định', 'default'].includes(variant.toLowerCase()) && (
                      <span className="font-sans text-slate-600 mr-1.5">{variant} |</span>
                    )}
                    <span>SL: x{item.quantity}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {hasDiscount && (
                    <div className="text-[11px] text-slate-400 line-through font-mono">
                      {formatPrice(orig * item.quantity)}
                    </div>
                  )}
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatPrice(item.subtotal || current * item.quantity)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. QUÀ TẶNG KÈM */}
      {gifts.map((g, idx) => (
        <div key={`gift-${idx}`} className="pt-2 first:pt-0">
          <div className="flex items-center gap-3 text-xs p-2 rounded-[4px] bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 rounded-[4px] border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
              {g.thumbnail || g.image ? (
                <img src={g.thumbnail || g.image} alt={g.productName || g.name || 'Quà tặng'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[9px] text-slate-400">Quà tặng</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 inline-block mb-0.5">
                Quà tặng kèm miễn phí
              </span>
              <p className="font-semibold text-slate-900 leading-snug line-clamp-1">
                {g.productName || g.name || 'Quà tặng'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                SL: x{g.quantity || 1}
              </p>
            </div>

            <div className="text-right shrink-0">
              {g.originalPrice > 0 && (
                <div className="text-[10px] text-slate-400 line-through font-mono">
                  {formatPrice(g.originalPrice * (g.quantity || 1))}
                </div>
              )}
              <div className="font-mono font-bold text-emerald-700 tabular-nums">
                0 đ
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
