'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Calendar, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PromotionCard({ promotion }) {
  if (!promotion) return null;

  const {
    name = '',
    description = '',
    type = 'percent_discount',
    discountValue = 0,
    triggerQty = null,
    payQty = null,
    scope = { type: 'all', productIds: [] },
    minOrderValue = null,
    endDate = null,
  } = promotion;

  const formattedEndDate = endDate
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(endDate))
    : 'Dài hạn';

  const getTypeBadge = () => {
    switch (type) {
      case 'percent_discount':
        return `Giảm ${discountValue}%`;
      case 'fixed_discount':
        return `Giảm ${Number(discountValue).toLocaleString('vi-VN')}₫`;
      case 'buy_x_pay_y':
        return `Mua ${triggerQty} Tính ${payQty}`;
      case 'quantity_discount':
        return `Ưu đãi số lượng`;
      default:
        return 'Khuyến mãi hot';
    }
  };

  const productList = Array.isArray(scope?.productIds) ? scope.productIds : [];

  return (
    <div className="rounded-[6px] border border-slate-200 bg-white hover:border-slate-400 transition-colors duration-150 p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Top Header Tag */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="px-2 py-0.5 rounded-[4px] bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold uppercase tracking-wider font-mono">
            {getTypeBadge()}
          </span>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono tabular-nums">
            <Calendar size={12} />
            <span>Đến {formattedEndDate}</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 [text-wrap:balance]">
          {name}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
          {description || 'Chương trình trợ giá độc quyền áp dụng tự động khi đặt hàng trực tuyến.'}
        </p>

        {/* Minimum Order Value (if applicable) */}
        {minOrderValue > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-[4px] border border-slate-100 text-[11px] text-slate-600 font-mono tabular-nums mb-3">
            <Tag size={12} className="text-slate-400" />
            <span>Đơn tối thiểu: <strong>{Number(minOrderValue).toLocaleString('vi-VN')}₫</strong></span>
          </div>
        )}

        {/* Applicable Products Preview */}
        {productList.length > 0 && (
          <div className="pt-3 border-t border-slate-100 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
              Sản phẩm tiêu biểu áp dụng ({productList.length})
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {productList.slice(0, 3).map((prod) => (
                <Link
                  key={prod._id || prod.slug}
                  href={`/products/${prod.slug || prod._id}`}
                  className="flex items-center gap-1.5 p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[4px] shrink-0 max-w-[160px] transition-colors"
                  title={prod.name}
                >
                  {prod.thumbnail && (
                    <img
                      src={prod.thumbnail}
                      alt={prod.name}
                      className="size-7 object-contain rounded-[2px] bg-white shrink-0"
                    />
                  )}
                  <span className="text-[11px] font-medium text-slate-700 truncate">
                    {prod.name}
                  </span>
                </Link>
              ))}
              {productList.length > 3 && (
                <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-1">
                  +{productList.length - 3} món
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500 font-medium">
          Tự động áp dụng tại giỏ hàng
        </span>
        <Button
          asChild
          variant="default"
          size="sm"
          className="h-8 px-3 rounded-[6px] bg-slate-900 hover:bg-red-600 text-white text-xs font-bold gap-1.5 transition active:scale-[0.98] cursor-pointer"
        >
          <Link href="/collections/all">
            <span>Mua ngay</span>
            <ArrowRight size={13} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
