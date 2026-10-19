import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';
import shipmentService from '@/services/shipment.service';
import CreateShipmentModal from './components/CreateShipmentModal';
import ShipmentDetailModal from './components/ShipmentDetailModal';
import { Truck, Plus, Search, Download, RefreshCw, Eye } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'Tất cả' },
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

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
      fetchShipments(1, q);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShipments(1, search);
  };

  const handleExportCSV = () => {
    if (shipments.length === 0) return toast.info('Không có dữ liệu để xuất');
    const rows = shipments.map((s) => `"${s.shipmentCode}","${s.trackingCode}","${s.orderCode}","${s.carrierName}","${s.receiverInfo?.fullName}","${s.receiverInfo?.phone}",${s.codAmount},${s.shippingFee},"${s.statusText || s.status}"\n`);
    const blob = new Blob(['\uFEFF' + ['Mã giao hàng,Mã vận đơn,Mã đơn hàng,Đối tác,Người nhận,SĐT,COD,Phí ship,Trạng thái\n'].concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `van_don_${Date.now()}.csv`;
    a.click();
    toast.success('Đã xuất file vận đơn thành công');
  };

  return (
    <div className="space-y-4">
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-[#212b36] dark:text-foreground">Danh sách vận đơn</h2>
          <p className="text-[13px] text-[#637381] dark:text-muted-foreground">
            Quản lý toàn bộ phiếu giao hàng, đối soát COD và mã vận đơn từ đối tác
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleExportCSV} className="h-8 px-3 text-[12.5px] border-[#dfe3e8] cursor-pointer">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Xuất file
          </Button>
          <Button type="button" onClick={() => setIsCreateOpen(true)} className="h-8 px-3 text-[12.5px] bg-[#0088ff] hover:bg-[#0077e6] text-white cursor-pointer active:scale-[0.98]">
            <Plus className="w-3.5 h-3.5 mr-1" /> Tạo vận đơn
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-xs overflow-hidden">
        {/* Filter Tabs */}
        <div className="flex items-center border-b border-[#dfe3e8] dark:border-border overflow-x-auto px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchParams(tab.id === 'all' ? {} : { status: tab.id }); }}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.id ? 'border-[#0088ff] text-[#0088ff]' : 'border-transparent text-[#637381] hover:text-[#212b36]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="p-3 border-b border-[#dfe3e8] dark:border-border flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8a99a8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, mã vận đơn, mã giao hàng, người nhận..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-[6px] border border-[#dfe3e8] dark:border-border bg-white dark:bg-muted text-[13px]"
            />
          </div>
          <Button type="submit" variant="outline" className="h-9 px-3 text-[13px] border-[#dfe3e8] cursor-pointer">Tìm</Button>
          <Button type="button" variant="outline" onClick={() => fetchShipments(pagination.page)} className="h-9 px-2.5 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse">
            <thead>
              <tr className="bg-[#f9fafb] dark:bg-muted/40 border-b border-[#dfe3e8] dark:border-border text-[#637381] font-medium">
                <th className="py-2.5 px-3">Mã giao hàng</th>
                <th className="py-2.5 px-3">Mã vận đơn</th>
                <th className="py-2.5 px-3">Mã đơn hàng</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Tiền thu hộ COD</th>
                <th className="py-2.5 px-3 text-right">Phí trả ĐTGH</th>
                <th className="py-2.5 px-3">Đối tác</th>
                <th className="py-2.5 px-3">Người nhận</th>
                <th className="py-2.5 px-3">Kho lấy hàng</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe3e8] dark:divide-border text-[#212b36] dark:text-foreground">
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-[#8a99a8]">
                    {loading ? 'Đang tải dữ liệu vận đơn...' : 'Chưa có vận đơn nào phù hợp'}
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s._id} className="hover:bg-[#fafbfb] dark:hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-[#0088ff] hover:underline cursor-pointer" onClick={() => setSelectedShipment(s)}>
                      {s.shipmentCode}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold">{s.trackingCode}</td>
                    <td
                      className="py-2.5 px-3 font-mono font-medium text-[#0088ff] hover:underline cursor-pointer"
                      onClick={() => navigate(`/orders?search=${s.orderCode}`)}
                      title="Bấm để xem đơn hàng này"
                    >
                      {s.orderCode}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#f0f7ff] text-[#0088ff] border border-[#b3ddff]">
                        {s.statusText || s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">{(s.codAmount || 0).toLocaleString('vi-VN')}₫</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#637381]">{(s.shippingFee || 0).toLocaleString('vi-VN')}₫</td>
                    <td className="py-2.5 px-3 font-medium">{s.carrierName}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium truncate max-w-[130px]">{s.receiverInfo?.fullName}</p>
                      <span className="text-[11px] text-[#8a99a8] font-mono">{s.receiverInfo?.phone}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#637381] truncate max-w-[120px]">{s.warehouseName || 'Cửa hàng chính'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={syncingId === s._id}
                          onClick={() => handleQuickSync(s._id)}
                          className="p-1 rounded-[4px] hover:bg-slate-100 dark:hover:bg-muted text-emerald-600 dark:text-emerald-400 cursor-pointer disabled:opacity-50"
                          title="Đồng bộ trạng thái từ hãng"
                        >
                          <RefreshCw className={`w-4 h-4 ${syncingId === s._id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedShipment(s)}
                          className="p-1 rounded-[4px] hover:bg-slate-100 dark:hover:bg-muted text-[#0088ff] cursor-pointer"
                          title="Xem chi tiết phiếu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="p-3 border-t border-[#dfe3e8] dark:border-border flex justify-between items-center text-[12.5px] text-[#637381]">
          <span>Hiển thị {shipments.length} trên tổng {pagination.total} vận đơn</span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => fetchShipments(pagination.page - 1)}
              className="h-7 px-2.5 text-[12px]"
            >
              Trang trước
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchShipments(pagination.page + 1)}
              className="h-7 px-2.5 text-[12px]"
            >
              Trang sau
            </Button>
          </div>
        </div>
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

