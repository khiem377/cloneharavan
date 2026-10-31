'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Icon from '../common/Icon';
import PALETTE from '../../constants/palette';
import ShopLogo from '../common/ShopLogo';
import SearchBar from './SearchBar';
import AccountMenu from './AccountMenu';
import useCartStore from '@/store/cartStore';
import { formatLogoUrl } from '@/utils/imageUtils';

export const HeaderTop = ({ onOpenCategoryDrawer, storeSetting = null, initialUser = null }) => {
  const { items, totalItems, fetchCart, initialized } = useCartStore();

  useEffect(() => {
    if (!initialized) {
      fetchCart();
    }
  }, [initialized, fetchCart]);

  // Tổng số loại sản phẩm trong giỏ (không tính số lượng lặp lại của từng món)
  const productCount = Array.isArray(items) ? items.length : (totalItems || 0);

  return (
    <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 py-2 sm:py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-6">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-2">
          {onOpenCategoryDrawer && (
            <button
              type="button"
              onClick={onOpenCategoryDrawer}
              className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 md:hidden cursor-pointer"
              aria-label="Mở menu danh mục"
            >
              <Icon name="menu" size={22} color="#284ea1" />
            </button>
          )}

          <Link href="/" className="flex items-center shrink-0 py-0.5 hover:opacity-95 transition">
            {storeSetting?.logo ? (
              <img
                src={formatLogoUrl(storeSetting.logo)}
                alt={storeSetting.name || 'Logo'}
                className="h-9 sm:h-10 md:h-11 max-h-12 w-auto max-w-[180px] sm:max-w-[220px] object-contain"
              />
            ) : (
              <ShopLogo />
            )}
          </Link>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex md:hidden items-center gap-2 sm:gap-3">
          <Link
            href="/live"
            aria-label="Xem livestream bán hàng"
            className="flex items-center gap-1 px-2 py-0.5 border border-red-500 text-red-600 rounded-[4px] text-[11px] font-semibold hover:bg-red-50 active:scale-[0.98] transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>LIVE</span>
          </Link>

          <AccountMenu initialUser={initialUser} />

          {/* Mobile Cart Pill Button */}
          <Link
            href="/cart"
            aria-label="Xem giỏ hàng"
            className="flex items-center gap-1.5 bg-[#284ea1] hover:bg-[#1e3b82] text-white px-2.5 py-1 rounded-full text-xs font-bold active:scale-[0.98] transition shadow-xs"
          >
            <Icon name="header-bag" size={17} color="#ffffff" strokeWidth={2} />
            <span className="font-mono tabular-nums">{productCount}</span>
          </Link>
        </div>
      </div>

      <div className="w-full md:flex-1 md:max-w-xl lg:max-w-2xl 2xl:max-w-3xl">
        <SearchBar />
      </div>

      {/* DESKTOP CONTROLS */}
      <div className="hidden md:flex items-center gap-3 sm:gap-4 shrink-0">
        <Link
          href="/live"
          aria-label="Xem livestream bán hàng"
          className="flex items-center gap-1.5 px-2.5 py-1 border border-red-500 text-red-600 rounded-[4px] text-xs font-semibold hover:bg-red-50 active:scale-[0.98] transition"
        >
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span>LIVE</span>
        </Link>

        <AccountMenu initialUser={initialUser} />

        {/* NÚT GIỎ HÀNG PILL ĐỒNG BỘ THEME #284ea1 */}
        <Link
          href="/cart"
          aria-label="Xem giỏ hàng"
          className="flex items-center gap-2.5 bg-[#284ea1] hover:bg-[#1e3b82] text-white px-3.5 py-1.5 rounded-full active:scale-[0.98] transition-all shadow-xs cursor-pointer select-none group"
        >
          <Icon name="header-bag" size={22} color="#ffffff" strokeWidth={2.2} className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-100">
              GIỎ HÀNG
            </span>
            <span className="text-xs font-bold text-white font-mono tabular-nums mt-0.5">
              {productCount} Sản phẩm
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HeaderTop;
