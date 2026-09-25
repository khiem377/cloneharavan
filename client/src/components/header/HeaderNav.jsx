'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../common/Icon';
import PALETTE from '../../constants/palette';
import { useStoreData } from '../../providers/StoreProvider';

export const HeaderNav = ({ onOpenCategoryDrawer }) => {
  const { menuData } = useStoreData();

  const navMenuItems = (menuData?.items || []).filter(
    (item) => item.label !== 'Trang chủ' && item.label !== 'Danh mục sản phẩm'
  );

  return (
    <div
      className="w-full text-white text-xs font-medium shadow-xs"
      style={{ backgroundColor: PALETTE.primary }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-9 sm:h-10">
        <div className="flex items-center h-full overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={onOpenCategoryDrawer}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-full hover:bg-black/15 transition cursor-pointer font-bold uppercase text-[11px] sm:text-xs shrink-0 whitespace-nowrap"
          >
            <Icon name="menu" size={15} color="#ffffff" />
            <span>Danh mục sản phẩm</span>
          </button>

          {navMenuItems.map((item) => {
            const linkHref =
              item.customUrl ||
              (item.linkType === 'category'
                ? `/collections/${item.linkRef}`
                : item.linkType === 'blog'
                ? (!item.linkRef || item.linkRef === 'news' || item.linkRef === 'tin-tuc' ? '/blogs' : `/blogs?category=${item.linkRef}`)
                : '#');
            const isFlashSales =
              item.label?.toLowerCase().includes('flash sale');

            return (
              <div
                key={item._id || item.label}
                className="relative h-full flex items-center shrink-0"
              >
                <Link
                  href={linkHref}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 h-full hover:bg-black/15 transition font-semibold whitespace-nowrap text-[11px] sm:text-xs"
                >
                  {isFlashSales && (
                    <Icon name="bolt" size={14} color="#facc15" />
                  )}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white uppercase leading-tight"
                      style={{
                        backgroundColor: item.badgeColor || PALETTE.accent,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.children && item.children.length > 0 && (
                    <Icon name="chevron-down" size={12} color="#ffffff" />
                  )}
                </Link>
              </div>
            );
          })}
        </div>

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
