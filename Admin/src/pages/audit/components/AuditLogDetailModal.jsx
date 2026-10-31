import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Clock,
} from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const FIELD_NAME_MAP = {
  name: 'Tên đối tượng',
  description: 'Mô tả',
  slug: 'Đường dẫn (Slug)',
  price: 'Giá niêm yết',
  costPrice: 'Giá vốn nhập hàng',
  salePrice: 'Giá khuyến mãi',
  stock: 'Số lượng tồn kho',
  unit: 'Đơn vị tính',
  isActive: 'Trạng thái hoạt động',
  status: 'Trạng thái xuất bản',
  sku: 'Mã quản lý (SKU)',
  code: 'Mã giảm giá/mã định danh',
  productCode: 'Mã sản phẩm',
  isDefault: 'Biến thể mặc định',
  isFeatured: 'Sản phẩm nổi bật',
  isHot: 'Sản phẩm bán chạy',
  value: 'Giá trị giảm',
  type: 'Loại hình áp dụng',
  minOrderValue: 'Đơn hàng tối thiểu',
  maxDiscount: 'Mức giảm tối đa',
  usedCount: 'Lượt đã dùng',
  usageLimit: 'Giới hạn tổng lượt dùng',
  giftLimit: 'Giới hạn quà tặng',
  giftUsedCount: 'Số quà đã trao',
  postCount: 'Số bài viết đính kèm',
};

const getFriendlyFieldName = (field) => FIELD_NAME_MAP[field] || field;

const formatFriendlyValue = (field, val) => {
  if (val === null || val === undefined || val === '') {
    return <span className="text-muted-foreground italic font-mono">(Không có)</span>;
  }
  if (typeof val === 'boolean') {
    return val ? (
      <Badge variant="outline" className="rounded-[4px] px-2 py-0 text-xs font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
        Bật (Hoạt động)
      </Badge>
    ) : (
      <Badge variant="outline" className="rounded-[4px] px-2 py-0 text-xs font-semibold bg-rose-500/10 text-rose-600 border-rose-500/20">
        Tắt (Ẩn)
      </Badge>
    );
  }
  if (typeof val === 'number') {
    if (field.toLowerCase().includes('price') || field.toLowerCase().includes('value') || field.toLowerCase().includes('discount')) {
      return `${val.toLocaleString('vi-VN')} đ`;
    }
    return val.toLocaleString('vi-VN');
  }
  if (typeof val === 'object') {
    return <code className="text-[11px] font-mono">{JSON.stringify(val)}</code>;
  }
  return String(val);
};

