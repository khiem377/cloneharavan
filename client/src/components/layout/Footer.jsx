'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { menuService } from '@/services/menu.service';
import { settingService } from '@/services/setting.service';
import FooterCompanyInfo from './footer/FooterCompanyInfo';
import FooterNavColumn from './footer/FooterNavColumn';
import FooterHotlineSection from './footer/FooterHotlineSection';
import FooterPaymentBadges from './footer/FooterPaymentBadges';
import FooterCopyright from './footer/FooterCopyright';

const DEFAULT_FOOTER_ITEMS = [
  {
    label: 'Hỗ trợ khách hàng',
    children: [
      { label: 'Câu hỏi thường gặp', customUrl: '/pages/cau-hoi-thuong-gap' },
      { label: 'Hệ thống cửa hàng', customUrl: '/pages/he-thong-cua-hang' },
      { label: 'Tìm kiếm', customUrl: '/search' },
      { label: 'Liên hệ', customUrl: '/pages/lien-he' },
      { label: 'Giới thiệu', customUrl: '/pages/about-us' },
    ],
  },
  {
    label: 'Chính sách',
    children: [
      { label: 'Chính sách bảo mật', customUrl: '/pages/chinh-sach-bao-mat' },
      { label: 'Điều khoản dịch vụ', customUrl: '/pages/dieu-khoan-dich-vu' },
      { label: 'Chính sách đổi trả', customUrl: '/pages/chinh-sach-doi-tra' },
      { label: 'Chính sách bảo hành', customUrl: '/pages/chinh-sach-bao-hanh' },
    ],
  },
  {
    label: 'Dịch vụ',
    children: [
      { label: 'Câu hỏi thường gặp', customUrl: '/pages/cau-hoi-thuong-gap' },
      { label: 'Hệ thống cửa hàng', customUrl: '/pages/he-thong-cua-hang' },
      { label: 'Tìm kiếm', customUrl: '/search' },
      { label: 'Liên hệ', customUrl: '/pages/lien-he' },
      { label: 'Giới thiệu', customUrl: '/pages/about-us' },
    ],
  },
];

export default function Footer({ initialMenu = null }) {
  const pathname = usePathname();
  const [footerMenu, setFooterMenu] = useState(initialMenu);
  const [storeSetting, setStoreSetting] = useState(null);

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';

  useEffect(() => {
    if (!initialMenu) {
      menuService.getByHandle('footer').then((res) => {
        if (res && res.items?.length > 0) {
          setFooterMenu(res);
        }
      });
    }
    settingService.getPublicSettings().then((s) => {
      if (s?.storeInfo) setStoreSetting(s.storeInfo);
    });
  }, [initialMenu]);

  if (isAuthRoute) return null;

  const rawItems = footerMenu?.items && footerMenu.items.length > 0
    ? footerMenu.items
    : DEFAULT_FOOTER_ITEMS;

  const menuItems = rawItems
    .filter((col) => col.isActive !== false)
    .map((col) => ({
      ...col,
      children: (col.children || []).filter((child) => child.isActive !== false),
    }));

  const colCustomerSupport = menuItems[0] || DEFAULT_FOOTER_ITEMS[0];
  const colPolicies = menuItems[1] || DEFAULT_FOOTER_ITEMS[1];
  const colServices = menuItems[2] || DEFAULT_FOOTER_ITEMS[2];

  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto text-slate-800">
      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 2xl:gap-12">
          {/* Cột 1: Thông tin công ty & Mạng xã hội */}
          <FooterCompanyInfo storeSetting={storeSetting} />

          {/* Cột 2: Hỗ trợ khách hàng */}
          <FooterNavColumn
            title={colCustomerSupport.label || 'Hỗ trợ khách hàng'}
            items={colCustomerSupport.children}
          />

          {/* Cột 3: Chính sách & Tổng đài */}
          <div>
            <FooterNavColumn
              title={colPolicies.label || 'Chính sách'}
              items={colPolicies.children}
            />
            <FooterHotlineSection storeSetting={storeSetting} />
          </div>

          {/* Cột 4: Dịch vụ & Phương thức thanh toán */}
          <div>
            <FooterNavColumn
              title={colServices.label || 'Dịch vụ'}
              items={colServices.children}
            />
            <FooterPaymentBadges />
          </div>
        </div>
      </div>

      {/* Bản quyền Footer Bottom */}
      <FooterCopyright storeSetting={storeSetting} />
    </footer>
  );
}
