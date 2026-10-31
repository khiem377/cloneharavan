'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function HomeComboCard({ combo }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const addComboToCart = useCartStore((s) => s.addComboToCart);

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const comboId = combo._id || combo.id;
  const items = combo.items || [];
  const savings = combo.savingsAmount || Math.max(0, (combo.totalOriginalPrice || 0) - (combo.comboPrice || 0));
  const percent = combo.savingsPercent || (combo.totalOriginalPrice > 0 ? Math.round((savings / combo.totalOriginalPrice) * 100) : 0);
  const virtualStock = typeof combo.virtualStock === 'number'
    ? combo.virtualStock
    : typeof combo.stock === 'number'
      ? combo.stock
      : 99;
  const isOutOfStock = virtualStock <= 0;

  const handleAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading || isOutOfStock || !comboId) return;
    setLoading(true);
    try {
      const res = await addComboToCart(comboId, 1);
      if (res?.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
      }
    } catch (err) {
      console.error('Error adding combo to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[6px] border border-slate-200 hover:border-slate-300 transition-colors p-4 sm:p-4.5 flex flex-col justify-between h-full">
      {/* ─── 1. HEADER: TÊN COMBO & THÔNG TIN ƯU ĐÃI ─── */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded-[4px]">
              Gói phối ghép
            </span>
            {virtualStock > 0 ? (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-100">
                Còn {virtualStock} bộ
              </span>
            ) : (
              <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-[4px] border border-red-100">
                Tạm hết hàng
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-1 hover:text-red-600 transition-colors">
            {combo.name}
          </h3>
        </div>

        {percent > 0 && (
          <div className="shrink-0 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-[4px] uppercase tracking-tight">
            GIẢM {percent}%
          </div>
        )}
      </div>

      {/* ─── 2. DANH SÁCH SẢN PHẨM GHÉP ĐÔI (LAZY LOAD IMAGES & CLEAN + TEXT) ─── */}
      <div className="py-3.5 my-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          {items.map((item, idx) => {
            const product = item.productId || {};
            const thumb = product.thumbnail?.url || product.thumbnail || '/logo-shop.jpg';
            const price = item.originalPrice || product.cachedPrice || product.price || 0;

            return (
              <React.Fragment key={product._id || idx}>
                {idx > 0 && (
                  <span className="text-slate-400 font-bold text-base sm:text-lg select-none px-1">
                    +
                  </span>
                )}

                <div className="flex-1 w-full flex items-center gap-3 min-w-0 p-2 rounded-[6px] bg-slate-50/60 border border-slate-100">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[4px] overflow-hidden border border-slate-200 shrink-0 bg-white p-1">
                    <img
                      src={thumb}
                      alt={product.name || 'Sản phẩm'}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = '/logo-shop.jpg';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">
                      {product.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded-[3px] border border-slate-200">
                        SL: {item.quantity || 1}
                      </span>
                      <span className="font-mono tabular-nums text-xs text-slate-400 line-through">
                        {formatPrice(price)}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ─── 3. TỔNG GIÁ & NÚT THÊM VÀO GIỎ ─── */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums font-black text-xl text-red-600">
              {formatPrice(combo.comboPrice)}
            </span>
            {combo.totalOriginalPrice > combo.comboPrice && (
              <span className="font-mono tabular-nums text-xs text-slate-400 line-through">
                {formatPrice(combo.totalOriginalPrice)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
              Tiết kiệm {formatPrice(savings)} so với mua lẻ
            </div>
          )}
        </div>

        <button
          type="button"
          data-no-drag="true"
          onClick={handleAddToCart}
          disabled={loading || isOutOfStock}
          className={`px-4 py-2 sm:py-2.5 rounded-[6px] font-bold text-xs sm:text-sm transition-all active:scale-[0.98] shrink-0 cursor-pointer ${
            added
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-2xs'
          }`}
        >
          {loading ? 'Đang thêm...' : added ? 'Đã thêm vào giỏ!' : 'Thêm combo vào giỏ'}
        </button>
      </div>
    </div>
  );
}
