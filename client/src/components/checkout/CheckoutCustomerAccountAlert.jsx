'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogIn, Lock, ArrowRight } from 'lucide-react';

export default function CheckoutCustomerAccountAlert({ customerAccount = 'optional', isAuthenticated = false }) {
  if (isAuthenticated || customerAccount === 'disabled') {
    return null;
  }

  // Trường hợp Bắt buộc đăng nhập
  if (customerAccount === 'required') {
    return (
      <div className="bg-red-50/70 border border-red-200 rounded-[6px] p-4 text-xs sm:text-sm text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-red-100 flex items-center justify-center text-red-700 shrink-0">
            <Lock size={16} />
          </div>
          <div>
            <div className="font-bold text-red-950">Yêu cầu đăng nhập tài khoản</div>
            <p className="text-[11.5px] text-red-700 mt-0.5">
              Cửa hàng yêu cầu quý khách đăng nhập hoặc đăng ký tài khoản trước khi hoàn tất thanh toán.
            </p>
          </div>
        </div>
        <Link
          href="/login?redirect=/checkout"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[6px] font-semibold text-xs transition shadow-xs shrink-0"
        >
          <LogIn size={13} />
          <span>Đăng nhập ngay</span>
        </Link>
      </div>
    );
  }

  // Trường hợp Tùy chọn đăng nhập ('optional')
  return (
    <div className="bg-blue-50/60 border border-blue-200/80 rounded-[6px] p-3 text-xs text-blue-900 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <User size={15} className="text-[#0088ff] shrink-0" />
        <span className="truncate">
          Bạn đã có tài khoản?{' '}
          <span className="text-slate-600 hidden sm:inline">Đăng nhập để nhận tích điểm và chọn địa chỉ đã lưu.</span>
        </span>
      </div>
      <Link
        href="/login?redirect=/checkout"
        className="inline-flex items-center gap-1 text-[#0088ff] hover:text-blue-700 font-bold shrink-0 hover:underline"
      >
        <span>Đăng nhập</span>
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}
