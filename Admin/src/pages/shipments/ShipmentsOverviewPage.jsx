import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import shipmentService from '@/services/shipment.service';
import { Truck, RefreshCw, ExternalLink, CheckCircle2, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

const STATUS_CONFIGS = [
  { key: 'ready_to_pick', label: 'Chờ lấy hàng' },
  { key: 'picking', label: 'Đã lấy hàng' },
  { key: 'delivering', label: 'Đang giao hàng' },
  { key: 'delivery_fail', label: 'Chờ giao lại' },
  { key: 'returning', label: 'Đang hoàn hàng' },
  { key: 'returned', label: 'Đã hoàn hàng' },
  { key: 'delivered', label: 'Đã giao hàng' },
  { key: 'cancelled', label: 'Hủy giao hàng' },
];

export default function ShipmentsOverviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await shipmentService.getOverview();
      setData(res.data);
    } catch (err) {
      console.warn('Lỗi lấy báo cáo vận chuyển:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const statusSummary = data?.statusSummary || {};
  const carrierDistribution = data?.carrierDistribution || [];
  const totalShipments = data?.totalShipments || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#212b36] dark:text-foreground">Tổng quan vận chuyển</h2>
          <p className="text-[13px] text-[#637381] dark:text-muted-foreground">
            Theo dõi trạng thái giao hàng, COD và hiệu quả giao vận theo thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={fetchOverview}
            disabled={loading}
            className="h-8 px-3 text-[12.5px] border-[#dfe3e8] dark:border-border cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            type="button"
            onClick={() => navigate('/settings?tab=shipping-providers')}
            className="h-8 px-3 text-[12.5px] bg-[#0088ff] hover:bg-[#0077e6] text-white cursor-pointer active:scale-[0.98]"
          >
            <Truck className="w-3.5 h-3.5 mr-1.5" />
            Kết nối vận chuyển
          </Button>
        </div>
      </div>

      {/* KPI STATUS GRID BANNER (Sapo style) */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-xs overflow-x-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-y lg:divide-y-0 divide-[#dfe3e8] dark:divide-border min-w-[760px]">
          {STATUS_CONFIGS.map((item) => {
            const count = statusSummary[item.key]?.count || 0;
            const cod = statusSummary[item.key]?.cod || 0;

            return (
              <div
                key={item.key}
                onClick={() => navigate(`/shipments?status=${item.key}`)}
                className="p-3 hover:bg-[#fafbfb] dark:hover:bg-muted/30 cursor-pointer transition-colors text-center sm:text-left"
              >
                <span className="text-[12px] text-[#637381] dark:text-muted-foreground block truncate">
                  {item.label}
                </span>
                <span className="text-[17px] font-bold text-[#212b36] dark:text-foreground font-mono tabular-nums block mt-0.5">
                  {count}
                </span>
                <span className="text-[11px] text-[#8a99a8] dark:text-muted-foreground/80 font-mono tabular-nums block mt-0.5">
                  COD: {cod.toLocaleString('vi-VN')}₫
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHARTS / TỶ TRỌNG VÀ HIỆU SUẤT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tỉ lệ giao hàng thành công */}
        <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfe3e8] dark:border-border">
            <h4 className="text-[14px] font-semibold text-[#212b36] dark:text-foreground">Tỉ lệ giao hàng thành công</h4>
            <span className="text-[12px] text-[#637381] font-mono">{data?.successRate || 100}%</span>
          </div>
          <div className="pt-4 flex flex-col items-center justify-center min-h-[160px]">
            <div className="w-24 h-24 rounded-full border-4 border-[#008848] flex items-center justify-center">
              <span className="text-[20px] font-bold text-[#008848] font-mono">{data?.successRate || 100}%</span>
            </div>
            <p className="text-[12.5px] text-[#637381] mt-3">Tỷ lệ đơn hàng giao thành công trên tổng đơn hoàn tất</p>
          </div>
        </div>

        {/* Tỉ trọng vận đơn theo đối tác */}
        <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#dfe3e8] dark:border-border">
            <h4 className="text-[14px] font-semibold text-[#212b36] dark:text-foreground">Tỉ trọng vận đơn</h4>
            <span className="text-[12px] text-[#637381] font-mono tabular-nums">{totalShipments} đơn</span>
          </div>
          <div className="pt-4 space-y-3 min-h-[160px]">
            {carrierDistribution.length === 0 ? (
              <div className="text-center py-8 text-[#8a99a8] text-[13px]">Chưa có dữ liệu vận đơn</div>
            ) : (
              carrierDistribution.map((c) => {
                const percent = totalShipments > 0 ? Math.round((c.count / totalShipments) * 100) : 0;
                return (
                  <div key={c.code} className="space-y-1">
                    <div className="flex justify-between text-[12.5px]">
                      <span className="font-medium text-[#212b36] dark:text-foreground">{c.name}</span>
                      <span className="text-[#637381] font-mono tabular-nums">
                        {c.count} đơn ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#f4f6f8] dark:bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-[#0088ff] h-2 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
