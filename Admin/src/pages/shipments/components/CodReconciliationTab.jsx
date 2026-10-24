import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { CheckCircle2, Clock, AlertTriangle, Coins, Search, RefreshCw, CheckCheck } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import shipmentService from '@/services/shipment.service';
import ReconcileCODModal from './ReconcileCODModal';

const COD_STATUS_BADGES = {
  pending: { label: 'Chờ đối soát', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  reconciled: { label: 'Đã đối soát', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  discrepancy: { label: 'Lệch tiền', class: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  not_applicable: { label: 'Không COD', class: 'bg-muted text-muted-foreground border-border' },
};

export default function CodReconciliationTab() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ totalCod: 0, pendingCod: 0, reconciledCod: 0, discrepancyCount: 0 });

  const [selectedIds, setSelectedIds] = useState([]);
  const [modalTarget, setModalTarget] = useState(null);
  const [isBulkModal, setIsBulkModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        shipmentService.getShipmentsList({
          limit: 50,
          search,
          codStatus: statusFilter === 'all' ? undefined : statusFilter,
        }),
        shipmentService.getCODStats(),
      ]);
      setShipments(listRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      toast.error('Lỗi tải dữ liệu đối soát COD: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const eligible = shipments.filter((s) => (s.codAmount || 0) > 0).map((s) => s._id);
      setSelectedIds(eligible);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const selectedShipments = shipments.filter((s) => selectedIds.includes(s._id));

  return (
    <div className="flex flex-col gap-4">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5 rounded-[6px] border border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Tổng COD cần thu</span>
            <Coins className="size-4 text-primary" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-foreground mt-1">
            {(stats.totalCod || 0).toLocaleString('vi-VN')}đ
          </div>
        </Card>

        <Card className="p-3.5 rounded-[6px] border border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Chờ đối soát ({stats.pendingCount || 0})</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-amber-600 mt-1">
            {(stats.pendingCod || 0).toLocaleString('vi-VN')}đ
          </div>
        </Card>

        <Card className="p-3.5 rounded-[6px] border border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Đã đối soát ({stats.reconciledCount || 0})</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {(stats.reconciledCod || 0).toLocaleString('vi-VN')}đ
          </div>
        </Card>

        <Card className="p-3.5 rounded-[6px] border border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Cảnh báo lệch tiền</span>
            <AlertTriangle className="size-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-rose-600 mt-1">
            {stats.discrepancyCount || 0} đơn
          </div>
        </Card>
      </div>

      {/* 2. Toolbar & Bulk Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm mã vận đơn, mã đơn, khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs rounded-[6px]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-[6px] border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="all">Tất cả trạng thái COD</option>
            <option value="pending">Chờ đối soát</option>
            <option value="reconciled">Đã đối soát</option>
            <option value="discrepancy">Lệch tiền</option>
          </select>
        </form>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              size="sm"
              onClick={() => {
                setModalTarget(null);
                setIsBulkModal(true);
              }}
              className="h-9 gap-1.5 rounded-[6px] text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCheck className="size-4" />
              Đối soát {selectedIds.length} đơn đã chọn
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={loadData} className="h-9 text-xs gap-1 rounded-[6px]">
            <RefreshCw className="size-3.5" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* 3. Table */}
      <Card className="rounded-[6px] border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 text-center">
                <Checkbox
                  checked={selectedIds.length > 0 && selectedIds.length === shipments.filter((s) => (s.codAmount || 0) > 0).length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-xs font-semibold">Mã vận đơn / Đơn hàng</TableHead>
              <TableHead className="text-xs font-semibold">Đối tác</TableHead>
              <TableHead className="text-xs font-semibold">Người nhận</TableHead>
              <TableHead className="text-xs font-semibold text-right">Tiền COD</TableHead>
              <TableHead className="text-xs font-semibold text-center">Trạng thái COD</TableHead>
              <TableHead className="text-xs font-semibold">Mã đối soát</TableHead>
              <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8} className="py-3">
                    <Skeleton className="h-5 w-full rounded-[4px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                  Không có vận đơn nào phù hợp với bộ lọc
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((s) => {
                const badge = COD_STATUS_BADGES[s.codStatus] || COD_STATUS_BADGES.pending;
                const isSelected = selectedIds.includes(s._id);
                return (
                  <TableRow key={s._id} className={`hover:bg-muted/40 ${isSelected ? 'bg-primary/5' : ''}`}>
                    <TableCell className="text-center">
                      <Checkbox
                        disabled={(s.codAmount || 0) <= 0}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(s._id)}
                      />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="font-mono font-bold text-xs text-primary">{s.trackingCode}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">#{s.orderCode}</div>
                    </TableCell>
                    <TableCell className="py-2.5 text-xs font-medium uppercase">
                      {s.carrierName || s.carrierCode}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="text-xs font-medium">{s.receiverInfo?.fullName}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{s.receiverInfo?.phone}</div>
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-mono font-bold text-xs tabular-nums">
                      {(s.codAmount || 0).toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border ${badge.class}`}>
                        {badge.label}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 font-mono text-[11px] text-muted-foreground">
                      {s.reconciliationCode || '—'}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setModalTarget(s);
                          setIsBulkModal(false);
                        }}
                        className="h-7 text-xs rounded-[4px]"
                      >
                        Đối soát
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <ReconcileCODModal
        isOpen={!!modalTarget || isBulkModal}
        onClose={() => {
          setModalTarget(null);
          setIsBulkModal(false);
        }}
        shipment={modalTarget}
        bulkShipments={isBulkModal ? selectedShipments : []}
        onSuccess={() => {
          setSelectedIds([]);
          loadData();
        }}
      />
    </div>
  );
}
