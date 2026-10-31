import React from 'react';
import { Trash2 } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function FlashSaleItemsTable({
  items,
  onDiscountTypeChange,
  onDiscountValueChange,
  onStockChange,
  onRemoveItem,
}) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-[6px] text-muted-foreground text-xs">
        Chưa có sản phẩm nào. Hãy gõ tên sản phẩm ở trên để thêm vào Flash Sale.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-[6px] overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-b border-border">
            <TableHead className="px-3 py-2 text-xs">Sản phẩm</TableHead>
            <TableHead className="px-3 py-2 text-xs w-24">Giá gốc</TableHead>
            <TableHead className="px-3 py-2 text-xs w-32">Loại giảm</TableHead>
            <TableHead className="px-3 py-2 text-xs w-24">Mức giảm</TableHead>
            <TableHead className="px-3 py-2 text-xs w-28 text-emerald-600 font-semibold">Giá FS</TableHead>
            <TableHead className="px-3 py-2 text-xs w-20 text-center">Tồn kho</TableHead>
            <TableHead className="px-3 py-2 text-xs w-24 text-center">Suất FS</TableHead>
            <TableHead className="px-3 py-2 text-xs w-20 text-center">Đã bán FS</TableHead>
            <TableHead className="px-3 py-2 text-xs w-24 text-center">Còn lại FS</TableHead>
            <TableHead className="px-3 py-2 text-xs w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => {
            const fsRemaining = Math.max(0, (item.stockLimit || 0) - (item.soldCount || 0));
            const isOverStock = item.inventoryStock !== null && item.inventoryStock !== undefined && item.stockLimit > item.inventoryStock;
            return (
              <TableRow key={idx} className="border-b border-border/50">
                <TableCell className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {item.productImage ? (
                      <img src={item.productImage} alt="" className="size-8 object-cover rounded-[6px] border border-border shrink-0" />
                    ) : (
                      <div className="size-8 rounded-[6px] bg-muted shrink-0" />
                    )}
                    <div className="truncate max-w-xs">
                      <p className="font-medium text-foreground text-xs truncate">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-[11px] font-semibold text-primary truncate">↳ Biến thể: {item.variantName}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground font-mono tabular-nums">Tổng bán shop: <span className="font-medium text-foreground">{item.totalSold ?? 0}</span></p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-3 py-2 font-mono font-medium text-muted-foreground tabular-nums whitespace-nowrap text-xs">
                  {item.originalPrice.toLocaleString('vi-VN')}đ
                </TableCell>

                <TableCell className="px-3 py-2">
                  <select
                    className="w-full h-7 px-1.5 rounded-[6px] border border-input bg-background text-xs font-medium outline-none focus:border-ring cursor-pointer"
                    value={item.discountType}
                    onChange={(e) => onDiscountTypeChange(idx, e.target.value)}
                  >
                    <option value="percent">Giảm %</option>
                    <option value="fixed_discount">Giảm bớt (đ)</option>
                    <option value="fixed_price">Giá cố định (đ)</option>
                  </select>
                </TableCell>

                <TableCell className="px-3 py-2">
                  <Input
                    type="number"
                    min={0}
                    className="w-full h-7 px-2 rounded-[6px] font-mono font-semibold text-xs tabular-nums"
                    value={item.discountValue}
                    onChange={(e) => onDiscountValueChange(idx, e.target.value)}
                  />
                </TableCell>

                <TableCell className="px-3 py-2 font-mono font-bold text-emerald-600 tabular-nums whitespace-nowrap text-xs">
                  {item.flashSalePrice.toLocaleString('vi-VN')}đ
                </TableCell>

                <TableCell className="px-3 py-2 text-center font-mono tabular-nums text-xs">
                  <span className="font-semibold text-foreground">
                    {item.inventoryStock !== null && item.inventoryStock !== undefined ? item.inventoryStock : '—'}
                  </span>
                </TableCell>

                <TableCell className="px-3 py-2 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <Input
                      type="number"
                      min={1}
                      className={`w-16 h-7 px-1.5 rounded-[6px] font-mono text-xs text-center tabular-nums ${isOverStock ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : ''}`}
                      value={item.stockLimit}
                      onChange={(e) => onStockChange(idx, e.target.value)}
                    />
                    {isOverStock && (
                      <span className="text-[10px] text-amber-600 whitespace-nowrap font-medium" title="Số suất vượt quá số lượng trong kho thực tế">
                        Vượt tồn
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-3 py-2 text-center font-mono tabular-nums text-xs">
                  <Badge variant="outline" className="rounded-[6px] px-1.5 py-0 font-medium text-[11px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                    {item.soldCount || 0}
                  </Badge>
                </TableCell>

                <TableCell className="px-3 py-2 text-center font-mono tabular-nums text-xs">
                  <Badge variant="outline" className={`rounded-[6px] px-1.5 py-0 font-medium text-[11px] ${fsRemaining === 0 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                    {fsRemaining}
                  </Badge>
                </TableCell>

                <TableCell className="px-3 py-2 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(idx)}
                    className="size-7 rounded-[6px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-[0.98]"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
