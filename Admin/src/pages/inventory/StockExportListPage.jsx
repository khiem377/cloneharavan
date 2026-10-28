import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText, Plus, SearchIcon as Search, Eye, X,
  FileSpreadsheet, CheckCircle2, Clock, PackageCheck, ArrowRight,
  ExternalLink,
} from '@/components/ui/Icons';
import { useStockExports } from '@/hooks/useInventory';
import { inventoryService } from '@/services/inventory.service';
import { warehouseService } from '@/services/warehouse.service';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { toast } from '@/providers/ToastProvider';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import StockExportCreateModal from './components/StockExportCreateModal';

export default function StockExportListPage() {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingId, setDownloadingId] = useState(null);

  // Detail Drawer state
  const [selectedExport, setSelectedExport] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [initialOrderId, setInitialOrderId] = useState(null);
  const [initialOrderCode, setInitialOrderCode] = useState(null);
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Warehouse State
  const [warehouses, setWarehouses] = useState([]);

  const { data: res = {}, isLoading, refetch } = useStockExports({
    page,
    limit: pageSize,
    keyword,
  });

  const exportsList = res.data || res.exports || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const whRes = await warehouseService.getWarehouses();
        const list = whRes.data?.data?.data || [];
        setWarehouses(list);
      } catch (err) {
        console.warn('Lỗi tải kho:', err);
      }
    };
    loadWarehouses();
  }, []);

  const handleDownloadExcel = async (exportItem) => {
    try {
      setDownloadingId(exportItem._id);
      const resp = await inventoryService.downloadExportExcel(exportItem._id);
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Phieu_Xuat_Kho_${exportItem.exportNumber}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải phiếu xuất kho Excel mẫu thành công!');
    } catch (err) {
      toast.error('Lỗi tải file Excel: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreviewExcelOnWeb = (item) => {
    const url = `/stock-exports/${item._id}/download-excel`;
    setPreviewDownloadUrl(url);
    setPreviewTitle(`Phieu Xuat Kho Excel (${item.exportNumber})`);
    setExcelPreviewOpen(true);
  };

  const handleOpenDetail = (item) => {
    setSelectedExport(item);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (exportId, nextStatus) => {
    try {
      await inventoryService.updateStockExportStatus(exportId, { status: nextStatus });
      toast.success('Cập nhật quy trình xuất kho thành công!');
      refetch();
      if (selectedExport && selectedExport._id === exportId) {
        const updated = await inventoryService.getStockExportById(exportId);
        setSelectedExport(updated.data?.data || updated.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const orderCodeParam = searchParams.get('orderCode');
    if (orderIdParam || orderCodeParam) {
      setInitialOrderId(orderIdParam);
      setInitialOrderCode(orderCodeParam);
      setCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setInitialOrderId(null);
    setInitialOrderCode(null);
    setCreateModalOpen(true);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending_pick':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">Chờ soạn hàng</span>;
      case 'picking':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600">Đang lấy hàng</span>;
      case 'packed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600">Đã đóng gói</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">Hoàn thành</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{status}</span>;
    }
  };

  const renderTypeBadge = (type) => {
    switch (type) {
      case 'sale':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Bán hàng</span>;
      case 'transfer':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">Chuyển kho</span>;
      case 'internal_use':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">Tiêu dùng nội bộ</span>;
      case 'damage_expired':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-destructive/10 text-destructive font-semibold text-[11px]">Hủy / Hết hạn</span>;
      case 'sample_gift':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">Hàng mẫu / Quà</span>;
      case 'return_supplier':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">Trả NCC</span>;
      case 'audit_deficit':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">Hao hụt kiểm kê</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-muted text-muted-foreground font-semibold text-[11px]">Xuất khác</span>;
    }
  };

  return (
    <div className="space-y-6 p-6 antialiased">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Lệnh Xuất Kho 4 Bước (Outbound Workflow)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quy trình xuất kho MISA AMIS: Chờ soạn hàng -&gt; Đang lấy hàng -&gt; Đã đóng gói -&gt; Hoàn thành xuất kho
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-[6px] text-xs font-semibold shadow-xs active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tạo Lệnh Xuất Kho Mới
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="rounded-[6px] border border-border p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm mã Lệnh xuất EX, người nhận..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs rounded-[6px]"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-[6px] border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 font-bold text-foreground text-[11px]">
                <th className="px-4 py-3.5 whitespace-nowrap">Mã Lệnh Xuất</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Kho Xuất</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Loại Xuất</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Trạng Thái Thực Hiện</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Người Nhận / Địa Chỉ</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Tổng SL</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Tổng Giá Trị</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Ngày Lập</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Xem & Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                    Đang tải danh sách lệnh xuất kho...
                  </td>
                </tr>
              ) : exportsList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                    Chưa có lệnh xuất kho nào trong hệ thống
                  </td>
                </tr>
              ) : (
                exportsList.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors align-middle">
                    <td className="px-4 py-3 font-semibold text-primary font-mono whitespace-nowrap text-xs">
                      <div>{item.exportNumber}</div>
                      {item.orderId && (
                        <Link
                          to={`/orders/${item.orderId._id || item.orderId}`}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5"
                        >
                          Đơn: #{item.orderId.orderCode || item.orderId}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap text-xs">
                      {item.warehouseId?.name || 'Kho Tổng'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {renderTypeBadge(item.type)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{renderStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-medium text-foreground">{item.recipientName || 'Khách lẻ'}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{item.recipientPhone || item.recipientAddress || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-foreground font-mono tabular-nums text-xs">{item.totalQuantity || 0}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 tabular-nums whitespace-nowrap text-xs">
                      {(item.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono tabular-nums whitespace-nowrap text-xs">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="inline-flex items-center gap-1 rounded-[6px] border border-input bg-background px-2.5 py-1 text-xs font-semibold hover:bg-muted transition-colors h-7"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" /> Tiến Trình
                        </button>
                        <button
                          onClick={() => handlePreviewExcelOnWeb(item)}
                          className="inline-flex items-center gap-1 rounded-[6px] border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors h-7"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" /> Preview Excel
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
      </Card>

      {/* DETAIL & TIMELINE SIDEBAR DRAWER (Matching AMIS Screenshot 1) */}
      {detailOpen && selectedExport && (
        <div className="fixed inset-0 z-50 flex bg-black/40 justify-end">
          <div className="w-full max-w-4xl bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 p-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Lệnh Xuất Kho Số: <span className="text-primary font-mono">{selectedExport.exportNumber}</span>
                </h2>
                <p className="text-xs text-muted-foreground">Chi tiết mặt hàng xuất và Lịch sử tiến trình hoạt động</p>
              </div>
              <button onClick={() => setDetailOpen(false)} className="rounded-[4px] p-1.5 hover:bg-muted cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Content Area */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto border-r border-border">
                <div className="grid grid-cols-2 gap-4 rounded-[6px] border border-border bg-card p-4 text-xs shadow-2xs">
                  <div>
                    <span className="text-muted-foreground">Kho xuất hàng:</span>
                    <p className="font-bold text-primary">{selectedExport.warehouseId?.name || 'Kho Tổng Bình Tân'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Đơn hàng liên kết:</span>
                    {selectedExport.orderId ? (
                      <Link
                        to={`/orders/${selectedExport.orderId._id || selectedExport.orderId}`}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        #{selectedExport.orderId.orderCode || selectedExport.orderId}
                        <ExternalLink className="size-3" />
                      </Link>
                    ) : (
                      <p className="font-semibold text-muted-foreground">Xuất thủ công / Không gắn đơn</p>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Địa chỉ:</span>
                    <p className="font-semibold text-foreground">{selectedExport.recipientAddress || 'TP.HCM'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loại xuất:</span>
                    <p className="font-semibold">{selectedExport.type === 'sale' ? 'Bán hàng' : 'Xuất khác'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <div>{renderStatusBadge(selectedExport.status)}</div>
                  </div>
                </div>

                <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/50 font-bold border-b border-border">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Mã hàng</th>
                        <th className="p-3">Tên hàng</th>
                        <th className="p-3">ĐVT</th>
                        <th className="p-3 text-center">SL Yêu Cầu</th>
                        <th className="p-3 text-center">SL Thực Xuất</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedExport.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-3 text-muted-foreground font-mono tabular-nums">{idx + 1}</td>
                          <td className="p-3 font-mono font-semibold text-primary">{it.sku}</td>
                          <td className="p-3 font-medium text-foreground">{it.productName}</td>
                          <td className="p-3">{it.unit}</td>
                          <td className="p-3 text-center font-bold font-mono tabular-nums">{it.quantity}</td>
                          <td className="p-3 text-center font-bold font-mono tabular-nums text-emerald-600">{it.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Status Action Workflow Buttons */}
                <div className="rounded-[6px] border border-border bg-card p-4 space-y-3 shadow-2xs">
                  <h3 className="text-xs font-bold text-foreground">Chuyển Bước Tiến Trình Xuất Kho</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedExport.status === 'pending_pick' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedExport._id, 'picking')}
                        className="inline-flex items-center gap-1.5 rounded-[6px] bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                      >
                        <ArrowRight className="size-3.5" /> Chuyển sang "Đang Lấy Hàng"
                      </button>
                    )}
                    {selectedExport.status === 'picking' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedExport._id, 'packed')}
                        className="inline-flex items-center gap-1.5 rounded-[6px] bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 active:scale-[0.98] cursor-pointer"
                      >
                        <PackageCheck className="size-3.5" /> Chuyển sang "Đã Đóng Gói"
                      </button>
                    )}
                    {selectedExport.status === 'packed' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedExport._id, 'completed')}
                        className="inline-flex items-center gap-1.5 rounded-[6px] bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] cursor-pointer"
                      >
                        <CheckCircle2 className="size-3.5" /> Hoàn Thành & Trừ Tồn Kho DB
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar Timeline Widget (Matching AMIS Screenshot 1) */}
              <div className="w-72 bg-muted/20 p-5 space-y-4 border-l border-border overflow-y-auto">
                <h3 className="text-xs font-bold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> Lịch Sử Hoạt Động
                </h3>

                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {selectedExport.activityLogs?.map((log, idx) => (
                    <div key={idx} className="relative pl-6 space-y-1">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary border-2 border-background flex items-center justify-center" />
                      <div className="text-xs font-bold text-foreground">{log.note}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal CREATE Stock Export */}
      <StockExportCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        warehouses={warehouses}
        initialOrderId={initialOrderId}
        initialOrderCode={initialOrderCode}
        onSuccess={refetch}
      />

      <ExcelPreviewModal isOpen={excelPreviewOpen} onClose={() => setExcelPreviewOpen(false)} title={previewTitle} downloadUrl={previewDownloadUrl} />
    </div>
  );
}
