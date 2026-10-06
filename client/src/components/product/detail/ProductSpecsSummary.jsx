'use client';

import React, { useState, useMemo } from 'react';
import { X, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

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
    <Card className="p-4 space-y-3 shadow-xs border-slate-200">
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

      {/* Bảng tóm tắt thông số với Table component */}
      <Table>
        <TableBody>
          {summarySpecs.map((spec, idx) => (
            <TableRow
              key={idx}
              className={idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}
            >
              <TableCell className="w-2/5 p-2 font-medium text-slate-600 border-r border-slate-100 text-xs">
                {spec.key}
              </TableCell>
              <TableCell className="w-3/5 p-2 text-slate-900 font-semibold break-words text-xs">
                {spec.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Nút xem chi tiết mở Dialog */}
      {specs.length > 6 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="w-full h-8 text-xs font-semibold text-slate-700 rounded-[6px] hover:bg-slate-50 active:scale-[0.98]"
        >
          <span>Xem toàn bộ cấu hình chi tiết ({specs.length} mục)</span>
          <ChevronRight size={13} className="ml-1 text-slate-400" />
        </Button>
      )}

      {/* DIALOG TOÀN BỘ CẤU HÌNH */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <DialogHeader className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <DialogTitle className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Thông số kỹ thuật chi tiết
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 text-slate-400 hover:text-slate-700 rounded-[4px]"
            >
              <X size={15} />
            </Button>
          </DialogHeader>

          {/* Body */}
          <DialogContent className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
            {Object.entries(groupedSpecs).map(([groupName, items]) => (
              <div key={groupName} className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#e30019] border-b border-red-100 pb-1">
                  {groupName}
                </h4>
                <Table>
                  <TableBody>
                    {items.map((item, i) => (
                      <TableRow
                        key={i}
                        className={i % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
                      >
                        <TableCell className="w-2/5 p-2.5 font-medium text-slate-600 border-r border-slate-100 text-xs">
                          {item.key}
                        </TableCell>
                        <TableCell className="w-3/5 p-2.5 text-slate-900 font-semibold break-words text-xs">
                          {item.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </DialogContent>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="px-4 h-8 rounded-[6px] bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:scale-[0.98]"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
