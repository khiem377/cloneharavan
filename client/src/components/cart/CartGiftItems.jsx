'use client';

import React from 'react';
import Link from 'next/link';

export default function CartGiftItems({ giftPrograms = [] }) {
  if (!Array.isArray(giftPrograms) || giftPrograms.length === 0) {
    return null;
  }

  // Chuẩn hóa dữ liệu quà tặng
  const normalizedPrograms = [];

  for (const item of giftPrograms) {
    if (item.gifts && Array.isArray(item.gifts)) {
      normalizedPrograms.push({
        _id: item._id || item.giftProgramId,
        name: item.name || item.giftProgramName || 'Quà tặng tri ân khách hàng',
        gifts: item.gifts,
      });
    } else if (item.isGift || item.giftProgramId || item.name) {
      const progName = item.giftProgramName || 'Quà tặng tri ân khách hàng';
      const existing = normalizedPrograms.find((p) => p.name === progName);
      if (existing) {
        existing.gifts.push(item);
      } else {
        normalizedPrograms.push({
          _id: item.giftProgramId || 'gift_prog',
          name: progName,
          gifts: [item],
        });
      }
    }
  }

  if (normalizedPrograms.length === 0) {
    return null;
  }

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 2xl:p-6 shadow-2xs">
      {/* HEADER KHỐI QUÀ TẶNG */}
      <div className="flex items-center justify-between gap-2 mb-3 2xl:mb-4 pb-2.5 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm 2xl:text-base font-bold text-slate-900 uppercase tracking-tight">
          Quà tặng kèm theo đơn hàng
        </h3>

        <span className="bg-[#284ea1] text-white text-[10px] 2xl:text-xs font-bold px-2 py-0.5 rounded-[4px] font-mono tabular-nums">
          Miễn phí 0₫
        </span>
      </div>

      {/* DANH SÁCH CHƯƠNG TRÌNH & SẢN PHẨM QUÀ */}
      <div className="space-y-3">
        {normalizedPrograms.map((program, idx) => {
          const gifts = program.gifts || [];
          return (
            <div key={program._id || idx} className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">
                Chương trình: {program.name}
              </div>

              <div className="divide-y divide-slate-100 bg-slate-50/50 border border-slate-200 rounded-[6px] overflow-hidden">
                {gifts.map((gift, gIdx) => {
                  const giftUrl = gift.slug
                    ? `/products/${gift.slug}`
                    : gift.productId?.slug
                    ? `/products/${gift.productId.slug}`
                    : gift.productId?._id
                    ? `/products/${gift.productId._id}`
                    : gift.productId
                    ? `/products/${gift.productId}`
                    : '#';
                  return (
                    <div
                      key={gift._id || gIdx}
                      className="p-3 sm:p-3.5 flex items-center gap-3 transition-colors hover:bg-slate-50"
                    >
                      {/* ẢNH QUÀ TẶNG */}
                      <Link
                        href={giftUrl}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-[4px] overflow-hidden bg-white border border-slate-200 shrink-0 block"
                      >
                        <img
                          src={gift.thumbnail || '/logo-shop.jpg'}
                          alt={gift.name || 'Quà tặng'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/logo-shop.jpg';
                          }}
                        />
                      </Link>

                      {/* TÊN & SỐ LƯỢNG */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={giftUrl}
                          className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#284ea1] line-clamp-1 transition-colors"
                        >
                          {gift.name || 'Sản phẩm quà tặng'}
                        </Link>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                          Số lượng: <strong className="text-slate-900">x{gift.quantity || gift.qty || 1}</strong>
                        </div>
                      </div>

                      {/* CỘT GIÁ (GIÁ GỐC GẠCH NGANG & GIÁ TRONG GIỎ 0đ) */}
                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-mono font-bold text-emerald-600 tabular-nums">
                          0₫
                        </div>
                        {gift.originalPrice > 0 && (
                          <div className="text-[11px] font-mono tabular-nums text-slate-400 line-through">
                            {formatPrice(gift.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
