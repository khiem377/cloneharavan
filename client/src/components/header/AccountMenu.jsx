'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import {
  IconProfile,
  IconOrders,
  IconAddress,
  IconChangePassword,
  IconLogout,
} from '../account/AccountIcons';

export const AccountMenu = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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

  if (mounted && isAuthenticated()) {
    const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Tài khoản';
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 transition cursor-pointer text-left shadow-xs h-9 active:scale-[0.98]"
          title={displayName}
        >
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#e30019] text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0 shadow-2xs">
              {initial}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-800 max-w-[100px] lg:max-w-[130px] truncate hidden sm:inline-block">
            {displayName}
          </span>
          <ChevronDown
            size={13}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-[6px] shadow-sm border border-slate-200 py-1.5 z-[200] animate-fadeIn text-xs">
            {/* Header info */}
            <div className="px-3.5 py-2 border-b border-slate-100">
              <div className="font-bold text-slate-900 truncate text-xs">
                {user?.fullName || user?.name || 'Khách hàng'}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                {user?.email || 'Chưa liên kết email'}
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1">
              <Link
                href="/tai-khoan?tab=profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#e30019] transition font-medium group text-xs"
              >
                <IconProfile size={15} />
                <span>Tài khoản của tôi</span>
              </Link>

              <Link
                href="/tai-khoan?tab=orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#e30019] transition font-medium group text-xs"
              >
                <IconOrders size={15} />
                <span>Đơn hàng của tôi</span>
              </Link>

              <Link
                href="/tai-khoan?tab=addresses"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#e30019] transition font-medium group text-xs"
              >
                <IconAddress size={15} />
                <span>Sổ địa chỉ</span>
              </Link>

              <Link
                href="/tai-khoan?tab=change-password"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#e30019] transition font-medium group text-xs"
              >
                <IconChangePassword size={15} />
                <span>Đổi mật khẩu</span>
              </Link>
            </div>

            <div className="border-t border-slate-100 my-1" />

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50/70 transition font-medium cursor-pointer text-xs active:scale-[0.98]"
            >
              <IconLogout size={15} className="text-rose-500" />
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
      <div className="w-8 h-8 rounded-[6px] border border-slate-200 flex items-center justify-center text-slate-700">
        <User size={16} className="text-slate-600" />
      </div>
      <div className="text-xs leading-tight hidden sm:block">
        <span className="block text-slate-400 text-[11px]">Tài khoản</span>
        <strong className="block text-slate-800 font-semibold">Đăng nhập</strong>
      </div>
    </Link>
  );
};

export default AccountMenu;
