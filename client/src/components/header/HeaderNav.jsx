'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '../common/Icon';
import PALETTE from '../../constants/palette';
import { useStoreData } from '../../providers/StoreProvider';

export const HeaderNav = ({ onOpenCategoryDrawer }) => {
  const { menuData } = useStoreData();
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Lấy các mục menu từ Menu API (loại bỏ Trang chủ và Danh mục sản phẩm vì đã có nút riêng)
  const navMenuItems = (menuData?.items || []).filter(
    (item) => item.label !== 'Trang chủ' && item.label !== 'Danh mục sản phẩm'
  );

  const resolveLinkHref = (item) => {
    if (item.customUrl) return item.customUrl;
    if (item.linkType === 'category') return `/collections/${item.linkRef}`;
    if (item.linkType === 'brand') return `/brands/${item.linkRef}`;
    if (item.linkType === 'blog') {
      return !item.linkRef || item.linkRef === 'news' || item.linkRef === 'tin-tuc'
        ? '/blogs'
        : `/blogs?category=${item.linkRef}`;
    }
    return '#';
  };

  return (
    <div
      className="w-full text-white text-xs font-medium shadow-xs relative z-40"
      style={{ backgroundColor: PALETTE.primary }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-9 sm:h-10">
        <div className="flex items-center h-full overflow-x-visible no-scrollbar">
          
          {/* Category Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenCategoryDrawer}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-full hover:bg-black/15 transition cursor-pointer font-bold uppercase text-[11px] sm:text-xs shrink-0 whitespace-nowrap"
          >
            <Icon name="menu" size={15} color="#ffffff" />
            <span>Danh mục sản phẩm</span>
          </button>

          {/* Navigation Items hoàn toàn từ Menu API */}
          {navMenuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isFlashSales = item.label?.toLowerCase().includes('flash sale');
            const linkHref = resolveLinkHref(item);
            const isDropdownOpen = activeDropdownId === (item._id || item.label);

            return (
              <div
                key={item._id || item.label}
                className="relative h-full flex items-center shrink-0 group"
                onMouseEnter={() => hasChildren && setActiveDropdownId(item._id || item.label)}
                onMouseLeave={() => setActiveDropdownId(null)}
              >
                <Link
                  href={linkHref}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-full hover:bg-black/15 transition font-semibold whitespace-nowrap text-[11px] sm:text-xs ${
                    isFlashSales ? 'text-yellow-300 font-bold' : ''
                  }`}
                >
                  {isFlashSales && (
                    <span className="animate-pulse">
                      <Icon name="bolt" size={14} color="#facc15" />
                    </span>
                  )}
                  <span>{item.label}</span>

                  {/* Badge từ Menu Admin */}
                  {item.badge && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white uppercase leading-tight animate-bounce"
                      style={{
                        backgroundColor: item.badgeColor || PALETTE.accent,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Chỉ hiện mũi tên khi thực sự có menu con trong Admin */}
                  {hasChildren && (
                    <Icon name="chevron-down" size={12} color="#ffffff" />
                  )}
                </Link>

                {/* Dropdown menu con: Chỉ hiển thị khi Admin cấu hình children trong Menu API */}
                {hasChildren && isDropdownOpen && (
                  <div className="absolute top-full left-0 min-w-56 bg-white text-gray-800 rounded-b-xl shadow-2xl border border-gray-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {item.children.map((sub) => (
                      <Link
                        key={sub._id || sub.label}
                        href={resolveLinkHref(sub)}
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50/50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Info */}
        <div className="hidden lg:flex items-center gap-4 h-full shrink-0 ml-4">
          <Link
            href="/pages/he-thong-cua-hang"
            className="hover:underline flex items-center gap-1 text-white/95 whitespace-nowrap"
          >
            Hệ thống cửa hàng
          </Link>
          <span className="flex items-center gap-1 font-semibold text-white whitespace-nowrap">
            <Icon name="phone" size={13} color="#ffffff" />
            <span>Hotline: 099999998</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderNav;
