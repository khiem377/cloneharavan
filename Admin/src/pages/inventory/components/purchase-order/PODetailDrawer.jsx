import React from 'react';
import { X, CreditCard, FileSpreadsheet, Send, FileCheck } from '@/components/ui/Icons';
import { POStatusBadge, POPaymentBadge } from './POBadges';

export default function PODetailDrawer({
  isOpen,
  selectedPoDetail,
  onClose,
  handlePreviewExcelOnWeb,
  handleOpenSendPOModal,
  handleOpenPayment,
  navigate,
}) {
  if (!isOpen || !selectedPoDetail) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 justify-end">
      <div className="w-full max-w-4xl bg-background border-l border-border shadow-sm flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 p-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              Đơn Mua Hàng: <span className="text-primary font-mono">{selectedPoDetail.poNumber}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Chi tiết thỏa thuận mua hàng với Nhà cung cấp & Đối soát nhập thực tế
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[6px] p-1.5 hover:bg-muted active:scale-[0.98] cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4 rounded-[6px] border border-border bg-card p-4 text-xs sm:grid-cols-5 shadow-2xs">
            <div>
              <span className="text-muted-foreground">Kho nhận hàng:</span>
              <p className="font-bold text-primary truncate">
                {selectedPoDetail.warehouseId?.name || 'Kho Tổng Bình Tân'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Mã nhà cung cấp:</span>
              <p className="font-mono font-bold text-foreground">
                {selectedPoDetail.supplierId?.code || 'NCC-01'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Tên nhà cung cấp:</span>
              <p className="font-bold text-foreground truncate">
                {selectedPoDetail.supplierId?.name || 'Nhà cung cấp'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Ngày đơn hàng:</span>
              <p className="font-mono font-semibold tabular-nums">
                {new Date(selectedPoDetail.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Trạng thái:</span>
              <div><POStatusBadge status={selectedPoDetail.status} /></div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground">Danh Sách Hàng Hóa Mua</h3>
            <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/50 font-bold border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Mã hàng</th>
                    <th className="p-3">Tên hàng</th>
                    <th className="p-3 text-center">ĐVT</th>
                    <th className="p-3 text-center">SL Yêu Cầu</th>
                    <th className="p-3 text-center">SL Đã Nhận</th>
                    <th className="p-3 text-right">Đơn giá</th>
                    <th className="p-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {selectedPoDetail.items?.map((it, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground font-mono tabular-nums">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-primary">{it.sku || 'SKU-001'}</td>
                      <td className="p-3 font-medium text-foreground">{it.productName}</td>
                      <td className="p-3 text-center text-muted-foreground">{it.unit || 'Cái'}</td>
                      <td className="p-3 text-center font-bold text-foreground font-mono tabular-nums">{it.expectedQty}</td>
                      <td className="p-3 text-center font-bold text-emerald-600 font-mono tabular-nums">{it.receivedQty || 0}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{(it.importPrice || 0).toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 text-right font-mono font-bold tabular-nums text-primary">{(it.subtotal || 0).toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[6px] border border-border bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground">Trạng Thái Thanh Toán Cho Nhà Cung Cấp</h3>
                </div>
                <POPaymentBadge po={selectedPoDetail} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-[4px] bg-muted/40 p-2.5 border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Tổng giá trị đơn:</span>
                  <span className="font-mono font-bold text-foreground text-sm tabular-nums">
                    {(selectedPoDetail.totalAmount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="rounded-[4px] bg-muted/40 p-2.5 border border-border/50">
                  <span className="text-muted-foreground block text-[11px]">Đã thanh toán:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
                    {(selectedPoDetail.paidAmount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="rounded-[4px] bg-primary/5 p-2.5 border border-primary/20">
                  <span className="text-muted-foreground block text-[11px]">Tiền còn cần trả NCC:</span>
                  <span className="font-mono font-bold text-primary text-sm tabular-nums">
                    {Math.max(0, (selectedPoDetail.totalAmount || 0) - (selectedPoDetail.paidAmount || 0)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {selectedPoDetail.status !== 'cancelled' && (selectedPoDetail.totalAmount - (selectedPoDetail.paidAmount || 0)) > 0 && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleOpenPayment(selectedPoDetail)}
                    className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <CreditCard className="size-3.5" /> Xác Nhận Thanh Toán
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/40 p-4 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-muted-foreground">Tổng cộng: </span>
            <span className="font-extrabold text-sm text-primary font-mono tabular-nums">
              {(selectedPoDetail.totalAmount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePreviewExcelOnWeb(selectedPoDetail)}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 active:scale-[0.98] cursor-pointer"
            >
              <FileSpreadsheet className="size-3.5" /> Preview Mẫu Đơn Đặt Hàng Excel
            </button>

            {selectedPoDetail.status === 'draft' && (
              <button
                onClick={() => {
                  onClose();
                  handleOpenSendPOModal(selectedPoDetail);
                }}
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
              >
                <Send className="size-3.5" /> Gửi PO Cho NCC
              </button>
            )}

            {['sent', 'in_transit', 'arrived', 'inspecting', 'partial_received'].includes(selectedPoDetail.status) && (
              <button
                onClick={() => navigate(`/stock-receivings/create?poId=${selectedPoDetail._id}`)}
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] cursor-pointer"
              >
                <FileCheck className="size-3.5" /> Lập Phiếu Nhập Kho (PNK)
              </button>
            )}

            {selectedPoDetail.status !== 'cancelled' && (selectedPoDetail.totalAmount - (selectedPoDetail.paidAmount || 0)) > 0 && (
              <button
                onClick={() => handleOpenPayment(selectedPoDetail)}
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 active:scale-[0.98] cursor-pointer"
              >
                <CreditCard className="size-3.5" /> Thanh Toán
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
