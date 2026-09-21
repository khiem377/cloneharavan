import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck, Plus, SearchIcon as Search, Building2, Calendar, Layers, ArrowRight,
  RefreshCw, FileSpreadsheet, CheckCircle2, Clock, ExternalLink, X,
} from '@/components/ui/Icons';
import { inventoryService } from '@/services/inventory.service';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { toast } from '@/providers/ToastProvider';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';

export default function StockReceivingListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [receivings, setReceivings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // PO Detail Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPoDetail, setSelectedPoDetail] = useState(null);

  // Excel Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handlePreviewExcel = (pnk) => {
    setPreviewUrl(`stock-receivings/${pnk._id}/download-excel`);
    setPreviewTitle(`Phieu Nhap Kho Excel (${pnk.receivingNumber})`);
    setPreviewOpen(true);
  };

  const handleOpenPoDetail = (poObj) => {
    if (!poObj || typeof poObj !== 'object') {
      toast.info('Thông tin Đơn mua hàng gốc không khả dụng');
      return;
    }
    setSelectedPoDetail(poObj);
    setDetailModalOpen(true);
  };

  const handleSyncFromPOs = async () => {
    try {
      setIsSyncing(true);
      const res = await inventoryService.syncStockReceivingsFromPOs();
      toast.success(res.data?.message || 'Đã đồng bộ Phiếu Nhập Kho từ các Đơn Mua Hàng!');
      fetchReceivings();
    } catch (err) {
      toast.error('Lỗi khi đồng bộ từ Đơn mua hàng');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchReceivings = async () => {
    try {
      setIsLoading(true);
      const res = await inventoryService.getStockReceivings({ page, limit: pageSize, keyword });
      setReceivings(res.data?.data || res.data || []);
      setPagination(res.data?.pagination || { page: 1, limit: pageSize, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error('Lỗi khi tải danh sách Phiếu Nhập Kho PNK');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivings();
  }, [page, pageSize, keyword]);

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-primary" />
            Quản Lý Nhập Kho (Inbound Management)
          </h1>
          <p className="text-xs text-muted-foreground">
            Quản lý Đơn Mua Hàng với Nhà Cung Cấp và các đợt Phiếu Nhập Kho thực tế tại kho
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncFromPOs}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Tự Động Từ PO'}
          </button>
          <button
            onClick={() => navigate('/stock-receivings/create')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Lập Phiếu Nhập Kho Mới (PNK)
          </button>
        </div>
      </div>

      {/* QUICK SWITCH HEADER TABS (PO vs PNK) */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => navigate('/purchase-orders')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          <Building2 className="h-4 w-4" /> Đơn Mua Hàng (PO)
        </button>
        <button
          onClick={() => navigate('/stock-receivings')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-md transition-all"
        >
          <FileCheck className="h-4 w-4" /> Phiếu Nhập Kho (PNK)
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo mã PNK, ghi chú..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={fetchReceivings}
          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      {/* Main PNK Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <th className="px-4 py-3.5">Mã PNK</th>
                <th className="px-4 py-3.5">Mã PO Tham Chiếu</th>
                <th className="px-4 py-3.5">Nhà Cung Cấp</th>
                <th className="px-4 py-3.5 text-center">Số Mặt Hàng</th>
                <th className="px-4 py-3.5 text-center">SL Thực Nhập</th>
                <th className="px-4 py-3.5 text-right">Tổng Tiền Nhập</th>
                <th className="px-4 py-3.5 text-center">Ngày Nhập Kho</th>
                <th className="px-4 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    Đang tải danh sách Phiếu Nhập Kho...
                  </td>
                </tr>
              ) : receivings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    Chưa có Phiếu Nhập Kho (PNK) nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                receivings.map((pnk) => (
                  <tr key={pnk._id} className="hover:bg-muted/30 transition-colors align-middle">
                    <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">
                      {pnk.receivingNumber}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap">
                      {pnk.purchaseOrderId ? (
                        <button
                          onClick={() => {
                            const poObj = pnk.purchaseOrderId;
                            const targetId = typeof poObj === 'object' ? (poObj._id || poObj.poNumber) : poObj;
                            if (targetId) navigate(`/purchase-orders?poId=${targetId}`);
                            else toast.info('Thông tin Đơn mua hàng gốc không khả dụng');
                          }}
                          className="inline-flex items-center gap-1 bg-muted hover:bg-primary/10 hover:text-primary px-2.5 py-1 rounded-lg text-xs font-bold text-primary underline transition-colors"
                          title="Chuyển về trang Đơn Mua Hàng (PO) và tự động bật modal Chi Tiết Đơn Này"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {typeof pnk.purchaseOrderId === 'object' ? (pnk.purchaseOrderId.poNumber || 'PO-GỐC') : pnk.purchaseOrderId}
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {pnk.supplierId?.name || 'Nhà cung cấp'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                      {pnk.items?.length || 0} mục
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">
                      {pnk.totalQuantity} cái
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                      {(pnk.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(pnk.receivedDate || pnk.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Da nhap kho
                        </span>
                        <button
                          onClick={() => handlePreviewExcel(pnk)}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                          title="Xem truoc Phieu Nhap Kho Excel"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 text-primary" /> Excel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* PO DETAIL DRAWER MODAL */}
      {detailModalOpen && selectedPoDetail && (
        <div className="fixed inset-0 z-50 flex bg-black/40 justify-end">
          <div className="w-full max-w-4xl bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 p-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  Đơn Mua Hàng Tham Chiếu: <span className="text-primary font-mono">{selectedPoDetail.poNumber}</span>
                </h2>
                <p className="text-xs text-muted-foreground">Chi tiết Đơn mua hàng đã ký kết với Nhà cung cấp</p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Mã PO:</span>
                  <p className="font-mono font-bold text-foreground">{selectedPoDetail.poNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <p className="font-bold text-emerald-600 font-mono capitalize">{selectedPoDetail.status || 'Hoàn thành'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày giao hàng:</span>
                  <p className="font-mono font-semibold">{selectedPoDetail.deliveryDate ? new Date(selectedPoDetail.deliveryDate).toLocaleDateString('vi-VN') : 'Theo hợp đồng'}</p>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-border bg-muted/40 p-4 flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Preview Modal */}
      <ExcelPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        downloadUrl={previewUrl}
      />
    </div>
  );
}
