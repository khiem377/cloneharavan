import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';
import shipmentService from '@/services/shipment.service';
import { X, RotateCw, FileSpreadsheet } from 'lucide-react';
import ShipmentSidebarInfo from './ShipmentSidebarInfo';
import ShipmentHistoryTimeline from './ShipmentHistoryTimeline';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';

export default function ShipmentDetailModal({ shipment, isOpen, onClose, onRefresh }) {
  const [cancelling, setCancelling] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(shipment?.status || 'ready_to_pick');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);

  React.useEffect(() => {
    if (shipment?.status) setCurrentStatus(shipment.status);
  }, [shipment?.status]);

  if (!isOpen || !shipment) return null;


  const handleUpdateStatus = async (newStatus) => {
    if (!newStatus || newStatus === currentStatus) return;
    try {
      setUpdatingStatus(true);
      await shipmentService.updateShipmentStatus(shipment._id, {
        status: newStatus,
        note: 'Admin cập nhật trạng thái trực tiếp',
      });
      setCurrentStatus(newStatus);
      toast.success('Đã chuyển trạng thái vận đơn thành công!');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Lỗi chuyển trạng thái: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSyncShipment = async () => {
    try {
      setSyncing(true);
      const res = await shipmentService.syncShipmentStatus(shipment._id);
      toast.success(res.message || 'Đã đồng bộ trạng thái mới nhất từ đối tác!');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error('Lỗi đồng bộ: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy phiếu giao hàng ${shipment.shipmentCode}? Đơn hàng sẽ được chuyển lại trạng thái Đã xác nhận.`)) return;

    try {
      setCancelling(true);
      await shipmentService.cancelShipment(shipment._id, 'Hủy theo yêu cầu của Quản trị viên');
      toast.success('Đã hủy phiếu giao hàng thành công!');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error('Lỗi hủy vận đơn: ' + (err.response?.data?.message || err.message));
    } finally {
      setCancelling(false);
    }
  };

  const isCancellable = ['ready_to_pick', 'picking'].includes(currentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#dfe3e8] dark:border-border">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[16px] font-bold text-[#212b36] dark:text-foreground font-mono">
              {shipment.shipmentCode}
            </h3>
            <select
              value={currentStatus}
              disabled={updatingStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="h-7 px-2 text-[12px] font-medium rounded-[4px] border border-[#b3ddff] bg-[#f0f7ff] text-[#0088ff] dark:bg-primary/10 dark:text-primary dark:border-primary/30 cursor-pointer focus:outline-none"
              title="Bấm để chuyển trạng thái vận đơn"
            >
              <option value="ready_to_pick">Chờ lấy hàng</option>
              <option value="picking">Đang lấy hàng</option>
              <option value="delivering">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="delivery_fail">Chờ giao lại</option>
              <option value="returning">Đang hoàn hàng</option>
              <option value="returned">Đã hoàn hàng</option>
              <option value="cancelled">Đã hủy giao</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Nhóm công cụ phụ: Đồng bộ & Xuất phiếu Excel */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={syncing}
              onClick={handleSyncShipment}
              className="h-8 px-2.5 text-[12px] rounded-[6px] border-[#dfe3e8] dark:border-border hover:bg-slate-50 dark:hover:bg-muted text-slate-700 dark:text-slate-300"
              title="Đồng bộ trạng thái vận đơn từ đối tác vận chuyển"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
              Đồng bộ
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExcelPreviewOpen(true)}
              className="h-8 px-2.5 text-[12px] rounded-[6px] border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60"
              title="Xem trước, in và tải mẫu phiếu giao hàng Excel chuẩn"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Phiếu Excel
            </Button>

            {/* Nút hủy giao hàng nếu vận đơn còn trong giai đoạn chuẩn bị */}
            {isCancellable && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelShipment}
                disabled={cancelling}
                className="h-8 px-2.5 text-[12px] rounded-[6px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                Hủy phiếu
              </Button>
            )}

            {/* Nút hành động chính (Duy nhất 1 nút chính) */}
            {currentStatus === 'ready_to_pick' && (
              <Button
                type="button"
                size="sm"
                disabled={updatingStatus}
                onClick={() => handleUpdateStatus('delivering')}
                className="h-8 px-3 text-[12px] rounded-[6px] bg-[#0088ff] hover:bg-[#0077ee] text-white font-medium shadow-none active:scale-[0.98] transition-transform"
              >
                Bắt đầu giao
              </Button>
            )}
            {currentStatus === 'delivering' && (
              <Button
                type="button"
                size="sm"
                disabled={updatingStatus}
                onClick={() => handleUpdateStatus('delivered')}
                className="h-8 px-3 text-[12px] rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-none active:scale-[0.98] transition-transform"
              >
                Xác nhận đã giao
              </Button>
            )}

            {/* Phân cách với nút đóng */}
            <div className="w-px h-5 bg-[#dfe3e8] dark:bg-border mx-0.5" />

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[#637381] hover:text-[#212b36] hover:bg-slate-100 dark:hover:bg-muted cursor-pointer transition-colors"
              title="Đóng (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>


        {/* 2 Cột chuẩn Sapo */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5 text-[13px] flex-1">
          {/* Cột trái (2/3) */}
          <div className="md:col-span-2 space-y-4">
            {/* Box 1: Thông tin liên kết */}
            <div className="p-4 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] space-y-2">
              <div className="flex justify-between py-1 border-b border-[#dfe3e8] dark:border-border">
                <span className="text-[#637381]">Mã vận đơn đối tác:</span>
                <span className="font-mono font-bold text-[#0088ff]">{shipment.trackingCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#dfe3e8] dark:border-border">
                <span className="text-[#637381]">Đơn hàng:</span>
                <span className="font-mono font-semibold">{shipment.orderCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#dfe3e8] dark:border-border">
                <span className="text-[#637381]">Kho lấy hàng:</span>
                <span>{shipment.warehouseName || 'Cửa hàng chính'}</span>
              </div>
              <div className="py-1">
                <span className="text-[#637381] block mb-1">Người nhận:</span>
                <p className="font-medium text-[#212b36] dark:text-foreground">
                  {shipment.receiverInfo?.fullName} - {shipment.receiverInfo?.phone}
                </p>
                <p className="text-[12px] text-[#637381]">{shipment.receiverInfo?.fullAddress}</p>
              </div>
            </div>

            {/* Box 2: Thông tin sản phẩm đóng gói */}
            <div className="p-4 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] space-y-2">
              <h4 className="font-semibold text-[#212b36] dark:text-foreground mb-2">
                Sản phẩm trong gói hàng
              </h4>
              <div className="divide-y divide-[#dfe3e8] dark:divide-border">
                {(shipment.items || []).map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center text-[12.5px]">
                    <div>
                      <p className="font-medium text-[#212b36] dark:text-foreground">{it.productName}</p>
                      <span className="text-[11px] text-[#8a99a8] font-mono">SKU: {it.sku || 'N/A'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono tabular-nums">SL: {it.quantity}</span>
                      <p className="text-[11.5px] text-[#637381] font-mono tabular-nums">
                        {(it.price * it.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Chi tiết trạng thái đơn giao hàng (Timeline) */}
            <ShipmentHistoryTimeline historyLogs={shipment.historyLogs} />
          </div>

          {/* Cột phải (1/3) */}
          <ShipmentSidebarInfo shipment={shipment} />
        </div>
      </div>

      <ExcelPreviewModal
        isOpen={excelPreviewOpen}
        onClose={() => setExcelPreviewOpen(false)}
        title={`Phiếu Giao Hàng: ${shipment.trackingCode || shipment.shipmentCode}`}
        downloadUrl={shipmentService.getExcelSlipUrl(shipment._id)}
      />
    </div>
  );
}
