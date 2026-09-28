'use client';

import React, { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/dialog';

export default function ProductSpecsSummary({ product, selectedVariant }) {
  const [isOpen, setIsOpen] = useState(false);

  // Tổng hợp thông số kỹ thuật (ưu tiên từ variant nếu có, hoặc product cha)
  const specs = useMemo(() => {
    const rawSpecs = selectedVariant?.specifications?.length > 0
      ? selectedVariant.specifications
      : product?.specifications || [];

    const list = [...rawSpecs];

    if (!list.some((s) => s.key === 'Thương hiệu') && product?.brand?.name) {
      list.unshift({ group: 'Thông tin chung', key: 'Thương hiệu', value: product.brand.name });
    }
    if (!list.some((s) => s.key === 'Mã SKU') && (selectedVariant?.sku || product?.sku || product?.productCode)) {
      list.unshift({
        group: 'Thông tin chung',
        key: 'Mã SKU',
        value: selectedVariant?.sku || product?.sku || product?.productCode,
      });
    }
    if (!list.some((s) => s.key === 'Đơn vị tính') && product?.unit) {
      list.push({ group: 'Thông tin chung', key: 'Đơn vị tính', value: product.unit });
    }

    return list;
  }, [product, selectedVariant]);

  const groupedSpecs = useMemo(() => {
    const map = {};
    specs.forEach((item) => {
      const g = item.group || 'Thông số kỹ thuật';
      if (!map[g]) map[g] = [];
      map[g].push(item);
    });
    return map;
  }, [specs]);

  if (specs.length === 0) return null;

  const summarySpecs = specs.slice(0, 6);

  return (
    <div className="rounded-[6px] border border-slate-200 bg-white p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
          THÔNG SỐ KỸ THUẬT
        </h3>

        {specs.length > 6 && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer active:scale-[0.98]"
          >
            [Xem chi tiết]
          </button>
        )}
      </div>

      {/* Bảng rút gọn */}
      <div className="rounded-[6px] border border-slate-200 overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-100">
            {summarySpecs.map((spec, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
              >
                <td className="w-2/5 p-2 font-medium text-slate-600 border-r border-slate-100">
                  {spec.key}
                </td>
                <td className="w-3/5 p-2 text-slate-900 font-semibold break-words">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nút xem chi tiết mở Dialog */}
      {specs.length > 6 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full py-2 px-3 rounded-[6px] border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors text-center cursor-pointer active:scale-[0.98]"
        >
          Xem toàn bộ cấu hình chi tiết ({specs.length} mục)
        </button>
      )}

      {/* DIALOG TOÀN BỘ CẤU HÌNH */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Thông số kỹ thuật chi tiết
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-[4px] border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer active:scale-[0.98]"
              aria-label="Đóng"
            >
              Đóng [X]
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
            {Object.entries(groupedSpecs).map(([groupName, items]) => (
              <div key={groupName} className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-red-600 border-b border-red-100 pb-1">
                  {groupName}
                </h4>
                <div className="rounded-[6px] border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {items.map((item, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? 'bg-slate-50/80' : 'bg-white'}
                        >
                          <td className="w-2/5 p-2.5 font-medium text-slate-600 border-r border-slate-100">
                            {item.key}
                          </td>
                          <td className="w-3/5 p-2.5 text-slate-900 font-semibold break-words">
                            {item.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 rounded-[6px] bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer active:scale-[0.98]"
            >
              Đóng
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
