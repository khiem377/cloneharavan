import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShippingCarrierCustomIcon,
  ShippingReconcileCustomIcon,
  ShippingSuccessRateCustomIcon,
} from '@/components/ui/Icons';
import { ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ShipmentsCarrierAndCodWidget({
  carrierDistribution = [],
  totalShipments = 0,
  codStats = {},
}) {
  const navigate = useNavigate();

  const totalCod = codStats.totalCod || 0;
  const pendingCod = codStats.pendingCod || 0;
  const reconciledCod = codStats.reconciledCod || 0;
  const discrepancyCount = codStats.discrepancyCount || 0;
  const reconciledRate = totalCod > 0 ? Math.round((reconciledCod / totalCod) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* CỘT 1: HIỆU SUẤT ĐỐI TÁC VẬN CHUYỂN */}
      <div className="bg-card border border-border rounded-[6px] shadow-xs overflow-hidden flex flex-col justify-between">
        <div>
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShippingCarrierCustomIcon size={15} className="text-muted-foreground" />
              <h4 className="text-[13px] font-semibold text-foreground">
                Hiệu suất Hãng vận chuyển
              </h4>
            </div>
            <span className="text-[11.5px] text-muted-foreground font-mono tabular-nums">
              Tổng {totalShipments} đơn
            </span>
          </div>

          <div className="p-4 space-y-3.5">
            {carrierDistribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-[12.5px]">
                Chưa có dữ liệu vận đơn phát sinh trong kỳ
              </div>
            ) : (
              carrierDistribution.map((c) => {
                const percent = totalShipments > 0 ? Math.round((c.count / totalShipments) * 100) : 0;
                const carrierSuccessRate =
                  c.count > 0 ? Math.round(((c.deliveredCount || 0) / c.count) * 100) : 0;

                return (
                  <div key={c.code} className="space-y-1.5 p-2.5 rounded-[5px] bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-semibold text-foreground">{c.name}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">({c.code.toUpperCase()})</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-mono text-[12px]">
                        <span className="text-foreground font-medium">{c.count} đơn</span>
                        <span className="text-muted-foreground font-medium">({percent}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 font-mono">
                      <span>COD: {(c.codAmount || 0).toLocaleString('vi-VN')}₫</span>
                      <span>Cước: {(c.totalFee || 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-border bg-muted/10 text-right">
          <button
            type="button"
            onClick={() => navigate('/settings?tab=shipping-providers')}
            className="text-[12px] text-primary hover:underline font-medium inline-flex items-center cursor-pointer"
          >
            Cấu hình đối tác giao vận <ArrowRight size={13} className="ml-1" />
          </button>
        </div>
      </div>

      {/* CỘT 2: TIẾN ĐỘ ĐỐI SOÁT DÒNG TIỀN COD */}
      <div className="bg-card border border-border rounded-[6px] shadow-xs overflow-hidden flex flex-col justify-between">
        <div>
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShippingReconcileCustomIcon size={15} className="text-muted-foreground" />
              <h4 className="text-[13px] font-semibold text-foreground">
                Tiến độ Đối soát COD & Dòng tiền
              </h4>
            </div>
            <span className="text-[11.5px] text-muted-foreground font-mono tabular-nums">
              Đạt {reconciledRate}%
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Thanh tiến trình hoàn tất */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Tỷ lệ tiền đã quyết toán / Tổng COD</span>
                <span className="font-mono font-semibold text-foreground">{reconciledRate}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${reconciledRate}%` }}
                />
              </div>
            </div>

            {/* 3 Thẻ thống kê COD */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* COD Chờ đối soát */}
              <div className="p-3 rounded-[6px] border border-border bg-muted/20">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11.5px] font-medium">
                  <Clock size={13} />
                  <span>Chờ đối soát</span>
                </div>
                <div className="mt-1 text-[15px] font-bold font-mono text-foreground tabular-nums">
                  {pendingCod.toLocaleString('vi-VN')}₫
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {codStats.pendingCount || 0} đơn đang thu
                </span>
              </div>

              {/* COD Đã đối soát */}
              <div className="p-3 rounded-[6px] border border-border bg-muted/20">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11.5px] font-medium">
                  <CheckCircle2 size={13} />
                  <span>Đã quyết toán</span>
                </div>
                <div className="mt-1 text-[15px] font-bold font-mono text-foreground tabular-nums">
                  {reconciledCod.toLocaleString('vi-VN')}₫
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {codStats.reconciledCount || 0} đơn hoàn tất
                </span>
              </div>
            </div>

            {/* Cảnh báo chênh lệch nếu có */}
            {discrepancyCount > 0 ? (
              <div className="flex items-center gap-2 p-2.5 rounded-[5px] bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-[12px]">
                <AlertCircle size={14} className="shrink-0" />
                <span>Có <strong>{discrepancyCount}</strong> đơn hàng đang có chênh lệch tiền COD cần kiểm tra!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-[5px] bg-slate-50 dark:bg-muted/30 text-muted-foreground text-[11.5px]">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Dòng tiền khớp 100%, không phát sinh chênh lệch đối soát</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-border bg-muted/10 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Chu kỳ đối soát 2 lần/tuần</span>
          <button
            type="button"
            onClick={() => navigate('/shipments?status=cod_reconciliation')}
            className="text-[12px] text-primary hover:underline font-medium inline-flex items-center cursor-pointer"
          >
            Vào trang Đối soát COD <ArrowRight size={13} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
