import React from 'react';

const commitments = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: '100% Chính hãng',
    desc: 'Hóa đơn VAT đầy đủ',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8v4l3 3"/>
        <circle cx="12" cy="12" r="10"/>
      </svg>
    ),
    title: 'Bảo hành 12 tháng',
    desc: 'Hỗ trợ kỹ thuật chính hãng',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    ),
    title: '1 Đổi 1 trong 30 ngày',
    desc: 'Nếu lỗi từ nhà sản xuất',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Giao hàng toàn quốc',
    desc: 'Kiểm tra hàng trước khi nhận',
  },
];

export default function ProductTrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {commitments.map((item, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2.5 p-2.5 rounded-[6px] border border-slate-200 bg-white hover:border-slate-300 transition-colors"
        >
          <span className="text-slate-500 shrink-0 mt-0.5">{item.icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-slate-900 leading-tight">
              {item.title}
            </span>
            <span className="text-[11px] text-slate-500 leading-normal mt-0.5">
              {item.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
