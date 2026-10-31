import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { ShippingBoxCustomIcon } from '@/components/ui/Icons';
import { Eye, RotateCw, FileSpreadsheet, ArrowRight, AlertTriangle } from 'lucide-react';

const STATUS_BADGES = {
  ready_to_pick: { label: 'Chờ lấy hàng', variant: 'outline', className: 'border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300' },
  picking: { label: 'Đang lấy hàng', variant: 'outline', className: 'border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300' },
  delivering: { label: 'Đang giao hàng', variant: 'outline', className: 'border-sky-400 text-sky-700 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-300' },
  delivery_fail: { label: 'Chờ giao lại', variant: 'outline', className: 'border-orange-400 text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300' },
  returning: { label: 'Đang hoàn hàng', variant: 'outline', className: 'border-rose-400 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300' },
  returned: { label: 'Đã hoàn hàng', variant: 'outline', className: 'border-rose-600 text-rose-800 bg-rose-100 dark:bg-rose-950 dark:text-rose-200' },
  delivered: { label: 'Đã giao hàng', variant: 'outline', className: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300' },
  cancelled: { label: 'Hủy giao hàng', variant: 'outline', className: 'border-slate-300 text-slate-600 bg-slate-50 dark:bg-slate-900/40 dark:text-slate-400' },
};

export default function ShipmentsRecentTable({
  shipments = [],
  onSelectShipment,
  onSyncShipment,
  onPreviewExcel,
  syncingId = null,
}) {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'ready_to_pick' | 'attention'

  const filteredShipments = shipments.filter((s) => {
    if (filterType === 'ready_to_pick') return s.status === 'ready_to_pick';
    if (filterType === 'attention') {
      return ['delivery_fail', 'returning', 'cancelled'].includes(s.status);
    }
    return true;
  });

  const readyCount = shipments.filter((s) => s.status === 'ready_to_pick').length;
  const attentionCount = shipments.filter((s) =>
    ['delivery_fail', 'returning', 'cancelled'].includes(s.status)
  ).length;

  return (
    <div className="bg-card border border-border rounded-[6px] shadow-xs overflow-hidden">
      {/* Header & Filter Chips */}
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShippingBoxCustomIcon size={16} className="text-muted-foreground" />
          <h4 className="text-[13.5px] font-semibold text-foreground">
            Vận đơn cần xử lý & Mới phát sinh
          </h4>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 text-[12px] font-medium rounded-[5px] transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-foreground text-background'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả gần đây ({shipments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ready_to_pick')}
            className={`px-2.5 py-1 text-[12px] font-medium rounded-[5px] transition-colors cursor-pointer ${
              filterType === 'ready_to_pick'
                ? 'bg-amber-600 text-white'
                : 'bg-muted/50 text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300'
            }`}
          >
            Chờ lấy hàng ({readyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('attention')}
            className={`px-2.5 py-1 text-[12px] font-medium rounded-[5px] transition-colors cursor-pointer ${
              filterType === 'attention'
                ? 'bg-rose-600 text-white'
                : 'bg-muted/50 text-muted-foreground hover:text-rose-700 dark:hover:text-rose-300'
            }`}
          >
            Cần xử lý ({attentionCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="w-[140px] text-[12px]">Mã vận đơn</TableHead>
              <TableHead className="w-[120px] text-[12px]">Đơn hàng</TableHead>
              <TableHead className="min-w-[160px] text-[12px]">Người nhận & Nơi giao</TableHead>
              <TableHead className="w-[120px] text-[12px]">Đối tác giao</TableHead>
              <TableHead className="w-[110px] text-[12px] text-right">Tiền COD</TableHead>
              <TableHead className="w-[110px] text-[12px] text-right">Cước phí</TableHead>
              <TableHead className="w-[130px] text-[12px] text-center">Trạng thái</TableHead>
              {/* STICKY RIGHT-0 CỘT THAO TÁC THEO CHUẨN KỶ LUẬT */}
              <TableHead className="w-[110px] text-[12px] text-center sticky right-0 z-20 bg-background/95 backdrop-blur-none shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-[13px]">
                  Không có vận đơn nào phù hợp với bộ lọc hiện tại.
                </TableCell>
              </TableRow>
            ) : (
              filteredShipments.map((s) => {
                const badge = STATUS_BADGES[s.status] || {
                  label: s.statusText || s.status,
                  variant: 'outline',
                  className: 'border-slate-300 text-slate-700',
                };
                const isReady = s.status === 'ready_to_pick';

                return (
                  <TableRow
                    key={s._id}
                    className="group hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-colors"
                  >
                    {/* Mã vận đơn */}
                    <TableCell className="font-mono text-[12px] py-2.5">
                      <span className="font-semibold text-foreground block">{s.shipmentCode}</span>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {s.trackingCode || 'Chưa có tracking'}
                      </span>
                    </TableCell>

                    {/* Mã đơn hàng */}
                    <TableCell className="font-mono text-[12px] py-2.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/orders?search=${s.orderCode}`)}
                        className="text-primary hover:underline font-semibold cursor-pointer"
                      >
                        {s.orderCode}
                      </button>
                    </TableCell>

                    {/* Người nhận */}
                    <TableCell className="text-[12.5px] py-2.5">
                      <span className="font-medium text-foreground block truncate max-w-[180px]">
                        {s.receiverInfo?.fullName || 'Khách vãng lai'}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono block">
                        {s.receiverInfo?.phone} • {s.receiverInfo?.province || 'Toàn quốc'}
                      </span>
                    </TableCell>

                    {/* Đối tác giao */}
                    <TableCell className="text-[12px] py-2.5 font-medium text-foreground">
                      <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-muted text-[11px] font-mono">
                        {s.carrierName || s.carrierCode?.toUpperCase()}
                      </span>
                    </TableCell>

                    {/* Tiền COD */}
                    <TableCell className="font-mono text-[12px] text-right py-2.5 tabular-nums">
                      {s.codAmount > 0 ? (
                        <span className="font-semibold text-foreground">
                          {s.codAmount.toLocaleString('vi-VN')}₫
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0₫</span>
                      )}
                    </TableCell>

                    {/* Cước phí */}
                    <TableCell className="font-mono text-[12px] text-right py-2.5 tabular-nums text-muted-foreground">
                      {(s.shippingFee || 0).toLocaleString('vi-VN')}₫
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="text-center py-2.5">
                      <Badge variant={badge.variant} className={`text-[11px] py-0.5 ${badge.className}`}>
                        {badge.label}
                      </Badge>
                    </TableCell>

                    {/* STICKY RIGHT-0 THAO TÁC CELL */}
                    <TableCell className="text-center py-2.5 sticky right-0 z-10 bg-card group-hover:bg-slate-50/95 dark:group-hover:bg-muted/70 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground active:scale-[0.98]"
                          title="Xem chi tiết"
                          onClick={() => onSelectShipment(s)}
                        >
                          <Eye size={13} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground active:scale-[0.98]"
                          title="Đồng bộ hãng"
                          disabled={syncingId === s._id}
                          onClick={() => onSyncShipment(s._id)}
                        >
                          <RotateCw
                            size={13}
                            className={syncingId === s._id ? 'animate-spin text-primary' : ''}
                          />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground active:scale-[0.98]"
                          title="Xem/In phiếu Excel"
                          onClick={() => onPreviewExcel(s)}
                        >
                          <FileSpreadsheet size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-muted/10 flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">
          Hiển thị tối đa 8 vận đơn cần chú ý nhất
        </span>
        <button
          type="button"
          onClick={() => navigate('/shipments')}
          className="text-primary hover:underline font-medium inline-flex items-center cursor-pointer"
        >
          Xem toàn bộ danh sách vận đơn <ArrowRight size={13} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
