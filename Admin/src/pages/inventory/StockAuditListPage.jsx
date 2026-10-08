import React, { useState, useMemo } from 'react';
import {
  ClipboardList, Plus, SearchIcon as Search, Download, AlertTriangle, Eye,
  Trash2, X, FileSpreadsheet, CheckCircle2, Clock, Save, Check,
} from '@/components/ui/Icons';
import { useStockAudits, useCreateStockAudit } from '@/hooks/useInventory';
import { useSearchInventoryProducts } from '@/hooks/useProducts';
import { inventoryService } from '@/services/inventory.service';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { toast } from '@/providers/ToastProvider';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function StockAuditListPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingId, setDownloadingId] = useState(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // KiotViet Audit Form Filter Tab State
  const [auditTab, setAuditTab] = useState('all'); // 'all' | 'match' | 'diff' | 'uncheck'

  // Form State
  const [formData, setFormData] = useState({
    note: '',
    items: [],
  });

  const [productSearch, setProductSearch] = useState('');

  const { data: res = {}, isLoading, refetch } = useStockAudits({
    page,
    limit: pageSize,
    keyword,
  });

  const audits = res.data || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createMutation = useCreateStockAudit();
  const searchProducts = useSearchInventoryProducts(productSearch).data || [];

  const handleDownloadExcel = async (audit) => {
    try {
      setDownloadingId(audit._id);
      const resp = await inventoryService.downloadAuditExcel(audit._id);
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Phieu_Kiem_Ke_${audit.auditNumber}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải phiếu kiểm kê Excel mẫu thành công!');
    } catch (err) {
      toast.error('Lỗi tải file Excel: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreviewExcelOnWeb = (audit) => {
    const url = `/stock-audits/${audit._id}/download-excel?t=${Date.now()}`;
    setPreviewDownloadUrl(url);
    setPreviewTitle(`Biên Bản Kiểm Kê Excel (${audit.auditNumber})`);
    setExcelPreviewOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      note: '',
      items: [],
    });
    setProductSearch('');
    setAuditTab('all');
    setCreateModalOpen(true);
  };

  const handleAddProduct = (prod) => {
    const existingIndex = formData.items.findIndex((i) => i.productId === prod._id && i.variantId === prod.variantId);
    if (existingIndex > -1) {
      toast.info('Sản phẩm / biến thể này đã có trong danh sách kiểm kê');
      return;
    }

    const sysStock = prod.stock || 0;
    const unitPrice = prod.price || prod.costPrice || 0;

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: prod._id,
          variantId: prod.variantId || null,
          sku: prod.sku || '',
          productName: prod.name,
          unit: prod.unit || 'Cái',
          unitPrice,
          systemStock: sysStock,
          actualStock: sysStock,
          difference: 0,
          diffValue: 0,
          reason: 'Kiểm kê thực tế',
          checkedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });
    setProductSearch('');
  };

  const handleUpdateItem = (index, field, val) => {
    const updated = [...formData.items];
    const item = { ...updated[index], [field]: val };

    if (field === 'actualStock') {
      const act = val === '' ? 0 : Number(val);
      item.actualStock = act;
      item.difference = act - item.systemStock;
      item.diffValue = item.difference * (item.unitPrice || 0);
      item.checkedAt = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
    e?.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để kiểm kê');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success('Đã xác nhận kiểm kê & Cân bằng tồn kho thành công!');
      setCreateModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu kiểm kê');
    }
  };

  // Calculations for KiotViet Audit Tabs
  const filteredAuditItems = useMemo(() => {
    return formData.items.filter((item) => {
      if (auditTab === 'match') return item.difference === 0;
      if (auditTab === 'diff') return item.difference !== 0;
      if (auditTab === 'uncheck') return item.actualStock === undefined || item.actualStock === null;
      return true;
    });
  }, [formData.items, auditTab]);

  const matchCount = useMemo(() => formData.items.filter((i) => i.difference === 0).length, [formData.items]);
  const diffCount = useMemo(() => formData.items.filter((i) => i.difference !== 0).length, [formData.items]);
  const totalActualQty = useMemo(() => formData.items.reduce((acc, i) => acc + (Number(i.actualStock) || 0), 0), [formData.items]);

  return (
    <div className="space-y-6 p-6 antialiased">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Phiếu Kiểm Kê & Cân Bằng Kho (Stock Audits)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quản lý kiểm kê kho trực tiếp kiểu KiotViet, tự động điều chỉnh tồn kho & xuất biên bản Excel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-[6px] text-xs font-semibold"
          >
            <Clock className="h-4 w-4 mr-1.5" /> Làm mới
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="rounded-[6px] text-xs font-semibold shadow-xs active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tạo Phiếu Kiểm Kê
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="rounded-[6px] border border-border p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm mã phiếu kiểm kê AUD, ghi chú..."
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
            <thead className="bg-muted/60 text-[11px] font-bold text-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">Mã Kiểm Kê</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Số Mặt Hàng</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Tổng Chênh Lệch</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Ghi Chú / Lý Do</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Ngày Kiểm Kê</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Xem & Xuất File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    Đang tải danh sách phiếu kiểm kê...
                  </td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    Chưa có phiếu kiểm kê nào
                  </td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit._id} className="hover:bg-muted/30 transition-colors align-middle">
                    <td className="px-4 py-3 font-semibold text-primary font-mono whitespace-nowrap text-xs">{audit.auditNumber}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap text-xs">{audit.items?.length || 0} mặt hàng</td>
                    <td className="px-4 py-3 font-semibold font-mono whitespace-nowrap text-xs">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs tabular-nums font-bold ${audit.totalDifference < 0
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : audit.totalDifference > 0
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {audit.totalDifference < 0 && <AlertTriangle className="h-3 w-3" />}
                        {audit.totalDifference > 0 ? `+${audit.totalDifference}` : audit.totalDifference} cái
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate text-xs">{audit.note || '-'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono tabular-nums whitespace-nowrap">
                      {new Date(audit.auditDate || audit.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePreviewExcelOnWeb(audit)}
                          className="inline-flex items-center gap-1 rounded-[6px] border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors h-7"
                          title="Xem trước file Excel (.xlsx) trực tiếp trên Web"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" /> Preview Excel Web
                        </button>
                        <button
                          onClick={() => handleDownloadExcel(audit)}
                          disabled={downloadingId === audit._id}
                          className="inline-flex items-center gap-1.5 rounded-[6px] border border-input bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-xs hover:bg-muted transition-colors disabled:opacity-50 h-7"
                          title="Tải phiếu kiểm tra hàng hóa điền sẵn dữ liệu theo Mẫu Excel"
                        >
                          <Download className="h-3.5 w-3.5 text-primary" />
                          {downloadingId === audit._id ? 'Đang xuất...' : 'Tải Excel'}
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

      {/* FULLSCREEN KIOTVIET-STYLE AUDIT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex bg-background p-4 overflow-hidden">
          <div className="flex flex-col flex-1 rounded-[6px] border border-border bg-card shadow-xs overflow-hidden">
            {/* Modal Topbar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-[6px] bg-primary text-primary-foreground">
                  <ClipboardList className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Kiểm Kho Thực Tế
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Nhập tay số lượng thực tế đếm được tại kho để tự động chốt chênh lệch
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-[6px] border border-input bg-background p-1.5 text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.98] cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Modal Content Split Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* LEFT MAIN AREA */}
              <div className="flex flex-col flex-1 p-6 space-y-4 overflow-y-auto border-r border-border">
                {/* Search Bar F3 */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Tìm hàng hóa theo mã SKU hoặc tên sản phẩm (F3)..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full rounded-[6px] border border-input bg-background pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  {productSearch.trim() && (
                    <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-[6px] border border-border bg-card shadow-md divide-y divide-border/60">
                      {searchProducts.map((prod, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleAddProduct(prod)}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-xs text-foreground">{prod.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono tabular-nums">
                              Mã SKU: <span className="font-semibold text-foreground">{prod.sku || '-'}</span> | Tồn máy:{' '}
                              <span className="font-bold text-primary">{prod.stock || 0}</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-[4px] font-mono">
                            <Plus className="size-3" /> Thêm kiểm
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit Tabs (All | Match | Diff | Uncheck) */}
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <button
                    onClick={() => setAuditTab('all')}
                    className={`px-3 py-1 rounded-[6px] text-xs font-semibold font-mono transition-colors active:scale-[0.98] cursor-pointer ${auditTab === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    Tất cả ({formData.items.length})
                  </button>
                  <button
                    onClick={() => setAuditTab('match')}
                    className={`px-3 py-1 rounded-[6px] text-xs font-semibold font-mono transition-colors active:scale-[0.98] cursor-pointer ${auditTab === 'match' ? 'bg-emerald-600 text-white' : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    Khớp ({matchCount})
                  </button>
                  <button
                    onClick={() => setAuditTab('diff')}
                    className={`px-3 py-1 rounded-[6px] text-xs font-semibold font-mono transition-colors active:scale-[0.98] cursor-pointer ${auditTab === 'diff' ? 'bg-amber-600 text-white' : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    Lệch ({diffCount})
                  </button>
                </div>

                {/* Main Audit Items Table */}
                <div className="flex-1 overflow-x-auto rounded-[6px] border border-border bg-card shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/50 font-semibold text-muted-foreground border-b border-border">
                      <tr>
                        <th className="p-2.5 text-center w-10">STT</th>
                        <th className="p-2.5">Mã SKU</th>
                        <th className="p-2.5">Tên hàng hóa</th>
                        <th className="p-2.5 text-center">ĐVT</th>
                        <th className="p-2.5 text-right">Tồn kho</th>
                        <th className="p-2.5 text-center w-28">Thực tế</th>
                        <th className="p-2.5 text-right">SL lệch</th>
                        <th className="p-2.5 text-right">Giá trị lệch</th>
                        <th className="p-2.5 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredAuditItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-muted-foreground font-mono">
                            Chưa có hàng hóa nào trong danh mục lọc này
                          </td>
                        </tr>
                      ) : (
                        filteredAuditItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/30 align-middle">
                            <td className="p-2.5 text-center font-mono tabular-nums text-muted-foreground">{idx + 1}</td>
                            <td className="p-2.5 font-mono font-semibold text-primary">{item.sku}</td>
                            <td className="p-2.5 font-medium text-foreground">{item.productName}</td>
                            <td className="p-2.5 text-center text-muted-foreground">{item.unit}</td>
                            <td className="p-2.5 text-right font-mono font-bold tabular-nums text-muted-foreground">{item.systemStock}</td>
                            <td className="p-2.5 text-center">
                              <input
                                type="number"
                                min="0"
                                value={item.actualStock}
                                onChange={(e) => handleUpdateItem(idx, 'actualStock', e.target.value)}
                                className="w-full rounded-[4px] border border-border bg-background px-2 py-1 text-center font-bold font-mono tabular-nums text-xs text-foreground focus:border-ring focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold tabular-nums">
                              <span
                                className={
                                  item.difference < 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : item.difference > 0
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-muted-foreground'
                                }
                              >
                                {item.difference > 0 ? `+${item.difference}` : item.difference}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold tabular-nums text-muted-foreground">
                              {(item.diffValue || 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="rounded-[4px] p-1 text-destructive hover:bg-destructive/10 cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT SUMMARY SIDEBAR (KiotViet Audit Right Panel) */}
              <div className="w-80 bg-muted/20 p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-border pb-3">
                    <span className="text-xs font-semibold text-muted-foreground">Mã phiếu kiểm kho:</span>
                    <p className="text-base font-bold font-mono text-primary">AUD-TỰ ĐỘNG</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ghi chú đợt kiểm kho</label>
                    <textarea
                      rows={3}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Nhập ghi chú lý do đợt kiểm kho..."
                      className="w-full rounded-[6px] border border-input bg-background p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="rounded-[6px] border border-border bg-card p-3 space-y-2 text-xs shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <span className="font-semibold text-amber-600">Phiếu tạm (Draft)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng SL thực tế:</span>
                      <span className="font-bold font-mono tabular-nums text-foreground">{totalActualQty} cái</span>
                    </div>
                  </div>

                  {/* Widget: Kiểm gần đây */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" /> Kiểm gần đây
                    </span>
                    <div className="max-h-40 overflow-y-auto rounded-[6px] border border-border bg-card p-2 space-y-1.5 text-xs shadow-2xs">
                      {formData.items.length === 0 ? (
                        <p className="text-muted-foreground text-center py-2 text-[11px] font-mono">Chưa có dòng vừa kiểm</p>
                      ) : (
                        formData.items.slice(-5).reverse().map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] border-b border-border/40 pb-1">
                            <span className="truncate font-medium max-w-[130px]">{item.productName}</span>
                            <span className="font-mono font-bold tabular-nums text-primary">({item.actualStock})</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={handleSubmitCreate}
                    disabled={createMutation.isPending || formData.items.length === 0}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5" />
                    {createMutation.isPending ? 'Đang cân bằng...' : 'Hoàn Thành & Cân Bằng Kho'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="w-full rounded-[6px] border border-input bg-background py-2 text-xs font-semibold text-muted-foreground hover:bg-muted active:scale-[0.98] cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real XLSX Web Preview Modal */}
      <ExcelPreviewModal
        isOpen={excelPreviewOpen}
        onClose={() => setExcelPreviewOpen(false)}
        title={previewTitle}
        downloadUrl={previewDownloadUrl}
      />
    </div>
  );
}
