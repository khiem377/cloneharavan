import React from 'react';
import {
  FileCheck, Download, Send, Building2, Truck, PackageCheck,
  ClipboardCheck, FileSpreadsheet, RotateCcw, CreditCard, CheckCircle2,
} from '@/components/ui/Icons';
import { POStatusBadge, POPaymentBadge } from './POBadges';

export default function PORowItem({
  po,
  idx,
  page,
  pageSize,
  isColumnVisible,
  handleOpenPoDetail,
  handleOpenPayment,
  handleOpenSendPOModal,
  handleAdvanceStatus,
  handlePreviewExcelOnWeb,
  handleDownloadExcel,
  downloadingId,
  navigate,
}) {
  const renderActionStepperButton = (order) => {
    switch (order.status) {
      case 'draft':
        return (
          <button
            onClick={() => handleOpenSendPOModal(order)}
            className="inline-flex items-center gap-1.5 rounded-[6px] bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
          >
            <Send className="size-3.5" /> Gửi PO Cho NCC
          </button>
        );
      case 'sent':
      case 'in_transit':
      case 'arrived':
      case 'inspecting':
        return (
          <div className="flex items-center gap-1.5 justify-center">
            <button
              onClick={() => navigate(`/stock-receivings/create?poId=${order._id}`)}
              className="inline-flex items-center gap-1 rounded-[6px] bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
              title="Lập phiếu nhập kho trực tiếp"
            >
              <FileCheck className="size-3.5" /> Nhập Kho
            </button>
            {order.status === 'sent' && (
              <button
                onClick={() => handleAdvanceStatus(order, 'in_transit')}
                className="inline-flex items-center gap-1 rounded-[6px] border border-input bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
                title="Chuyển trạng thái sang Vận chuyển"
              >
                <Truck className="size-3.5 text-indigo-500" />
              </button>
            )}
            {order.status === 'in_transit' && (
              <button
                onClick={() => handleAdvanceStatus(order, 'arrived')}
                className="inline-flex items-center gap-1 rounded-[6px] border border-input bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
                title="Đã đến kho"
              >
                <PackageCheck className="size-3.5 text-cyan-500" />
              </button>
            )}
            {order.status === 'arrived' && (
              <button
                onClick={() => handleAdvanceStatus(order, 'inspecting')}
                className="inline-flex items-center gap-1 rounded-[6px] border border-input bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
                title="Bắt đầu kiểm hàng"
              >
                <ClipboardCheck className="size-3.5 text-purple-500" />
              </button>
            )}
            {order.status === 'inspecting' && (
              <button
                onClick={() => handleAdvanceStatus(order, 'completed')}
                className="inline-flex items-center gap-1 rounded-[6px] border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
                title="Nghiệm thu toàn bộ & Nhập kho ngay"
              >
                <CheckCircle2 className="size-3.5" /> Hoàn tất
              </button>
            )}
          </div>
        );
      case 'partial_received':
        return (
          <button
            onClick={() => navigate(`/stock-receivings/create?poId=${order._id}`)}
            className="inline-flex items-center gap-1.5 rounded-[6px] bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
          >
            <FileCheck className="size-3.5" /> Lập PNK Đợt Tiếp
          </button>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 whitespace-nowrap">
              <CheckCircle2 className="size-3.5" /> Đã Khóa Tồn Kho
            </span>
            <button
              onClick={() => navigate(`/purchase-returns/create?poId=${order._id}`)}
              className="inline-flex items-center gap-1 rounded-[6px] border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive/20 transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="size-3.5" /> Trả Hàng
            </button>
          </div>
        );
      default:
        return <span className="text-xs text-muted-foreground">-</span>;
    }
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors align-middle">
      {isColumnVisible('stt') && (
        <td className="px-4 py-3.5 text-center font-mono text-xs font-semibold text-muted-foreground whitespace-nowrap">
          {(page - 1) * pageSize + idx + 1}
        </td>
      )}
      {isColumnVisible('poNumber') && (
        <td className="px-4 py-3.5 whitespace-nowrap">
          <button
            onClick={() => handleOpenPoDetail(po)}
            className="font-extrabold text-primary hover:underline font-mono cursor-pointer"
            title="Click xem chi tiết Đơn mua hàng"
          >
            {po.poNumber}
          </button>
        </td>
      )}
      {isColumnVisible('warehouse') && (
        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-foreground">
          {po.warehouseId?.name || 'Kho Tổng Bình Tân'}
        </td>
      )}
      {isColumnVisible('supplier') && (
        <td className="px-4 py-3.5 font-medium text-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[260px]" title={po.supplierId?.name}>
              {po.supplierId?.name || 'Nhà cung cấp'}
            </span>
          </div>
        </td>
      )}
      {isColumnVisible('itemCount') && (
        <td className="px-4 py-3.5 font-mono text-muted-foreground text-center whitespace-nowrap">
          {po.items?.length || 0} mặt hàng
        </td>
      )}
      {isColumnVisible('totalQuantity') && (
        <td className="px-4 py-3.5 font-semibold text-foreground text-center whitespace-nowrap">
          {po.totalQuantity || 0}
        </td>
      )}
      {isColumnVisible('totalAmount') && (
        <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-right whitespace-nowrap">
          {(po.totalAmount || 0).toLocaleString('vi-VN')} đ
        </td>
      )}

      {isColumnVisible('paymentStatus') && (
        <td className="px-4 py-3.5 text-center whitespace-nowrap">
          <div className="flex items-center justify-center gap-1.5">
            <POPaymentBadge po={po} />
            {po.status !== 'cancelled' && (po.totalAmount - (po.paidAmount || 0)) > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenPayment(po);
                }}
                className="p-1 rounded-[4px] border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                title="Xác nhận thanh toán ngay"
              >
                <CreditCard className="size-3" />
              </button>
            )}
          </div>
        </td>
      )}

      {isColumnVisible('status') && (
        <td className="px-4 py-3.5 text-center whitespace-nowrap">
          <POStatusBadge status={po.status} />
        </td>
      )}

      {isColumnVisible('stepper') && (
        <td className="px-4 py-3.5 text-center whitespace-nowrap">
          {renderActionStepperButton(po)}
        </td>
      )}

      {isColumnVisible('actions') && (
        <td className="px-4 py-3.5 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1.5">
            {['sent', 'in_transit', 'arrived', 'inspecting', 'partial_received'].includes(po.status) && (
              <button
                onClick={() => navigate(`/stock-receivings/create?poId=${po._id}`)}
                className="inline-flex items-center gap-1 rounded-[6px] bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-transform active:scale-[0.98] shadow-xs cursor-pointer"
                title="Tạo phiếu nhập kho ngay từ đơn mua hàng này"
              >
                <FileCheck className="size-3.5" /> Lập PNK
              </button>
            )}

            <button
              onClick={() => handlePreviewExcelOnWeb(po)}
              className="inline-flex items-center gap-1 rounded-[6px] border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-transform active:scale-[0.98] cursor-pointer"
              title="Xem trước file Excel (.xlsx) trực tiếp trên Web"
            >
              <FileSpreadsheet className="size-3.5" /> Preview Excel
            </button>

            <button
              onClick={() => handleDownloadExcel(po)}
              disabled={downloadingId === po._id}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              title="Tải phiếu nhập kho điền sẵn dữ liệu theo Mẫu Excel"
            >
              <Download className="size-3.5 text-primary" />
              {downloadingId === po._id ? 'Đang xuất...' : 'Tải Excel'}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
