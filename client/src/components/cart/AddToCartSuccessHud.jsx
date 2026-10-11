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
      <div className="bg-white rounded-2xl px-7 py-6 flex flex-col items-center justify-center shadow-[0_16px_50px_rgba(0,0,0,0.18)] border border-slate-100 min-w-[190px] max-w-[240px] text-center transform animate-in zoom-in-95 duration-200">
        {/* TRẠNG THÁI 1: ĐANG TẢI (LOADING) */}
        {cartHud.status === 'loading' && (
          <>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-3">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" strokeWidth={2.5} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight leading-snug">
              {cartHud.message || 'Đang thêm vào giỏ...'}
            </span>
          </>
        )}

        {/* TRẠNG THÁI 2: THÀNH CÔNG (CHỮ V CHECKMARK XANH NGỌC) */}
        {cartHud.status === 'success' && (
          <>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mb-3 text-emerald-600 shadow-[0_4px_16px_rgba(16,185,129,0.25)] animate-in zoom-in-75 duration-300">
              <Check size={32} strokeWidth={3.5} className="text-emerald-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug">
              Thêm vào giỏ hàng<br />thành công!
            </span>
          </>
        )}

        {/* TRẠNG THÁI 3: LỖI (NẾU CÓ) */}
        {cartHud.status === 'error' && (
          <>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 border-2 border-red-500 flex items-center justify-center mb-3 text-red-600 shadow-[0_4px_16px_rgba(239,68,68,0.2)] animate-in zoom-in-75 duration-300">
              <AlertCircle size={30} strokeWidth={2.5} className="text-red-600" />
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
