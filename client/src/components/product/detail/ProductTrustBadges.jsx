import React from 'react';

export default function ProductTrustBadges() {
  const commitments = [
    {
      tag: '01',
      title: '100% Chính hãng',
      desc: 'Cam kết xuất xứ rõ ràng, đầy đủ hóa đơn VAT',
    },
    {
      tag: '02',
      title: 'Bảo hành chu đáo',
      desc: 'Hỗ trợ kỹ thuật chính hãng tận tâm trọn đời',
    },
    {
      tag: '03',
      title: '1 Đổi 1 trong 30 ngày',
      desc: 'Nếu phát sinh lỗi kỹ thuật từ nhà sản xuất',
    },
    {
      tag: '04',
      title: 'Giao hàng toàn quốc',
      desc: 'Giao nhanh nội thành, kiểm tra hàng trước khi nhận',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-3 rounded-[6px] border border-slate-200 bg-white">
      {commitments.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2.5 p-2 rounded-[6px] bg-slate-50/70 border border-slate-100">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[4px] bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0 mt-0.5">
            {item.tag}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-slate-900 leading-tight">
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
