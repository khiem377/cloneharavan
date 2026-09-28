'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail } from 'lucide-react';
import ShopLogo from '@/components/common/ShopLogo';
import { PALETTE } from '@/constants/palette';
import { menuService } from '@/services/menu.service';

// Fallback data in case API is not yet seeded or fails to load
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

  // Hide footer on authentication screens
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
  }, [initialMenu]);

  if (isAuthRoute) return null;

  const menuItems = footerMenu?.items && footerMenu.items.length > 0
    ? footerMenu.items
    : DEFAULT_FOOTER_ITEMS;

  const colCustomerSupport = menuItems[0] || DEFAULT_FOOTER_ITEMS[0];
  const colPolicies = menuItems[1] || DEFAULT_FOOTER_ITEMS[1];
  const colServices = menuItems[2] || DEFAULT_FOOTER_ITEMS[2];

  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto text-slate-800">
      {/* Main Footer Container */}
      <div className="max-w-[1320px] mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* ========================================================= */}
          {/* CỘT 1: THÔNG TIN CÔNG TY & LIÊN HỆ                       */}
          {/* ========================================================= */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="inline-block w-fit">
              <ShopLogo className="h-8" />
            </Link>

            <div className="text-base font-bold text-slate-900">
              SHOP Điện Máy
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Chuyên cung cấp các thiết bị điện máy, điện tử, điện gia dụng chính hãng chất lượng cao.
            </p>

            <div className="text-xs text-slate-600 font-medium">
              Mã số thuế: <span className="font-semibold text-slate-800">12345678910</span>
            </div>

            {/* Thông tin liên hệ */}
            <div className="flex flex-col gap-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Địa chỉ</span>
                  <span className="font-semibold text-slate-800">
                    150/8 Nguyễn Duy Cung, Phường 12, Tp.HCM
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Hotline</span>
                  <a
                    href="tel:0999999999"
                    className="font-bold text-[#284ea1] hover:underline"
                  >
                    0999999999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <a
                    href="mailto:support@egany.com"
                    className="font-semibold text-slate-800 hover:text-[#284ea1] transition-colors"
                  >
                    support@egany.com
                  </a>
                </div>
              </div>
            </div>

            {/* Mạng xã hội */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Mạng xã hội
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center text-[#1877f2] hover:bg-slate-50 hover:border-slate-300 transition-colors active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center text-[#ff0000] hover:bg-slate-50 hover:border-slate-300 transition-colors active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center text-black hover:bg-slate-50 hover:border-slate-300 transition-colors active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center text-[#e4405f] hover:bg-slate-50 hover:border-slate-300 transition-colors active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* Zalo */}
                <a
                  href="https://zalo.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Zalo"
                  className="w-9 h-9 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center p-1.5 hover:bg-slate-50 hover:border-slate-300 transition-colors active:scale-[0.98]"
                >
                  <img
                    src="/images/logo zalo.webp"
                    alt="Zalo"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CỘT 2: HỖ TRỢ KHÁCH HÀNG (MENU API ITEM 1)                */}
          {/* ========================================================= */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3.5">
              {colCustomerSupport.label || 'Hỗ trợ khách hàng'}
            </h3>
            <ul className="space-y-3">
              {(colCustomerSupport.children || []).map((link, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <Link
                    href={link.customUrl || '#'}
                    className="text-xs text-slate-600 hover:text-[#284ea1] transition-colors leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ========================================================= */}
          {/* CỘT 3: CHÍNH SÁCH + TỔNG ĐÀI HỖ TRỢ (MENU API ITEM 2)    */}
          {/* ========================================================= */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3.5">
              {colPolicies.label || 'Chính sách'}
            </h3>
            <ul className="space-y-3">
              {(colPolicies.children || []).map((link, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <Link
                    href={link.customUrl || '#'}
                    className="text-xs text-slate-600 hover:text-[#284ea1] transition-colors leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Tổng đài hỗ trợ */}
            <div className="mt-6 pt-2">
              <h4 className="text-sm font-bold text-slate-900 mb-2.5">
                Tổng đài hỗ trợ
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span>
                    Gọi mua hàng:{' '}
                    <a
                      href="tel:0999999999"
                      className="font-bold text-[#284ea1] hover:underline"
                    >
                      0999999999
                    </a>{' '}
                    <span className="text-slate-500">(8h-20h)</span>
                  </span>
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span>
                    Gọi bảo hành:{' '}
                    <a
                      href="tel:19009999"
                      className="font-bold text-[#284ea1] hover:underline"
                    >
                      19009999
                    </a>{' '}
                    <span className="text-slate-500">(8h-20h)</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CỘT 4: DỊCH VỤ + PHƯƠNG THỨC THANH TOÁN (MENU API ITEM 3) */}
          {/* ========================================================= */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3.5">
              {colServices.label || 'Dịch vụ'}
            </h3>
            <ul className="space-y-3">
              {(colServices.children || []).map((link, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <Link
                    href={link.customUrl || '#'}
                    className="text-xs text-slate-600 hover:text-[#284ea1] transition-colors leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Phương thức thanh toán */}
            <div className="mt-6 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Phương thức thanh toán
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Visa */}
                <div className="h-8 px-3 bg-white border border-slate-200 rounded-[6px] flex items-center justify-center select-none shadow-xs">
                  <span className="font-black italic tracking-tighter text-[#1a1f71] text-xs">
                    VISA
                  </span>
                </div>

                {/* MasterCard */}
                <div className="h-8 px-2.5 bg-white border border-slate-200 rounded-[6px] flex items-center justify-center gap-1.5 select-none shadow-xs">
                  <div className="flex -space-x-1.5 items-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b]" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f79e1b]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">Mastercard</span>
                </div>

                {/* MoMo */}
                <div className="h-8 px-2 bg-white border border-slate-200 rounded-[6px] flex items-center justify-center select-none shadow-xs">
                  <img
                    src="/images/logo momo.png"
                    alt="MoMo"
                    className="h-5 w-auto object-contain rounded-[3px]"
                    loading="lazy"
                  />
                </div>

                {/* ZaloPay */}
                <div className="h-8 px-2 bg-white border border-slate-200 rounded-[6px] flex items-center justify-center select-none shadow-xs">
                  <img
                    src="/images/logo zalopay.png"
                    alt="ZaloPay"
                    className="h-5 w-auto object-contain rounded-[3px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* THANH BẢN QUYỀN BOTTOM                                    */}
      {/* ========================================================= */}
      <div className="border-t border-slate-200 bg-white py-3.5">
        <div className="max-w-[1320px] mx-auto px-4 text-center text-xs text-slate-500">
          © Bản quyền thuộc về{' '}
          <span className="font-semibold text-slate-800">SHOP</span>
          {' '}| Cung cấp bởi{' '}
          <a
            href="https://www.haravan.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-800 hover:text-[#284ea1] transition-colors"
          >
            Haravan
          </a>
        </div>
      </div>
    </footer>
  );
}
