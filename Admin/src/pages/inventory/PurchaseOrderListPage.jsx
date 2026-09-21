import React, { useState, useMemo, useEffect } from 'react';
import {
  FileCheck, Plus, SearchIcon as Search, Download, CheckCircle2, Clock,
  Send, XCircle, Eye, Building2, Truck, PackageCheck, ClipboardCheck,
  ShieldCheck, FileSpreadsheet, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown, X,
} from '@/components/ui/Icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  usePurchaseOrders,
  useUpdatePurchaseOrderStatus,
} from '@/hooks/useInventory';
import { inventoryService } from '@/services/inventory.service';
import DataTablePagination from '@/components/ui/DataTablePagination';
import Can from '@/components/auth/Can';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { toast } from '@/providers/ToastProvider';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';
import SendPOModal from '@/components/inventory/SendPOModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useModalSet } from '@/hooks/useModalSet';

import useColumnVisibility from '@/hooks/useColumnVisibility';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';

const PO_COLUMNS = [
  { id: 'stt', label: 'STT', defaultVisible: true },
  { id: 'poNumber', label: 'Mã Đơn PO', defaultVisible: true, alwaysVisible: true },
  { id: 'supplier', label: 'Nhà Cung Cấp', defaultVisible: true },
  { id: 'itemCount', label: 'Số Loại SP', defaultVisible: true },
  { id: 'totalQuantity', label: 'Tổng SL', defaultVisible: true },
  { id: 'totalAmount', label: 'Tổng Giá Nhập', defaultVisible: true },
  { id: 'status', label: 'Trạng Thái', defaultVisible: true },
  { id: 'stepper', label: 'Nấc Tiến Quy Trình', defaultVisible: true },
  { id: 'actions', label: 'Xem & Tải Excel', defaultVisible: true, alwaysVisible: true },
];

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingId, setDownloadingId] = useState(null);

  // Sorting state
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal state — managed by useModalSet
  const modal = useModalSet(['detail', 'excelPreview', 'sendPO', 'confirm']);

  // Convenience shorthands
  const detailModalOpen   = modal.isOpen('detail');
  const selectedPoDetail  = modal.data('detail');
  const excelPreviewOpen  = modal.isOpen('excelPreview');
  const previewData       = modal.data('excelPreview') || {};
  const previewDownloadUrl = previewData.url || '';
  const previewTitle      = previewData.title || '';
  const sendPOModalOpen   = modal.isOpen('sendPO');
  const selectedPOToSend  = modal.data('sendPO');
  const confirmModal      = {
    open: modal.isOpen('confirm'),
    ...(modal.data('confirm') || {}),
  };

  const handleOpenPoDetail = (po) => modal.open('detail', po);

  const columnVisibility = useColumnVisibility('admin_po_columns', PO_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  const { data: res = {}, isLoading } = usePurchaseOrders({
    page,
    limit: pageSize,
    keyword,
    status: statusFilter,
  });

  const orders = res.data || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const updateStatusMutation = useUpdatePurchaseOrderStatus();

  const [searchParams] = useSearchParams();
  const poIdFromUrl = searchParams.get('poId');

  useEffect(() => {
    if (poIdFromUrl && orders.length > 0) {
      const found = orders.find((o) => o._id === poIdFromUrl || o.poNumber === poIdFromUrl);
      if (found) modal.open('detail', found);
    }
  }, [poIdFromUrl, orders]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    return [...orders].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'supplierId') {
        valA = a.supplierId?.name || '';
        valB = b.supplierId?.name || '';
      } else if (sortField === 'itemCount') {
        valA = a.items?.length || 0;
        valB = b.items?.length || 0;
      }

      if (typeof valA === 'string') {
        const cmp = String(valA || '').localeCompare(String(valB || ''), 'vi', { sensitivity: 'base' });
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortField, sortOrder]);

  const renderSortHeader = (field, label, align = 'left', extraClass = '') => {
    const isSorted = sortField === field;
    const alignClass = align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end text-right' : 'justify-start text-left';

    return (
      <th
        onClick={() => handleSort(field)}
        className={`px-4 py-3.5 whitespace-nowrap cursor-pointer select-none hover:bg-muted/80 transition-colors ${extraClass}`}
      >
        <div className={`flex items-center gap-1.5 ${alignClass}`}>
          <span>{label}</span>
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-primary shrink-0" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          )}
        </div>
      </th>
    );
  };

  const handleDownloadExcel = async (order) => {
    try {
      setDownloadingId(order._id);
      const resp = await inventoryService.downloadPOExcel(order._id);
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Don_Dat_Hang_${order.poNumber}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải Đơn Đặt Hàng Excel mẫu thành công!');
    } catch (err) {
      toast.error('Lỗi tải file Excel Đơn Đặt Hàng: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreviewExcelOnWeb = (order) => {
    // Dung relative path de axios interceptor tu dong gan Bearer token
    const url = `/purchase-orders/${order._id}/download-excel`;
    modal.open('excelPreview', { url, title: `Don Dat Hang Excel (${order.poNumber})` });
  };

  const handleOpenSendPOModal = (po) => modal.open('sendPO', po);

  const doAdvanceStatus = async (id, status, poNumber) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success(`Đã chuyển đơn ${poNumber} sang trạng thái mới thành công!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleAdvanceStatus = (po, nextStatus) => {
    if (po.status === 'completed') {
      toast.error('Đơn hàng đã hoàn tất nhập kho, không thể thay đổi trạng thái!');
      return;
    }

    if (nextStatus === 'completed') {
      modal.open('confirm', {
        po,
        nextStatus: 'completed',
        title: `Xác Nhận Nghiệm Thu & Nhập Kho (${po.poNumber})`,
        message: `Xác nhận nghiệm thu đơn ${po.poNumber}? Hệ thống sẽ chính thức cộng số lượng vào tồn kho thực tế và lưu trữ chứng từ lên Đám Mây.`,
        confirmText: 'Xác Nhận Nhập Kho',
        variant: 'primary',
      });
      return;
    }

    doAdvanceStatus(po._id, nextStatus, po.poNumber);
  };

  const renderStatusBadge = (st) => {
    switch (st) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <CheckCircle2 className="h-3.5 w-3.5" /> 6. Đã Nhập Kho (Hoàn Tất)
          </span>
        );
      case 'inspecting':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
            <ClipboardCheck className="h-3.5 w-3.5" /> 5. Đang Kiểm Hàng
          </span>
        );
      case 'arrived':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
            <PackageCheck className="h-3.5 w-3.5" /> 4. Đã Đến Kho
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
            <Truck className="h-3.5 w-3.5" /> 3. Đang Vận Chuyển
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
            <Send className="h-3.5 w-3.5" /> 2. Đã Gửi NCC
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
            <XCircle className="h-3.5 w-3.5" /> Đã Hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            <Clock className="h-3.5 w-3.5" /> 1. Bản Nháp (Đã Tạo)
          </span>
        );
    }
  };

  const renderActionStepperButton = (po) => {
    switch (po.status) {
      case 'draft':
        return (
          <button
            onClick={() => handleOpenSendPOModal(po)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow transition-colors whitespace-nowrap"
          >
            <Send className="h-3.5 w-3.5" /> Gửi PO Cho NCC
          </button>
        );
      case 'sent':
        return (
          <button
            onClick={() => handleAdvanceStatus(po, 'in_transit')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow transition-colors whitespace-nowrap"
          >
            <Truck className="h-3.5 w-3.5" /> Vận Chuyển Hàng
          </button>
        );
      case 'in_transit':
        return (
          <button
            onClick={() => handleAdvanceStatus(po, 'arrived')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700 shadow transition-colors whitespace-nowrap"
          >
            <PackageCheck className="h-3.5 w-3.5" /> Đến Kho Thành Phẩm
          </button>
        );
      case 'arrived':
        return (
          <button
            onClick={() => handleAdvanceStatus(po, 'inspecting')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 shadow transition-colors whitespace-nowrap"
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Bắt Đầu Kiểm Hàng
          </button>
        );
      case 'inspecting':
        return (
          <button
            onClick={() => handleAdvanceStatus(po, 'completed')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-colors whitespace-nowrap"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Xác Nhận & Nhập Kho
          </button>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4" /> Đã Khóa Tồn Kho
            </span>
            <button
              onClick={() => navigate(`/purchase-returns/create?poId=${po._id}`)}
              className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Trả Hàng
            </button>
          </div>
        );
      default:
        return <span className="text-xs text-muted-foreground">-</span>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-primary" />
            Đơn Mua Hàng & Nhập Kho (Inbound Management)
          </h1>
          <p className="text-xs text-muted-foreground">
            Quản lý Đơn Mua Hàng với Nhà Cung Cấp và các đợt Phiếu Nhập Kho thực tế
          </p>
        </div>
        <button
          onClick={() => navigate('/purchase-orders/create')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo Đơn Mua Hàng Mới (PO)
        </button>
      </div>

      {/* QUICK SWITCH HEADER TABS (PO vs PNK) */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => navigate('/purchase-orders')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-md transition-all"
        >
          <Building2 className="h-4 w-4" /> Đơn Mua Hàng (PO)
        </button>
        <button
          onClick={() => navigate('/stock-receivings')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          <FileCheck className="h-4 w-4" /> Phiếu Nhập Kho (PNK)
        </button>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm mã đơn nhập PO, ghi chú..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-64">
            <SearchableSelect
              options={[
                { label: 'Tất cả trạng thái quy trình', value: '' },
                { label: 'Bản nháp (Đã tạo đơn)', value: 'draft' },
                { label: 'Đã gửi NCC', value: 'sent' },
                { label: 'Đang vận chuyển', value: 'in_transit' },
                { label: 'Đã đến kho thành phẩm', value: 'arrived' },
                { label: 'Đang kiểm tra hàng hóa', value: 'inspecting' },
                { label: 'Đã xác nhận & Nhập kho', value: 'completed' },
                { label: 'Đã hủy đơn', value: 'cancelled' },
              ]}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              creatable={false}
              placeholder="Tất cả trạng thái quy trình"
            />
          </div>
          <ColumnToggleDropdown columnVisibility={columnVisibility} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                {isColumnVisible('stt') && <th className="px-4 py-3.5 text-center w-12 whitespace-nowrap">STT</th>}
                {isColumnVisible('poNumber') && renderSortHeader('poNumber', 'Mã Đơn PO', 'left', 'w-36')}
                {isColumnVisible('supplier') && renderSortHeader('supplierId', 'Nhà Cung Cấp', 'left', 'min-w-[220px]')}
                {isColumnVisible('itemCount') && renderSortHeader('itemCount', 'Số Loại SP', 'center', 'w-24')}
                {isColumnVisible('totalQuantity') && renderSortHeader('totalQuantity', 'Tổng SL', 'center', 'w-24')}
                {isColumnVisible('totalAmount') && renderSortHeader('totalAmount', 'Tổng Giá Nhập', 'right', 'w-36')}
                {isColumnVisible('status') && renderSortHeader('status', 'Trạng Thái Hiện Tại', 'center', 'w-48')}
                {isColumnVisible('stepper') && <th className="px-4 py-3.5 whitespace-nowrap w-48 text-center">Nấc Tiến Quy Trình</th>}
                {isColumnVisible('actions') && <th className="px-4 py-3.5 whitespace-nowrap w-56 text-right">Xem & Tải Excel</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-8 text-center text-sm text-muted-foreground">
                    Đang tải danh sách đơn nhập kho...
                  </td>
                </tr>
              ) : sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-8 text-center text-sm text-muted-foreground">
                    Chưa có đơn nhập kho nào
                  </td>
                </tr>
              ) : (
                sortedOrders.map((po, idx) => (
                  <tr key={po._id} className="hover:bg-muted/30 transition-colors align-middle">
                    {isColumnVisible('stt') && (
                      <td className="px-4 py-3.5 text-center font-mono text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                    )}
                    {isColumnVisible('poNumber') && (
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenPoDetail(po)}
                          className="font-extrabold text-primary hover:underline font-mono"
                          title="Click xem chi tiết Đơn mua hàng"
                        >
                          {po.poNumber}
                        </button>
                      </td>
                    )}
                    {isColumnVisible('supplier') && (
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[260px]" title={po.supplierId?.name}>
                            {po.supplierId?.name || 'Nhà cung cấp'}
                          </span>
                        </div>
                      </td>
                    )}
                    {isColumnVisible('itemCount') && (
                      <td className="px-4 py-3.5 font-mono text-muted-foreground text-center whitespace-nowrap">
                        {po.items?.length || 0} mặt hàng
                      </td>
                    )}
                    {isColumnVisible('totalQuantity') && (
                      <td className="px-4 py-3.5 font-semibold text-foreground text-center whitespace-nowrap">
                        {po.totalQuantity || 0}
                      </td>
                    )}
                    {isColumnVisible('totalAmount') && (
                      <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-right whitespace-nowrap">
                        {(po.totalAmount || 0).toLocaleString('vi-VN')} đ
                      </td>
                    )}

                    {/* Current Status Badge */}
                    {isColumnVisible('status') && (
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">{renderStatusBadge(po.status)}</td>
                    )}

                    {/* ACTION STEPPER BUTTON COLUMN */}
                    {isColumnVisible('stepper') && (
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {renderActionStepperButton(po)}
                      </td>
                    )}

                    {isColumnVisible('actions') && (
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreviewExcelOnWeb(po)}
                            className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                            title="Xem trước file Excel (.xlsx) trực tiếp trên Web"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" /> Preview Excel
                          </button>

                          <button
                            onClick={() => handleDownloadExcel(po)}
                            disabled={downloadingId === po._id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
                            title="Tải phiếu nhập kho điền sẵn dữ liệu theo Mẫu Excel"
                          >
                            <Download className="h-3.5 w-3.5 text-primary" />
                            {downloadingId === po._id ? 'Đang xuất...' : 'Tải Excel'}
                          </button>
                        </div>
                      </td>
                    )}
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

      {/* Real Web XLSX Preview Modal */}
      <ExcelPreviewModal
        isOpen={excelPreviewOpen}
        onClose={() => modal.close('excelPreview')}
        title={previewTitle}
        downloadUrl={previewDownloadUrl}
      />

      {/* Send PO to Supplier Modal (Flexible Dispatch) */}
      <SendPOModal
        isOpen={sendPOModalOpen}
        onClose={() => modal.close('sendPO')}
        po={selectedPOToSend}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        }}
      />

      {/* Custom Confirm Dialog (Replaces native browser window.confirm popup) */}
      <ConfirmDialog
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        loading={updateStatusMutation.isPending}
        onCancel={() => modal.close('confirm')}
        onConfirm={async () => {
          if (confirmModal.po && confirmModal.nextStatus) {
            await doAdvanceStatus(confirmModal.po._id, confirmModal.nextStatus, confirmModal.po.poNumber);
            modal.close('confirm');
          }
        }}
      />

      {/* AMIS STYLE PO DETAIL DRAWER (Matching AMIS Screenshot 3) */}
      {detailModalOpen && selectedPoDetail && (
        <div className="fixed inset-0 z-50 flex bg-black/40 justify-end">
          <div className="w-full max-w-4xl bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 p-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  Đơn Mua Hàng: <span className="text-primary font-mono">{selectedPoDetail.poNumber}</span>
                </h2>
                <p className="text-xs text-muted-foreground">Chi tiết thỏa thuận mua hàng với Nhà cung cấp & Đối soát nhập thực tế</p>
              </div>
              <button onClick={() => modal.close('detail')} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">Mã nhà cung cấp:</span>
                  <p className="font-mono font-bold text-foreground">{selectedPoDetail.supplierId?.code || 'NCC-01'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tên nhà cung cấp:</span>
                  <p className="font-bold text-foreground truncate">{selectedPoDetail.supplierId?.name || 'NCC'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày đơn hàng:</span>
                  <p className="font-mono font-semibold">{new Date(selectedPoDetail.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <div>{renderStatusBadge(selectedPoDetail.status)}</div>
                </div>
              </div>

              {/* Items Table (Matching AMIS Screenshot 3 columns) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground">Danh Sách Hàng Hóa Mua</h3>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/50 font-bold border-b border-border text-muted-foreground">
                      <tr>
                        <th className="p-3 w-10">#</th>
                        <th className="p-3">Mã hàng</th>
                        <th className="p-3">Tên hàng</th>
                        <th className="p-3 text-center">ĐVT</th>
                        <th className="p-3 text-center">SL Yêu Cầu</th>
                        <th className="p-3 text-center">SL Đã Nhận</th>
                        <th className="p-3 text-right">Đơn giá</th>
                        <th className="p-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedPoDetail.items?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="p-3 text-muted-foreground font-mono">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-primary">{it.sku || 'SKU-001'}</td>
                          <td className="p-3 font-medium text-foreground">{it.productName}</td>
                          <td className="p-3 text-center text-muted-foreground">{it.unit || 'Cái'}</td>
                          <td className="p-3 text-center font-bold text-foreground">{it.expectedQty}</td>
                          <td className="p-3 text-center font-bold text-emerald-600 font-mono">{it.receivedQty || 0}</td>
                          <td className="p-3 text-right font-mono">{(it.importPrice || 0).toLocaleString('vi-VN')} đ</td>
                          <td className="p-3 text-right font-mono font-bold text-primary">{(it.subtotal || 0).toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-border bg-muted/40 p-4 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-muted-foreground">Tổng cộng: </span>
                <span className="font-extrabold text-sm text-primary font-mono">
                  {(selectedPoDetail.totalAmount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreviewExcelOnWeb(selectedPoDetail)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20"
                >
                  <FileSpreadsheet className="h-4 w-4" /> Preview Mẫu Đơn Đặt Hàng Excel
                </button>
                <button
                  onClick={() => navigate(`/stock-receivings/create?poId=${selectedPoDetail._id}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  <FileCheck className="h-4 w-4" /> Lập Phiếu Nhập Kho (PNK)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
