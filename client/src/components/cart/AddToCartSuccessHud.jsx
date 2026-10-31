'use client';

import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import useCartStore from '@/store/cartStore';

/**
 * AddToCartSuccessHud
 * Pop-up thông báo thêm giỏ hàng toàn cầu (Global HUD):
 * - Hiển thị ở chính giữa màn hình (centered pop-up).
 * - Không có backdrop che mờ màn hình (pointer-events-none, người dùng vẫn nhìn rõ toàn bộ trang).
 * - Background hộp màu TRẮNG tinh tế, bo góc mềm mại, đổ bóng nổi bật.
 * - Trạng thái Loading: Xoay vòng loading khi đang gửi request.
 * - Trạng thái Success: Hiện chữ V (Checkmark) to màu xanh ngọc + dòng chữ "Thêm vào giỏ hàng thành công!".
 * - Tự động biến mất mượt mà sau 1.5 giây.
 */
export default function AddToCartSuccessHud() {
  const { cartHud } = useCartStore();

  if (!cartHud?.visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] pointer-events-none flex items-center justify-center animate-in fade-in duration-200"
      aria-live="polite"
    >
      <div className="bg-white rounded-[6px] px-6 py-5 flex flex-col items-center justify-center shadow-sm border border-slate-200 min-w-[190px] max-w-[240px] text-center transform animate-in zoom-in-95 duration-200">
        {/* TRẠNG THÁI 1: ĐANG TẢI (LOADING) */}
        {cartHud.status === 'loading' && (
          <>
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-2.5">
              <Loader2 className="w-6 h-6 text-red-600 animate-spin" strokeWidth={2.5} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight leading-snug">
              {cartHud.message || 'Đang thêm vào giỏ...'}
            </span>
          </>
        )}

        {/* TRẠNG THÁI 2: THÀNH CÔNG (CHỮ V CHECKMARK XANH NGỌC) */}
        {cartHud.status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-500/30 flex items-center justify-center mb-2.5 text-emerald-600 animate-in zoom-in-75 duration-200">
              <Check size={26} strokeWidth={3} className="text-emerald-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug">
              Thêm vào giỏ hàng<br />thành công!
            </span>
          </>
        )}

        {/* TRẠNG THÁI 3: LỖI (NẾU CÓ) */}
        {cartHud.status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-500/30 flex items-center justify-center mb-2.5 text-red-600 animate-in zoom-in-75 duration-200">
              <AlertCircle size={26} strokeWidth={2.5} className="text-red-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug">
              {cartHud.message || 'Thêm vào giỏ thất bại'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
