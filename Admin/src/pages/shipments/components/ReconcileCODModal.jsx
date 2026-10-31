import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import shipmentService from '@/services/shipment.service';

export default function ReconcileCODModal({
  isOpen,
  onClose,
  shipment = null,
  bulkShipments = [],
  onSuccess,
}) {
  const isBulk = Array.isArray(bulkShipments) && bulkShipments.length > 0;
  const targetShipment = shipment || (isBulk ? bulkShipments[0] : null);

  const [reconciliationCode, setReconciliationCode] = useState('');
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const totalExpectedCod = isBulk
    ? bulkShipments.reduce((sum, s) => sum + (s.codAmount || 0), 0)
    : targetShipment?.codAmount || 0;

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      setReconciliationCode(`DS-${today}-${Math.floor(100 + Math.random() * 900)}`);
      setReceivedAmount(totalExpectedCod);
      setNote('');
    }
  }, [isOpen, totalExpectedCod]);

  if (!isOpen || (!targetShipment && !isBulk)) return null;

  const diff = isBulk ? 0 : Number(receivedAmount) - Number(totalExpectedCod);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reconciliationCode.trim()) {
      return toast.error('Vui lòng nhập mã phiên đối soát');
    }

    try {
      setLoading(true);
      if (isBulk) {
        const ids = bulkShipments.map((s) => s._id);
        const res = await shipmentService.bulkReconcileCOD({
          shipmentIds: ids,
          reconciliationCode: reconciliationCode.trim(),
          codNote: note.trim(),
        });
        toast.success(res.message || 'Đã đối soát thành công');
      } else {
        await shipmentService.reconcileCOD(targetShipment._id, {
          codReceivedAmount: Number(receivedAmount),
          reconciliationCode: reconciliationCode.trim(),
          codNote: note.trim(),
        });
        toast.success('Đối soát tiền COD thành công!');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi đối soát COD');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="flex w-full max-w-md flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-sm text-foreground">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            {isBulk ? `Đối soát COD hàng loạt (${bulkShipments.length} đơn)` : `Đối soát COD: ${targetShipment.trackingCode}`}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[6px] active:scale-[0.98]" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 flex flex-col gap-3.5">
            {/* Thông tin đối soát tóm tắt */}
            <div className="p-3 rounded-[6px] border border-border bg-muted/20 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số lượng vận đơn:</span>
                <span className="font-mono font-bold">{isBulk ? bulkShipments.length : 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền COD dự kiến:</span>
                <span className="font-mono font-bold text-foreground">
                  {totalExpectedCod.toLocaleString('vi-VN')}đ
                </span>
              </div>
              {!isBulk && (
                <div className="flex justify-between items-center pt-1 border-t border-border">
                  <span className="text-muted-foreground">Chênh lệch:</span>
                  <span className={`font-mono font-bold ${diff === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {diff === 0 ? 'Khớp 100%' : `${diff > 0 ? '+' : ''}${diff.toLocaleString('vi-VN')}đ`}
                  </span>
                </div>
              )}
            </div>

            {/* Mã phiên đối soát */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Mã phiên / Số chứng từ đối soát <span className="text-destructive">*</span></label>
              <Input
                className="h-8 rounded-[6px] text-xs font-mono"
                placeholder="VD: DS-20261021-01"
                value={reconciliationCode}
                onChange={(e) => setReconciliationCode(e.target.value)}
              />
            </div>

            {/* Số tiền thực nhận */}
            {!isBulk && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Số tiền thực tế hãng chuyển (VNĐ) <span className="text-destructive">*</span></label>
                <Input
                  type="number"
                  min={0}
                  className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                />
                {diff !== 0 && (
                  <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="size-3 shrink-0" />
                    Số tiền lệch so với dự kiến. Đơn sẽ mang trạng thái "Lệch tiền".
                  </p>
                )}
              </div>
            )}

            {/* Ghi chú */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Ghi chú đối soát</label>
              <Input
                className="h-8 rounded-[6px] text-xs"
                placeholder="VD: Tiền đã về tài khoản Vietcombank lúc 10h"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="p-3 border-t border-border flex justify-end gap-2 bg-muted/10">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 rounded-[6px]">
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="h-8 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? 'Đang xử lý...' : 'Xác nhận đối soát'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
