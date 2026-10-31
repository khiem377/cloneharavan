import React from 'react';
import { Package, CheckCircle2, SearchIcon as Search, Plus, Trash2, ArrowRight } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { PriceInput } from './poCreateUtils';

export default function POProductItemsCard({
  items,
  productSearch,
  setProductSearch,
  searchResults,
  isSearching,
  onAddProductOrVariant,
  onUpdateItem,
  onRemoveItem,
  onAutoFillReceiveAll,
  onGoToStep2,
}) {
  return (
    <div className="space-y-6 lg:col-span-2">
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Danh Sách Sản Phẩm / Biến Thể Nhập Kho
          </CardTitle>
          {items.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAutoFillReceiveAll}
              className="h-7 text-xs font-semibold rounded-[6px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 active:scale-[0.98]"
              title="Tự động điền SL Thực nhập = SL Chứng từ cho tất cả mặt hàng"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Đánh dấu nhập đủ
            </Button>
          )}
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên sản phẩm, mã SKU hoặc biến thể (Màu sắc, Size)..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9 h-9 rounded-[6px] text-xs"
            />

            {productSearch.trim() && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[6px] border border-border bg-card shadow-xs divide-y divide-border/60">
                {isSearching ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">Đang tìm biến thể sản phẩm...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    Không tìm thấy sản phẩm / biến thể nào
                  </div>
                ) : (
                  searchResults.map((resItem, idx) => (
                    <div
                      key={idx}
                      onClick={() => onAddProductOrVariant(resItem)}
                      className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors active:scale-[0.99]"
                    >
                      <div>
                        <div className="font-medium text-xs text-foreground">{resItem.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono tabular-nums">
                          SKU: {resItem.sku || '-'} | Tồn hiện tại:{' '}
                          <span className="font-bold text-emerald-600">{resItem.stock || 0}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" /> Thêm Hàng
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="rounded-[6px] border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-2.5">Sản Phẩm / Biến Thể</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-20">ĐVT</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-24">SL Chứng Từ</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-24">SL Thực Nhập</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-32">Đơn Giá Nhập</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-32">Chiết Khấu (VND)</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-32">Thành Tiền</TableHead>
                  <TableHead className="w-10 py-2.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                      Chưa chọn sản phẩm/biến thể nào. Tìm kiếm phía trên để thêm vào đơn.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="py-2">
                        <div className="font-medium text-xs text-foreground">{item.productName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono tabular-nums">{item.sku}</div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="text"
                          value={item.unit}
                          onChange={(e) => onUpdateItem(idx, 'unit', e.target.value)}
                          className="h-8 rounded-[6px] text-xs"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.expectedQty}
                          onChange={(e) => onUpdateItem(idx, 'expectedQty', Number(e.target.value))}
                          className="h-8 rounded-[6px] text-xs font-mono font-semibold tabular-nums"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.actualQty}
                          onChange={(e) => onUpdateItem(idx, 'actualQty', Number(e.target.value))}
                          className="h-8 rounded-[6px] text-xs font-mono font-semibold tabular-nums text-emerald-600"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <PriceInput
                          value={item.importPrice}
                          onChange={(val) => onUpdateItem(idx, 'importPrice', val)}
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <PriceInput
                          value={item.discountAmount || 0}
                          onChange={(val) => onUpdateItem(idx, 'discountAmount', val)}
                          placeholder="0"
                          className="text-amber-600 dark:text-amber-400"
                        />
                      </TableCell>
                      <TableCell className="py-2 font-mono font-semibold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {item.subtotal.toLocaleString('vi-VN')} đ
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(idx)}
                          className="h-7 w-7 rounded-[6px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onGoToStep2}
          className="rounded-[6px] bg-primary text-primary-foreground font-semibold px-5 py-2 text-xs flex items-center gap-2 active:scale-[0.98]"
        >
          <span>Tiếp Theo: Xem Trước File Excel (Bước 2)</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
