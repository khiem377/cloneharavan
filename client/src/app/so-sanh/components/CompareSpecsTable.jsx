'use client';

import React from 'react';
import { Info, Tv, Volume2, Cpu, Wifi, Layers } from 'lucide-react';

export default function CompareSpecsTable({
  products = [],
  productSpecsList = [],
  highlightDiff = false,
}) {
  const sections = [
    { title: '1. Tổng quan & Thông tin chung', icon: <Info size={14} className="text-red-600" />, key: 'overview' },
    { title: '2. Công nghệ Hình ảnh & Màn hình', icon: <Tv size={14} className="text-red-600" />, key: 'display' },
    { title: '3. Công nghệ Âm thanh & Loa', icon: <Volume2 size={14} className="text-red-600" />, key: 'audio' },
    { title: '4. Hệ điều hành & Tiện ích thông minh', icon: <Cpu size={14} className="text-red-600" />, key: 'smart' },
    { title: '5. Cổng kết nối & Mạng', icon: <Wifi size={14} className="text-red-600" />, key: 'connectivity' },
    { title: '6. Thiết kế & Chuẩn lắp đặt', icon: <Layers size={14} className="text-red-600" />, key: 'design' },
  ];

  const renderSection = (sectionTitle, icon, sectionKey) => {
    const sampleRows = productSpecsList[0]?.[sectionKey] || [];
    if (sampleRows.length === 0) return null;

    return (
      <div key={sectionKey} className="border-b border-slate-200 last:border-b-0">
        <div className="bg-slate-50/90 px-4 py-2.5 flex items-center gap-2 border-y border-slate-200 text-xs font-bold text-slate-900 uppercase tracking-wide">
          {icon}
          <span>{sectionTitle}</span>
        </div>

        <table className="w-full border-collapse text-xs">
          <tbody className="divide-y divide-slate-100">
            {sampleRows.map((sampleRow, rowIdx) => {
              const rowLabel = sampleRow.label;
              const values = productSpecsList.map(
                (specs) => specs[sectionKey]?.[rowIdx]?.value || '—'
              );

              const isSame = values.every((v) => v === values[0]);
              if (highlightDiff && isSame) return null;

              return (
                <tr key={rowIdx} className="hover:bg-slate-50/70 transition">
                  <td className="w-48 sm:w-60 p-3.5 font-semibold text-slate-700 bg-slate-50/40 align-top border-r border-slate-200">
                    {rowLabel}
                  </td>
                  {values.map((val, pIdx) => (
                    <td
                      key={pIdx}
                      className="p-3.5 border-r border-slate-100 text-slate-800 leading-relaxed align-top w-64 max-w-[280px]"
                    >
                      {val}
                    </td>
                  ))}
                  {products.length < 4 && <td className="bg-slate-50/20" />}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[6px] border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[760px]">
          {sections.map((sec) => renderSection(sec.title, sec.icon, sec.key))}
        </div>
      </div>
    </div>
  );
}
