'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Icon from '../common/Icon';
import FireIcon from '../common/FireIcon';
import PALETTE from '../../constants/palette';
import { useStoreData } from '../../providers/StoreProvider';

export const HeaderNav = ({ onOpenCategoryDrawer }) => {
  const { menuData } = useStoreData();
  const [dropdown, setDropdown] = useState(null);
  const navRef = useRef(null);
  const closeTimer = useRef(null);

  const navMenuItems = (menuData?.items || []).filter(
    (item) => item.label !== 'Trang chủ' && item.label !== 'Danh mục sản phẩm' && item.isActive !== false
  );

  const resolveLinkHref = (item) => {
    if (item.customUrl) return item.customUrl;
    if (item.linkType === 'category') return `/collections/${item.linkRef}`;
    if (item.linkType === 'brand') return `/search?brand=${encodeURIComponent(item.linkRef)}`;
    if (item.linkType === 'blog') {
      return !item.linkRef || item.linkRef === 'news' || item.linkRef === 'tin-tuc'
        ? '/blogs'
        : `/blogs?category=${item.linkRef}`;
    }
    return '#';
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setDropdown(null), 120);
  }, []);

  const handleItemEnter = (e, item) => {
    cancelClose();
    const activeChildren = (item.children || []).filter((sub) => sub.isActive !== false);
    if (!activeChildren.length) {
      setDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const navRect = navRef.current?.getBoundingClientRect();
    const left = navRect ? rect.left - navRect.left : 0;
    setDropdown({ id: item._id || item.label, left, children: activeChildren });
  };

  return (
    <div
      className="w-full text-white text-xs font-medium shadow-xs"
      style={{ backgroundColor: PALETTE.primary, position: 'relative', zIndex: 40 }}
    >
      <div
        ref={navRef}
        className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-9 sm:h-10"
        style={{ position: 'relative' }}
      >
        {/* Scroll container */}
        <div
          className="flex items-center h-full w-full"
          style={{ overflowX: 'auto', overflowY: 'visible', scrollbarWidth: 'none' }}
        >
          {/* Category Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenCategoryDrawer}
            onMouseEnter={() => { cancelClose(); setDropdown(null); }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-full hover:bg-black/15 transition cursor-pointer font-bold uppercase text-[11px] sm:text-xs shrink-0 whitespace-nowrap"
          >
            <Icon name="menu" size={15} color="#ffffff" />
            <span>Danh mục sản phẩm</span>
          </button>

          {navMenuItems.map((item) => {
            const activeChildren = (item.children || []).filter((sub) => sub.isActive !== false);
            const hasChildren = activeChildren.length > 0;
            const isFlashSales = item.label?.toLowerCase().includes('flash sale');
            const isOpen = dropdown?.id === (item._id || item.label);

            return (
              <div
                key={item._id || item.label}
                className="relative h-full flex items-center shrink-0"
                onMouseEnter={(e) => handleItemEnter(e, item)}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={resolveLinkHref(item)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-full hover:bg-black/15 transition font-semibold whitespace-nowrap text-[11px] sm:text-xs ${
                    isFlashSales ? 'text-yellow-300 font-bold' : ''
                  } ${isOpen ? 'bg-black/15' : ''}`}
                >
                  {isFlashSales && <FireIcon size={14} />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase leading-tight animate-bounce"
                      style={{ backgroundColor: item.badgeColor || PALETTE.accent }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {hasChildren && <Icon name="chevron-down" size={12} color="#ffffff" />}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right Info */}
        <div className="hidden lg:flex items-center gap-4 h-full shrink-0 ml-4">
          <Link href="/pages/he-thong-cua-hang" className="hover:underline flex items-center gap-1 text-white/95 whitespace-nowrap">
            Hệ thống cửa hàng
          </Link>
          <span className="flex items-center gap-1 font-semibold text-white whitespace-nowrap">
            <Icon name="phone" size={13} color="#ffffff" />
            <span>Hotline: 099999998</span>
          </span>
        </div>

        {/* Dropdown — ngoài overflow container, ko bị clip */}
        {dropdown && dropdown.children.length > 0 && (
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{
              position: 'absolute',
              top: '100%',
              left: Math.max(0, dropdown.left),
              minWidth: 220,
              zIndex: 9999,
              borderRadius: '0 0 8px 8px',
              background: '#fff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
              border: '1px solid #f1f5f9',
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            {dropdown.children.map((sub) => (
              <Link
                key={sub._id || sub.label}
                href={resolveLinkHref(sub)}
                onClick={() => setDropdown(null)}
                className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <span>{sub.label}</span>
                {sub.badge && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase ml-2 shrink-0"
                    style={{ backgroundColor: sub.badgeColor || '#ef4444' }}
                  >
                    {sub.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderNav;
