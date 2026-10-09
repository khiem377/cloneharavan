'use client';

import React from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CartGiftItems({ giftPrograms = [] }) {
  if (!Array.isArray(giftPrograms) || giftPrograms.length === 0) {
    return null;
  }

  return (
    <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-4 shadow-2xs">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
          <Gift size={13} />
        </div>
        <h3 className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
          <span>Quà tặng kèm đặc quyền</span>
          <Sparkles size={14} className="text-amber-500 fill-amber-400" />
        </h3>
        <Badge className="ml-auto bg-purple-600 text-white text-[10px] px-2 py-0.5">
          Miễn phí 0₫
        </Badge>
      </div>

      <div className="space-y-2.5">
        {giftPrograms.map((program, idx) => {
          const gifts = program.gifts || [];
          return (
            <div key={program._id || idx} className="space-y-2">
              <div className="text-xs font-semibold text-purple-900">
                Chương trình: {program.name || 'Quà tặng tri ân khách hàng'}
              </div>

              {gifts.map((gift, gIdx) => (
                <div
                  key={gift._id || gIdx}
                  className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-purple-100 shadow-2xs"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                    <img
                      src={gift.thumbnail || '/logo-shop.jpg'}
                      alt={gift.name || 'Quà tặng'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 line-clamp-1">
                      {gift.name || 'Sản phẩm quà tặng'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Số lượng: <strong>x{gift.quantity || 1}</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-600">0₫</div>
                    {gift.originalPrice > 0 && (
                      <div className="text-[10px] text-slate-400 line-through">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(gift.originalPrice)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