export default function AuditLogDetailModal({
  selectedLog,
  onClose,
  logToRollback,
  showConfirmModal,
  onCloseConfirm,
  onConfirmRollback,
  rollbackLoading = false,
}) {
  const [viewMode, setViewMode] = useState('table');

  return (
    <>
      {/* Detail / Diff Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-0 rounded-[6px] border border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <FileText className="size-4 text-primary" />
                Chi Tiết Thao Tác: <span className="font-bold">{selectedLog?.targetName || selectedLog?.module}</span>
              </DialogTitle>
            </div>

            <div className="flex items-center gap-1 bg-muted p-0.5 rounded-[4px] text-xs font-medium">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-background text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Xem dạng Bảng
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer ${
                  viewMode === 'json' ? 'bg-background text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mã JSON (Dev)
              </button>
            </div>
          </DialogHeader>

          {selectedLog && (
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-[6px] border border-border font-mono tabular-nums">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Thời gian:</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Người thực hiện:</span>
                  <span className="font-medium text-foreground">{selectedLog.userName || 'Hệ thống'}</span>
                  <span className="text-[10px] text-muted-foreground block">{selectedLog.userEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Phân hệ:</span>
                  <span className="font-medium text-foreground">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Địa chỉ IP:</span>
                  <span className="text-foreground">{selectedLog.ipAddress}</span>
                </div>
              </div>

              {viewMode === 'table' ? (
                <div className="space-y-3">
                  {selectedLog.changes && selectedLog.changes.length > 0 ? (
                    <div>
                      <h3 className="font-semibold text-foreground text-xs mb-2">So Sánh Chi Tiết Thuộc Tính Thay Đổi:</h3>
                      <div className="border border-border rounded-[6px] overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="p-2.5 text-xs">Thuộc tính</TableHead>
                              <TableHead className="p-2.5 text-xs text-rose-600 bg-rose-500/5">Giá trị Ban Đầu (Cũ)</TableHead>
                              <TableHead className="p-2.5 text-xs text-emerald-600 bg-emerald-500/5">Giá trị Sau Thay Đổi (Mới)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-border">
                            {selectedLog.changes.map((c, i) => (
                              <TableRow key={i} className="hover:bg-muted/20">
                                <TableCell className="p-2.5 font-medium text-foreground">
                                  {getFriendlyFieldName(c.field)}
                                  <span className="block text-[10px] text-muted-foreground font-mono font-normal">{c.field}</span>
                                </TableCell>
                                <TableCell className="p-2.5 bg-rose-500/5 text-foreground font-mono tabular-nums">
                                  {formatFriendlyValue(c.field, c.oldValue)}
                                </TableCell>
                                <TableCell className="p-2.5 bg-emerald-500/5 text-foreground font-mono tabular-nums">
                                  {formatFriendlyValue(c.field, c.newValue)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : selectedLog.oldData || selectedLog.newData ? (
                    <div>
                      <h3 className="font-semibold text-foreground text-xs mb-2">Thông Tin Chi Tiết Bản Ghi:</h3>
                      <div className="border border-border rounded-[6px] overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="p-2.5 text-xs">Thuộc tính</TableHead>
                              <TableHead className="p-2.5 text-xs">Giá trị</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-border">
                            {Object.entries(selectedLog.newData || selectedLog.oldData || {})
                              .filter(([k]) => !['_id', '__v', 'createdAt', 'updatedAt', 'password'].includes(k))
                              .map(([k, v], i) => (
                                <TableRow key={i} className="hover:bg-muted/20">
                                  <TableCell className="p-2.5 font-medium text-foreground">
                                    {getFriendlyFieldName(k)}
                                    <span className="block text-[10px] text-muted-foreground font-mono font-normal">{k}</span>
                                  </TableCell>
                                  <TableCell className="p-2.5 text-foreground font-mono tabular-nums">{formatFriendlyValue(k, v)}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground font-mono">Không có dữ liệu snapshot</div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                  {selectedLog.oldData && (
                    <div>
                      <h4 className="font-semibold text-foreground text-xs mb-1">Dữ Liệu Ban Đầu (Old Data):</h4>
                      <pre className="bg-muted p-3 rounded-[6px] border border-border text-[11px] overflow-x-auto max-h-60">
                        {JSON.stringify(selectedLog.oldData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newData && (
                    <div>
                      <h4 className="font-semibold text-foreground text-xs mb-1">Dữ Liệu Mới (New Data):</h4>
                      <pre className="bg-muted p-3 rounded-[6px] border border-border text-[11px] overflow-x-auto max-h-60">
                        {JSON.stringify(selectedLog.newData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 rounded-[6px] text-xs"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal && !!logToRollback} onOpenChange={(open) => { if (!open) onCloseConfirm(); }}>
        <DialogContent className="max-w-md rounded-[6px] border border-border p-6">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-5" /> Xác Nhận Khôi Phục Dữ Liệu
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground py-2 leading-relaxed">
            Bạn có chắc chắn muốn khôi phục dữ liệu cho đối tượng{' '}
            <strong className="text-foreground">{logToRollback?.targetName || logToRollback?.module}</strong> về trạng thái lúc{' '}
            {logToRollback && new Date(logToRollback.createdAt).toLocaleString('vi-VN')} không?
          </p>

          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2 bg-transparent">
            <Button
              variant="outline"
              size="sm"
              onClick={onCloseConfirm}
              disabled={rollbackLoading}
              className="h-8 rounded-[6px] text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              size="sm"
              onClick={onConfirmRollback}
              disabled={rollbackLoading}
              className="h-8 rounded-[6px] text-xs bg-amber-600 hover:bg-amber-700 text-white active:scale-[0.98] transition-transform"
            >
              {rollbackLoading && <Clock className="size-3.5 mr-1.5 animate-spin" />}
              Xác Nhận Khôi Phục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
