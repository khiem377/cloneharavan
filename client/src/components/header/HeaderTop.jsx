'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../common/Icon';
import PALETTE from '../../constants/palette';
import ShopLogo from '../common/ShopLogo';
import SearchBar from './SearchBar';
import AccountMenu from './AccountMenu';

export const HeaderTop = ({ onOpenCategoryDrawer }) => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-6">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-2">
          {onOpenCategoryDrawer && (
            <button
              type="button"
              onClick={onOpenCategoryDrawer}
              className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 md:hidden cursor-pointer"
              aria-label="Mở menu danh mục"
            >
              <Icon name="menu" size={22} color="#1e2b69" />
            </button>
          )}

          <Link href="/" className="flex items-center shrink-0 py-1 hover:opacity-95 transition">
            <ShopLogo />
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2 sm:gap-3">
          <Link
            href="/live"
            className="flex items-center gap-1 px-2 py-0.5 border border-red-500 text-red-600 rounded-md text-[11px] font-semibold hover:bg-red-50 transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>LIVE</span>
          </Link>

          <AccountMenu />

          <Link href="/cart" className="flex items-center p-1 cursor-pointer hover:opacity-80 transition">
            <div className="relative">
              <Icon name="cart" size={22} color="#334155" />
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: PALETTE.accent }}
              >
                0
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="w-full md:flex-1 md:max-w-xl">
        <SearchBar />
      </div>

      <div className="hidden md:flex items-center gap-3 sm:gap-5 shrink-0">
        <Link
          href="/live"
          className="flex items-center gap-1.5 px-2.5 py-1 border border-red-500 text-red-600 rounded-md text-xs font-semibold hover:bg-red-50 transition"
        >
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span>LIVE</span>
        </Link>

        <AccountMenu />

        <Link href="/cart" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
          <div className="relative">
            <Icon name="cart" size={24} color="#334155" />
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: PALETTE.accent }}
            >
              0
            </span>
          </div>
          <span className="text-xs font-medium text-slate-800 hidden sm:inline">
            Giỏ hàng
          </span>
        </Link>
      </div>
    </div>
  );
};

export default HeaderTop;
