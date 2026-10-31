import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Building2,
  Check,
  X,
  Edit2,
  History,
  ShoppingCart,
} from '@/components/ui/Icons';
import DataTablePagination from '@/components/ui/DataTablePagination';

export default function StockAlertTable({
  items = [],
  isLoading = false,
  threshold = 5,
  selectedWarehouseId = '',
  warehouses = [],
  editingCostId,
  editingCostVal,
  setEditingCostVal,
  onStartEditCost,
  onSaveCost,
  onCancelEditCost,
  onViewHistory,
  onCreatePO,
  pagination,
  page,
  pageSize,
  setPage,
  setPageSize,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/60 text-[11px] font-bold text-foreground">
            <TableHead className="whitespace-nowrap">Sản phẩm</TableHead>
            <TableHead className="whitespace-nowrap">Mã SKU</TableHead>
            <TableHead className="whitespace-nowrap">Kho lưu trữ</TableHead>
            <TableHead className="whitespace-nowrap">Thương hiệu</TableHead>
            <TableHead className="whitespace-nowrap">Nhà Cung Cấp</TableHead>
            <TableHead className="text-right whitespace-nowrap">Giá bán</TableHead>
            <TableHead className="text-right whitespace-nowrap">Giá nhập vốn</TableHead>
            <TableHead className="text-center whitespace-nowrap">Tồn kho</TableHead>
            <TableHead className="text-center whitespace-nowrap">Tồn tối thiểu</TableHead>
            <TableHead className="text-center whitespace-nowrap">Gợi ý nhập</TableHead>
            <TableHead className="text-right whitespace-nowrap">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={11} className="py-12 text-center text-muted-foreground text-xs font-mono">
                Đang đối soát danh sách tồn kho toàn hệ thống...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="py-12 text-center text-muted-foreground text-xs font-mono">
                Không tìm thấy sản phẩm kho phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            items.map((prod) => (
              <TableRow key={prod.id} className="hover:bg-muted/30 transition-colors align-middle group">
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {prod.thumbnail ? (
                      <img
                        src={prod.thumbnail}
                        alt=""
                        className="size-9 rounded-[4px] object-cover border border-border"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-[4px] bg-muted text-muted-foreground font-mono text-[10px]">
                        SP
                      </div>
                    )}
                    <span className="font-semibold text-foreground max-w-xs truncate text-xs">
                      {prod.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="font-mono font-bold text-muted-foreground whitespace-nowrap text-xs">
                  {prod.productCode || '---'}
                </TableCell>

                {/* Kho lưu trữ */}
                <TableCell className="whitespace-nowrap text-xs">
                  {selectedWarehouseId ? (
                    <span className="inline-flex items-center gap-1 rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                      <Building2 className="size-3" />
                      {warehouses.find((w) => w._id === selectedWarehouseId)?.name || 'Kho đã chọn'}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {(prod.warehouseStocks || []).filter((ws) => ws.stock > 0).length === 0 ? (
                        <span className="text-[11px] text-muted-foreground italic">Chưa có tồn kho</span>
                      ) : (
                        (prod.warehouseStocks || [])
                          .filter((ws) => ws.stock > 0)
                          .map((ws, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 text-[11px] text-foreground font-medium"
                            >
                              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate max-w-[130px]">{ws.warehouseName}:</span>
                              <span className="font-mono font-bold tabular-nums text-primary">{ws.stock}</span>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                  {prod.brandName}
                </TableCell>
                <TableCell className="font-semibold text-foreground whitespace-nowrap text-xs">
                  {prod.supplierName || '---'}
                </TableCell>

                <TableCell className="text-right font-mono font-semibold whitespace-nowrap text-xs tabular-nums">
                  {(prod.price || 0).toLocaleString('vi-VN')} đ
                </TableCell>

                <TableCell className="text-right font-mono font-semibold whitespace-nowrap text-xs tabular-nums">
                  {editingCostId === prod.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <Input
                        type="number"
                        value={editingCostVal}
                        onChange={(e) => setEditingCostVal(e.target.value)}
                        className="w-24 h-7 text-xs text-right font-mono rounded-[4px]"
                      />
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onSaveCost(prod.id)}
                        className="text-emerald-600 hover:bg-emerald-50 h-7 w-7"
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={onCancelEditCost}
                        className="text-destructive hover:bg-destructive/10 h-7 w-7"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-end gap-1.5 group/edit cursor-pointer"
                      onClick={() => onStartEditCost(prod)}
                    >
                      <span className="text-primary font-bold">
                        {(prod.costPrice || 0).toLocaleString('vi-VN')} đ
                      </span>
                      <Edit2 className="size-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-center whitespace-nowrap">
                  <Badge
                    variant={
                      prod.stock === 0
                        ? 'destructive'
                        : prod.stock <= threshold
                        ? 'outline'
                        : 'secondary'
                    }
                    className={`font-mono tabular-nums font-bold text-xs rounded-[4px] ${
                      prod.stock > 0 && prod.stock <= threshold
                        ? 'bg-amber-500/10 text-amber-600 border-amber-300'
                        : prod.stock > threshold
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                        : ''
                    }`}
                  >
                    {prod.stock}
                  </Badge>
                </TableCell>

                <TableCell className="text-center font-semibold text-muted-foreground whitespace-nowrap font-mono tabular-nums text-xs">
                  {prod.minThreshold}
                </TableCell>

                <TableCell className="text-center whitespace-nowrap text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-primary font-mono tabular-nums">
                    +{prod.suggestedReorderQty} cái
                  </span>
                </TableCell>

                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onViewHistory(prod)}
                      className="rounded-[6px] text-xs font-semibold h-7"
                    >
                      <History className="size-3.5 mr-1 text-primary" /> Lịch Sử
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => onCreatePO(prod)}
                      className="rounded-[6px] text-xs font-semibold h-7 active:scale-[0.98]"
                    >
                      <ShoppingCart className="size-3.5 mr-1" /> Tạo PO
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </Card>
  );
}
