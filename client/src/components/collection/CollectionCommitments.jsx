import React from 'react';
import { ShieldCheck, Truck, Wrench, RotateCcw, CreditCard, Headphones } from 'lucide-react';

const COMMITMENTS = [
  {
    icon: ShieldCheck,
    title: '100% Chính hãng',
    desc: 'Cam kết xuất xứ rõ ràng',
  },
  {
    icon: Truck,
    title: 'Giao hàng 2H',
    desc: 'Nhanh chóng nội thành',
  },
  {
    icon: Wrench,
    title: 'Miễn phí lắp đặt',
    desc: 'Kỹ thuật viên tận tình',
  },
  {
    icon: RotateCcw,
    title: 'Lỗi 1 đổi 1 7 ngày',
    desc: 'An tâm trải nghiệm',
  },
  {
    icon: CreditCard,
    title: 'Trả góp 0% lãi suất',
    desc: 'Duyệt nhanh qua thẻ',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    desc: 'Tư vấn nhiệt tình',
  },
];

export default function CollectionCommitments() {
  return (
    <div className="bg-white rounded-lg border border-gray-200/90 p-4 sm:p-6 shadow-2xs mt-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {COMMITMENTS.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 ${idx > 0 ? 'sm:pl-4 pt-3 sm:pt-0' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-red-50 text-[#e30019] flex items-center justify-center shrink-0">
                <IconComp size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
