'use client';

import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

const POLICIES = [
  {
    icon: ShieldCheck,
    title: '100% Chính hãng',
    desc: 'Cam kết hàng chuẩn thương hiệu, hoàn tiền 200% nếu phát hiện giả.',
  },
  {
    icon: Truck,
    title: 'Giao nhanh toàn quốc',
    desc: 'Đóng gói chuẩn quy trình kho, giao hàng hỏa tốc trong 2-4 ngày.',
  },
  {
    icon: RefreshCw,
    title: 'Đổi mới 30 ngày',
    desc: 'Lỗi 1 đổi 1 tận nơi nếu sản phẩm gặp trục trặc kỹ thuật từ nhà sản xuất.',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ kỹ thuật viên hỗ trợ kích hoạt bảo hành điện tử nhanh chóng.',
  },
];

export default function FlashSalePolicies() {
  return (
    <div className="mt-8 rounded-[6px] border border-slate-200 bg-white p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {POLICIES.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className={`flex items-start gap-3 ${index > 0 ? 'sm:pl-4 pt-3 sm:pt-0' : ''}`}>
              <div className="size-8 rounded-[6px] bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 mb-0.5">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
