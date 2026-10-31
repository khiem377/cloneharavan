import React from 'react';
import { ShieldCheck, Wrench, RefreshCw, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';

const commitments = [
  {
    icon: <ShieldCheck className="size-4 text-emerald-600" />,
    title: '100% Chính hãng',
    desc: 'Hóa đơn VAT đầy đủ',
  },
  {
    icon: <Wrench className="size-4 text-blue-600" />,
    title: 'Bảo hành 24 tháng',
    desc: 'Hỗ trợ kỹ thuật tận nơi',
  },
  {
    icon: <RefreshCw className="size-4 text-amber-600" />,
    title: '1 Đổi 1 trong 30 ngày',
    desc: 'Nếu lỗi từ nhà sản xuất',
  },
  {
    icon: <Truck className="size-4 text-red-600" />,
    title: 'Giao hàng 2H',
    desc: 'Kiểm tra hàng trước khi nhận',
  },
];

export default function ProductTrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {commitments.map((item, idx) => (
        <Card
          key={idx}
          className="flex items-start gap-2.5 p-2.5 rounded-[6px] border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-none"
        >
          <span className="shrink-0 mt-0.5">{item.icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-slate-900 leading-tight">
              {item.title}
            </span>
            <span className="text-[11px] text-slate-500 leading-normal mt-0.5 truncate">
              {item.desc}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
