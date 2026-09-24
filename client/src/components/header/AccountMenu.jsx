'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import {
  IconProfile,
  IconOrders,
  IconChangePassword,
  IconLogout,
} from '../account/AccountIcons';

export const AccountMenu = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsOpen(false);
    router.push('/login');
  };

  if (isAuthenticated()) {
    const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Tài khoản';
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 hover:border-slate-300 transition cursor-pointer text-left shadow-2xs h-9"
          title={displayName}
        >
          <div className="w-5 h-5 rounded-full bg-[#e30019] text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0 shadow-2xs">
            {initial}
          </div>
          <span className="text-xs font-semibold text-slate-800 max-w-[100px] lg:max-w-[130px] truncate hidden sm:inline-block">
            {displayName}
          </span>
          <ChevronDown
            size={13}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-lg shadow-xl border border-gray-200/80 py-2 z-50 animate-fadeIn text-xs">
            {/* Header info */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="font-bold text-gray-900 truncate text-sm">
                {user?.fullName || user?.name || 'Khách hàng'}
              </div>
              <div className="text-xs text-gray-400 truncate mt-0.5 font-normal">
                {user?.email || 'Chưa liên kết email'}
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1">
              <Link
                href="/tai-khoan?tab=profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#e30019] transition font-medium group"
              >
                <IconProfile size={16} />
                <span>Tài khoản của tôi</span>
              </Link>

              <Link
                href="/tai-khoan?tab=orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#e30019] transition font-medium group"
              >
                <IconOrders size={16} />
                <span>Đơn hàng của tôi</span>
              </Link>

              <Link
                href="/tai-khoan?tab=change-password"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#e30019] transition font-medium group"
              >
                <IconChangePassword size={16} />
                <span>Đổi mật khẩu</span>
              </Link>
            </div>

            <div className="border-t border-gray-100 my-1" />

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-[#e30019] hover:bg-red-50/70 transition font-medium cursor-pointer"
            >
              <IconLogout size={16} className="text-gray-400" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-2 p-1 text-left hover:opacity-80 transition"
    >
      <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700">
        <User size={18} className="text-slate-600" />
      </div>
      <div className="text-xs leading-tight hidden sm:block">
        <span className="block text-slate-400 text-[11px]">Tài khoản</span>
        <strong className="block text-slate-800 font-semibold">Đăng nhập</strong>
      </div>
    </Link>
  );
};

export default AccountMenu;
