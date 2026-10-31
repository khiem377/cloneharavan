'use client';

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';

export default function ProductSpecsSummary({ product, selectedVariant }) {
  const [isOpen, setIsOpen] = useState(false);

  const specs = useMemo(() => {
    const rawSpecs = (selectedVariant?.specifications?.length > 0
      ? selectedVariant.specifications
      : product?.specifications || []
    ).filter((s) => {
      const k = String(s.key || '').trim().toLowerCase();
      return !['mã sku', 'sku', 'mã sản phẩm'].includes(k);
    });

    const list = [...rawSpecs];

    if (!list.some((s) => s.key === 'Thương hiệu') && product?.brand?.name) {
      list.unshift({ group: 'Thông tin chung', key: 'Thương hiệu', value: product.brand.name });
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
    <Card className="p-4 space-y-3 shadow-none border-slate-200 rounded-[6px]">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-[#e30019]" />
          <span>Thông số kỹ thuật</span>
        </h3>

        {specs.length > 6 && (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs text-[#e30019] hover:text-[#c40015] font-bold p-0 h-auto"
          >
            Xem chi tiết
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-[4px] border border-slate-100">
        <Table>
          <TableBody>
            {summarySpecs.map((item, idx) => (
              <TableRow
                key={idx}
                className={idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}
              >
                <TableCell className="py-2 px-3 text-xs text-slate-500 font-medium w-2/5 border-r border-slate-100">
                  {item.key}
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-slate-900 font-semibold w-3/5 font-mono tabular-nums">
                  {item.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {specs.length > 6 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="w-full h-8 text-xs font-semibold rounded-[6px] border-slate-200 text-slate-700 hover:border-slate-400"
        >
          Xem toàn bộ {specs.length} thông số
        </Button>
      )}

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-[6px]">
            <DialogHeader className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-[#e30019]" />
                <span>Bảng thông số kỹ thuật chi tiết</span>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {Object.entries(groupedSpecs).map(([groupTitle, groupItems]) => (
                <div key={groupTitle} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide px-1">
                    {groupTitle}
                  </h4>
                  <div className="rounded-[6px] border border-slate-200 overflow-hidden">
                    <Table>
                      <TableBody>
                        {groupItems.map((spec, sIdx) => (
                          <TableRow
                            key={sIdx}
                            className={sIdx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}
                          >
                            <TableCell className="py-2.5 px-3.5 text-xs text-slate-600 font-medium w-1/3 border-r border-slate-200">
                              {spec.key}
                            </TableCell>
                            <TableCell className="py-2.5 px-3.5 text-xs text-slate-900 font-semibold w-2/3 font-mono tabular-nums">
                              {spec.value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold rounded-[6px]"
              >
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
