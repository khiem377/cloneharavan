import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { toast } from '@/providers/ToastProvider';
import shipmentService from '@/services/shipment.service';
import CreateShipmentModal from './components/CreateShipmentModal';
import ShipmentDetailModal from './components/ShipmentDetailModal';
import CodReconciliationTab from './components/CodReconciliationTab';
import { Truck, Plus, Search, RefreshCw, Eye } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'cod_reconciliation', label: 'Đối soát COD' },
  { id: 'ready_to_pick', label: 'Chờ lấy hàng' },
  { id: 'delivering_group', label: 'Đang giao hàng' },
  { id: 'delivery_fail', label: 'Chờ giao lại' },
  { id: 'returning', label: 'Đang hoàn hàng' },
  { id: 'delivered', label: 'Đã giao hàng' },
];

export default function ShipmentsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialStatus = searchParams.get('status') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [syncingId, setSyncingId] = useState(null);

  const handleQuickSync = async (id) => {
    try {
      setSyncingId(id);
      const res = await shipmentService.syncShipmentStatus(id);
      toast.success(res.message || 'Đã đồng bộ trạng thái mới nhất từ đối tác!');
      fetchShipments(pagination.page, search);
    } catch (err) {
      toast.error('Lỗi đồng bộ: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncingId(null);
    }
  };

  const fetchShipments = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await shipmentService.getShipmentsList({
        page,
        status: activeTab,
        search: searchQuery,
      });
      setShipments(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0 });
    } catch (err) {
      toast.error('Lỗi tải danh sách vận đơn: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments(1, search);
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShipments(1, search);
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="size-5 text-primary" />
            Vận đơn & Giao hàng
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý vận đơn, tra cứu hành trình GHN, Viettel Post, AhaMove
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          size="sm"
          className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
        >
          <Plus size={15} className="mr-1" /> Tạo vận đơn mới
        </Button>
      </div>

      {/* Main Container */}
      <div className="bg-card border border-border rounded-[6px] shadow-2xs overflow-hidden">
        {/* Filter Tabs */}
        <div className="flex items-center border-b border-border overflow-x-auto px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchParams(tab.id === 'all' ? {} : { status: tab.id }); }}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.id ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'cod_reconciliation' ? (
          <div className="p-4">
            <CodReconciliationTab />
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="p-3 border-b border-border flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, mã vận đơn, mã giao hàng, người nhận..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-[6px] text-xs"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-9 px-3 text-xs">Tìm</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fetchShipments(pagination.page)} className="h-9 px-2.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold py-2.5">Mã giao hàng</TableHead>
                <TableHead className="text-xs font-semibold py-2.5">Mã vận đơn</TableHead>
                <TableHead className="text-xs font-semibold py-2.5">Mã đơn hàng</TableHead>
                <TableHead className="text-xs font-semibold py-2.5">Trạng thái</TableHead>
                <TableHead className="text-xs font-semibold py-2.5 text-right">Tiền thu hộ COD</TableHead>
                <TableHead className="text-xs font-semibold py-2.5 text-right">Phí trả ĐTGH</TableHead>
                <TableHead className="text-xs font-semibold py-2.5">Đối tác</TableHead>
                <TableHead className="text-xs font-semibold py-2.5">Người nhận</TableHead>
                <TableHead className="text-xs font-semibold py-2.5">Kho lấy hàng</TableHead>
                <TableHead className="text-xs font-semibold py-2.5 text-center w-20">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`ship-skel-${i}`}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-7 w-14 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-xs text-muted-foreground font-mono">
                    Chưa có vận đơn nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((s) => (
                  <TableRow key={s._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-2.5 font-mono text-xs font-medium text-primary hover:underline cursor-pointer" onClick={() => setSelectedShipment(s)}>
                      {s.shipmentCode}
                    </TableCell>
                    <TableCell className="py-2.5 font-mono text-xs font-semibold">{s.trackingCode || '—'}</TableCell>
                    <TableCell
                      className="py-2.5 font-mono text-xs font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => navigate(`/orders?search=${s.orderCode}`)}
                      title="Bấm để xem đơn hàng này"
                    >
                      {s.orderCode}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border-primary/20">
                        {s.statusText || s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-mono tabular-nums text-xs font-semibold">{(s.codAmount || 0).toLocaleString('vi-VN')}₫</TableCell>
                    <TableCell className="py-2.5 text-right font-mono tabular-nums text-xs text-muted-foreground">{(s.shippingFee || 0).toLocaleString('vi-VN')}₫</TableCell>
                    <TableCell className="py-2.5 text-xs font-medium">{s.carrierName}</TableCell>
                    <TableCell className="py-2.5">
                      <p className="font-medium text-xs truncate max-w-[130px]">{s.receiverInfo?.fullName}</p>
                      <span className="text-[11px] text-muted-foreground font-mono">{s.receiverInfo?.phone}</span>
                    </TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground truncate max-w-[120px]">{s.warehouseName || 'Cửa hàng chính'}</TableCell>
                    <TableCell className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={syncingId === s._id}
                          onClick={() => handleQuickSync(s._id)}
                          className="size-7 rounded-[4px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                          title="Đồng bộ trạng thái từ hãng"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === s._id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedShipment(s)}
                          className="size-7 rounded-[4px] text-primary hover:bg-primary/10"
                          title="Xem chi tiết phiếu"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer pagination */}
        <div className="p-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>Hiển thị {shipments.length} trên tổng {pagination.total} vận đơn</span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchShipments(pagination.page - 1)}
              className="h-7 px-2.5 text-xs"
            >
              Trang trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchShipments(pagination.page + 1)}
              className="h-7 px-2.5 text-xs"
            >
              Trang sau
            </Button>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Modals */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchShipments(1)}
      />
      <ShipmentDetailModal
        shipment={selectedShipment}
        isOpen={!!selectedShipment}
        onClose={() => setSelectedShipment(null)}
        onRefresh={() => fetchShipments(pagination.page)}
      />
    </div>
  );
}
