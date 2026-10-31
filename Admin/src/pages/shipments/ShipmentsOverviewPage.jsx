import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '@/providers/ToastProvider';
import shipmentService from '@/services/shipment.service';
import ShipmentsOverviewHeader from './components/overview/ShipmentsOverviewHeader';
import ShipmentsKpiMetrics from './components/overview/ShipmentsKpiMetrics';
import ShipmentsStatusPipeline from './components/overview/ShipmentsStatusPipeline';
import ShipmentsCarrierAndCodWidget from './components/overview/ShipmentsCarrierAndCodWidget';
import ShipmentsRecentTable from './components/overview/ShipmentsRecentTable';
import CreateShipmentModal from './components/CreateShipmentModal';
import ShipmentDetailModal from './components/ShipmentDetailModal';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ShipmentsOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const calculateDateParams = (range) => {
    const now = new Date();
    if (range === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { fromDate: start.toISOString() };
    }
    if (range === '7d') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { fromDate: start.toISOString() };
    }
    if (range === '30d') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { fromDate: start.toISOString() };
    }
    return {};
  };

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setIsError(false);
      const params = calculateDateParams(dateRange);
      const res = await shipmentService.getOverview(params);
      setData(res.data);
    } catch (err) {
      console.warn('Lỗi lấy báo cáo vận chuyển:', err.message);
      setIsError(true);
      toast.error('Không thể tải dữ liệu báo cáo vận chuyển: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleQuickSync = async (id) => {
    try {
      setSyncingId(id);
      const res = await shipmentService.syncShipmentStatus(id);
      toast.success(res.message || 'Đã đồng bộ trạng thái mới nhất từ đối tác!');
      fetchOverview();
    } catch (err) {
      toast.error('Lỗi đồng bộ: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncingId(null);
    }
  };

  const handlePreviewExcel = (s) => {
    setPreviewDownloadUrl(shipmentService.getExcelSlipUrl(s._id));
    setPreviewTitle(`Phiếu Vận Đơn: ${s.trackingCode || s.shipmentCode}`);
    setExcelPreviewOpen(true);
  };

  const statusSummary = data?.statusSummary || {};
  const carrierDistribution = data?.carrierDistribution || [];
  const totalShipments = data?.totalShipments || 0;
  const totalCodAmount = data?.totalCodAmount || 0;
  const totalShippingFee = data?.totalShippingFee || 0;
  const attentionCount = data?.attentionCount || 0;
  const successRate = data?.successRate ?? 100;
  const codStats = data?.codStats || {};
  const recentShipments = data?.recentShipments || [];

  return (
    <div className="space-y-4">
      {/* 1. Header & Bộ lọc thời gian */}
      <ShipmentsOverviewHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        loading={loading}
        onRefresh={fetchOverview}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Xử lý trạng thái lỗi */}
      {isError && (
        <div className="p-4 rounded-[6px] border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 text-[13px]">
            <AlertCircle size={16} />
            <span>Đã xảy ra lỗi khi tải dữ liệu tổng quan. Vui lòng thử lại.</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            className="h-7 text-[12px] border-rose-300 dark:border-rose-800"
          >
            <RotateCcw size={12} className="mr-1" />
            Thử lại
          </Button>
        </div>
      )}

      {/* 2. Bộ 4 Thẻ KPI Tài chính & Vận hành */}
      <ShipmentsKpiMetrics
        totalShipments={totalShipments}
        totalCodAmount={totalCodAmount}
        totalShippingFee={totalShippingFee}
        attentionCount={attentionCount}
        successRate={successRate}
        codPending={codStats.pendingCod || 0}
        loading={loading}
      />

      {/* 3. Pipeline Hành trình 8 trạng thái vận đơn */}
      <ShipmentsStatusPipeline statusSummary={statusSummary} />

      {/* 4. Hiệu suất Đối tác & Tiến độ Đối soát COD (2 Cột) */}
      <ShipmentsCarrierAndCodWidget
        carrierDistribution={carrierDistribution}
        totalShipments={totalShipments}
        codStats={codStats}
      />

      {/* 5. Bảng Vận đơn cần xử lý & Gần nhất (Lấp đầy nửa dưới màn hình) */}
      <ShipmentsRecentTable
        shipments={recentShipments}
        onSelectShipment={(s) => setSelectedShipment(s)}
        onSyncShipment={handleQuickSync}
        onPreviewExcel={handlePreviewExcel}
        syncingId={syncingId}
      />

      {/* Modal Tạo vận đơn */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchOverview();
        }}
      />

      {/* Modal Chi tiết vận đơn */}
      {selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onRefresh={() => {
            setSelectedShipment(null);
            fetchOverview();
          }}
        />
      )}

      {/* Modal Xem trước / In phiếu Excel */}
      <ExcelPreviewModal
        isOpen={excelPreviewOpen}
        onClose={() => setExcelPreviewOpen(false)}
        downloadUrl={previewDownloadUrl}
        title={previewTitle}
      />
    </div>
  );
}
