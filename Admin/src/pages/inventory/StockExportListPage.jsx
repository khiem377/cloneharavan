import React, { useState } from 'react';
import {
  FileText, Plus, SearchIcon as Search, Download, Eye, Trash2, X,
  FileSpreadsheet, CheckCircle2, Clock, PackageCheck, Truck, ArrowRight,
} from '@/components/ui/Icons';
import { useStockExports, useCreateStockExport } from '@/hooks/useInventory';
import { useSearchInventoryProducts } from '@/hooks/useProducts';
import { inventoryService } from '@/services/inventory.service';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { toast } from '@/providers/ToastProvider';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function StockExportListPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingId, setDownloadingId] = useState(null);

  // Detail Drawer state
  const [selectedExport, setSelectedExport] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    type: 'sale',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    note: '',
    items: [],
  });

  const [productSearch, setProductSearch] = useState('');

  const { data: res = {}, isLoading, refetch } = useStockExports({
    page,
    limit: pageSize,
    keyword,
  });

  const exportsList = res.data || res.exports || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createMutation = useCreateStockExport();
  const searchProducts = useSearchInventoryProducts(productSearch).data || [];

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

  const handleOpenCreate = () => {
    setFormData({
      type: 'sale',
      recipientName: '',
      recipientPhone: '',
      recipientAddress: '',
      note: '',
      items: [],
    });
    setProductSearch('');
    setCreateModalOpen(true);
  };

  const handleAddProduct = (prod) => {
    const existingIndex = formData.items.findIndex((i) => i.productId === prod._id && i.variantId === prod.variantId);
    if (existingIndex > -1) {
      const updated = [...formData.items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].exportPrice;
      setFormData({ ...formData, items: updated });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            productId: prod._id,
            variantId: prod.variantId || null,
            sku: prod.sku || '',
            productName: prod.name,
            unit: 'Cái',
            quantity: 1,
            exportPrice: prod.price || 0,
            subtotal: prod.price || 0,
          },
        ],
      });
    }
    setProductSearch('');
  };

  const handleUpdateItem = (index, field, val) => {
    const updated = [...formData.items];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'exportPrice') {
      item.subtotal = Number(item.quantity || 0) * Number(item.exportPrice || 0);
    }
    updated[index] = item;
    setFormData({ ...formData, items: updated });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm xuất kho!');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success('Khởi tạo Lệnh xuất kho thành công!');
      setCreateModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu xuất');
    }
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
                  <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                    Đang tải danh sách lệnh xuất kho...
                  </td>
                </tr>
              ) : exportsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                    Chưa có lệnh xuất kho nào trong hệ thống
                  </td>
                </tr>
              ) : (
                exportsList.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors align-middle">
                    <td className="px-4 py-3 font-semibold text-primary font-mono whitespace-nowrap text-xs">{item.exportNumber}</td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap text-xs">
                      {item.type === 'sale'
                        ? 'Bán hàng'
                        : item.type === 'transfer'
                        ? 'Chuyển kho'
                        : item.type === 'return_supplier'
                        ? 'Trả NCC'
                        : 'Xuất khác'}
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
                    <span className="text-muted-foreground">Người nhận:</span>
                    <p className="font-bold text-foreground">{selectedExport.recipientName || 'Khách lẻ'}</p>
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
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-[6px] border border-border bg-card p-6 shadow-xs space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" /> Tạo Lệnh Xuất Kho Mới
              </h2>
              <button onClick={() => setCreateModalOpen(false)} className="rounded-[4px] p-1 text-muted-foreground hover:bg-muted cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Loại Xuất Kho</label>
                  <SearchableSelect
                    options={[
                      { label: 'Xuất bán hàng', value: 'sale' },
                      { label: 'Xuất chuyển kho nội bộ', value: 'transfer' },
                      { label: 'Xuất khác', value: 'other' },
                    ]}
                    value={formData.type}
                    onChange={(val) => setFormData({ ...formData, type: val })}
                    creatable={false}
                    placeholder="Chọn loại xuất..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Người Nhận</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full rounded-[6px] border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                    className="w-full rounded-[6px] border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Ghi Chú</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full rounded-[6px] border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Product Autocomplete */}
              <div className="relative pt-1">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Tìm sản phẩm / biến thể</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Gõ tên hoặc mã SKU sản phẩm..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full rounded-[6px] border border-input bg-background pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {productSearch.trim() && (
                  <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-[6px] border border-border bg-card shadow-md divide-y divide-border/60">
                    {searchProducts.map((prod, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleAddProduct(prod)}
                        className="flex items-center justify-between p-2.5 hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-xs text-foreground">{prod.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono tabular-nums">SKU: {prod.sku || '-'} | Tồn: <span className="font-bold text-emerald-600">{prod.stock || 0}</span></div>
                        </div>
                        <span className="text-xs font-semibold text-primary font-mono">Thêm</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-[6px] border border-border shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Sản Phẩm</th>
                      <th className="p-2.5 w-24">Số Lượng</th>
                      <th className="p-2.5 w-32">Đơn Giá</th>
                      <th className="p-2.5 w-32">Thành Tiền</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {formData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-foreground">{item.productName}</td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                            className="w-full rounded-[4px] border border-input bg-background px-2 py-1 text-xs font-mono tabular-nums"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            value={item.exportPrice}
                            onChange={(e) => handleUpdateItem(idx, 'exportPrice', Number(e.target.value))}
                            className="w-full rounded-[4px] border border-input bg-background px-2 py-1 text-xs font-mono tabular-nums"
                          />
                        </td>
                        <td className="p-2.5 font-semibold text-emerald-600 font-mono tabular-nums">{item.subtotal.toLocaleString('vi-VN')} đ</td>
                        <td className="p-2.5 text-right">
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="rounded-[4px] p-1 text-destructive hover:bg-destructive/10 cursor-pointer">
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="rounded-[6px] border border-input px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted active:scale-[0.98] cursor-pointer">Hủy</button>
                <button type="submit" disabled={createMutation.isPending} className="rounded-[6px] bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] cursor-pointer">
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo Lệnh Xuất Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExcelPreviewModal isOpen={excelPreviewOpen} onClose={() => setExcelPreviewOpen(false)} title={previewTitle} downloadUrl={previewDownloadUrl} />
    </div>
  );
}
